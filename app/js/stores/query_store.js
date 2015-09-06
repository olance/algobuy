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
                setCurrentQuery(action.query);
                this.__emitChange();
                break;
        }
    }
}

function setCurrentQuery(query)
{
    currentQuery = query;
}

export default new QueryStore(Dispatcher);
