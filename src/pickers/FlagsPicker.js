import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Autocomplete, formatMessage } from '@stssocialst-stp/fe-core';
import { fetchTicketFlags } from '../actions';

class FlagPicker extends Component {
  componentDidMount() {
    if (!this.props.flags.length && !this.props.fetching) {
      this.props.fetchTicketFlags();
    }
  }

  render() {
    const {
      intl,
      onChange,
      readOnly,
      required,
      withLabel = true,
      withPlaceholder,
      value,
      label,
      filterOptions,
      filterSelectedOptions,
      placeholder,
      multiple,
      flags,
      fetching,
      error,
    } = this.props;

    return (
      <Autocomplete
        multiple={multiple}
        required={required}
        placeholder={placeholder ?? formatMessage(intl, 'ticket', 'FlagPicker.placeholder')}
        label={label ?? formatMessage(intl, 'ticket', 'FlagPicker.label')}
        error={error}
        withLabel={withLabel}
        withPlaceholder={withPlaceholder}
        readOnly={readOnly}
        options={flags}
        isLoading={fetching}
        value={value}
        getOptionLabel={(option) => option?.nome ?? `${option}`}
        onChange={(option) => onChange(option, option?.nome ?? null)}
        filterOptions={filterOptions}
        filterSelectedOptions={filterSelectedOptions}
        onInputChange={this.props.onInputChange || (() => { })}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  flags: state.grievanceSocialProtection.ticketFlags ?? [],
  fetching: state.grievanceSocialProtection.fetchingTicketFlags,
  error: state.grievanceSocialProtection.errorTicketFlags,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchTicketFlags }, dispatch);
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(FlagPicker));
