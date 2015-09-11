import _ from 'lodash';

import {Store} from 'flux/utils';
import * as CartConstants from 'constants/cart_constants.js';
import Dispatcher from 'dispatcher/algobuy_dispatcher.js';

var products = [];

// The CartStore keeps track of the products added to the shopping cart
class CartStore extends Store {
    getProductsCount() {
        return products.length;
    }

    getProducts() {
        return _.cloneDeep(products);
    }

    isProductInCart(product) {
        // Find product by objectID
        return _.find(products, 'objectID', product.objectID) != null;
    }

    __onDispatch(action) {
        switch(action.type) {
            case CartConstants.PRODUCT_ADDED:
                // Add the product to the cart
                products.push(action.product);
                this.__emitChange();
                break;

            case CartConstants.PRODUCT_REMOVED:
                // Remove all products that have the same objectID
                products = _.reject(products, 'objectID', action.product.objectID);
                this.__emitChange();
                break;
        }
    }
}

export default new CartStore(Dispatcher);
