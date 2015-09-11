import _ from 'lodash';

import {Store} from 'flux/utils';
import * as CartConstants from 'constants/cart_constants.js';
import Dispatcher from 'dispatcher/algobuy_dispatcher.js';

var products = [];

// The CartStore keeps track of the products added to the shopping cart
// (its a very basic cart, one can just add products to it and get the list!)
class CartStore extends Store {
    getProductsCount() {
        return products.length;
    }

    getProducts() {
        return _.cloneDeep(products);
    }

    isProductInCart(product) {
        return _.find(products, 'objectID', product.objectID) != null;
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
