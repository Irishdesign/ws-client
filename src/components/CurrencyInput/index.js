import React from 'react';
import PropTypes from 'prop-types';
import { Input, InputNumber } from 'antd';
import './currencyInput.scss';

const fieldValue = props => {
  if (!isNaN(props.value)) {
    return props.value;
  }
  return props.initialValue;
};
const CurrencyInput = props => (
  <div className="currencyInputContainer">
    {/* <div className="questionWrapper">
      <div className="question"> {props.data.question}</div>
      <div className="hintRight"> {props.data.hintRight} </div>
    </div> */}

    <div className="currencyBox">
      <div className="amount">
        <div
          className="ant-input-group-addon"
          style={{ verticalAlign: 'middle', display: 'inline-table' }}
        >
          &pound;
        </div>
        <InputNumber
          size="large"
          key={`currency:${props.initialValue}`}
          value={fieldValue(props)}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          onChange={props.onChange}
          placeholder={props.placeholder}
          disabled={props.disabled}
          className={
            props.disabled == 'true'
              ? 'currencyTrue'
              : props.initialValue || props.initialValue == 0
              ? 'currencyInputFilled'
              : ''
          }
          block
        />
      </div>
    </div>
  </div>
);

CurrencyInput.propTypes = {
  data: PropTypes.any,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  hintRight: PropTypes.string,
  hintBottom: PropTypes.string,
  initialValue: PropTypes.number,
};
export default CurrencyInput;
