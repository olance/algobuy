import React from 'react';
import TooltipStore from 'stores/tooltip_store';


class Tooltip extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tooltip: TooltipStore.getTooltip()
        };
    }

    componentDidMount() {
        this._tooltipListener = TooltipStore.addListener(this._tooltipChanged.bind(this));
    }

    componentWillUnmount() {
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
