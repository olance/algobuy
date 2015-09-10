import Dispatcher from 'dispatcher/algobuy_dispatcher.js';
import * as DisplayConstants from 'constants/display_constants';

export default class DisplayActions {

    static displayProduct(product) {
        Dispatcher.dispatch({
            type: DisplayConstants.DISPLAY_PRODUCT,
            product: product
        });
    }

    static displaySearch(category) {
        Dispatcher.dispatch({
            type: DisplayConstants.DISPLAY_SEARCH,
            category: category
        });
    }

    static displaySearchResults(category, results) {
        Dispatcher.dispatch({
            type: DisplayConstants.DISPLAY_SEARCH_RESULTS,
            category: category,
            results: results
        })
    }

};
