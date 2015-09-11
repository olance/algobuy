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
    render() {
        var classes = cx({
            product: true,
            large: this.props.large,
            'in-cart': this.state.inCart
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

                <AddToCartButton inCart={this.state.inCart} onClick={this.addToCart.bind(this)}/>
            </div>
        );
    }
}

class AddToCartButton extends React.Component {
    render() {
        if(this.props.inCart)
        {
            return (
                <div className="in-cart">IN CART</div>
            );
        }
        else
        {
            return (
                <div className="add-to-cart" onClick={this.props.onClick}>
                    ADD TO CART
                </div>
            );
        }
    }
}
