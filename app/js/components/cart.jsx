import cx from 'classnames';

import React from 'react';
import {Container} from 'flux/utils';

import CartStore from 'stores/cart_store.js';

class CartController extends React.Component {
    static getStores() {
        return [CartStore];
    }

    static calculateState() {
        return {
            productsCount: CartStore.getProductsCount()
        };
    }

    render() {
        return (
            <div className="cart">
                <CartIcon cart={this.state}/>
            </div>
        );
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
            <div className="cart-icon">
                <div className={badgeClasses}>
                    <div>
                        {this.props.cart.productsCount}
                    </div>
                </div>
            </div>
        );
    }
}
