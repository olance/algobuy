import React from 'react';
import TooltipStore from 'stores/tooltip_store';


// This component simply displays the current tooltip given by the TooltipStore.
// It listens to the store on its own because it felt a bit too much to refresh
// an entire component tree just to have an impact on a single line here.
class Tooltip extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tooltip: TooltipStore.getTooltip()
        };
    }

    componentDidMount() {
        // Listen to the store's change events
        this._tooltipListener = TooltipStore.addListener(this._tooltipChanged.bind(this));
    }

    componentWillUnmount() {
        // Remove the listener
        this._tooltipListener.remove();
    }

    render() {
        return (
            <div className="tooltip">
                <img src="images/tooltip-icon.png" alt="Tooltip"/>
                {this.state.tooltip}
            </div>
        );
    }

    // Private methods
    _tooltipChanged() {
        this.setState({ tooltip: TooltipStore.getTooltip() });
    }
}

export default Tooltip;
