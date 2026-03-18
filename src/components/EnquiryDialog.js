import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import {
  Dialog, Button, DialogActions, DialogContent,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  formatMessage,
  formatMessageWithValues,
  Contributions,
  Error,
  ProgressOrError,
  withModulesManager,
  withHistory,
} from '@stssocialst-stp/fe-core';
import { fetchIndividual } from '../actions';
import IndividualSummary from './IndividualSummary';

class EnquiryDialog extends Component {
  componentDidUpdate(prevProps) {
    const {
      open, individual, chfid, modulesManager, fetchIndividual: doFetch,
    } = this.props;
    if (open && (open !== prevProps.open || chfid !== prevProps.chfid)) {
      if (individual?.id !== chfid) {
        doFetch(modulesManager, chfid);
      }
    }
  }

  render() {
    const {
      intl, modulesManager, fetching, fetched, individual, error, onClose, open, chfid,
    } = this.props;

    return (
      <Dialog maxWidth="xl" fullWidth open={open} onClose={onClose}>
        <DialogContent>
          <ProgressOrError progress={fetching} error={error} />
          {!!fetched && !individual && (
            <Error
              error={{
                code: formatMessage(intl, 'insuree', 'notFound'),
                detail: formatMessageWithValues(intl, 'insuree', 'chfidNotFound', { chfid }),
              }}
            />
          )}
          {!fetching && individual && (
            <>
              <IndividualSummary
                modulesManager={modulesManager}
                insuree={individual}
                style={{ marginBottom: 32 }}
              />
              <Contributions contributionKey="insuree.EnquiryDialog" insuree={individual} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            {formatMessage(intl, 'insuree', 'close')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const mapStateToProps = (state) => ({
  fetching: state.individual.fetchingIndividual,
  fetched: state.individual.fetchedIndividual,
  individual: state.individual.individual,
  error: state.individual.errorIndividual,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchIndividual }, dispatch);
export default withModulesManager(withHistory(connect(mapStateToProps, mapDispatchToProps)(injectIntl(EnquiryDialog))));
