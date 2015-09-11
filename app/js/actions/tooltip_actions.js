import Dispatcher from 'dispatcher/algobuy_dispatcher';
import * as TooltipConstants from 'constants/tooltip_constants';

export default class TooltipActions {

    static changeTooltip(tooltip) {
        Dispatcher.dispatch({
            type: TooltipConstants.CHANGE_TOOLTIP,
            tooltip
        });
    }

};
