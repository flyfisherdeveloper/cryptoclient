import React from "react";
import PropTypes from "prop-types";
import LineGraph from "./LineGraph";
import CandleStickChart from "./CandleStickChart";
import "./chart-modal-styles.css";

class ChartModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            hours: 4,
            days: 7,
            months: 0,
            isArea: true
        }
    }

    onHourButtonClick(buttonNumber) {
        this.resetHourButtonBorder(buttonNumber);
        this.setState({hours: buttonNumber});
        if (this.state.isArea) {
            this.lineGraph.updateChart(buttonNumber, this.state.days, this.state.months);
        } else {
            this.candleStickChart.updateChart(buttonNumber, this.state.days, this.state.months);
        }
    }

    onDayButtonClick(buttonNumber) {
        this.resetDayButtonBorder(buttonNumber);
        let months = 0;
        let days = buttonNumber;

        if (buttonNumber === 30) {
            months = 1;
            days = 0;
        }
        this.setState({days: days, months: months});
        if (this.state.isArea) {
            this.lineGraph.updateChart(this.state.hours, days, months);
        } else {
            this.candleStickChart.updateChart(this.state.hours, days, months);
        }
    }

    onChartTypeClick(buttonType) {
        if (buttonType === "area") {
            this.setState({isArea: true});
            this.buttonAreaChart.className = "high-light-button";
            this.buttonCandleStickChart.className = "chart-button";
        } else {
            this.setState({isArea: false});
            this.buttonAreaChart.className = "chart-button";
            this.buttonCandleStickChart.className = "high-light-button";
        }
    }

    onCloseButtonClick(params) {
        this.setState({hours: 4, days: 7, months: 0});
        this.setState({isArea: true});
        this.props.onClose(params);
    }

    resetHourButtonBorder(buttonNumber) {
        if (buttonNumber === 1) {
            this.button1Hr.className = "high-light-button";
            this.button4Hr.className = "chart-button";
            this.button12Hr.className = "chart-button";
        } else if (buttonNumber === 4) {
            this.button4Hr.className = "high-light-button";
            this.button1Hr.className = "chart-button";
            this.button12Hr.className = "chart-button";
        } else if (buttonNumber === 12) {
            this.button12Hr.className = "high-light-button";
            this.button1Hr.className = "chart-button";
            this.button4Hr.className = "chart-button";
        }
    }

    resetDayButtonBorder(buttonNumber) {
        if (buttonNumber === 1) {
            this.button1Day.className = "high-light-button";
            this.button3Day.className = "chart-button";
            this.button7Day.className = "chart-button";
            this.button1Month.className = "chart-button";
        } else if (buttonNumber === 3) {
            this.button3Day.className = "high-light-button";
            this.button1Day.className = "chart-button";
            this.button7Day.className = "chart-button";
            this.button1Month.className = "chart-button";
        } else if (buttonNumber === 7) {
            this.button7Day.className = "high-light-button";
            this.button1Day.className = "chart-button";
            this.button3Day.className = "chart-button";
            this.button1Month.className = "chart-button";
        } else if (buttonNumber === 30) {
            this.button1Month.className = "high-light-button";
            this.button1Day.className = "chart-button";
            this.button3Day.className = "chart-button";
            this.button7Day.className = "chart-button";
        }
    }

    render() {
        if (!this.props.isOpen) {
            return null;
        }
        let chart = null;
        if (this.state.isArea) {
            chart = <LineGraph ref={lineGraph => this.lineGraph = lineGraph}
                               symbol={this.props.symbol}
                               quote={this.props.quote}
                               coin={this.props.coin}
                               hours={this.state.hours}
                               days={this.state.days}
                               months={this.state.months}
                               isQuoteVolume={this.props.isQuoteVolume}
                               isPrice={this.props.isPrice}
            />
        } else {
            chart = <CandleStickChart ref={candleStickChart => this.candleStickChart = candleStickChart}
                                      symbol={this.props.symbol}
                                      quote={this.props.quote}
                                      coin={this.props.coin}
                                      hours={this.state.hours}
                                      days={this.state.days}
                                      months={this.state.months}
            />
        }
        return (
            <div className="modal-chart-background">
                <div className="modal">
                    <div className="modal-header">
                        <label className="hours-label">Hours:
                        </label>
                        <button ref={button1Hr => this.button1Hr = button1Hr}
                                id="button1Hr"
                                className="chart-button"
                                onClick={this.onHourButtonClick.bind(this, 1)}>1Hr
                        </button>
                        <button ref={button4Hr => this.button4Hr = button4Hr}
                                id="button4Hr"
                                className="high-light-button"
                                onClick={this.onHourButtonClick.bind(this, 4)}>4Hr
                        </button>
                        <button ref={button12Hr => this.button12Hr = button12Hr}
                                id="button12Hr"
                                className="chart-button"
                                onClick={this.onHourButtonClick.bind(this, 12)}>12Hr
                        </button>
                        <label className="middle-label">Days:
                        </label>
                        <button ref={button1Day => this.button1Day = button1Day}
                                id="button1Day"
                                className="chart-button"
                                onClick={this.onDayButtonClick.bind(this, 1)}>1 Day
                        </button>
                        <button ref={button3Day => this.button3Day = button3Day}
                                id="button3Day"
                                className="chart-button"
                                onClick={this.onDayButtonClick.bind(this, 3)}>3 Days
                        </button>
                        <button ref={button7Day => this.button7Day = button7Day}
                                id="button7Day"
                                className="high-light-button"
                                onClick={this.onDayButtonClick.bind(this, 7)}>7 Days
                        </button>
                        <button ref={button1Month => this.button1Month = button1Month}
                                id="button1Month"
                                className="chart-button"
                                onClick={this.onDayButtonClick.bind(this, 30)}>1 Month
                        </button>
                        <label className={this.props.isPrice ? "middle-label" : "hidden"}>Chart Type:
                        </label>
                        <button ref={buttonAreaChart => this.buttonAreaChart = buttonAreaChart}
                                id="buttonAreaChart"
                                className={this.props.isPrice ? "high-light-button" : "hidden"}
                                onClick={this.onChartTypeClick.bind(this, "area")}>Area
                        </button>
                        <button ref={buttonCandleStickChart => this.buttonCandleStickChart = buttonCandleStickChart}
                                id="buttonCandleStickChart"
                                className={this.props.isPrice ? "chart-button" : "hidden"}
                                onClick={this.onChartTypeClick.bind(this, "candle")}>Candle Stick
                        </button>
                        <a href="#"
                           className="close"
                           onClick={this.onCloseButtonClick.bind(this)}
                        />
                    </div>
                    {this.props.children}
                </div>
                {chart}
            </div>
        );
    }
}


ChartModal.propTypes = {
    onClose: PropTypes.func,
    isOpen: PropTypes.bool,
    symbol: PropTypes.string,
    quote: PropTypes.string,
    coin: PropTypes.string,
    isQuoteVolume: PropTypes.bool,
    isPrice: PropTypes.bool
};
export default ChartModal;