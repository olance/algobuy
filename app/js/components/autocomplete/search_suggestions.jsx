import _ from 'lodash';
import cx from 'classnames';
import pluralize from 'pluralize';
import debounce from 'debounce';

import React from 'react';

import * as SearchConstants from 'constants/search_constants.js';
import SearchActions from 'actions/search_actions';
import Search from 'algolia/search.js';

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
        else if(emptyQuery)
        {
            return null;
        }
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
        else
        {
            return (
                <div className="search-suggestions">
                    <PriceRangeList search={this.props.search}/>
                    <CategoriesSearch search={this.props.search}/>
                    <PopularProducts search={this.props.search}/>
                </div>
            );
        }
    }
}

export default SearchSuggestions;

// PRIVATE COMPONENTS

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
        var debouncedHandler = debounce(this.clicked.bind(this), 20, true);

        var attributes = {
            className: className,
            onClick: debouncedHandler,
            onFocus: debouncedHandler,
            'data-nav-stop': true,
            tabIndex: -1
        };

        // If the tag is the active one, make it a nav priority target
        if(this.props.priceRange.isRefined)
        {
            attributes['data-nav-priority'] = true;
        }

        return (<span {...attributes}>{this.props.priceRange.name}</span>);
    }

    clicked() {
        SearchActions.priceRangeChanged(this.props.priceRange.name);
    }
}

// The CategoriesSearch component suggests "regular" searches that the user
// could perform in the categories that hold the highest count of products for
// his query.
class CategoriesSearch extends React.Component {
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
            let pluralizedResults = pluralize('result', category.count);

            return (
                <li key={category.name} data-nav-stop tabIndex="-1">
                    <span className="results-count">
                        {category.count} {pluralizedResults}
                    </span>
                    {` for "${this.props.search.query}" in `}
                    <span className="category-name">{category.name}</span>
                </li>
            );
        });
    }

    _allDeptsCategory() {
        return {
            name: 'All Departments',
            count: this.props.search.results.nbHits
        };
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
            let attributes = {
                key: product.objectID,
                'data-nav-stop': true,
                tabIndex: -1
            };

            // Always give priority to the first product in the list
            if(idx === 0)
            {
                attributes['data-nav-priority'] = true;
            }

            return (
                <li {...attributes}>
                    <div className="main-info">
                        <div className="picture">
                            <img src={product.image} alt={product.name}/>
                        </div>

                        <div className="price">${product.price}</div>

                        <div className="add-to-cart" data-nav-stop tabIndex="-1">ADD TO CART</div>
                    </div>

                    <div className="name"
                         dangerouslySetInnerHTML={{__html: product._highlightResult.name.value}}>
                    </div>
                </li>
            );
        });
    }
}
