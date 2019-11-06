import React from 'react';
import Modal from 'react-modal';
import ModalButton from "./ModalButton";
import style from './style.css';

class ChartModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { modalOpened: false };
        this.toggleModal = this.toggleModal.bind(this);
    }

    toggleModal() {
        this.setState(prevState => ({ modalOpened: !prevState.modalOpened }));
    }

    render() {
        const { data } = this.props;
        return (
            <div className={style.modalWrapper}>
                <ModalButton handleClick={this.toggleModal}>
                    click to open modal
                </ModalButton>
                <Modal
                    className={{ base: [style.base]}}
                    overlayClassName={{ base: [style.overlayBase] }}
                    isOpen={this.state.modalOpened}
                    onRequestClose={this.toggleModal}
                    contentLabel="Modal with image"
                >
                    <img
                        onClick={this.toggleModal}
                        src={data.src}
                        alt='image displayed in modal'
                    />
                    <span className={style.text}>{data.description}</span>
                </Modal>
            </div>
        );
    }
}

export default ChartModal;