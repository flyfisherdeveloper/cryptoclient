import React, {Component} from "react";
import {render} from "react-dom";
import {AgGridReact} from "ag-grid-react";

class CoinGrid extends Component {
    mounted = false;

    constructor(props) {
        super(props);
        this.state = {
            columnDefs: [{
                headerName: "Coin Pair", field: "symbol", sortable: true, filter: true,
                cellRenderer: function (params) {
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
                    return "<a href='" + url + "'> " + params.value + "</a>";
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
                headerName: "Volume", field: "volume", sortable: true, filter: true,
            }, {
                headerName: "Quote Volume", field: "quoteVolume", sortable: true, filter: true
            },
            ],
            rowData: []
        }
    }

    componentDidMount() {
        this.mounted = true;
        fetch('http://localhost:8080/api/v1/binance/Mock24HourTicker')
            .then(result => {
                return result.json();
            }).then(data => {
            if (this.mounted) {
                this.setState({rowData: data});
            }
        }).catch(err => {
            if (err.name === 'AbortError') {
                console.log("error catch: " + err);
                return;
            }
            throw err;
        });
    }

    onRowSelected(params) {
        let rows = params.api.getSelectedRows();
        let volume = "";
        rows.forEach((selectedRow) => {
            volume = selectedRow.volume;
        });
        console.log("selected row volume: " + volume);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    render() {
        return (
            <div
                className="ag-theme-balham"
                style={{height: '800px', width: '1500px'}}
            >
                <AgGridReact
                    reactNext={true}
                    rowSelection={"single"}
                    enableSorting={true}
                    enableFilter={true}
                    pagination={true}
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}
                    onSelectionChanged={this.onRowSelected.bind(this)}
                >
                </AgGridReact>
            </div>
        );
    }
}

export default CoinGrid;
