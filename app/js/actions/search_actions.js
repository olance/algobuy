import Dispatcher from 'dispatcher/algobuy_dispatcher.js';
import * as SearchConstants from 'constants/search_constants';

export default class SearchActions {

    static receivedResults(results, params) {
        Dispatcher.dispatch({
            type: SearchConstants.SEARCH_RESULTS_RECEIVED,
            results: results,
            params: params
        });
    }

    static searchFailed(error) {
        Dispatcher.dispatch({
            type: SearchConstants.SEARCH_FAILED,
            error: error
        });
    }

    static priceRangeChanged(priceRange) {
        Dispatcher.dispatch({
            type: SearchConstants.PRICE_RANGE_CHANGED,
            priceRange: priceRange
        });
    }
};
