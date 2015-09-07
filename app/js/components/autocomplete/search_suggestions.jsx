import _ from 'lodash';
import cx from 'classnames';
import pluralize from 'pluralize';

import React from 'react';

import * as SearchConstants from 'constants/search_constants.js';
import SearchActions from 'actions/search_actions';
import Search from 'algolia/search.js';

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
            // Create a list of all available price range tags for the search
            // results we received
            let ranges = this._priceRangesList(this.props.search.priceRanges);

            return (
                <div className="search-suggestions">
                    <div className="price-ranges">
                        {ranges}
                    </div>
                    <CategoriesSearch search={this.props.search}/>
                </div>
            );
        }
    }

    // Private methods
    _priceRangesList(priceRanges) {
        // Map all ranges to their tag
        return priceRanges.map((range) => {
            return <PriceRangeTag key={range.name} priceRange={range} />;
        });;
    }
}

export default SearchSuggestions;

// PRIVATE COMPONENTS

// The PriceRangeTag represents a selectable price range used to refine the
// current search.
class PriceRangeTag extends React.Component {
    render() {
        var className = cx('price-range', {
            active: this.props.priceRange.isRefined
        });

        return (
            <span className={className} onClick={this.clicked.bind(this)}>
                {this.props.priceRange.name}
            </span>
        );
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
                    {suggestions}
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
                <li key={category.name}>
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
