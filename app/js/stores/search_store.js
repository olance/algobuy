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

        Search.on('result', this._searchResults.bind(this));
        Search.on('error', this._searchError.bind(this));
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
                Dispatcher.waitFor([QueryStore.getDispatchToken()]);

                // There's nothing to do if the query hasn't really changed
                if(!QueryStore.hasChanged())
                {
                    return;
                }

                // Search!
                Search.setQuery(QueryStore.getQuery()).search();

                break;

            case QueryConstants.QUERY_CLEARED:
                if(searchResults != SearchConstants.EMPTY_SEARCH_QUERY)
                {
                    searchResults = SearchConstants.EMPTY_SEARCH_QUERY;
                    this.__emitChange();
                }
                break;

            // When results are received, store them and notify the change
            case SearchConstants.SEARCH_RESULTS_RECEIVED:
                searchResults = {
                    results: action.results,
                    params: action.params
                };
                lastError = null;
                this.__emitChange();
                break;

            // When search failed, store a special value SEARCH_ERROR as our
            // results and store the error message.
            case SearchConstants.SEARCH_FAILED:
                searchResults = SearchConstants.SEARCH_ERROR;
                lastError = error.message;
                this.__emitChange();
                break;
        }
    }

    // Private methods
    _searchResults(results, params) {
        // To enforce a single data flow direction, we just dispatch an action
        // with the received results
        SearchActions.receivedResults(results, params);
    }

    _searchError(error) {
        // To enforce a single data flow direction, we just dispatch an action
        // with the search error
        SearchActions.searchFailed(error);
    }
}

export default new SearchStore(Dispatcher);
