import React, {Component} from "react";
import {AgGridReact} from "ag-grid-react";
import "./styles.css"
import ChartModal from "../ChartModal";

class CoinGrid extends Component {
    mounted = false;

    constructor(props) {
        super(props);
        this.toggleModal = this.toggleModal.bind(this);
        this.state = {
            columnDefs: [{
                headerName: "Coin Pair", field: "symbol", sortable: true, filter: true,
                cellRenderer: (params) => this.getLink(params),
            }, {
                headerName: "24Hr Price Change", field: "priceChange", sortable: true, filter: true,
                cellStyle: (params) => this.getCellFontColor(params),
            }, {
                headerName: "24Hr Price Change %", field: "priceChangePercent", sortable: true, filter: true,
                cellStyle: (params) => this.getCellFontColor(params),
            }, {
                headerName: "High Price", field: "highPrice", sortable: true, filter: true,
            }, {
                headerName: "Low Price", field: "lowPrice", sortable: true, filter: true,
            }, {
                headerName: "Volume", field: "volume", sortable: true, filter: true,
            }, {
                headerName: "Quote Volume", field: "quoteVolume", sortable: true, filter: true,
            },
            ],
            gridOptions: {
                rowHeight: 45,
                rowStyle: {
                    fontWeight: "bold",
                    fontSize: "14px",
                    'border-bottom': 'black 10px solid',
                    'border-top': 'black 10px solid',
                },
            },
            rowData: [],
            isOpen: false,
            symbol: "",
            quote: "",
            isQuoteVolume: false
        }
    }

    getCellFontColor(params) {
        if (params.value === 0.0) {
            return {color: 'white'}
        }
        if (params.value < 0.0) {
            return {color: 'red'};
        }
        return {color: 'green'};
    }

    getLink(params) {
        //todo: do this server-side, and include the link in the data passed from the server
        //get the url of the trading pair - this function only works for USD, USDT, BTC, ETH pairs
        //that is OK for now, but if there is ever a different pairing of 4 letters (such as LTCDOGE),
        //then that link won't work here
        this.quote = this.getQuote(params.value);
        let start = this.getStartOfQuote(params.value);
        let newStr = params.value.slice(0, start) + "_" + this.quote;
        let url = "https://www.binance.us/en/trade/" + newStr;
        return "<a href='" + url + "'> " + params.value + "</a>";
    }

    getQuoteOffset(params) {
        let offset = 3;
        if (params.endsWith("USDT")) {
            offset = 4;
        }
        return offset;
    }

    getStartOfQuote(str) {
        let end = str.length;
        let offset = this.getQuoteOffset(str);
        return end - offset;
    }

    getQuote(str) {
        let start = this.getStartOfQuote(str);
        return str.slice(start, str.length);
    }

    getCoin(str) {
        let offset = this.getStartOfQuote(str);
        return str.slice(0, offset);
    }

    componentDidMount() {
        this.mounted = true;
        fetch('http://localhost:8080/api/v1/binance/24HourTicker')
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

    onCellClicked(event) {
        let isVolume = event.column.getColId() === "volume";
        let isQuoteVolume = event.column.getColId() === "quoteVolume";
        if (isVolume === true || isQuoteVolume === true) {
            let selectedSymbol = event.api.getSelectedRows()[0].symbol;
            this.setState({symbol: selectedSymbol});
            if (isVolume) {
                this.setState({quote: this.getCoin(selectedSymbol)});
            } else {
                this.setState({quote: this.getQuote(selectedSymbol)});
                this.setState({isQuoteVolume: true})
            }
            this.toggleModal();
        }
    }

    toggleModal() {
        this.setState({isOpen: !this.state.isOpen});
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    render() {
        return (
            <div
                className="ag-theme-balham-dark"
                style={{width: 1500, height: 800}}>
                <AgGridReact
                    reactNext={true}
                    rowSelection={"single"}
                    enableSorting={true}
                    enableFilter={true}
                    gridOptions={this.state.gridOptions}
                    pagination={true}
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}
                    onCellClicked={this.onCellClicked.bind(this)}
                >
                </AgGridReact>
                <ChartModal isOpen={this.state.isOpen}
                            symbol={this.state.symbol}
                            quote={this.state.quote}
                            isQuoteVolume={this.state.isQuoteVolume}
                            onClose={this.toggleModal}>
                </ChartModal>
            </div>
        );
    }
}

export default CoinGrid;
