import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columnDefs: [{
                headerName: "Coin Pair", field: "symbol", sortable: true, filter: true,
                cellRenderer: function(params) {
                    //get the url of the trading pair - this function only works for USD, USDT, BTC, ETH pairs
                    //that is OK for now, but if there is ever a different pairing of 4 letters (such as LTCDOGE),
                    //then that link won't work here
                    let offset = 3;
                    if (params.value.endsWith("USDT")) {
                        offset = 4;
                    }
                    let end = params.value.length;
                    let start = end - offset;
                    let newStr = params.value;
                    newStr = newStr.slice(0, start) + "_" + newStr.slice(start, end);
                    let url = "https://www.binance.us/en/trade/" + newStr;
                    return "<a href='" + url + "'> "+params.value+"</a>";
                }
            }, {
                headerName: "Price Change", field: "priceChange", sortable: true, filter: true
            }, {
                headerName: "Price Change Percent", field: "priceChangePercent", sortable: true, filter: true
            }, {
                headerName: "High Price", field: "highPrice", sortable: true, filter: true
            }, {
                headerName: "Low Price", field: "lowPrice", sortable: true, filter: true
            }, {
                headerName: "Volume", field: "volume", sortable: true, filter: true
            }, {
                headerName: "Quote Volume", field: "quoteVolume", sortable: true, filter: true
            }]
        }
    }

    componentDidMount() {
        fetch('http://localhost:8080/api/v1/binance/24HourTicker')
            .then(result => result.json())
            .then(rowData => this.setState({rowData}))
    }

    render() {
        return (
            <div
                className="ag-theme-balham"
                style={{height: '200px'}}
            >
                <AgGridReact
                    reactNext={true}
                    enableSorting={true}
                    enableFilter={true}
                    pagination={true}
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}>
                </AgGridReact>
            </div>
        );
    }
}

export default App;