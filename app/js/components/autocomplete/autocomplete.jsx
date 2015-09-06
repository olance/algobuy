import _ from 'lodash';
import cx from 'classnames';

import React from 'react';
import {Container} from 'flux/utils';
import QueryStore from 'stores/query_store.js';
import SearchInput from './search_input.jsx';

class AutocompleteContainer extends React.Component {
    static getStores() {
        return [QueryStore];
    }

    static calculateState() {
        return {
            query: QueryStore.getQuery()
        }
    }

    render() {
        var widgetClasses = cx('autocomplete', {
            empty: _.isEmpty(this.state.query)
        });

        return (
            <div className={widgetClasses}>
                <SearchInput query={this.state.query}/>
            </div>
        );
    }
}

export default Container.create(AutocompleteContainer);
