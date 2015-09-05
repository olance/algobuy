import React from 'react';

class Autocomplete extends React.Component {
    render() {
        return (
            <div className="autocomplete">
                <input type="text" placeholder="Type something..."
                       autofocus="autofocus" autocomplete="off"
                       spellcheck="false" autocorrect="off"/>

                <div className="input-icon"></div>
            </div>
        );
    }
}

export default Autocomplete;
