import React, {Component} from 'react';
import './App.css';
import CoinGrid from "./grid/CoinGrid";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

class App extends Component {

    render() {
        return (
            <CoinGrid/>
        );
    }
}

export default App;