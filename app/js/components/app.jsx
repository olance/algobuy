import React from 'react';
import Header from './app_header.jsx';
import Autocomplete from './autocomplete/autocomplete.jsx';


class App extends React.Component {
    render() {
        return (
            <div>
                <Header/>

                <section className="content">
                    <h1>We find, you buy!</h1>
                    <Autocomplete/>
                </section>
            </div>
        )
    }
}

export default App;
