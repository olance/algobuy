import _ from 'lodash';
import cx from 'classnames';
import pluralize from 'pluralize';

import React from 'react';

import * as SearchConstants from 'constants/search_constants.js';
import SearchActions from 'actions/search_actions';
import Search from 'algolia/search.js';

import CartActions from 'actions/cart_actions';
import DisplayActions from 'actions/display_actions';

import TooltipActions from 'actions/tooltip_actions';
import {Tooltips} from 'constants/tooltip_constants';

import Tooltip from './tooltip.jsx';
import BaseProduct from 'components/base_product.jsx';
import KeyboardNavGroup from './keyboard_nav_group.jsx';

// The SearchSuggestions component displays the panel that shows below the
// search input, filling it with price filters and suggested searches/products.
//
// Children components for this one are declared at the end of the file to keep
// them private.
class SearchSuggestions extends React.Component {
    render() {
        var results = this.props.search.results,
            emptyQuery = results == SearchConstants.EMPTY_SEARCH_QUERY;

        // Depending on the search status, we render an error message...
        if(results == SearchConstants.SEARCH_ERROR)
        {
            return (
                <div className="search-suggestions search-error">
                    <p>
                        Something wrong happened. Sorry.
                        <img src="images/search-error.png" alt="Error"/>
                    </p>
                </div>
            );
        }
        // ... nothing ...
        else if(emptyQuery || this.props.search.closed)
        {
            return null;
        }
        // ... a useful message ...
        else if(results.nbHits === 0)
        {
            return (
                <div className="search-suggestions no-results">
                    <p>
                        Nothing found.
                        <img src="images/no-results.png" alt="Bummer!"/>
                    </p>
                </div>
            );
        }
        // ... or actual results.
        else
        {
            return (
                <div className="search-suggestions">
                    <Tooltip/>
                    <PriceRangeList search={this.props.search}/>
                    <CategorySearches search={this.props.search}/>
                    <PopularProducts search={this.props.search}/>
                </div>
            );
        }
    }
}

export default SearchSuggestions;

// PRIVATE COMPONENTS

// Handle the list of price ranges shown to the user for refinements purposes
// This list can be keyboard-navigated horizontally thanks to the
// KeyboardNavGroup component
class PriceRangeList extends React.Component {
    render() {
        var priceRanges = this._priceRangesList();

        return (
            <KeyboardNavGroup dir="horizontal">
                {priceRanges}
            </KeyboardNavGroup>
        );
    }

    // Private methods
    _priceRangesList() {
        // Map all ranges to their tag
        return this.props.search.priceRanges.map((range) => {
            return <PriceRangeTag key={range.name} priceRange={range} />;
        });
    }
}

// The PriceRangeTag represents a selectable price range used to refine the
// current search.
class PriceRangeTag extends React.Component {
    render() {
        var className = cx('price-range', {
            active: this.props.priceRange.isRefined
        });

        // Create a debounced version of our click handler: clicking on a tag
        // will also focus it, resulting in two calls to the handler in a row
        // and thus two identical requests to Algolia
        var debouncedHandler = _.debounce(this.clicked.bind(this), 20, true);

        var attributes = {
            className: className,
            onClick: debouncedHandler,
            onFocus: debouncedHandler,
            'data-nav-stop': true,
            tabIndex: -1,

            // If the tag is the active one, make it a nav priority target
            'data-nav-priority': this.props.priceRange.isRefined
        };

        return (<span {...attributes}>{this.props.priceRange.name}</span>);
    }

    clicked(event) {
        SearchActions.priceRangeChanged(this.props.priceRange.name);

        if(event.type === 'focus')
        {
            TooltipActions.changeTooltip(Tooltips.priceRange);
        }
    }
}

// The CategorySearches component suggests "regular" searches that the user
// could perform in the categories that hold the highest count of products for
// his query.
class CategorySearches extends React.Component {
    render() {
        var suggestions = this._categoriesSuggestions();

        return (
            <div className="categories">
                <div className="heading">
                    Search suggestions
                </div>

                <ul className="list">
                    <KeyboardNavGroup dir="vertical" loop={false}>
                        {suggestions}
                    </KeyboardNavGroup>
                </ul>
            </div>
        );
    }

    // Private methods
    _categoriesSuggestions() {
        var categories = this.props.search.results.getFacetValues(
            'categories',
            { sortBy: ['count:desc', 'name:asc'] }
        );

        // We'd need way to specify `maxValuesPerFacet` for each facet
        // independently :)
        categories = _.take(categories, 3);
        categories.unshift(this._allDeptsCategory());

        return _.map(categories, (category) => {
            return <CategorySearch key={category.name} category={category}
                                   query={this.props.search.query}/>
        });
    }

    _allDeptsCategory() {
        return {
            name: 'All Departments',
            count: this.props.search.results.nbHits
        };
    }
}


// A component to represent a single search suggestion in the category searches
class CategorySearch extends React.Component {
    render() {
        var category = this.props.category,
            pluralizedResults = pluralize('result', category.count);

        // Debounce our _performSearch handler to avoid triggering multiple
        // searches when clicking (which focuses too)
        var debouncedHandler = _.debounce(this._performSearch.bind(this), 20, true);

        // Putting a div to wrap the inside of the <li> and separate the
        // element that is able to receive focus from the element that will
        // receiving click events. Otherwise, both events trigger in a row
        // at random order and that causes UI/UX problems!
        return (
            <li data-nav-stop tabIndex="-1"
                onKeyDown={debouncedHandler.bind(this, true)}
                onFocus={debouncedHandler.bind(this, false)}>

                <div onClick={debouncedHandler.bind(this, true)}
                     tabIndex="-1"
                     onFocus={this._ignoreFocus.bind(this)}>
                        <span className="results-count">
                            {category.count} {pluralizedResults}
                        </span>
                    {` for "${this.props.query}" in `}
                    <span className="category-name">{category.name}</span>
                </div>
            </li>
        );
    }

    // Private methods
    _performSearch(preemptive, event) {
        if(event.keyCode === 13 || event.type === 'click' || event.type === 'focus')
        {
            event.stopPropagation();
            event.preventDefault();

            DisplayActions.displaySearch(this.props.category.name, preemptive);
        }

        if(event.type === 'focus')
        {
            TooltipActions.changeTooltip(Tooltips.search);
        }
    }

    // We need to prevent the focus event from bubbling from our inner <div> to
    // its parent <li>
    _ignoreFocus(event) {
        event.stopPropagation();
        event.preventDefault();
    }
}



// The PopularProducts component shows the three most popular products that best
// match the current search query
class PopularProducts extends React.Component {
    render() {
        var products = this._popularProducts();

        return (
            <div className="popular-products">
                <div className="heading">
                    Popular products
                </div>

                <ul className="list">
                    <KeyboardNavGroup dir="horizontal">
                        {products}
                    </KeyboardNavGroup>
                </ul>
            </div>
        );
    }

    // Private methods

    // Select the 3 top results and return <li> tags for them
    _popularProducts() {
        var products = _.take(this.props.search.results.hits, 3);

        return _.map(products, (product, idx) => {
            // Always give priority to the first product in the list
            let priority = {
                navPriority: idx === 0
            };

            return <Product key={product.objectID} product={product} {...priority}/>
        });
    }
}

// A component to represent a single product in the popular products list
class Product extends BaseProduct {
    constructor(props) {
        super(props);

        // The highlight state is used to keep the product's div visually
        // focused when the actual browser focus has moved to the inner
        // add to/remove from cart button.
        this.state.highlight = false;
    }

    render() {
        // Debounce our _displayProduct handler to avoid triggering multiple
        // searches when clicking (which focuses too)
        var debouncedHandler = _.debounce(this._display.bind(this), 20, true);

        var attributes = {
            'data-nav-stop': true,
            tabIndex: -1,
            'data-nav-priority': this.props.navPriority,

            onKeyDown: debouncedHandler.bind(this, true),
            onFocus: debouncedHandler.bind(this, false)
        };

        var product = this.props.product,
            classes = cx({ highlight: this.state.highlight });


        // Putting a div to wrap the inside of the <li> and separate the
        // element that is able to receive focus from the element that will
        // receiving click events. Otherwise, both events trigger in a row
        // at random order and that causes UI/UX problems!
        return (
            <li {...attributes} className={classes}>
                <div onClick={debouncedHandler.bind(this, true)}
                     tabIndex="-1"
                     onFocus={this._ignoreFocus.bind(this)}>
                    <div className="main-info">
                        <div className="picture">
                            <img src={product.image} alt={product.name}/>
                        </div>

                        <div className="price">${product.price}</div>

                        <AddToCartButton inCart={this.state.inCart}
                                         onFocus={this._setHighlightState.bind(this, true)}
                                         onBlur={this._setHighlightState.bind(this, false)}
                                         onAdd={this._addToCart.bind(this)}
                                         onRemove={this._removeFromCart.bind(this)}/>
                    </div>

                    <div className="name"
                         dangerouslySetInnerHTML={{__html: product._highlightResult.name.value}}>
                    </div>
                </div>
            </li>
        );
    }

    // Block the focus event from the inner div
    _ignoreFocus(event) {
        event.stopPropagation();
        event.preventDefault();
    }

    _setHighlightState(highlight) {
        this.setState(_.extend({}, this.state, { highlight }));
    }

    _addToCart(event) {
        if(event.keyCode == 13 || event.type === 'click')
        {
            event.stopPropagation();
            event.preventDefault();

            this.addToCart();
        }
    }

    _removeFromCart(event) {
        if(event.keyCode == 13 || event.type === 'click')
        {
            event.stopPropagation();
            event.preventDefault();

            this.removeFromCart();
        }
    }

    // Display the product in the results area
    _display(preemptive, event) {
        if(event.keyCode == 13 || event.type === 'click' || event.type === 'focus')
        {
            event.stopPropagation();
            event.preventDefault();

            DisplayActions.displayProduct(this.props.product, preemptive);
        }

        if(event.type === 'focus')
        {
            TooltipActions.changeTooltip(Tooltips.product);
        }
    }
}

// A component for the "Add to cart" button
class AddToCartButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            active: false
        };
    }

    render() {
        var inCart = this.props.inCart,
            active = this.state.active;

        var attributes = {
            className: cx({
                'add-to-cart': !inCart,
                'in-cart': inCart && !active,
                'remove-from-cart': inCart && active
            }),

            onMouseLeave: this._setActive.bind(this, false),
            onMouseEnter: this._setActive.bind(this, true),

            onFocus: this._onFocus.bind(this),
            onBlur: this._onBlur.bind(this),

            onKeyDown: inCart ? this.props.onRemove : this.props.onAdd,
            onClick: inCart ? this.props.onRemove : this.props.onAdd,

            'data-nav-stop': true,
            tabIndex: -1
        };

        var inCartText = active ? 'REMOVE' : 'IN CART',
            text = inCart ? inCartText : 'ADD TO CART';


        return <span {...attributes}>{text}</span>;
    }

    // Private methods
    _setActive(active) {
        this.setState({ active });
    }

    _onFocus(event) {
        // Switch to active state and notify our parent that we're focused
        this._setActive(true);
        this.props.onFocus(event);

        // Change the tooltip according to the "cart state" of the product
        if(this.props.inCart)
        {
            TooltipActions.changeTooltip(Tooltips.removeFromCart);
        }
        else
        {
            TooltipActions.changeTooltip(Tooltips.addToCart);
        }
    }

    _onBlur(event) {
        // Switch to non-active state and notify our parent that we're not
        // focused anymore.
        this._setActive(false);
        this.props.onBlur(event);
    }
}
