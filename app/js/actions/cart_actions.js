import Dispatcher from 'dispatcher/algobuy_dispatcher.js';
import * as CartConstants from 'constants/cart_constants';

export default class CartActions {

    // Action to add a product to the shopping cart
    static productAdded(product) {
        Dispatcher.dispatch({
            type: CartConstants.PRODUCT_ADDED,
            product: product
        });
    }

    // Action to remove a product from the shopping cart
    static productRemoved(product) {
        Dispatcher.dispatch({
            type: CartConstants.PRODUCT_REMOVED,
            product: product
        });
    }

};
