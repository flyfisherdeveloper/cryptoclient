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
    displayMap = new Map([["Volume Information", "volume"], ["Price Information", "price"]]);
    columnApi = null;

    constructor(props) {
        super(props);
        this.toggleModal = this.toggleModal.bind(this);

        this.state = {
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
            isQuoteVolume: false,
            isPrice: false,
            isLoading: true,
            volumeDisplay: false,
            priceDisplay: false,
            allDisplay: true
        }
    }

    getAllColumnDefs() {
        return [
            {
                headerName: "Coin", field: "coin", sortable: true, width: 150,
                cellRenderer: (params) => this.getLink(params), cellStyle: {border: 'none !important'},
            },
            {
                headerName: "Market", field: "currency", sortable: true, cellStyle: {border: 'none !important'}
            },
            {
                headerName: "Current Price ⓘ", field: "lastPrice", sortable: true, cellStyle: {cursor: 'pointer'},
                comparator: this.columnComparator
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
        ];
    }

    getColumnDefs() {
        let all = this.getAllColumnDefs();
        let volume = all.filter(col => col.field === "volume");
        let quoteVolume = all.filter(col => col.field === "quoteVolume");
        let volumeChangePercent = all.filter(col => col.field === "volumeChangePercent");
        let volumeColumns = [volume, quoteVolume, volumeChangePercent];

        let price = all.filter(col => col.field === "lastPrice");
        let priceChange = all.filter(col => col.field === "priceChange");
        let pricePercent = all.filter(col => col.field === "priceChangePercent");
        let highPrice = all.filter(col => col.field === "highPrice");
        let lowPrice = all.filter(col => col.field === "lowPrice");
        let priceColumns = [price, priceChange, pricePercent, highPrice, lowPrice];

        if (this.state.volumeDisplay) {
            volumeColumns.forEach(col => this.columnApi.setColumnVisible(col.map(c => c.field), true));
            priceColumns.forEach(col => this.columnApi.setColumnVisible(col.map(c => c.field), false));
        }
        if (this.state.priceDisplay) {
            volumeColumns.forEach(col => this.columnApi.setColumnVisible(col.map(c => c.field), false));
            priceColumns.forEach(col => this.columnApi.setColumnVisible(col.map(c => c.field), true));
        }
        if (this.state.allDisplay && this.columnApi != null) {
            all.forEach(col => this.columnApi.setColumnVisible(col.field, true));
        }
        return all;
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
        return icon + "<a target='_blank' rel='noopener noreferrer' href='" + data.tradeLink + "'> " + params.value + "</a>";
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

    onGridReady(grid) {
        let columns = grid.columnApi.getAllColumns().filter(col => col.colId !== "coin");
        this.columnApi = grid.columnApi;
        grid.columnApi.autoSizeColumns(columns);
    }

    columnComparator(value1, value2) {
        //take the commas out of the numbers
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
        this.setState({symbol: selectedRow.symbol});
        this.setState({quote: selectedRow.currency});
        this.setState({coin: selectedRow.coin});
        this.toggleModal();
    }

    resetMarketButtons() {
        let markets = this.state.markets;
        markets.forEach(market => this.refs[market].className = "toolbar-button");
        this.allButton.className = "toolbar-button";
    }

    resetDisplayButtons() {
        this.displayMap.forEach((key, value) => this.refs[key].className = "toolbar-button");
        this.allDisplayButton.className = "toolbar-button";
    }

    onMarketButtonClick(currency) {
        this.resetMarketButtons();
        this.refs[currency].className = "toolbar-button-selected";
        let rows = this.state.allRowData;
        let filteredRows = rows.filter(value => {
            return value.currency === currency
        });
        this.setState({rowData: filteredRows});
    }

    onDisplayButtonClick(display) {
        this.resetDisplayButtons();
        this.refs[display].className = "toolbar-button-selected";
        //todo: fix this
        if (display === "volume") {
            this.setState({volumeDisplay: true});
            this.setState({priceDisplay: false});
            this.setState({allDisplay: false});
        }
        if (display === "price") {
            this.setState({volumeDisplay: false});
            this.setState({priceDisplay: true});
            this.setState({allDisplay: false});
        }
    }

    onAllMarketButtonClick() {
        this.resetMarketButtons();
        this.allButton.className = "toolbar-button-selected";
        this.setState({rowData: this.state.allRowData});
    }

    onAllDisplayButtonClick() {
        this.resetDisplayButtons();
        this.allDisplayButton.className = "toolbar-button-selected";
        this.setState({volumeDisplay: false});
        this.setState({priceDisplay: false});
        this.setState({allDisplay: true});
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
        const columnDefs = this.getColumnDefs();
        return (
            <AgGridReact
                reactNext={true}
                rowSelection={"single"}
                enableSorting={true}
                gridOptions={this.state.gridOptions}
                pagination={false}
                columnDefs={columnDefs}
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
        let marketButtons = this.state.markets.map(currency => <button className="toolbar-button"
                                                                       ref={currency}
                                                                       key={currency}
                                                                       onClick={this.onMarketButtonClick.bind(this, currency)}>{currency}</button>);
        marketButtons.push(<button className="toolbar-button-selected"
                                   key="ALL"
                                   ref={allButton => this.allButton = allButton}
                                   onClick={this.onAllMarketButtonClick.bind(this)}>ALL</button>);
        return marketButtons;
    }

    getDisplayButtons() {
        let displayButtons = [];
        let which = 0;
        this.displayMap.forEach((key, value) => {
            displayButtons[which++] = <button className="toolbar-button"
                                              ref={key}
                                              key={key}
                                              onClick={this.onDisplayButtonClick.bind(this, key)}>{value}</button>;
        });
        displayButtons.push(<button className="toolbar-button-selected"
                                    key="AllDisplay"
                                    ref={allDisplayButton => this.allDisplayButton = allDisplayButton}
                                    onClick={this.onAllDisplayButtonClick.bind(this)}>ALL</button>);
        return displayButtons;
    }

    render() {
        const marketButtons = this.getMarketButtons();
        const displayButtons = this.getDisplayButtons();
        const toolTipInfo = this.getToolTipInfo();
        const tooltip = this.getToolTip(toolTipInfo);
        this.grid = this.getGrid();
        const spinner = this.getSpinner();
        const gridOrSpinner = this.state.isLoading ? spinner : this.grid;
        const gridStyles = {
            normalStyle: {
                width: "100%",
                height: 3000
            },
            volumeStyle: {
                width: "51%",
                height: 3000,
                padding: "0% 25%"
            },
            priceStyle: {
                width: "60%",
                height: 3000,
                padding: "0% 20%"
            },
        };
        let whichStyle = gridStyles.normalStyle;
        if (this.state.volumeDisplay) {
            whichStyle = gridStyles.volumeStyle;
        }
        if (this.state.priceDisplay) {
            whichStyle = gridStyles.priceStyle;
        }

        return (
            <div className="grid-background">
                <div className="toolbar-section">
                    {tooltip}
                    <label className="toolbar-label-start">Display:</label>
                    {displayButtons}
                    <label className="toolbar-label">Exchange:</label>
                    <select className="exchange-select">
                        <option>Binance USA</option>
                    </select>
                    <label className="toolbar-label">Market:</label>
                    {marketButtons}
                </div>
                <div className="ag-theme-balham-dark"
                     style={whichStyle}>
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
