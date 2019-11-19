import React from "react";
import PropTypes from "prop-types";
import LineGraph from "./LineGraph";

class ChartModal extends React.Component {

    onButtonClick(buttonNumber) {
        this.resetButtonBorder(buttonNumber)
        this.lineGraph.updateHourChart(buttonNumber);
    };

    resetButtonBorder(buttonNumber) {
        let outLine = "3px solid blue";
        let normal = "1px solid blue";

        if (buttonNumber === 1) {
            this.button1Hr.style.border = outLine;
            this.button4Hr.style.border = normal;
            this.button12Hr.style.border = normal;
            this.button24Hr.style.border = normal;
        } else if (buttonNumber === 4) {
            this.button4Hr.style.border = outLine;
            this.button1Hr.style.border = normal;
            this.button12Hr.style.border = normal;
            this.button24Hr.style.border = normal;
        } else if (buttonNumber === 12) {
            this.button12Hr.style.border = outLine;
            this.button1Hr.style.border = normal;
            this.button4Hr.style.border = normal;
            this.button24Hr.style.border = normal;
        } else if (buttonNumber === 24) {
            this.button24Hr.style.border = outLine;
            this.button1Hr.style.border = normal;
            this.button4Hr.style.border = normal;
            this.button12Hr.style.border = normal;
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
            top: 0,
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
            width: "100%"
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

        return (
            <div style={BackgroundStyle}>
                <div style={ModalStyle}>
                    <div style={HeaderStyle}>
                        <button ref={button1Hr => this.button1Hr = button1Hr}
                                id="button1Hr"
                                style={ButtonStyle}
                                onClick={this.onButtonClick.bind(this, 1)}>1Hr
                        </button>
                        <button ref={button4Hr => this.button4Hr = button4Hr}
                                id="button4Hr"
                                style={HighLightButtonStyle}
                                onClick={this.onButtonClick.bind(this, 4)}>4Hr
                        </button>
                        <button ref={button12Hr => this.button12Hr = button12Hr}
                                id="button12Hr"
                                style={ButtonStyle}
                                onClick={this.onButtonClick.bind(this, 12)}>12Hr
                        </button>
                        <button ref={button24Hr => this.button24Hr = button24Hr}
                                id="button24Hr"
                                style={ButtonStyle}
                                onClick={this.onButtonClick.bind(this, 24)}>24Hr
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
    isQuoteVolume: PropTypes.bool
};
export default ChartModal;