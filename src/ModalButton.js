import React from 'react';
import style from './style.css';

const ModalButton = props => (
    <button className={style.btn} onClick={props.onClick}>
        {props.children}
    </button>);

export default ModalButton;