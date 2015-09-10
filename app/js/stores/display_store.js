import _ from 'lodash';

import {Store} from 'flux/utils';
import Dispatcher from 'dispatcher/algobuy_dispatcher.js';
import * as DisplayConstants from 'constants/display_constants.js';
import DisplayActions from 'actions/display_actions';

import Search from 'algolia/search';

var products = [],
    displayType = null;

export const DisplayTypes = {
    product: Symbol('DisplayTypeProduct'),
    search: Symbol('DisplayTypeSearch')
};

// The QueryStore keeps track of the current search query typed by the user
class DisplayStore extends Store {
    getProducts() {
        return _.cloneDeep(products);
    }

    getDisplayType() {
        return displayType;
    }

    __onDispatch(action) {
        switch(action.type) {
            case DisplayConstants.DISPLAY_PRODUCT:
                displayType = DisplayTypes.product;
                products = [action.product];

                this.__emitChange();
                break;

            case DisplayConstants.DISPLAY_SEARCH:
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
