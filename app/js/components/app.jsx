import React from 'react';

import Header from './app_header.jsx';
import Autocomplete from './autocomplete/autocomplete.jsx';
import ResultsDisplay from 'components/results_display.jsx';

class App extends React.Component {
    render() {
        return (
            <div>
                <Header/>

                <section className="search">
                    <h1>We find, you buy!</h1>
                    <Autocomplete/>
                </section>

                <section className="display">
                    <ResultsDisplay/>
                </section>
            </div>
        )
    }
}

export default App;
