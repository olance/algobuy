import React from 'react';


class OutsideClickHandler extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            boundHandler: this._outsideClickHandler.bind(this)
        };
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.state.boundHandler);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.state.boundHandler);
    }

    render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }

    _outsideClickHandler(event) {
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

        this.props.onClickOutside.call(null, event);
    }
}

OutsideClickHandler.propTypes = {
    onClickOutside: React.PropTypes.func.isRequired
};

export default OutsideClickHandler;
