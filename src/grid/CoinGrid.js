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
    displayMap = new Map([["Volume Info", "volume"], ["Price Info", "price"]]);
    columnApi = null;
    currentExchange = "A";
    notAvailable = "Not Available";
    priceColumns = ["marketCap", "lastPrice", "priceChange", "highPrice", "lowPrice", "quoteVolume"];
    priceInfoColumns = ["lastPrice", "priceChange", "priceChangePercent", "highPrice", "lowPrice"];
    numberColumns = ["marketCap", "lastPrice", "priceChange", "priceChangePercent", "highPrice", "lowPrice", "volume", "quoteVolume", "volumeChangePercent"];
    volumeColumns = ["volume", "quoteVolume", "volumeChangePercent"];
    pageSize = 11;

    constructor(props) {
        super(props);
        this.toggleModal = this.toggleModal.bind(this);
        this.state = {
            //rowData is the current visible data (some columns might be hidden)
            rowData: [],
            //allRowData is all the row data, including data in hidden columns
            allRowData: [],
            markets: [],
            market: "ALL",
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
                headerName: "Market Cap", field: "marketCap", sortable: true,
                cellStyle: {border: 'none !important'},
                comparator: this.columnComparator
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

    //Get the column definitions for the grid. Set some visible based on user selection (price, volume, all).
    getColumnDefs() {
        let all = this.getAllColumnDefs();

        if (this.state.volumeDisplay) {
            this.volumeColumns.forEach(col => this.columnApi.setColumnVisible(col, true));
            this.priceInfoColumns.forEach(col => this.columnApi.setColumnVisible(col, false));
            this.columnApi.setColumnVisible("marketCap", false);
        }
        if (this.state.priceDisplay) {
            this.priceInfoColumns.forEach(col => this.columnApi.setColumnVisible(col, true));
            this.volumeColumns.forEach(col => this.columnApi.setColumnVisible(col, false));
            this.columnApi.setColumnVisible("marketCap", false);
        }
        if (this.state.allDisplay && this.columnApi != null) {
            all.forEach(col => this.columnApi.setColumnVisible(col.field, true));
        }
        return all;
    }

    getCellFontColorNoSelection(params) {
        let price = params.value === null ? 0.0 : (params.value === this.notAvailable ? 0.0 : this.modifiedPriceToNumber(params.value));
        if (price === 0.0) {
            return {color: 'white', border: 'none !important'};
        }
        if (price < 0.0) {
            return {color: 'red', border: 'none !important'};
        }
        return {color: 'green', border: 'none !important'};
    }

    getLink(params) {
        let data = params.data;
        let icon = "<img style='vertical-align: middle' alt=''/ src=\"data:image/png;base64, " + data.icon + " \"> ";
        return icon + "<a target='_blank' rel='noopener noreferrer' href='" + data.tradeLink + "'> " + params.value + "</a>";
    }

    //format a number to have commas: i.e. 12500 becomes 12,500
    formatNumber(num) {
        if (num === null) {
            return this.notAvailable;
        }
        let num_parts = num.toString().split(".");
        num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return num_parts.join(".");
    }

    //Format pricing data to use the currency symbols, such as '$' for USD, '₮' for USDT, and '₿' for BTC
    formatPrice(currency, item) {
        if (item === this.notAvailable) {
            return item;
        }
        if (currency === "USDT") {
            return "₮ " + item;
        }
        if (currency === "USD") {
            return "$ " + item;
        }
        if (currency === "BTC") {
            return "₿ " + item;
        }
        return item;
    };

    getApiHost() {
        let apiHost = "https://www.coininfousa.cc/api/v1/binanceusa";

        if (this.currentExchange === "" || this.currentExchange === "A") {
            apiHost = process.env.REACT_APP_API_HOST_BINANCE_USA;
            if (typeof apiHost == "undefined") {
                apiHost = "https://www.coininfousa.cc/api/v1/binanceusa";
            }
        } else if (this.currentExchange === "B") {
            apiHost = process.env.REACT_APP_API_HOST_BINANCE;
            if (typeof apiHost == "undefined") {
                apiHost = "https://www.coininfousa.cc/api/v1/binance";
            }
        } else if (this.currentExchange === "C") {
            apiHost = process.env.REACT_APP_API_HOST_BITTREX;
            if (typeof apiHost == "undefined") {
                apiHost = "https://www.coininfousa.cc/api/v1/bittrex";
            }
        }
        if (typeof apiHost == "undefined") {
            apiHost = "https://www.coininfousa.cc/api/v1/binanceusa";
        }
        return apiHost;
    }

    getUrl() {
        return urlObject.apiHost + "/24HourTicker";
    }

    getExchangeData(url) {
        fetch(url)
            .then(result => {
                return result.json();
            }).then(data => {
            if (this.mounted) {
                //Format the number data to have commas: i.e. 12500 becomes 12,500
                this.numberColumns.forEach(column => {
                    data.map(item => item[column] = column === "marketCap" && item[column] === 0.0 ? this.notAvailable : this.formatNumber(item[column]));
                });
                //Format pricing data to use the currency symbols, such as '$' for USD, '₮' for USDT, and '₿' for BTC
                this.priceColumns.forEach(column => {
                    data.map(item => item[column] = this.formatPrice((column === "marketCap" ? "USD" : item.currency), item[column]));
                });
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
            }
            throw err;
        });
    }

    componentDidMount() {
        urlObject.apiHost = this.getApiHost();
        this.mounted = true;
        let url = this.getUrl();
        this.getExchangeData(url);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    onCellClicked = event => {
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
    };

    onGridReady = grid => {
        this.columnApi = grid.columnApi;
        let columns = grid.columnApi.getAllColumns().filter(col => col.colId !== "coin");
        grid.columnApi.autoSizeColumns(columns);
    };

    //Change a modified price (such as $9,000) to a number (9000)
    modifiedPriceToNumber(price) {
        price = price === null ? "" : price;
        //take the commas out of the numbers
        let str = price.replace(/,/g, '');
        //Take out the '$' for USD, '₮' for USDT, and '₿' for BTC
        str = str.replace("$ ", "");
        str = str.replace("₮ ", "");
        str = str.replace("₿ ", "");
        return parseFloat(str);
    }

    //Compare the columns for sorting. Strip out the extra chars (such as '$') so that number values can be compared.
    columnComparator(value1, value2) {
        value1 = value1 === null ? "" : value1;
        value2 = value2 === null ? "" : value2;
        //take the commas out of the numbers
        let str1 = value1.replace(/,/g, '');
        //Take out the '$' for USD, '₮' for USDT, and '₿' for BTC
        str1 = str1.replace("$ ", "");
        str1 = str1.replace("₮ ", "");
        str1 = str1.replace("₿ ", "");
        let num1 = parseFloat(str1);

        let str2 = value2.replace(/,/g, '');
        //Take out the '$' for USD, '₮' for USDT, and '₿' for BTC
        str2 = str2.replace("$ ", "");
        str2 = str2.replace("₮ ", "");
        str2 = str2.replace("₿ ", "");
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

    resetDisplayButtons() {
        this.displayMap.forEach((key, value) => this.refs[key].className = "toolbar-button");
        this.allDisplayButton.className = "toolbar-button";
    }

    onDisplayButtonClick(display) {
        this.resetDisplayButtons();
        this.refs[display].className = "toolbar-button-selected";
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
        let colDef = {
            resizable: true
        };
        let gridOptions = {
            rowHeight: 60,
            rowStyle: {
                fontWeight: "bold",
                fontSize: "14px",
                'border-bottom': 'black 10px solid',
                'border-top': 'black 10px solid',
            },
            pagination: true,
            paginationPageSize: this.pageSize,
            domLayout: 'autoHeight'
        };
        return (
            <AgGridReact
                reactNext={true}
                rowSelection={"single"}
                gridOptions={gridOptions}
                columnDefs={columnDefs}
                defaultColDef={colDef}
                rowData={this.state.rowData}
                onCellClicked={this.onCellClicked}
                onGridReady={this.onGridReady}
            >
            </AgGridReact>);
    }

    getSpinner() {
        return (
            <div className="loader-style">
                <Loader
                    type="Puff"
                    color="#3c3bff"
                    //40 seconds
                    timeout={40000}>
                </Loader>
                <div className="spinner-label">Please wait... the exchange information can take up to 30 seconds to
                    load.
                </div>
            </div>
        );
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

    getMarketSelections() {
        let selections = [];
        this.state.markets.forEach((value) => {
            selections.push(<option key={value}>{value}</option>);
        });
        selections.push(<option key="ALL">ALL</option>);
        return <select className="exchange-select" value={this.state.market} onChange={this.onMarketChange}>
            {selections}
        </select>;
    }

    getGridHeight(coinGrid) {
        if (this.state.allRowData === null) {
            return 3000;
        }
        return "auto";
    };

    getGridStyles(coinGrid) {
        return {
            normalStyle: {
                width: "100%",
                height: this.getGridHeight(coinGrid)
            },
            volumeStyle: {
                width: "42.5%",
                height: this.getGridHeight(coinGrid),
                padding: "0% 28.5%"
            },
            priceStyle: {
                width: "63.5%",
                height: this.getGridHeight(coinGrid),
                padding: "0% 18%",
            },
        };
    }

    onExchangeChange = (event) => {
        this.setState({isLoading: true});
        this.currentExchange = event.target.value;
        urlObject.apiHost = this.getApiHost();
        let url = this.getUrl();
        this.getExchangeData(url);
        this.setState({market: "ALL"});
        this.onAllDisplayButtonClick();
    };

    onMarketChange = (event) => {
        let selection = event.target.value;
        let rows = this.state.allRowData;
        if (selection === "ALL") {
            this.setState({rowData: rows});
        } else {
            let filteredRows = rows.filter(value => value.currency === selection);
            this.setState({rowData: filteredRows});
        }
        this.setState({market: selection});
    };

    render() {
        //slight style change for a mobile device
        let toolbarStyle = "toolbar-section";
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            toolbarStyle = "toolbar-section-mobile";
        }
        const marketSelections = this.getMarketSelections();
        const displayButtons = this.getDisplayButtons();
        const toolTipInfo = this.getToolTipInfo();
        const tooltip = this.getToolTip(toolTipInfo);
        const coinGrid = this.getGrid();
        const spinner = this.getSpinner();
        const gridOrSpinner = this.state.isLoading ? spinner : coinGrid;
        const gridStyles = this.getGridStyles(coinGrid);
        let whichStyle = gridStyles.normalStyle;
        if (this.state.volumeDisplay) {
            whichStyle = gridStyles.volumeStyle;
        }
        if (this.state.priceDisplay) {
            whichStyle = gridStyles.priceStyle;
        }

        return (
            <div className="grid-background">
                <div className={toolbarStyle}>
                    {tooltip}
                    <label className="toolbar-label-start">Display:</label>
                    {displayButtons}
                    <label className="toolbar-label">Exchange:</label>
                    <select className="exchange-select" onChange={this.onExchangeChange}>
                        <option value="A">Binance USA</option>
                        <option value="B">Binance</option>
                        <option value="C">Bittrex</option>
                    </select>
                    <label className="toolbar-label">Market:</label>
                    {marketSelections}
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
