import _ from 'lodash';
import cx from 'classnames';

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
            let rangeTags = this._priceRangesList(results);

            return (
                <div className="search-suggestions">
                    <div className="price-ranges">
                        {rangeTags}
                    </div>
                </div>
            );
        }
    }

    // Private methods
    _priceRangesList(results) {
        // Get all available price_range values
        var priceRanges = results.getFacetValues('price_range', {
            sortBy: ['name:asc']
        });

        // Map all ranges to their tag
        var rangeTags = priceRanges.map((range) => {
            return <PriceRangeTag key={range.name} priceRange={range} />;
        });

        // Add a "any price" tag used when no refinement has been done
        var anyRange = {
            name: 'any price',
            isRefined: !_.any(priceRanges, 'isRefined')
        };

        rangeTags.unshift(<PriceRangeTag key="any-price"
                                         priceRange={anyRange}/>);

        return rangeTags;
    }
}

export default SearchSuggestions;

// PRIVATE COMPONENTS
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

    }
}

