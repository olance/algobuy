import _ from 'lodash';
import cx from 'classnames';

import React from 'react';
import {Container} from 'flux/utils';

import OutsideClickHandler from 'components/outside_click_handler.jsx';
import BaseProduct from 'components/base_product.jsx';

import CartStore from 'stores/cart_store.js';


class CartController extends React.Component {
    static getStores() {
        return [CartStore];
    }

    static calculateState(prevState) {
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
        if(this.state.productsCount === 0)
        {
            return;
        }

        var opened = !this.state.opened;
        this.setState(_.extend({}, this.state, { opened: opened }));
    }

    _outsideClick() {
        this.setState(_.extend({}, this.state, { opened: false }));
    }
}

export default Container.create(CartController);


// PRIVATE COMPONENTS

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
