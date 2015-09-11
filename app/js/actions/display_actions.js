import Dispatcher from 'dispatcher/algobuy_dispatcher.js';
import * as DisplayConstants from 'constants/display_constants';

export default class DisplayActions {

    // Action to display a product's details
    static displayProduct(product, shouldClose) {
        Dispatcher.dispatch({
            type: DisplayConstants.DISPLAY_PRODUCT,
            product,
            shouldClose
        });
    }

    // Action to display the results of the current search refined with the
    // given category name
    static displaySearch(category, shouldClose) {
        Dispatcher.dispatch({
            type: DisplayConstants.DISPLAY_SEARCH,
            category,
            shouldClose
        });
    }

    // Action to actually display the results, the other one above just ran the
    // search. Got ya.
    static displaySearchResults(category, results) {
        Dispatcher.dispatch({
            type: DisplayConstants.DISPLAY_SEARCH_RESULTS,
            category,
            results
        })
    }

};
