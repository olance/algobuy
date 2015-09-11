import {Store} from 'flux/utils';
import * as QueryConstants from 'constants/query_constants.js';
import Dispatcher from 'dispatcher/algobuy_dispatcher.js';

var currentQuery = '';

// The QueryStore keeps track of the current search query typed by the user
class QueryStore extends Store {
    getQuery() {
        return currentQuery;
    }

    __onDispatch(action) {
        switch(action.type) {
            // Update our current query value when it's changed
            case QueryConstants.QUERY_CHANGED:
                let oldQuery = currentQuery;
                currentQuery = action.query;

                // Do not emit a change event if the query remained identical
                if(oldQuery !== currentQuery)
                {
                    this.__emitChange();
                }

                break;

            case QueryConstants.QUERY_CLEARED:
                if(currentQuery !== '')
                {
                    currentQuery = '';
                    this.__emitChange();
                }
                break;
        }
    }
}

export default new QueryStore(Dispatcher);
