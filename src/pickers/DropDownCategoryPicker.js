import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Autocomplete, formatMessage } from '@stssocialst-stp/fe-core';
import { fetchTicketCategories } from '../actions';

class DropDownCategoryPicker extends Component {
  componentDidMount() {
    if (!this.props.categories.length && !this.props.fetching) {
      this.props.fetchTicketCategories();
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
      categories,
      fetching,
      error,
    } = this.props;

    return (
      <Autocomplete
        multiple={multiple}
        required={required}
        placeholder={placeholder ?? formatMessage(intl, 'ticket', 'CategoryPicker.placeholder')}
        label={label ?? formatMessage(intl, 'ticket', 'CategoryPicker.label')}
        error={error}
        withLabel={withLabel}
        withPlaceholder={withPlaceholder}
        readOnly={readOnly}
        options={categories}
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
  categories: state.grievanceSocialProtection.ticketCategories ?? [],
  fetching: state.grievanceSocialProtection.fetchingTicketCategories,
  error: state.grievanceSocialProtection.errorTicketCategories,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchTicketCategories }, dispatch);
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(DropDownCategoryPicker));
