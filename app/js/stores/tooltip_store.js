import _ from 'lodash';

import {Store} from 'flux/utils';
import {Tooltips} from 'constants/tooltip_constants';
import * as TooltipConstants from 'constants/tooltip_constants';
import Dispatcher from 'dispatcher/algobuy_dispatcher';

const availableTooltips = {
    [Tooltips.default]: 'Use the arrow keys or [Tab] to navigate this menu',
    [Tooltips.priceRange]: 'Select a price range to refine your search',
    [Tooltips.search]: 'Hit [Enter] to view the results for this search',
    [Tooltips.product]: 'Hit [Enter] to view the details of this product',
    [Tooltips.cart]: 'Hit [Enter] to add this product to your shopping cart'
};

var currentTooltip = Tooltips.default;

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
