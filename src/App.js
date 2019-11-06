import React, {Component} from 'react';
import './App.css';
import CoinGrid from "./grid/CoinGrid";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import {render} from "react-dom";

class App extends Component {

    render() {
        return (
        <div className="ag-theme-balham" style={{ height: '200px', width: '600px' }}>
            <CoinGrid>
            </CoinGrid>
        </div>
        );
    }
}

export default App;