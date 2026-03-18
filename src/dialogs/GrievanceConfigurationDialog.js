import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { coreAlert } from '@stssocialst-stp/fe-core';
import { fetchGrievanceConfiguration } from '../actions';

class GrievanceConfigurationDialog extends Component {
  componentDidMount() {
    if (!this.props.fetchedGrievanceConfig) {
      this.props.fetchGrievanceConfiguration();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.fetchedGrievanceConfig !== this.props.fetchedGrievanceConfig
      && this.props.fetchedGrievanceConfig) {
      if (!this.props.fetchedGrievanceConfig) {
        this.props.fetchGrievanceConfiguration();
      }
    }
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state) => ({
  fetchedGrievanceConfig: state?.grievanceSocialProtection?.fetchedGrievanceConfig,
  grievanceConfig: state?.grievanceSocialProtection?.grievanceConfig,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchGrievanceConfiguration,
  coreAlert,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(GrievanceConfigurationDialog);
