import _ from 'lodash';
import $ from 'jquery';

import React from 'react';
import QueryActions from 'actions/query_actions.js';

class SearchInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidUpdate(prevProps, prevState) {
        // If the search panel has been closed, make sure the search input gets
        // the focus back
        if(this.props.search.closed)
        {
            this._focus();
        }
    }

    render() {
        return (
            <div className="search-input">
                <input className="query" type="text"
                       placeholder="Type something..." autoComplete="off"
                       spellCheck="false" autoCorrect="off"

                       ref="searchInput"
                       value={this.props.search.query}
                       onChange={this.queryChanged.bind(this)}
                       data-nav-stop />

                <div className="query-input-icon"
                     onClick={this.inputIconClicked.bind(this)}></div>
            </div>
        );
    }

    queryChanged(event) {
        var $input = $(event.target),
            query = $input.val();

        if(_.isEmpty(query.trim()))
        {
            // Dispatch an action to notify the query was cleared
            QueryActions.queryCleared();
        }
        else
        {
            // Dispatch an action to notify the query changed
            QueryActions.queryChanged(query);
        }
    }

    inputIconClicked() {
        // `pointer-events: none` rule on the input-icon should prevent any
        // click event occurring when there's no query... so that's just in case
        // the CSS prop 'pointer-events' is not recognized.
        if(_.isEmpty(this.props.search.query))
        {
            this._focus();
            return;
        }

        // Clear the current query and focus back the text input
        QueryActions.queryCleared();
        this._focus();
    }

    // Private methods
    _focus() {
        React.findDOMNode(this.refs.searchInput).focus();
    }
}

export default SearchInput;
