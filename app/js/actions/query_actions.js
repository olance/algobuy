import Dispatcher from 'dispatcher/algobuy_dispatcher.js';
import * as QueryConstants from 'constants/query_constants';

export default class QueryActions {

    static queryChanged(query) {
        Dispatcher.dispatch({
            type: QueryConstants.QUERY_CHANGED,
            query: query
        });
    }

};
