import Dispatcher from 'dispatcher/algobuy_dispatcher.js';
import * as QueryConstants from 'constants/query_constants';

export default class QueryActions {

    // Action to notify the query changed
    static queryChanged(query) {
        Dispatcher.dispatch({
            type: QueryConstants.QUERY_CHANGED,
            query: query
        });
    }

    // Action to clear the current search query
    static queryCleared() {
        Dispatcher.dispatch({
            type: QueryConstants.QUERY_CLEARED
        });
    }

};
