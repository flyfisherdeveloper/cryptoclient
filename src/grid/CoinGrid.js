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
            columnDefs: [
                {
                    headerName: "Coin Pair", field: "symbol", sortable: true,
                    cellRenderer: (params) => this.getLink(params),
                }, {
                    headerName: "24Hr Price Change", field: "priceChange", sortable: true,
                    cellStyle: (params) => this.getCellFontColor(params),
                }, {
                    headerName: "24Hr Price Change %", field: "priceChangePercent", sortable: true,
                    cellStyle: (params) => this.getCellFontColor(params),
                }, {
                    headerName: "Current Price", field: "lastPrice", sortable: true, cellStyle: {cursor: 'pointer'},
                }, {
                    headerName: "24Hr High Price", field: "highPrice", sortable: true,
                }, {
                    headerName: "24Hr Low Price", field: "lowPrice", sortable: true,
                }, {
                    headerName: "24Hr Volume", field: "volume", sortable: true, cellStyle: {cursor: 'pointer'},
                }, {
                    headerName: "24Hr Quote Volume", field: "quoteVolume", sortable: true, cellStyle: {cursor: 'pointer'},
                },
            ],
            defaultColDef: {
                resizable: true
            },
            gridOptions: {
                rowHeight: 60,
                rowStyle: {
                    fontWeight: "bold",
                    fontSize: "14px",
                    'border-bottom': 'black 10px solid',
                    'border-top': 'black 10px solid',
                },
            },
            rowData: [],
            isOpen: false,
            symbol: "", //i.e. LTCUSDT
            quote: "",  //i.e. USDT
            coin: "",   //i.e. LTC
            price: 0.0,
            isQuoteVolume: false,
            isPrice: false
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
        let coin = params.value.slice(0, start);
        let newStr = coin + "_" + this.quote;
        const tradeUrl = "https://www.binance.us/en/trade/";
        let url = tradeUrl + newStr;
        const iconUrl = "http://localhost:8080/api/v1/binance/icon/";
        let iconLink = iconUrl + coin.toLowerCase();
        let icon = "<img src = " + iconLink + " style='vertical-align: middle' alt=''/> ";
        let link = icon + "<a target='_blank' rel='noopener noreferrer' href='" + url + "'> " + params.value + "</a>";
        return link;
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
        const url = 'http://localhost:8080/api/v1/binance/24HourTicker';
        fetch(url)
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
        let isPrice = event.column.getColId() === "lastPrice";
        if (isVolume || isQuoteVolume) {
            this.doVolume(event, isVolume);
        } else if (isPrice) {
            this.doPrice(event);
        }
    }

    onCellMouseOver(event) {
        let isVolume = event.column.getColId() === "volume";
        let isQuoteVolume = event.column.getColId() === "quoteVolume";
        let isPrice = event.column.getColId() === "lastPrice";
        if (isVolume || isQuoteVolume || isPrice) {
        }
    }

    onFirstDataRendered(params) {
        params.api.sizeColumnsToFit();
    }

    doVolume(event, isVolume) {
        this.setState({isPrice: false});
        if (isVolume) {
            this.setState({isQuoteVolume: false});
        } else {
            this.setState({isQuoteVolume: true});
        }
        let selectedSymbol = event.api.getSelectedRows()[0].symbol;
        this.setState({symbol: selectedSymbol});
        this.setState({quote: this.getQuote(selectedSymbol)});
        this.setState({coin: this.getCoin(selectedSymbol)});
        this.toggleModal();
    }

    doPrice(event) {
        this.setState({isPrice: true});
        this.setState({isQuoteVolume: false});
        let selectedSymbol = event.api.getSelectedRows()[0].symbol;
        let selectedPrice = event.api.getSelectedRows()[0].lastPrice;
        let thePrice = Number(selectedPrice);
        this.setState({symbol: selectedSymbol});
        this.setState({quote: this.getQuote(selectedSymbol)});
        this.setState({coin: this.getCoin(selectedSymbol)});
        this.setState({price: thePrice});
        this.toggleModal();
    }

    toggleModal() {
        this.setState({isOpen: !this.state.isOpen});
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    render() {
        return (
            <div className="header">
                <div
                    className="ag-theme-balham-dark"
                    style={{width: 1500, height: 2800}}>
                    <AgGridReact
                        reactNext={true}
                        rowSelection={"single"}
                        enableSorting={true}
                        gridOptions={this.state.gridOptions}
                        pagination={false}
                        columnDefs={this.state.columnDefs}
                        defaultColDef={this.state.defaultColDef}
                        rowData={this.state.rowData}
                        onCellClicked={this.onCellClicked.bind(this)}
                        onCellMouseOver={this.onCellMouseOver.bind(this)}
                        onFirstDataRendered={this.onFirstDataRendered.bind(this)}
                    >
                    </AgGridReact>
                    <ChartModal isOpen={this.state.isOpen}
                                symbol={this.state.symbol}
                                quote={this.state.quote}
                                coin={this.state.coin}
                                isQuoteVolume={this.state.isQuoteVolume}
                                isPrice={this.state.isPrice}
                                onClose={this.toggleModal}>
                    </ChartModal>
                </div>
            </div>
        );
    }
}

export default CoinGrid;
