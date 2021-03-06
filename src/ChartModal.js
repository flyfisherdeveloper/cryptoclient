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
            isArea: true,
            isLine: false,
            usdVolume: false
        }
    }

    onHourButtonClick(buttonNumber) {
        if (buttonNumber === 1 && this.state.months > 1) {
            return;
        }
        if (buttonNumber === 4 && this.state.months > 3) {
            return;
        }
        if (buttonNumber === 12 && this.state.months > 6) {
            return;
        }
        this.setState({hours: buttonNumber});
    }

    onDayOrMonthButtonClick(buttonNumber) {
        if (buttonNumber === 90 && this.state.hours === 1) {
            return;
        }
        if (buttonNumber === 180 && (this.state.hours === 1 || this.state.hours === 4)) {
            return;
        }
        if (buttonNumber === 365 && (this.state.hours === 1 || this.state.hours === 4 || this.state.hours === 12)) {
            return;
        }
        let months = 0;
        let days = buttonNumber;

        if (buttonNumber === 30) {
            months = 1;
            days = 0;
        }
        if (buttonNumber === 90) {
            months = 3;
            days = 0;
        }
        if (buttonNumber === 180) {
            months = 6;
            days = 0;
        }
        if (buttonNumber === 365) {
            months = 12;
            days = 0;
        }
        this.setState({days: days, months: months});
    }

    onChartTypeClick(buttonType) {
        if (buttonType === "area") {
            this.setState({isArea: true});
            this.setState({isLine: false});
        } else if (buttonType === "line") {
            this.setState({isArea: false});
            this.setState({isLine: true});
        } else {
            this.setState({isArea: false});
            this.setState({isLine: false});
        }
    }

    onToggleClick(buttonText) {
        if (buttonText === this.props.quote) {
            //here, we change from i.e. BTC to USD
            this.setState({usdVolume: false})
        } else {
            //here, we change from i.e. USD to BTC
            this.setState({usdVolume: true})
        }
    }

    onCloseButtonClick(params) {
        this.setState({hours: 4, days: 7, months: 0});
        this.setState({isArea: true});
        this.setState({isLine: false});
        this.setState({usdVolume: false});
        this.props.onClose(params);
    }

    render() {
        if (!this.props.isOpen) {
            return null;
        }
        //slight style change for a mobile device
        let modalStyle = "modal-chart-background";
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            modalStyle = "modal-chart-background-mobile";
        }
        let chart;
        if (this.state.isArea || this.state.isLine) {
            chart = <LineGraph ref={lineGraph => this.lineGraph = lineGraph}
                               symbol={this.props.symbol}
                               quote={this.props.quote}
                               usdVolume={this.state.usdVolume}
                               coin={this.props.coin}
                               hours={this.state.hours}
                               days={this.state.days}
                               months={this.state.months}
                               isPrice={this.props.isPrice}
                               isArea={this.state.isArea}
                               isLine={this.state.isLine}
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
        const button1Hr =
            <ButtonComponent
                text={"1Hr"}
                number={1}
                className={this.state.months > 1 ? "disabled" : (this.state.hours === 1 ? "high-light-button" : "chart-button")}
                func={this.onHourButtonClick.bind(this, 1)}>
            </ButtonComponent>;
        const button4Hr =
            <ButtonComponent
                text={"4Hr"}
                number={4}
                className={this.state.months > 3 ? "disabled" : (this.state.hours === 4 ? "high-light-button" : "chart-button")}
                func={this.onHourButtonClick.bind(this, 4)}>
            </ButtonComponent>;
        const button12Hr =
            <ButtonComponent
                text={"12Hr"}
                number={12}
                className={this.state.months > 6 ? "disabled" : (this.state.hours === 12 ? "high-light-button" : "chart-button")}
                func={this.onHourButtonClick.bind(this, 12)}>
            </ButtonComponent>;
        const button24Hr =
            <ButtonComponent
                text={"1D"}
                number={24}
                className={this.state.hours === 24 ? "high-light-button" : "chart-button"}
                func={this.onHourButtonClick.bind(this, 24)}>
            </ButtonComponent>;
        const button1Day =
            <ButtonComponent
                text={"1D"}
                number={1}
                className={this.state.days === 1 ? "high-light-button" : "chart-button"}
                func={this.onDayOrMonthButtonClick.bind(this, 1)}>
            </ButtonComponent>;
        const button3Day =
            <ButtonComponent
                text={"3D"}
                number={3}
                className={this.state.days === 3 ? "high-light-button" : "chart-button"}
                func={this.onDayOrMonthButtonClick.bind(this, 3)}>
            </ButtonComponent>;
        const button7Day =
            <ButtonComponent
                text={"7D"}
                number={7}
                className={this.state.days === 7 ? "high-light-button" : "chart-button"}
                func={this.onDayOrMonthButtonClick.bind(this, 7)}>
            </ButtonComponent>;
        const button1Month =
            <ButtonComponent
                text={"1M"}
                //30 => 30 days (to avoid confusion with the 3-day option)
                number={30}
                className={this.state.months === 1 ? "high-light-button" : "chart-button"}
                func={this.onDayOrMonthButtonClick.bind(this, 30)}>
            </ButtonComponent>;
        const button3Months =
            <ButtonComponent
                text={"3M"}
                //90 => 90 days
                number={90}
                className={this.state.months === 3 ? "high-light-button" : (this.state.hours === 1 ? "disabled" : "chart-button")}
                func={this.onDayOrMonthButtonClick.bind(this, 90)}>
            </ButtonComponent>;
        const button6Months =
            <ButtonComponent
                text={"6M"}
                //180 => 180 days
                number={180}
                className={this.state.months === 6 ? "high-light-button" : ((this.state.hours === 1 || this.state.hours === 4) ? "disabled" : "chart-button")}
                func={this.onDayOrMonthButtonClick.bind(this, 180)}>
            </ButtonComponent>;
        const button12Months =
            <ButtonComponent
                text={"1Y"}
                //365 => 365 days
                number={365}
                className={this.state.months === 12 ? "high-light-button" : ((this.state.hours === 1 || this.state.hours === 4 || this.state.hours === 12) ? "disabled" : "chart-button")}
                func={this.onDayOrMonthButtonClick.bind(this, 365)}>
            </ButtonComponent>;
        const areaClassName = () => {
            if (this.props.isPrice) {
                if (this.state.isArea) {
                    return "high-light-button";
                }
                return "chart-button";
            }
            return "hidden";
        };
        const lineClassName = () => {
            if (this.props.isPrice) {
                if (this.state.isLine) {
                    return "high-light-button";
                }
                return "chart-button";
            }
            return "hidden";
        };
        const candleStickClassName = () => {
            if (this.props.isPrice) {
                if (this.state.isArea || this.state.isLine) {
                    return "chart-button";
                }
                return "high-light-button";
            }
            return "hidden";
        };
        const buttonArea =
            <ButtonComponent
                text={"Area"}
                className={areaClassName()}
                func={this.onChartTypeClick.bind(this, "area")}>
            </ButtonComponent>;
        const buttonLine =
            <ButtonComponent
                text={"Line"}
                className={lineClassName()}
                func={this.onChartTypeClick.bind(this, "line")}>
            </ButtonComponent>;
        const buttonCandleStick =
            <ButtonComponent
                text={"Candle Stick"}
                className={candleStickClassName()}
                func={this.onChartTypeClick.bind(this, "candle")}>
            </ButtonComponent>;
        const close =
            <a href="#"
               className="close"
               onClick={this.onCloseButtonClick.bind(this)}
            />;
        const labelChartType = () => {
            if (this.props.isPrice) {
                return <label className="middle-label">Chart Type:</label>
            }
            if (this.props.quote === "USD" || this.props.quote === "USDT" || this.props.quote === "DAI" || this.props.quote === "BRL") {
                return <label className="middle-label"/>
            }
            return <label className="middle-label">Change Currency To:</label>
        }
        const toggleButtonText = () => {
            if (this.state.usdVolume === true) {
                return this.props.quote;
            }
            return "USD";
        }
        const buttonToggle = () => {
            if (!this.props.isPrice && (this.props.quote !== "USD" && this.props.quote !== "USDT" && this.props.quote !== "DAI" && this.props.quote !== "BRL")) {
                return <ButtonComponent
                    text={toggleButtonText()}
                    className="chart-button"
                    func={this.onToggleClick.bind(this, toggleButtonText())}>
                </ButtonComponent>;
            }
        }

        return (
            <div className={modalStyle}>
                <div className="modal">
                    <div className="modal-header">
                        <label className="hours-label">Time Frame:
                        </label>
                        {button1Hr}
                        {button4Hr}
                        {button12Hr}
                        {button24Hr}
                        <label className="middle-label">Time Period:
                        </label>
                        {button1Day}
                        {button3Day}
                        {button7Day}
                        {button1Month}
                        {button3Months}
                        {button6Months}
                        {button12Months}
                        {labelChartType()}
                        {buttonToggle()}
                        {buttonArea}
                        {buttonLine}
                        {buttonCandleStick}
                        {close}
                    </div>
                    {this.props.children}
                </div>
                {chart}
            </div>
        );
    }
}

class ButtonComponent extends React.Component {
    handleClick = (value) => {
        this.props.func(this, this.props.number);
    };

    render() {
        return (
            <button
                onClick={this.handleClick}
                className={this.props.className}
            >{this.props.text}
            </button>
        );
    }
}

ChartModal.propTypes = {
    onClose: PropTypes.func,
    isOpen: PropTypes.bool,
    symbol: PropTypes.string,
    quote: PropTypes.string,
    coin: PropTypes.string,
    isPrice: PropTypes.bool
};
export default ChartModal;