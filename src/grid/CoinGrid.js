import React, {Component} from "react";
import {AgGridReact} from "ag-grid-react";
import "./grid-styles.css"
import ChartModal from "../ChartModal";
import urlObject from "../UrlObject";
import info from './info_black.png';
import Popup from 'reactjs-popup';
import Loader from 'react-loader-spinner';

class CoinGrid extends Component {
    mounted = false;

    constructor(props) {
        super(props);
        this.toggleModal = this.toggleModal.bind(this);
        this.state = {
            columnDefs: [
                {
                    headerName: "Coin", field: "coin", sortable: true, width: 150,
                    cellRenderer: (params) => this.getLink(params), cellStyle: {border: 'none !important'},
                },
                {
                    headerName: "Market", field: "currency", sortable: true, cellStyle: {border: 'none !important'}
                },
                {
                    headerName: "24Hr Price Change", field: "priceChange", sortable: true,
                    cellStyle: (params) => this.getCellFontColorNoSelection(params),
                    comparator: this.columnComparator
                },
                {
                    headerName: "24Hr Price Change %", field: "priceChangePercent", sortable: true,
                    cellStyle: (params) => this.getCellFontColorNoSelection(params),
                    comparator: this.columnComparator
                },
                {
                    headerName: "Current Price ⓘ", field: "lastPrice", sortable: true, cellStyle: {cursor: 'pointer'},
                    comparator: this.columnComparator
                },
                {
                    headerName: "24Hr High Price",
                    field: "highPrice",
                    sortable: true,
                    cellStyle: {border: 'none !important'},
                    comparator: this.columnComparator
                },
                {
                    headerName: "24Hr Low Price",
                    field: "lowPrice",
                    sortable: true,
                    cellStyle: {border: 'none !important'},
                    comparator: this.columnComparator
                },
                {
                    headerName: "24Hr Coin Volume ⓘ", field: "volume", sortable: true, cellStyle: {cursor: 'pointer'},
                    comparator: this.columnComparator
                },
                {
                    headerName: "24Hr Market Volume ⓘ",
                    field: "quoteVolume",
                    sortable: true,
                    cellStyle: {cursor: 'pointer'},
                    comparator: this.columnComparator
                },
                {
                    headerName: "24Hr Market Volume Change %", field: "volumeChangePercent", sortable: true,
                    cellStyle: (params) => this.getCellFontColorNoSelection(params),
                    comparator: this.columnComparator
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
            isPrice: false,
            isLoading: true
        }
    }

    getCellFontColorNoSelection(params) {
        if (params.value === 0.0) {
            return {color: 'white', border: 'none !important'};
        }
        if (params.value < 0.0) {
            return {color: 'red', border: 'none !important'};
        }
        return {color: 'green', border: 'none !important'};
    }

    getLink(params) {
        let data = params.data;
        let icon = "<img style='vertical-align: middle' alt=''/ src=\"data:image/png;base64, " + data.icon + " \"> ";
        let link = icon + "<a target='_blank' rel='noopener noreferrer' href='" + data.tradeLink + "'> " + params.value + "</a>";
        return link;
    }

    formatNumber(num) {
        let num_parts = num.toString().split(".");
        num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return num_parts.join(".");
    }

    //Format the data to have commas: i.e. 12500 becomes 12,500
    formatData(data) {
        data.map(item => item.priceChange = this.formatNumber(item.priceChange));
        data.map(item => item.priceChangePercent = this.formatNumber(item.priceChangePercent));
        data.map(item => item.lastPrice = this.formatNumber(item.lastPrice));
        data.map(item => item.highPrice = this.formatNumber(item.highPrice));
        data.map(item => item.lowPrice = this.formatNumber(item.lowPrice));
        data.map(item => item.volume = this.formatNumber(item.volume));
        data.map(item => item.quoteVolume = this.formatNumber(item.quoteVolume));
        data.map(item => item.volumeChangePercent = this.formatNumber(item.volumeChangePercent));
    }

    componentDidMount() {
        this.mounted = true;
        urlObject.apiHost = process.env.REACT_APP_API_HOST;
        if (typeof urlObject.apiHost == "undefined") {
            urlObject.apiHost = "https://www.coininfousa.cc/api/v1/binance";
        }
        //freezing the object prevents other places from modifying it
        Object.freeze(urlObject);
        const url = urlObject.apiHost + "/24HourTicker";
        fetch(url)
            .then(result => {
                return result.json();
            }).then(data => {
            if (this.mounted) {
                this.formatData(data);
                this.setState({rowData: data});
                this.setState({allRowData: data});
                let markets = [...new Set(data.map(item => item.currency))];
                this.setState({markets: markets});
            }
            this.setState({isLoading: false});
        }).catch(err => {
            this.setState({isLoading: false});
            if (err.name === 'AbortError') {
                console.log("error catch: " + err);
                return;
            }
            throw err;
        });
    }

    onCellClicked(event) {
        if (this.state.isOpen) {
            return;
        }
        let isVolume = event.column.getColId() === "volume";
        let isQuoteVolume = event.column.getColId() === "quoteVolume";
        let isPrice = event.column.getColId() === "lastPrice";
        if (isVolume || isQuoteVolume) {
            this.doVolume(event, isVolume);
        } else if (isPrice) {
            this.doPrice(event);
        }
    }

    onGridReady(params) {
        let columns = params.columnApi.getAllColumns().filter(col => col.colId !== "coin");
        params.columnApi.autoSizeColumns(columns);
    }

    columnComparator(value1, value2) {
        let str1 = value1.replace(/,/g, '');
        let str2 = value2.replace(/,/g, '');
        let num1 = parseFloat(str1);
        let num2 = parseFloat(str2);
        return num1 - num2;
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

    resetMarketButtons() {
        let markets = this.state.markets;
        markets.forEach(market => this.refs[market].className = "market-button");
        this.allButton.className = "market-button";
    }

    onMarketButtonClick(currency) {
        this.resetMarketButtons();
        this.refs[currency].className = "market-button-selected";
        let rows = this.state.allRowData;
        let filteredRows = rows.filter(value => {
            return value.currency === currency
        });
        this.setState({rowData: filteredRows});
    }

    onAllMarketButtonClick() {
        this.resetMarketButtons();
        this.allButton.className = "market-button-selected";
        this.setState({rowData: this.state.allRowData});
    }

    toggleModal() {
        this.setState({isOpen: !this.state.isOpen});
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    getToolTipInfo() {
        return (
            <div className="tooltip-info">
                <div className="tooltip-info-header">ⓘ</div>
                <span>
                    To see detailed price or volume information,
                    click on a cell in a column with a 'ⓘ'.
                    <br/>
                    <br/>
                        (i.e. "Current Price ⓘ" column.)
                </span>
            </div>);
    }

    getToolTip(toolTipInfo) {
        return (
            <Popup
                trigger={open => (
                    <button className="info-button">
                        <img src={info} className="info-button" alt="Information"/>
                    </button>
                )}
                position={"right top"}
                closeOnDocumentClick
            >
                {toolTipInfo}
            </Popup>);
    }

    getGrid() {
        return (
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
                onGridReady={this.onGridReady.bind(this)}
            >
            </AgGridReact>);
    }

    getSpinner() {
        return (
            <Loader className="loader-style"
                    type="Puff"
                    color="#3c3bff"
                    timeout={8000} //8 secs
            />);
    }

    getMarketButtons() {
        let marketButtons = this.state.markets.map(currency => <button className="market-button"
                                                                       ref={currency}
                                                                       key={currency}
                                                                       onClick={this.onMarketButtonClick.bind(this, currency)}>{currency}</button>);
        marketButtons.push(<button className="market-button-selected"
                                   key="ALL"
                                   ref={allButton => this.allButton = allButton}
                                   onClick={this.onAllMarketButtonClick.bind(this)}>ALL</button>);
        return marketButtons;
    }

    render() {
        const marketButtons =  this.getMarketButtons();
        const toolTipInfo = this.getToolTipInfo();
        const tooltip = this.getToolTip(toolTipInfo);
        const agGrid = this.getGrid();
        const spinner = this.getSpinner();
        const gridOrSpinner = this.state.isLoading ? spinner : agGrid;

        return (
            <div className="grid-background">
                <div className="info-section">
                    {tooltip}
                    <label className="market-label">Exchange:</label>
                    <select className="exchange-select">
                        <option>Binance USA</option>
                    </select>
                    <label className="market-label">Market:</label>
                    {marketButtons}
                </div>
                <div className="ag-theme-balham-dark"
                     style={{width: "100%", height: 3000}}>
                    {gridOrSpinner}
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
