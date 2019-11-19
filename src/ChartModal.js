import React from "react";
import PropTypes from "prop-types";
import LineGraph from "./LineGraph";

class ChartModal extends React.Component {

    onButtonClick(params) {
        this.lineGraph.updateHourChart(params);
    };

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

        return (
            <div style={BackgroundStyle}>
                <div style={ModalStyle}>
                    <div style={HeaderStyle}>
                        <button
                            id="button1Hr"
                            style={ButtonStyle}
                            onClick={this.onButtonClick.bind(this, 1)}>1Hr
                        </button>
                        <button
                            id="button4Hr"
                            style={ButtonStyle}
                            onClick={this.onButtonClick.bind(this, 4)}>4Hr
                        </button>
                        <button
                            id="button12Hr"
                            style={ButtonStyle}
                            onClick={this.onButtonClick.bind(this, 12)}>12Hr
                        </button>
                        <button
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