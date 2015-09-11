import _ from 'lodash';
import React from 'react';

import CartStore from 'stores/cart_store';
import CartActions from 'actions/cart_actions';

// This class serves as a parent class for both places where we need to display
// products (the autocomplete menu and the results display area).
// Rendering is not implemented, but this base component will listen to
// CartStore changes and update its state when it's put or removed from the cart
class BaseProduct extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inCart: CartStore.isProductInCart(props.product)
        }
    }

    componentDidMount() {
        this._cartListener = CartStore.addListener(this._cartStoreChanged.bind(this));
    }

    componentWillUnmount() {
        this._cartListener.remove();
    }

    addToCart() {
        CartActions.productAdded(this.props.product);
    }

    removeFromCart() {
        CartActions.productRemoved(this.props.product);
    }

    // Private methods
    _cartStoreChanged() {
        var inCart = CartStore.isProductInCart(this.props.product);
        this.setState(_.extend({}, this.state, { inCart }));
    }
}

// A 'product' property must be passed with the literal object holding the
// product's data
BaseProduct.propTypes = {
    product: React.PropTypes.object.isRequired
};

export default BaseProduct;
