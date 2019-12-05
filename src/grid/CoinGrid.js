import React, {Component} from "react";
import {AgGridReact} from "ag-grid-react";
import "./grid-styles.css"
import ChartModal from "../ChartModal";

class CoinGrid extends Component {
    mounted = false;

    constructor(props) {
        super(props);
        this.toggleModal = this.toggleModal.bind(this);
        this.state = {
            columnDefs: [
                {
                    headerName: "Coin", field: "coin", sortable: true, suppressSizeToFit: true, width: 200,
                    cellRenderer: (params) => this.getLink(params),
                },
                {
                    headerName: "Currency", field: "currency", sortable: true,
                },
                {
                    headerName: "24Hr Price Change", field: "priceChange", sortable: true,
                    cellStyle: (params) => this.getCellFontColor(params),
                },
                {
                    headerName: "24Hr Price Change %", field: "priceChangePercent", sortable: true,
                    cellStyle: (params) => this.getCellFontColor(params),
                },
                {
                    headerName: "Current Price", field: "lastPrice", sortable: true, cellStyle: {cursor: 'pointer'},
                },
                {
                    headerName: "24Hr High Price", field: "highPrice", sortable: true,
                },
                {
                    headerName: "24Hr Low Price", field: "lowPrice", sortable: true,
                },
                {
                    headerName: "24Hr Coin Volume", field: "volume", sortable: true, cellStyle: {cursor: 'pointer'},
                },
                {
                    headerName: "24Hr Currency Volume",
                    field: "quoteVolume",
                    sortable: true,
                    cellStyle: {cursor: 'pointer'},
                },
                {
                    headerName: "24Hr Currency Volume Change %", field: "volumeChangePercent", sortable: true,
                    cellStyle: (params) => this.getCellFontColor(params)
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
            allRowData: [],
            markets: [],
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
        let data = params.data;
        let icon = "<img src = " + data.iconLink + " style='vertical-align: middle' alt=''/> ";
        let link = icon + "<a target='_blank' rel='noopener noreferrer' href='" + data.tradeLink + "'> " + params.value + "</a>";
        return link;
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
                this.setState({allRowData: data});
                let markets = [...new Set(data.map(item => item.currency))];
                this.setState({markets: markets});
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

    onFirstDataRendered(params) {
        params.columnApi.autoSizeAllColumns();
    }

    doVolume(event, isVolume) {
        this.setState({isPrice: false});
        if (isVolume) {
            this.setState({isQuoteVolume: false});
        } else {
            this.setState({isQuoteVolume: true});
        }
        let selectedRow = event.api.getSelectedRows()[0];
        this.setState({symbol: selectedRow.symbol});
        this.setState({quote: selectedRow.currency});
        this.setState({coin: selectedRow.coin});
        this.toggleModal();
    }

    doPrice(event) {
        this.setState({isPrice: true});
        this.setState({isQuoteVolume: false});
        let selectedRow = event.api.getSelectedRows()[0];
        let thePrice = Number(selectedRow.lastPrice);
        this.setState({symbol: selectedRow.symbol});
        this.setState({quote: selectedRow.currency});
        this.setState({coin: selectedRow.coin});
        this.setState({price: thePrice});
        this.toggleModal();
    }

    onMarketButtonClick(currency) {
        let markets = this.state.markets;
        markets.forEach(market => this.refs[market].className = "market-button");
        this.refs[currency].className = "market-button-selected";
        this.allButton.className = "market-button";
        let rows = this.state.allRowData;
        let filteredRows = rows.filter(value => {
            return value.currency === currency
        });
        this.setState({rowData: filteredRows});
    }

    onAllMarketButtonClick() {
        this.setState({rowData: this.state.allRowData});
        this.allButton.className = "market-button";
    }

    toggleModal() {
        this.setState({isOpen: !this.state.isOpen});
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    render() {
        let marketButtons = this.state.markets.map(currency => <button className="market-button"
                                                                       ref={currency}
                                                                       key={currency}
                                                                       onClick={this.onMarketButtonClick.bind(this, currency)}>{currency}</button>);
        marketButtons.push(<button className="market-button-selected"
                                   key="ALL"
                                   ref={allButton => this.allButton = allButton}
                                   onClick={this.onAllMarketButtonClick.bind(this)}>ALL</button>);
        return (
            <div className="header">
                {marketButtons}
                <div className="ag-theme-balham-dark"
                     style={{width: "100%", height: 2800}}>
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
