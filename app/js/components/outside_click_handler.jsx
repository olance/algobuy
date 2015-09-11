import React from 'react';

// A wrapping component that will trigger an event whenever the user clicks
// outside of it.
class OutsideClickHandler extends React.Component {
    constructor(props) {
        super(props);

        // As .bind() creates a new function, we need to save this function if
        // we want to reference it later to remove the listener.
        this._boundHandler = this._outsideClickHandler.bind(this);
    }

    componentDidMount() {
        // Listen to all mousedown events
        document.addEventListener('mousedown', this._boundHandler);
    }

    componentWillUnmount() {
        // Remove ourselves from the event callbacks
        document.removeEventListener('mousedown', this._boundHandler);
    }

    render() {
        // Simply render a wrapping <div> around the children we were given
        return (
            <div>
                {this.props.children}
            </div>
        );
    }

    _outsideClickHandler(event) {
        // Detect whether this click event originates from outside the component
        // by iterating from parent to parent until we either find ourselves (in
        // which case the click was made inside) or arrive at the top of the
        // DOM tree (in which case it was made outside).
        event.stopPropagation();
        var localNode = React.findDOMNode(this),
            source = event.target,
            found = false;

        while(source.parentNode)
        {
            found = (source === localNode);
            if(found)
            {
                return;
            }
            source = source.parentNode;
        }

        // If we come down to here, then the click was made outside, so call the
        // event callback we were given
        this.props.onClickOutside.call(null, event);
    }
}

OutsideClickHandler.propTypes = {
    onClickOutside: React.PropTypes.func.isRequired
};

export default OutsideClickHandler;
