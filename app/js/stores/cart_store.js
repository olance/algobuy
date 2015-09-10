import {Store} from 'flux/utils';
import * as CartConstants from 'constants/cart_constants.js';
import Dispatcher from 'dispatcher/algobuy_dispatcher.js';

var products = [];

// The QueryStore keeps track of the current search query typed by the user
class CartStore extends Store {
    getProductsCount() {
        return products.length;
    }

    __onDispatch(action) {
        switch(action.type) {
            case CartConstants.PRODUCT_ADDED:
                products.push(action.product);
                this.__emitChange();
                break;
        }
    }
}

export default new CartStore(Dispatcher);
