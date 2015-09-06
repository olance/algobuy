import _ from 'lodash';
import $ from 'jquery';
import React from 'react';
import cx from 'classnames';

class Autocomplete extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            query: ''
        };
    }

    render() {
        var widgetClasses = cx('autocomplete', {
            open: this.state.open,
            empty: _.isEmpty(this.state.query)
        });

        return (
            <div className={widgetClasses}>
                <input type="text" placeholder="Type something..."
                       autoFocus="autofocus" autoComplete="off"
                       spellCheck="false" autoCorrect="off"

                       ref="searchInput"
                       value={this.state.query}
                       onChange={this.queryChanged.bind(this)} />

                <div className="input-icon"
                     onClick={this.inputIconClicked.bind(this)}></div>
            </div>
        );
    }

    queryChanged(event) {
        var state = _.cloneDeep(this.state),
            $input = $(event.target);

        // Get the user-typed query and save it to the component's state
        state.query = $input.val();
        this.setState(state);
    }

    inputIconClicked() {
        // `pointer-events: none` rule on the input-icon should prevent any
        // click event occurring when there's no query... so that's just in case
        // the CSS prop 'pointer-events' is not recognized.
        if(_.isEmpty(this.state.query))
        {
            this._focus();
            return;
        }

        // Clear the current query and focus back the text input
        this.setState(_.extend(this.state, { query: '' }));
        this._focus();
    }

    // Private methods
    _focus() {
        React.findDOMNode(this.refs.searchInput).focus();
    }
}

export default Autocomplete;
