/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/no-did-update-set-state */
import React, { Component, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import { Badge } from "@material-ui/core";
import AttachIcon from "@material-ui/icons/AttachFile";
import {
  Form, formatMessageWithValues, journalize, ProgressOrError, withModulesManager, formatMessage,
  PublishedComponent, Contributions,
} from '@stssocialst-stp/fe-core';
import { bindActionCreators } from 'redux';
import {
  clearTicket,
  fetchComments, fetchGrievanceConfiguration, fetchTicket, reopenTicket,
} from '../actions';
import { ticketLabel } from '../utils/utils';
import EditTicketPage from '../pages/EditTicketPage';
import AddTicketPage from '../pages/AddTicketPage';
import TicketCommentPanel from './TicketCommentsPanel';
import {
  MODULE_NAME,
  RIGHT_TICKET_ADD,
  RIGHT_TICKET_ADD_COMMENT,
  RIGHT_TICKET_EDIT,
  RIGHT_TICKET_RESOLVE,
  RIGHT_TICKET_VIEW_COMMENTS,
  TICKET_STATUSES,
} from '../constants';


const TICKET_FORM_CONTRIBUTION_KEY = "grievanceSocialProtection.TicketForm";

class TicketForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lockNew: false,
      reset: 0,
      ticketUuid: null,
      ticket: this._newTicket(),
      attachmentsTicket: null,
    };

    this.ticketAttachments = props.modulesManager.getConf("fe-grievance_social_protection", "ticketAttachments", true);
  }

  componentDidMount() {
    this.props.fetchGrievanceConfiguration();
    if (this.props.ticketUuid) {
      this.setState((state, props) => ({ ticketUuid: props.ticketUuid }));
    }
  }

  // eslint-disable-next-line react/sort-comp
  componentWillUnmount() {
    this.props.clearTicket();
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.ticket.ticketCode !== this.state.ticket.ticketCode) {
      document.title = formatMessageWithValues(
        this.props.intl,
        MODULE_NAME,
        'ticket.title.bar',
        { label: ticketLabel(this.state.ticket) },
      );
    }
    if (prevProps.fetchedTicket !== this.props.fetchedTicket
      && !!this.props.fetchedTicket
      && !!this.props.ticket) {
      this.setState((state, props) => ({
        ticket: { ...props.ticket },
        ticketUuid: props.ticket.id,
        lockNew: false,
      }));
    } else if (prevState.ticketUuid !== this.state.ticketUuid) {
      const filters = [`id: "${this.state.ticketUuid}"`];
      if (this.props.ticketVersion) filters.push(`ticketVersion: ${this.props.ticketVersion}`);
      this.props.fetchTicket(
        this.props.modulesManager,
        filters,
      );
    } else if (prevProps.ticketUuid && !this.props.ticketUuid) {
      this.setState({ ticket: this._newTicket(), lockNew: false, ticketUuid: null });
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState((state) => ({ reset: state.reset + 1 }));
      if (this.props?.ticket?.id) {
        this.props.fetchTicket(
          this.props.modulesManager,
          [`id: "${this.state.ticketUuid}"`],
        );
      }
    }
  }

  // eslint-disable-next-line react/sort-comp
  _newTicket() {
    return {};
  }

  reload = () => {
    this.props.fetchComments(
      this.state.ticket,
    );
  };

  canSave = () => {
    if (!this.state.ticket.reporter) return false;
    if (!this.state.ticket.category) return false;
    return true;
  };

  _save = (ticket) => {
    this.setState(
      { lockNew: !ticket.uuid },
      () => this.props.save(ticket),
    );
  };

  onEditedChanged = (ticket) => {
    this.setState({ ticket });
  };

  reopenTicket = () => {
    const { intl, ticket } = this.props;
    this.props.reopenTicket(
      ticket.id,
      formatMessage(intl, MODULE_NAME, 'reopenTicket.mutation.label'),
    );
  };

  render() {
    const {
      fetchingTicket,
      fetchedTicket,
      errorTicket,
      save, back,
      rights,
    } = this.props;

    const {
      lockNew,
      reset,
      update,
      overview,
      ticketUuid,
      ticket,
    } = this.state;

    const readOnly = lockNew || !!ticket.validityTo || this.props.readOnly;
    const canReopenTicket = this.props.rights.includes(RIGHT_TICKET_EDIT);
    const canSeeComments = this.props.rights.includes(RIGHT_TICKET_VIEW_COMMENTS)
      || this.props.rights.includes(RIGHT_TICKET_ADD_COMMENT)
      || this.props.rights.includes(RIGHT_TICKET_RESOLVE);
    const actions = [];

    if (canReopenTicket) {
      actions.push({
        doIt: this.reopenTicket,
        icon: <LockOpenIcon />,
        onlyIfDirty: ![TICKET_STATUSES.CLOSED, TICKET_STATUSES.REJECTED].includes(ticket?.status),
        disabled: ticket.isHistory,
      });
    }

    // if (!!this.ticketAttachments && (!readOnly || ticket.attachmentsCount > 0)) {
    //   actions.push({
    //     doIt: (e) => this.setState({ attachmentsTicket: ticket }),
    //     icon: (
    //       <Badge badgeContent={this.state.ticket?.attachmentsCount ?? 0} color="primary">
    //         <AttachIcon />
    //       </Badge>
    //     ),
    //   });
    // }

    return (
      <>
        <ProgressOrError progress={fetchingTicket} error={errorTicket} />
        {(!!fetchedTicket || !ticketUuid) && (
          <Fragment>
            {/* <PublishedComponent
              pubRef="grievanceSocialProtection.TicketAttachmentsDialog"
              readOnly={!rights.includes(RIGHT_TICKET_ADD) || readOnly}
              ticket={this.state.attachmentsTicket}
              close={(e) => this.setState({ attachmentsTicket: null })}
              onUpdated={() => this.setState({ forcedDirty: true })}
            /> */}
            <Form
              module={MODULE_NAME}
              edited_id={ticketUuid}
              edited={ticket}
              reset={reset}
              update={update}
              title="ticket.title.bar"
              titleParams={{ label: ticketLabel(this.state.ticket) }}
              back={back}
              save={save ? this._save : null}
              canSave={this.canSave}
              reload={(ticketUuid || readOnly) && this.reload}
              readOnly={readOnly}
              overview={overview}
              Panels={ticketUuid ? [EditTicketPage, ...(canSeeComments ? [TicketCommentPanel] : [])] : [AddTicketPage]}
              onEditedChanged={this.onEditedChanged}
              actions={actions}
            />
          </Fragment>
        )}
      </>
    );
  }
}

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  fetchingTicket: state.grievanceSocialProtection.fetchingTicket,
  errorTicket: state.grievanceSocialProtection.errorTicket,
  fetchedTicket: state.grievanceSocialProtection.fetchedTicket,
  ticket: state.grievanceSocialProtection.ticket,
  submittingMutation: state.grievanceSocialProtection.submittingMutation,
  mutation: state.grievanceSocialProtection.mutation,
  grievanceConfig: state.grievanceSocialProtection.grievanceConfig,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchTicket,
  fetchComments,
  reopenTicket,
  fetchGrievanceConfiguration,
  clearTicket,
  journalize,
}, dispatch);

export default withModulesManager(connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(TicketForm),

));
