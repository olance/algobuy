import Dispatcher from 'dispatcher/algobuy_dispatcher';
import * as TooltipConstants from 'constants/tooltip_constants';

export default class TooltipActions {

    // Action to change the current tooltip
    static changeTooltip(tooltip) {
        Dispatcher.dispatch({
            type: TooltipConstants.CHANGE_TOOLTIP,
            tooltip
        });
    }

};
