import _ from 'lodash';

import {Store} from 'flux/utils';
import * as TooltipConstants from 'constants/tooltip_constants';
import Dispatcher from 'dispatcher/algobuy_dispatcher';

const availableTooltips = {
    [TooltipConstants.default]: 'Use the arrow keys or [Tab] to navigate this menu',
    [TooltipConstants.priceRange]: 'Select a price range to refine your search',
    [TooltipConstants.search]: 'Hit [Enter] to view the results for this search',
    [TooltipConstants.product]: 'Hit [Enter] to view the details of this product',
    [TooltipConstants.cart]: 'Hit [Enter] to add this product to your shopping cart'
};

var currentTooltip = TooltipConstants.default;

// The TooltipStore keeps track of the current tooltip displayed at the top of
// the autocomplete menu
class TooltipStore extends Store {
    getTooltip() {
        return availableTooltips[currentTooltip];
    }

    __onDispatch(action) {
        switch(action.type) {
            case TooltipConstants.CHANGE_TOOLTIP:
                if(currentTooltip !== action.tooltip)
                {
                    currentTooltip = action.tooltip;
                    this.__emitChange();
                }
                break;
        }
    }
}

export default new TooltipStore(Dispatcher);
