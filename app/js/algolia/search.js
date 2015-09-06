import search from 'algoliasearch';
import helper from 'algoliasearch-helper';

const APP_ID = 'PCPLLQEPNP';
const API_KEY = '47cd5bed96f9000541665a46dba8d031'; // search-only
const INDEX_NAME = 'AlgoBuyProducts';
const SEARCH_PARAMS = {
    facets: ['categories', 'price_range']
};

var client = search(APP_ID, API_KEY);

// Just export a new AlgoliaSearchHelper instance that can be used to configure
// and run searches.
export default helper(client, INDEX_NAME, SEARCH_PARAMS);
