import Dispatcher from 'dispatcher/algobuy_dispatcher.js';
import * as DisplayConstants from 'constants/display_constants';

export default class DisplayActions {

    static displayProduct(product, shouldClose) {
        Dispatcher.dispatch({
            type: DisplayConstants.DISPLAY_PRODUCT,
            product,
            shouldClose
        });
    }

    static displaySearch(category, shouldClose) {
        Dispatcher.dispatch({
            type: DisplayConstants.DISPLAY_SEARCH,
            category,
            shouldClose
        });
    }

    static displaySearchResults(category, results) {
        Dispatcher.dispatch({
            type: DisplayConstants.DISPLAY_SEARCH_RESULTS,
            category,
            results
        })
    }

};
