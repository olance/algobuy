import _ from 'lodash';
import cx from 'classnames';

import React from 'react';
import {Container} from 'flux/utils';

import KeyboardNavGroup from './keyboard_nav_group.jsx';
import OutsideClickHandler from 'components/outside_click_handler.jsx';

import SearchInput from './search_input.jsx';
import SearchSuggestions from './search_suggestions.jsx';

import QueryActions from 'actions/query_actions.js';
import QueryStore from 'stores/query_store.js';
import SearchStore from 'stores/search_store.js';
import DisplayStore from 'stores/display_store';

// The AutocompleteContainer class is a wrapper around the components that form
// the autocomplete widget, acting as a controller-view component: it subscribes
// to the Query- and SearchStore and re-renders itself whenever a change occurs
// in either of them.
class AutocompleteContainer extends React.Component {
    static getStores() {
        return [QueryStore, SearchStore, DisplayStore];
    }

    // Gather some data from the different stores we're observing
    static calculateState(prevState) {
        var searchResults = SearchStore.getResults(),
            forceClose = DisplayStore.isDisplayPreempting();

        return {
            query: QueryStore.getQuery(),
            results: searchResults.results || searchResults,
            params: searchResults.params,
            priceRanges: SearchStore.getPriceRanges(),
            error: SearchStore.getLastError(),
            closed: forceClose,
            blur: forceClose
        }
    }

    render() {
        var widgetClasses = cx('autocomplete', {
            empty: _.isEmpty(this.state.query)
        });

        return (

            <div className={widgetClasses}>
                <OutsideClickHandler onClickOutside={this._outsideClick.bind(this)}>
                    <KeyboardNavGroup dir="vertical" autofocus onEscape={this._handleEscape.bind(this)}>
                        <SearchInput search={this.state} onFocus={this._inputFocused.bind(this)}/>
                        <SearchSuggestions search={this.state}/>
                    </KeyboardNavGroup>
                </OutsideClickHandler>
            </div>
        );
    }

    _handleEscape(event) {
        // Clear the query if the suggestions panel is closed, otherwise just
        // close it
        if(this.state.closed)
        {
            QueryActions.queryCleared();
        }
        else
        {
            this.setState(_.extend({}, this.state, { closed: true }));
        }
    }

    _outsideClick() {
        // Close the panel when the user clicks outside of the autocomplete
        // component
        if(!this.state.closed)
        {
            this.setState(_.extend({}, this.state, { closed: true }));
        }
    }

    _inputFocused(event) {
        // Re-open the panel automatically when the search input is focused
        // again (if there's a non-empty current query)
        if(this.state.closed)
        {
            this.setState(_.extend({}, this.state, { closed: false }));
        }
    }
}

export default Container.create(AutocompleteContainer);
