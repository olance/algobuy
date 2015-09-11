import Dispatcher from 'dispatcher/algobuy_dispatcher.js';
import * as SearchConstants from 'constants/search_constants';

export default class SearchActions {

    // Action dispatched when search results have been received from Algolia
    static receivedResults(results, params) {
        Dispatcher.dispatch({
            type: SearchConstants.SEARCH_RESULTS_RECEIVED,
            results: results,
            params: params
        });
    }

    // Action dispatched when there was an error on Algolia's side
    static searchFailed(error) {
        Dispatcher.dispatch({
            type: SearchConstants.SEARCH_FAILED,
            error: error
        });
    }

    // Action to notify another price range has been selected (triggers a new
    // search)
    static priceRangeChanged(priceRange) {
        Dispatcher.dispatch({
            type: SearchConstants.PRICE_RANGE_CHANGED,
            priceRange: priceRange
        });
    }
};
