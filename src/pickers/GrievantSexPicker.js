import React from 'react';
import { ConstantBasedPicker } from '@stssocialst-stp/fe-core';
import {
    GRIEVANT_SEX_LIST,
} from '../constants';

function GrievantSexPicker(props) {
  const {
    required, withNull, readOnly, onChange, value, nullLabel, withLabel,
  } = props;
  return (
    <ConstantBasedPicker
      module="grievanceSocialProtection"
      label="grievant.sexPicker"
      constants={GRIEVANT_SEX_LIST}
      onChange={onChange}
      value={value}
      required={required}
      readOnly={readOnly}
      withNull={withNull}
      nullLabel={nullLabel}
      withLabel={withLabel}
    />
  );
}

export default GrievantSexPicker;
