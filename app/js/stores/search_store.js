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

        // Search!
        Search.setQuery(QueryStore.getQuery()).search();
    }

    _handleQueryCleared() {
        if(searchResults != SearchConstants.EMPTY_SEARCH_QUERY)
        {
            searchResults = SearchConstants.EMPTY_SEARCH_QUERY;

            // Clear all refinements to start the next search "cleanly"
            Search.clearRefinements();

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

    _handleSearchFailed() {
        searchResults = SearchConstants.SEARCH_ERROR;
        lastError = error.message;
        this.__emitChange();
    }

    _handlePriceRangeChanged(action) {
        Search.clearRefinements('price_range');

        if(action.priceRange !== SearchConstants.ANY_PRICE_RANGE)
        {
            Search.addFacetRefinement('price_range', action.priceRange);
        }

        Search.search();
    }
}

export default new SearchStore(Dispatcher);
