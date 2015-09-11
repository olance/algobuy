import _ from 'lodash';
import cx from 'classnames';

import React from 'react';
import {Container} from 'flux/utils';

import OutsideClickHandler from 'components/outside_click_handler.jsx';
import BaseProduct from 'components/base_product.jsx';

import CartStore from 'stores/cart_store.js';

// The CartController component observes the Cart store and re-renders when a
// product is added to, or removed from the cart.
// It displays a cart icon with a badge indicating the number of products
// currently added to the cart, and will show a list of these products when the
// icon is clicked.
class CartController extends React.Component {
    static getStores() {
        return [CartStore];
    }

    static calculateState(prevState) {
        // Make sure the cart stays open when its last state was to be opened.
        // This is to prevent the cart from closing when deleting a product.
        var wasOpened = prevState ? prevState.opened : false,
            productsCount = CartStore.getProductsCount();

        return {
            productsCount: productsCount,
            products: CartStore.getProducts(),
            opened: wasOpened && productsCount > 0
        };
    }

    render() {
        return (
            <OutsideClickHandler onClickOutside={this._outsideClick.bind(this)}>
                <div className="cart">
                    <CartIcon cart={this.state} onClick={this._iconClick.bind(this)}/>
                    <CartProducts cart={this.state}/>
                </div>
            </OutsideClickHandler>
        );
    }

    _iconClick() {
        // Do not open the cart if there are no products inside
        if(this.state.productsCount === 0)
        {
            return;
        }

        // Toggle the cart content
        var opened = !this.state.opened;
        this.setState(_.extend({}, this.state, { opened: opened }));
    }

    _outsideClick() {
        // Close the cart when the user clicks outside of it
        this.setState(_.extend({}, this.state, { opened: false }));
    }
}

export default Container.create(CartController);


// PRIVATE COMPONENTS

// This component simply displays the cart's icon along with the counter badge
class CartIcon extends React.Component {
    render() {
        var badgeClasses = cx({
            'cart-badge': true,
            hidden: this.props.cart.productsCount == 0
        });

        return (
            <div className="cart-icon" onClick={this.props.onClick}>
                <div className={badgeClasses}>
                    <div>
                        {this.props.cart.productsCount}
                    </div>
                </div>
            </div>
        );
    }
}

// This component handles the list of products present in the cart
class CartProducts extends React.Component {
    render() {
        var classes = cx({
            products: true,
            hidden: !this.props.cart.opened
        });

        var products = this.props.cart.products.map((product) => {
            return <CartProduct key={product.objectID} product={product}/>
        });

        return (
            <div className={classes}>
                <ul>
                    {products}
                </ul>
            </div>
        );
    }
}

// Simple component to display a single product. Note that we extend the
// BaseProduct class, to be able to remove the product from the cart easily.
class CartProduct extends BaseProduct {
    render() {
        return (
            <li className="product">
                <span className="remove" onClick={this.removeFromCart.bind(this)}>
                    <img src="images/remove-from-cart-icon.png"
                         alt="Remove from cart"/>
                </span>
                <span className="price">${this.props.product.price}</span>
                <span className="name">{this.props.product.name}</span>
            </li>
        );
    }
}
