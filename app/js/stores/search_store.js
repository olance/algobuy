import _ from 'lodash';
import {Store} from 'flux/utils';
import Dispatcher from 'dispatcher/algobuy_dispatcher.js';

import QueryStore from 'stores/query_store.js';
import * as QueryConstants from 'constants/query_constants.js';

import * as SearchConstants from 'constants/search_constants.js';
import SearchActions from 'actions/search_actions.js';
import Search from 'algolia/search';

var searchResults = SearchConstants.EMPTY_SEARCH_QUERY;
var lastError = null;

// Will be initialized to a new PriceRangeList once the class is defined
// #ForwardDeclarationFTW
var currentPriceRanges = null;

// This store launches a search request when the search query changes, and then
// emit a change event when the results are received.
class SearchStore extends Store {
    constructor(dispatcher) {
        super(dispatcher);

        Search.on('result', this._serverSearchResultsReceived.bind(this));
        Search.on('error', this._serverSearchFailed.bind(this));
    }

    getResults() {
        return searchResults;
    }

    getLastError() {
        return lastError;
    }

    getPriceRanges() {
        return currentPriceRanges.getPriceRanges();
    }

    __onDispatch(action) {
        switch(action.type) {
            // Wait for the QueryStore to complete processing this dispatch, to
            // get the actual query string from it (in case it internally
            // changes the query string for any reason).
            // When it's available, use the new query string to start a search
            // request.
            case QueryConstants.QUERY_CHANGED:
                this._handleQueryChanged();
                break;

            // Set our search results to the special EMPTY_SEARCH_QUERY value
            case QueryConstants.QUERY_CLEARED:
                this._handleQueryCleared();
                break;

            // When results are received, store them and notify the change
            case SearchConstants.SEARCH_RESULTS_RECEIVED:
                this._handleResultsReceived(action);
                break;

            // When search failed, store a special value SEARCH_ERROR as our
            // results and store the error message.
            case SearchConstants.SEARCH_FAILED:
                this._handleSearchFailed();
                break;

            // Refine the current search with the selected price range facet and
            // run the search again
            case SearchConstants.PRICE_RANGE_CHANGED:
                this._handlePriceRangeChanged(action);
                break;
        }
    }

    // Private methods
    // SERVER EVENTS
    _serverSearchResultsReceived(results, params) {
        // To enforce a single data flow direction, we just dispatch an action
        // with the received results
        SearchActions.receivedResults(results, params);
    }

    _serverSearchFailed(error) {
        // To enforce a single data flow direction, we just dispatch an action
        // with the search error
        SearchActions.searchFailed(error);
    }

    // DISPATCHER EVENTS
    _handleQueryChanged() {
        Dispatcher.waitFor([QueryStore.getDispatchToken()]);

        // There's nothing to do if the query hasn't really changed
        if(!QueryStore.hasChanged())
        {
            return;
        }

        // Set the new query
        Search.setQuery(QueryStore.getQuery());

        // Search once without any refinements to get the list of price ranges
        // for this new search, and once it's done do the real search
        Search.searchOnce({ facetsRefinements: {} }, (error, results) => {
            if(error)
            {
                this._serverSearchFailed(error);
                return;
            }

            // Update the price ranges that are available for refinement
            // by the user
            let rangeReset = this._updatePriceRanges(results);

            // If the price range was reset, we need to clear the search's
            // refinement parameter to keep in sync with the price ranges
            // display
            if(rangeReset)
            {
                Search.clearRefinements('price_range');
            }

            // Run the actual search
            Search.search();
        })

    }

    _handleQueryCleared() {
        if(searchResults != SearchConstants.EMPTY_SEARCH_QUERY)
        {
            searchResults = SearchConstants.EMPTY_SEARCH_QUERY;

            // Clear all refinements to start the next search "cleanly"
            Search.clearRefinements();
            currentPriceRanges.clear();

            this.__emitChange();
        }
    }

    _handleResultsReceived(action) {
        searchResults = {
            results: action.results,
            params: action.params
        };
        lastError = null;

        this.__emitChange();
    }


    _updatePriceRanges(results) {
        // If there are no hits, simply clear the price ranges list; otherwise
        // have the list of ranges update itself
        if(results.nbHits > 0)
        {
            let ranges = results.getFacetValues('price_range');
            return currentPriceRanges.updateRanges(ranges);
        }
        else
        {
            currentPriceRanges.clear();
            return true;
        }
    }

    _handleSearchFailed() {
        searchResults = SearchConstants.SEARCH_ERROR;
        lastError = error.message;
        this.__emitChange();
    }

    _handlePriceRangeChanged(action) {
        // Clear any previous price_range refinement (we don't want to
        // accumulate them)
        Search.clearRefinements('price_range');
        currentPriceRanges.resetActivePriceRange();

        if(action.priceRange !== SearchConstants.ANY_PRICE_RANGE)
        {
            // Add the newly selected price range refinement
            Search.addFacetRefinement('price_range', action.priceRange);
            currentPriceRanges.setActivePriceRange(action.priceRange);
        }

        Search.search();
    }
}

export default new SearchStore(Dispatcher);


// PRIVATE CLASSES

// The PriceRangeList maintains a list of ... price ranges.
// It makes sure the first virtual "any price" tag is present and updates the
// active state of the selected price range within the list.
// The idea is to be able to always show the full list of price_range facet
// values relevant to the current search query (when it's ran without
// refinements), even when a refinement has been made.
class PriceRangeList {
    constructor() {
        this.priceRanges = [];
    }

    resetActivePriceRange() {
        // Deactivate any selected price range, and activate the first, 'any
        // price' range.
        _.find(this.priceRanges, 'isRefined').isRefined = false;
        (this.priceRanges[0] || {}).isRefined = true;
    }

    setActivePriceRange(priceRange) {
        // Deactivate any selected price range, and activate the given one
        (_.find(this.priceRanges, 'isRefined') || {}).isRefined = false;
        (_.find(this.priceRanges, 'name', priceRange) || {}).isRefined = true;
    }

    // We'll receive new price ranges for each new search. Replace the current
    // ranges list and try to keep the currently selected range active (if it is
    // still present in the new list).
    // Return whether the price range needed to be reset
    updateRanges(newRanges) {
        var reset = true,
            currentActiveRange = _.find(this.priceRanges, 'isRefined');

        // Replace the price ranges and order them
        this.priceRanges = _.cloneDeep(newRanges);
        this.priceRanges = this.priceRanges.sort(PriceRangeList.sortRanges);

        if(currentActiveRange)
        {
            let newActiveRange = _.find(this.priceRanges, 'name', currentActiveRange.name);

            // If we found the currently active range within the new ranges, no need
            // to reset the active range to "any price"
            if(newActiveRange)
            {
                newActiveRange.isRefined = true;
                reset = false;
            }
        }

        this.priceRanges.unshift(PriceRangeList.anyPriceRange(reset));
        return reset;
    }

    clear() {
        this.priceRanges = [];
    }

    getPriceRanges() {
        // Clone to avoid unwanted side-effects
        // TODO: use immutables?
        return _.cloneDeep(this.priceRanges);
    }

    static anyPriceRange(isRefined) {
        return {
            name: SearchConstants.ANY_PRICE_RANGE,
            isRefined: isRefined
        }
    }

    // This is a comparison method that is *very* specific to the data we're
    // handling in this example...
    static sortRanges(a, b) {
        // Remove all spaces from both names
        a = a.name.replace(/ /g, '');
        b = b.name.replace(/ /g, '');

        // "> 2000" always comes last
        if(a === '>2000')
        {
            return 1;
        }
        else if(b === '>2000')
        {
            return -1;
        }
        // Otherwise we just sort according to the numerical order of the lower
        // bounds of the ranges
        else
        {
            let aLower = Number(a.split('-')[0]),
                bLower = Number(b.split('-')[0]);

            return aLower > bLower ? 1 : -1;
        }
    }
}

currentPriceRanges = new PriceRangeList();
