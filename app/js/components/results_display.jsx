import _ from 'lodash';
import cx from 'classnames';
import pluralize from 'pluralize';

import React from 'react';
import {Container} from 'flux/utils';
import BaseProduct from 'components/base_product.jsx';

import DisplayStore, {DisplayTypes} from 'stores/display_store';

import masonry from 'react-masonry-component';
const Masonry = masonry(React);


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
            case DisplayTypes.product:
                content = (
                    <Product product={this.state.products[0]} large/>
                );
                break;

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
class Product extends BaseProduct {
    constructor(props) {
        super(props);
        this.state.willRemove = false;
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
        this.setState(_.extend({}, this.state, { buttonHover: hover }));
    }
}

class AddToCartButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
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
