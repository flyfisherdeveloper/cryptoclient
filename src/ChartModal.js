import React from "react";
import PropTypes from "prop-types";
import LineGraph from "./LineGraph";

class ChartModal extends React.Component {
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

        return (
            <div style={BackgroundStyle}>
                <div style={ModalStyle}>
                    <div style={HeaderStyle}>
                        <div><a id="close" href="#" onClick={this.props.onClose}/></div>
                    </div>
                    {this.props.children}
                </div>
                <LineGraph symbol={this.props.symbol}
                           quoteSymbol={this.props.quote}
                           title={"7-Day Volume chart for " + this.props.symbol}/>
            </div>
        );
    }
}

ChartModal.propTypes = {
    onClose: PropTypes.func,
    isOpen: PropTypes.bool,
    symbol: PropTypes.string,
    quote: PropTypes.string,
    children: PropTypes.node
};
export default ChartModal;