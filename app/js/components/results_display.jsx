import _ from 'lodash';
import cx from 'classnames';
import pluralize from 'pluralize';

import React from 'react';
import {Container} from 'flux/utils';
import BaseProduct from 'components/base_product.jsx';

import DisplayStore, {DisplayTypes} from 'stores/display_store';

import masonry from 'react-masonry-component';
const Masonry = masonry(React);

// This component displays results from the autocomplete menu; either a single
// product from the popular products suggestions, or a list of products,
// resulting from a suggested category-search
class ResultsDisplayController extends React.Component {
    static getStores() {
        return [DisplayStore];
    }

    static calculateState() {
        return {
            displayType: DisplayStore.getDisplayType(),
            products: DisplayStore.getProducts()
        };
    }

    render() {
        var content = null;

        switch(this.state.displayType)
        {
            // Display a single product (as a large card)
            case DisplayTypes.product:
                content = (
                    <Product product={this.state.products[0]} large/>
                );
                break;

            // Display all products (only the first page actually) in a Masonry
            // component that will organize them nicely.
            case DisplayTypes.search:
                let products = this.state.products.map((product) => {
                    return <Product key={product.objectID} product={product}/>
                });

                content = (
                    <Masonry options={{ transitionDuration: 0}}>
                        {products}
                    </Masonry>
                );
                break
        }

        return (
            <div className="results-display">
                {content}
            </div>
        );
    }
}

export default Container.create(ResultsDisplayController)


// PRIVATE COMPONENTS

// This component is used to show a product with a button to add or remove the
// product from the cart, depending on it being added to the cart or not. The
// BaseProduct component is inherited to fulfill that purpose.
class Product extends BaseProduct {
    constructor(props) {
        super(props);

        // The buttonHover state is set to true when the add to/remove from cart
        // button from the AddToCartButton component is hovered. Some special
        // CSS styles are applied in this case.
        this.state.buttonHover = false;
    }

    render() {
        var classes = cx({
            product: true,
            large: this.props.large,
            'in-cart': this.state.inCart,
            'button-hover': this.state.buttonHover
        });

        var product = this.props.product;

        return (
            <div className={classes}>
                <div className="picture">
                    <img src={product.image} alt={product.name}/>
                </div>

                <div className="infos">
                    <h3 dangerouslySetInnerHTML={{__html: product._highlightResult.name.value}}></h3>
                    <span className="price">${product.price}</span>
                    <p className="description"
                       dangerouslySetInnerHTML={{__html: product._highlightResult.description.value}}></p>
                </div>

                <AddToCartButton inCart={this.state.inCart}
                                 onAdd={this.addToCart.bind(this)}
                                 onRemove={this.removeFromCart.bind(this)}
                                 onMouseEnter={this._setButtonHover.bind(this, true)}
                                 onMouseLeave={this._setButtonHover.bind(this, false)}/>
            </div>
        );
    }

    // Private methods
    _setButtonHover(hover) {
        // Set the buttonHover state, depending on what the AddToCartButton
        // reported
        this.setState(_.extend({}, this.state, { buttonHover: hover }));
    }
}

class AddToCartButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // The active state is used when the button is hovered. In the case
            // when the product this button "controls" is in the cart, the
            // button will show an "IN CART" notice when inactive, and a "REMOVE
            // FROM CART" button when active.
            active: false
        };
    }

    render() {
        var inCart = this.props.inCart,
            active = this.state.active,

            attributes = {
            className: cx({
                'add-to-cart': !inCart,
                'in-cart': inCart && !active,
                'remove-from-cart': inCart && active
            }),

            onMouseLeave: this._setActive.bind(this, false),
            onMouseEnter: this._setActive.bind(this, true),

            onClick: inCart ? this.props.onRemove : this.props.onAdd
        };

        var inCartText = active ? 'REMOVE FROM CART' : 'IN CART',
            text = inCart ? inCartText : 'ADD TO CART';


        return <div {...attributes}>{text}</div>;
    }

    // Private methods
    _setActive(active) {
        this.setState({ active });

        if(active)
        {
            this.props.onMouseEnter();
        }
        else
        {
            this.props.onMouseLeave();
        }
    }
}
