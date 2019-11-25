import React from "react";
import PropTypes from "prop-types";
import LineGraph from "./LineGraph";

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
        this.setState({days: days, months: months}, () => {
            this.lineGraph.updateChart(this.state.hours, this.state.days, this.state.months);
        });
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
        const ButtonStyle = {
            color: "#fff",
            background: "#008FFB",
            border: "1px solid blue",
            borderBottom: "2px solid blue"
        };
        const HighLightButtonStyle = {
            color: "#fff",
            background: "#008FFB",
            border: "3px solid blue",
        };
        const HoursLabelStyle = {
            marginRight: 10,
            marginTop: 100,
            color: "#000000",
            fontSize: 24,
        };
        const DaysLabelStyle = {
            marginLeft: 40,
            marginRight: 10,
            marginTop: 100,
            color: "#000000",
            fontSize: 24,
        };

        return (
            <div style={BackgroundStyle}>
                <div style={ModalStyle}>
                    <div style={HeaderStyle}>
                        <label style={HoursLabelStyle}>Hours:
                        </label>
                        <button ref={button1Hr => this.button1Hr = button1Hr}
                                id="button1Hr"
                                style={ButtonStyle}
                                onClick={this.onHourButtonClick.bind(this, 1)}>1Hr
                        </button>
                        <button ref={button4Hr => this.button4Hr = button4Hr}
                                id="button4Hr"
                                style={HighLightButtonStyle}
                                onClick={this.onHourButtonClick.bind(this, 4)}>4Hr
                        </button>
                        <button ref={button12Hr => this.button12Hr = button12Hr}
                                id="button12Hr"
                                style={ButtonStyle}
                                onClick={this.onHourButtonClick.bind(this, 12)}>12Hr
                        </button>
                        <label style={DaysLabelStyle}>Days:
                        </label>
                        <button ref={button1Day => this.button1Day = button1Day}
                                id="button1Day"
                                style={ButtonStyle}
                                onClick={this.onDayButtonClick.bind(this, 1)}>1 Day
                        </button>
                        <button ref={button3Day => this.button3Day = button3Day}
                                id="button3Day"
                                style={ButtonStyle}
                                onClick={this.onDayButtonClick.bind(this, 3)}>3 Days
                        </button>
                        <button ref={button7Day => this.button7Day = button7Day}
                                id="button7Day"
                                style={HighLightButtonStyle}
                                onClick={this.onDayButtonClick.bind(this, 7)}>7 Days
                        </button>
                        <button ref={button1Month => this.button1Month = button1Month}
                                id="button1Month"
                                style={ButtonStyle}
                                onClick={this.onDayButtonClick.bind(this, 30)}>1 Month
                        </button>
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