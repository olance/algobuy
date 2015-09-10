import cx from 'classnames';
import pluralize from 'pluralize';

import React from 'react';
import {Container} from 'flux/utils';

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
                    <Masonry>
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
class Product extends React.Component {
    render() {
        var classes = cx({
            product: true,
            large: this.props.large
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
            </div>
        );
    }
}
