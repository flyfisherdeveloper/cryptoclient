import React from "react";
import PropTypes from "prop-types";
import LineGraph from "./LineGraph";

class ChartModal extends React.Component {
    render() {
        if (!this.props.isOpen) {
            return null;
        }
        const BackgroundStyle = {
            backgroundColor: "rgba(220,220,220,0.5)",
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
            height: 20,
            width: "100%"
        };
        const CloseBtnStyle = {
            float: "right",
            cursor: "pointer",
            display: "block"
        };
        return (
            <div style={BackgroundStyle}>
                <div style={ModalStyle}>
                    <div style={HeaderStyle}>
                        <span style={CloseBtnStyle} onClick={this.props.onClose}>
                            X
                        </span>
                    </div>
                    {this.props.children}
                </div>
                <LineGraph symbol={this.symbol}/>
            </div>
        );
    }
}

ChartModal.propTypes = {
    onClose: PropTypes.func,
    isOpen: PropTypes.bool,
    symbol: PropTypes.string,
    children: PropTypes.node
};
export default ChartModal;