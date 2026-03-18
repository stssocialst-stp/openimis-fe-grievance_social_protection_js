import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Autocomplete, formatMessage } from '@stssocialst-stp/fe-core';
import { fetchTicketChannels } from '../actions';

class ChannelPicker extends Component {
  componentDidMount() {
    if (!this.props.channels.length && !this.props.fetching) {
      this.props.fetchTicketChannels();
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
      channels,
      fetching,
      error,
    } = this.props;

    return (
      <Autocomplete
        multiple={multiple}
        required={required}
        placeholder={placeholder ?? formatMessage(intl, 'ticket', 'ChannelPicker.placeholder')}
        label={label ?? formatMessage(intl, 'ticket', 'ChannelPicker.label')}
        error={error}
        withLabel={withLabel}
        withPlaceholder={withPlaceholder}
        readOnly={readOnly}
        options={channels}
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
  channels: state.grievanceSocialProtection.ticketChannels ?? [],
  fetching: state.grievanceSocialProtection.fetchingTicketChannels,
  error: state.grievanceSocialProtection.errorTicketChannels,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchTicketChannels }, dispatch);
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ChannelPicker));
