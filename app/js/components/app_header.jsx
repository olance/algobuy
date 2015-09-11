import React from 'react';

import CartController from 'components/cart.jsx';

// The AppHeader component contains the page logo and holds the cart component
class AppHeader extends React.Component {
    render() {
        return (
            <header>
                <img src="images/algobuy.png" alt="AlgoBuy"/>
                <CartController/>
            </header>
        );
    }
}

export default AppHeader;
