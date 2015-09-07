// EMPTY_SEARCH_QUERY denotes that no search has taken place
export const EMPTY_SEARCH_QUERY = Symbol('EmptySearchQuery');

// SEARCH_ERROR indicates that there are no search results due to an error
export const SEARCH_ERROR = Symbol('SearchError');


// ACTION TYPES //

// Dispatched action type when the user selects a price range in the menu
export const PRICE_RANGE_CHANGED = Symbol('PriceRangeChanged');

// Dispatched action type when search results are received
export const SEARCH_RESULTS_RECEIVED = Symbol('SearchResultsReceived');

// Dispatched action type when search resulted in an error
export const SEARCH_FAILED = Symbol('SearchFailed');

