import Dispatcher from 'dispatcher/algobuy_dispatcher.js';
import * as CartConstants from 'constants/cart_constants';

export default class CartActions {

    static productAdded(product) {
        Dispatcher.dispatch({
            type: CartConstants.PRODUCT_ADDED,
            product: product
        });
    }

};
