import React, {Component} from 'react';
import './App.css';
import CoinGrid from "./grid/CoinGrid";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import logo from './increasing.png';

class App extends Component {
    render() {
        return (
            <div className="App">
                <img src={logo} className="App-logo" alt="Crypto USA"/>
                <div className="App-header">
                    <a href="#home" className="App-link">Coin Info USA</a>
                </div>
                <CoinGrid/>
            </div>
        );
    }
}

export default App;