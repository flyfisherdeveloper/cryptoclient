import React from "react";
import PropTypes from "prop-types";
import LineGraph from "./LineGraph";
import "./chart-modal-styles.css";

class ChartModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            hours: 4,
            days: 7,
            months: 0
        }
    }

    onHourButtonClick(buttonNumber) {
        this.resetHourButtonBorder(buttonNumber);
        this.setState({hours: buttonNumber});
        this.lineGraph.updateChart(buttonNumber, this.state.days, this.state.months);
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
        this.lineGraph.updateChart(this.state.hours, days, months);
    }

    onCloseButtonClick(params) {
        this.setState({hours: 4, days: 7, months: 0});
        this.props.onClose(params);
    }

    resetHourButtonBorder(buttonNumber) {
        let outLine = "3px solid blue";
        let normal = "1px solid blue";

        if (buttonNumber === 1) {
            this.button1Hr.style.border = outLine;
            this.button4Hr.style.border = normal;
            this.button12Hr.style.border = normal;
        } else if (buttonNumber === 4) {
            this.button4Hr.style.border = outLine;
            this.button1Hr.style.border = normal;
            this.button12Hr.style.border = normal;
        } else if (buttonNumber === 12) {
            this.button12Hr.style.border = outLine;
            this.button1Hr.style.border = normal;
            this.button4Hr.style.border = normal;
        }
    }

    resetDayButtonBorder(buttonNumber) {
        let outLine = "3px solid blue";
        let normal = "1px solid blue";

        if (buttonNumber === 1) {
            this.button1Day.style.border = outLine;
            this.button3Day.style.border = normal;
            this.button7Day.style.border = normal;
            this.button1Month.style.border = normal;
        } else if (buttonNumber === 3) {
            this.button3Day.style.border = outLine;
            this.button1Day.style.border = normal;
            this.button7Day.style.border = normal;
            this.button1Month.style.border = normal;
        } else if (buttonNumber === 7) {
            this.button7Day.style.border = outLine;
            this.button1Day.style.border = normal;
            this.button3Day.style.border = normal;
            this.button1Month.style.border = normal;
        } else if (buttonNumber === 30) {
            this.button1Month.style.border = outLine;
            this.button1Day.style.border = normal;
            this.button3Day.style.border = normal;
            this.button7Day.style.border = normal;
        }
    }

    render() {
        if (!this.props.isOpen) {
            return null;
        }

        return (
            <div className="modal-chart-background">
                <div className="modal">
                    <div className="modal-header">
                        <label className="hours-label">Hours:
                        </label>
                        <button ref={button1Hr => this.button1Hr = button1Hr}
                                id="button1Hr"
                                onClick={this.onHourButtonClick.bind(this, 1)}>1Hr
                        </button>
                        <button ref={button4Hr => this.button4Hr = button4Hr}
                                id="button4Hr"
                                className="high-light-button"
                                onClick={this.onHourButtonClick.bind(this, 4)}>4Hr
                        </button>
                        <button ref={button12Hr => this.button12Hr = button12Hr}
                                id="button12Hr"
                                onClick={this.onHourButtonClick.bind(this, 12)}>12Hr
                        </button>
                        <label className="days-label">Days:
                        </label>
                        <button ref={button1Day => this.button1Day = button1Day}
                                id="button1Day"
                                onClick={this.onDayButtonClick.bind(this, 1)}>1 Day
                        </button>
                        <button ref={button3Day => this.button3Day = button3Day}
                                id="button3Day"
                                onClick={this.onDayButtonClick.bind(this, 3)}>3 Days
                        </button>
                        <button ref={button7Day => this.button7Day = button7Day}
                                id="button7Day"
                                className="high-light-button"
                                onClick={this.onDayButtonClick.bind(this, 7)}>7 Days
                        </button>
                        <button ref={button1Month => this.button1Month = button1Month}
                                id="button1Month"
                                onClick={this.onDayButtonClick.bind(this, 30)}>1 Month
                        </button>
                        <a href="#"
                           className="close"
                           onClick={this.onCloseButtonClick.bind(this)}
                        />
                    </div>
                    {this.props.children}
                </div>
                <LineGraph ref={lineGraph => this.lineGraph = lineGraph}
                           symbol={this.props.symbol}
                           quote={this.props.quote}
                           coin={this.props.coin}
                           isQuoteVolume={this.props.isQuoteVolume}
                           isPrice={this.props.isPrice}
                />
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