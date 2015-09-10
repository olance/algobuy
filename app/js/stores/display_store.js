import _ from 'lodash';

import {Store} from 'flux/utils';
import Dispatcher from 'dispatcher/algobuy_dispatcher.js';
import * as DisplayConstants from 'constants/display_constants.js';
import DisplayActions from 'actions/display_actions';

import Search from 'algolia/search';

export const DisplayTypes = {
    product: Symbol('DisplayTypeProduct'),
    search: Symbol('DisplayTypeSearch')
};


var products = [],
    displayType = null,
    preemptingNextDisplay = false;

// The QueryStore keeps track of the current search query typed by the user
class DisplayStore extends Store {
    getProducts() {
        return _.cloneDeep(products);
    }

    getDisplayType() {
        return displayType;
    }

    isDisplayPreempting() {
        // Preemption is a "transitory" state: once consumed, it is set back to
        // false.
        var preempt = preemptingNextDisplay;
        preemptingNextDisplay = false;
        return preempt;
    }

    __onDispatch(action) {
        switch(action.type) {
            case DisplayConstants.DISPLAY_PRODUCT:
                displayType = DisplayTypes.product;
                products = [action.product];
                preemptingNextDisplay = action.shouldClose;

                this.__emitChange();
                break;

            case DisplayConstants.DISPLAY_SEARCH:
                // Change variable here but wait for the search results to come
                // in to emit the change event
                preemptingNextDisplay = action.shouldClose;

                // Add a categories refinement to the current search
                let refinements = _.cloneDeep(Search.getQueryParameter('facetsRefinements'));

                if(action.category !== 'All Departments')
                {
                    refinements.categories = [action.category];
                }

                // Search without affecting the current search parameters
                Search.searchOnce({
                    hitsPerPage: 20,
                    facetsRefinements: refinements
                }).then(this._handleSearchResults.bind(this, action.category));

                break;

            case DisplayConstants.DISPLAY_SEARCH_RESULTS:
                displayType = DisplayTypes.search;
                products = action.results;
                this.__emitChange();
                break;
        }
    }

    // Private methods
    _handleSearchResults(category, results) {
        DisplayActions.displaySearchResults(category, results.content.hits);
    }
}

export default new DisplayStore(Dispatcher);
