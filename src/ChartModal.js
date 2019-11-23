import React from "react";
import PropTypes from "prop-types";
import LineGraph from "./LineGraph";

class ChartModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            hours: 4,
            days: 7,
            months: 0,
            dayMonthStr: "7days"
        }
    }

    onHourSelectionChange(event) {
        let value = event.target.value;
        this.setState({hours: value});
        this.lineGraph.updateChart(value, this.state.days, this.state.months);
    }

    onDaySelectionChange(event) {
        let value = event.target.value;
        let dayValue = this.state.days;
        let monthValue = this.state.months;

        if (value.includes("days")) {
            dayValue = Number(value.charAt(0));
            monthValue = 0;
        } else {
            monthValue = Number(value.charAt(0));
            dayValue = 0;
        }
        let dayMonthStr = (monthValue > 0 ? monthValue.toString() + "months" : dayValue.toString() + "days");
        this.setState({days: dayValue, dayMonthStr: dayMonthStr, months: monthValue});
        this.lineGraph.updateChart(this.state.hours, dayValue, monthValue);
    }

    render() {
        if (!this.props.isOpen) {
            return null;
        }
        const BackgroundStyle = {
            backgroundColor: "rgb(0,0,0)",
            position: "fixed",
            width: 1100,
            height: 600,
            top: 100,
            right: 0,
            bottom: 0,
            left: 200
        };
        const ModalStyle = {
            backgroundColor: "#fff",
            margin: "auto",
            padding: 5
        };
        const HeaderStyle = {
            height: 29,
            width: "100%",
            textAlign: "left"
        };
        const OptionStyle = {
            height: 35,
            width: 100,
            color: "#fff",
            background: "#008FFB",
            border: "1px solid blue",
        };

        console.log("render: " + this.state.dayMonthStr + " hours: " + this.state.hours + " days: " + this.state.days + " months: " + this.state.months);
        return (
            <div style={BackgroundStyle}>
                <div style={ModalStyle}>
                    <div style={HeaderStyle}>
                        <select
                            style={OptionStyle}
                            value={this.state.hours}
                            onChange={this.onHourSelectionChange.bind(this)}>
                            <option
                                style={OptionStyle}
                                value="1">1 Hour
                            </option>
                            <option
                                style={OptionStyle}
                                value="4">4 Hour
                            </option>
                            <option
                                style={OptionStyle}
                                value="12">12 Hour
                            </option>
                        </select>
                        <select
                            style={OptionStyle}
                            value={this.state.dayMonthStr}
                            onChange={this.onDaySelectionChange.bind(this)}>
                            <option
                                style={OptionStyle}
                                value="1days">1 Day
                            </option>
                            <option
                                style={OptionStyle}
                                value="3days">3 Days
                            </option>
                            <option
                                style={OptionStyle}
                                value="7days">7 Days
                            </option>
                            <option
                                style={OptionStyle}
                                value="1months">1 Month
                            </option>
                        </select>
                        <a id="close" href="#" onClick={this.props.onClose}/>
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