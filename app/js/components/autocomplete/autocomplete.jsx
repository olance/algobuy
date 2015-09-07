import _ from 'lodash';
import cx from 'classnames';

import React from 'react';
import {Container} from 'flux/utils';

import SearchInput from './search_input.jsx';
import SearchSuggestions from './search_suggestions.jsx';

import QueryStore from 'stores/query_store.js';
import SearchStore from 'stores/search_store.js';

// The AutocompleteContainer class is a wrapper around the components that form
// the autocomplete widget, acting as a controller-view component: it subscribes
// to the Query- and SearchStore and re-renders itself whenever a change occurs
// in either of them.
class AutocompleteContainer extends React.Component {
    static getStores() {
        return [QueryStore, SearchStore];
    }

    static calculateState() {
        var searchResults = SearchStore.getResults();

        return {
            query: QueryStore.getQuery(),
            results: searchResults.results || searchResults,
            params: searchResults.params,
            priceRanges: SearchStore.getPriceRanges(),
            error: SearchStore.getLastError()
        }
    }

    render() {
        var widgetClasses = cx('autocomplete', {
            empty: _.isEmpty(this.state.query)
        });

        return (
            <div className={widgetClasses}>
                <SearchInput query={this.state.query}/>
                <SearchSuggestions search={this.state}/>
            </div>
        );
    }
}

export default Container.create(AutocompleteContainer);
