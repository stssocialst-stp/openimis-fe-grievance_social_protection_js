/* eslint-disable max-len */
/* eslint-disable react/no-unused-state */
/* eslint-disable no-unused-vars */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Grid, Paper, Typography, Divider, IconButton,
} from '@material-ui/core';
import { Save } from '@material-ui/icons';
import {
  TextInput, journalize, PublishedComponent, FormattedMessage,
} from '@stssocialst-stp/fe-core';
import { createTicket, fetchIndividualById } from '../actions';
import { EMPTY_STRING, GRIEVANT_TYPES, MODULE_NAME } from '../constants';
import GrievantTypePicker from '../pickers/GrievantTypePicker';
import ReporterFields from '../components/ReporterFields';

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

class AddTicketPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateEdited: {},
      grievantType: null,
      benefitPlan: null,
      isSaved: false,
    };
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevPops, prevState, snapshort) {
    if (prevPops.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
    }
    if (!prevPops.fetchedAutofillIndividual && this.props.fetchedAutofillIndividual && this.props.autofillIndividual) {
      const ind = this.props.autofillIndividual;
      this.setState((state) => ({
        stateEdited: {
          ...state.stateEdited,
          reporterInfo: {
            name: [ind.firstName, ind.lastName].filter(Boolean).join(' '),
            dob: ind.dob || '',
            gender: ind.sexo || '',
            phone: ind.contactoTelefonico || '',
            phone2: '',
            otherInfo: ind.vulgo || '',
            idNumber: ind.numDocId || '',
            district: ind.distrito || '',
            subDistrict: ind.subdistrito || '',
            locality: ind.localidade || '',
          },
        },
      }));
    }
  }

  save = () => {
    this.props.createTicket(
      this.state.stateEdited,
      this.props.grievanceConfig,
      `Created Ticket ${this.state.stateEdited.title}`,
    );

    this.setState({ isSaved: true });
  };

  updateAttribute = (k, v) => {
    this.setState((state) => ({
      stateEdited: { ...state.stateEdited, [k]: v },
      isSaved: false, // Reset isSaved when form is modified
    }));
  };

  // eslint-disable-next-line class-methods-use-this
  extractFieldFromJsonExt = (stateEdited, field) => {
    if (stateEdited && stateEdited.reporter && stateEdited.reporter.jsonExt) {
      const jsonExt = JSON.parse(stateEdited.reporter.jsonExt || '{}');
      return jsonExt[field] || '';
    }
    return '';
  };

  updateTypeOfGrievant = (field, value) => {
    this.updateAttribute('reporter', null);
    this.updateAttribute('reporterType', value);
    this.setState((state) => ({
      grievantType: value,
    }));
  };

  updateBenefitPlan = (field, value) => {
    this.updateAttribute('reporter', null);
    this.setState((state) => ({
      benefitPlan: value,
    }));
  };

  updateIndividualReporter = (individual) => {
    this.updateAttribute('reporter', individual);
    if (individual) {
      this.props.fetchIndividualById(individual.id);
    } else {
      this.updateAttribute('reporterInfo', {});
    }
  };

  render() {
    const {
      classes,
      titleone = ' Ticket.ComplainantInformation',
      titletwo = ' Ticket.DescriptionOfEvents',
      titleParams = { label: EMPTY_STRING },
    } = this.props;

    const {
      stateEdited,
      grievantType,
      benefitPlan,
      isSaved,
    } = this.state;

    return (
      <div className={classes.page}>
        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container className={classes.tableTitle}>
                <Grid item xs={8} className={classes.tableTitle}>
                  <Typography>
                    <FormattedMessage module={MODULE_NAME} id={titleone} values={titleParams} />
                  </Typography>
                </Grid>
              </Grid>
              <Grid container className={classes.item}>
                <Grid item xs={3} className={classes.item}>
                  <GrievantTypePicker
                    module={MODULE_NAME}
                    label="type"
                    readOnly={!!stateEdited.id || isSaved}
                    withNull
                    value={grievantType?.replace(/\s+/g, '') ?? ''}
                    onChange={(v) => this.updateTypeOfGrievant('grievantType', v)}
                    withLabel
                  />
                </Grid>
                {grievantType === GRIEVANT_TYPES.INDIVIDUAL && (
                  <>
                    <Grid item xs={3} className={classes.item}>
                      <PublishedComponent
                        pubRef="socialProtection.BenefitPlanPicker"
                        withNull
                        label="socialProtection.benefitPlan"
                        value={benefitPlan}
                        onChange={(v) => this.updateBenefitPlan('benefitPlan', v)}
                        readOnly={isSaved}
                      />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                      <PublishedComponent
                        pubRef="individual.IndividualPicker"
                        value={stateEdited.reporter}
                        label="Complainant"
                        onChange={(v) => this.updateIndividualReporter(v)}
                        benefitPlan={benefitPlan}
                        readOnly={isSaved}
                      />
                    </Grid>
                  </>
                )}
                {grievantType === GRIEVANT_TYPES.BENEFICIARY && (
                  <>
                    <Grid item xs={3} className={classes.item}>
                      <PublishedComponent
                        pubRef="socialProtection.BenefitPlanPicker"
                        withNull
                        label="socialProtection.benefitPlan"
                        value={benefitPlan}
                        onChange={(v) => this.updateBenefitPlan('benefitPlan', v)}
                        readOnly={isSaved}
                      />
                    </Grid>
                    {benefitPlan && (
                      <Grid item xs={3} className={classes.item}>
                        <PublishedComponent
                          pubRef="socialProtection.BeneficiaryPicker"
                          value={stateEdited.reporter}
                          label="Complainant"
                          onChange={(v) => this.updateAttribute('reporter', v)}
                          benefitPlan={benefitPlan}
                          readOnly={isSaved}
                        />
                      </Grid>
                    )}
                  </>
                )}
                {grievantType === 'user' && (
                  <Grid item xs={6} className={classes.item}>
                    <PublishedComponent
                      pubRef="admin.UserPicker"
                      value={stateEdited.reporter}
                      label="Complainant"
                      onChange={(v) => this.updateAttribute('reporter', v)}
                      benefitPlan={benefitPlan}
                      readOnly={isSaved}
                    />
                  </Grid>
                )}
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                {grievantType === null || grievantType === GRIEVANT_TYPES.INDIVIDUAL ? (
                  <ReporterFields
                    stateEdited={stateEdited}
                    updateAttribute={this.updateAttribute}
                    isSaved={isSaved}
                    classes={classes}
                    individualSelected={grievantType === GRIEVANT_TYPES.INDIVIDUAL && !!stateEdited.reporter}
                  />
                ) : null}
                {grievantType === GRIEVANT_TYPES.BENEFICIARY && (
                  <>
                    <Grid item xs={3} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.name"
                        value={!!stateEdited
                          && !!stateEdited.reporter
                          // eslint-disable-next-line max-len
                          ? `${stateEdited.reporter.individual.firstName} ${stateEdited.reporter.individual.lastName} ${stateEdited.reporter.individual.dob}`
                          : EMPTY_STRING}
                        onChange={(v) => this.updateAttribute('name', v)}
                        required={false}
                        readOnly
                      />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.phone"
                        value={!!stateEdited && !!stateEdited.reporter
                          ? this.extractFieldFromJsonExt(stateEdited, 'phone')
                          : EMPTY_STRING}
                        onChange={(v) => this.updateAttribute('phone', v)}
                        required={false}
                        readOnly
                      />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.phone2"
                        value={!!stateEdited && !!stateEdited.reporter
                          ? this.extractFieldFromJsonExt(stateEdited, 'phone2')
                          : EMPTY_STRING}
                        onChange={(v) => this.updateAttribute('phone2', v)}
                        required={false}
                        readOnly
                      />
                    </Grid>
                    <Grid item xs={3} className={classes.item}>
                      <TextInput
                        module={MODULE_NAME}
                        label="ticket.email"
                        value={!!stateEdited && !!stateEdited.reporter
                          ? this.extractFieldFromJsonExt(stateEdited, 'email')
                          : EMPTY_STRING}
                        onChange={(v) => this.updateAttribute('email', v)}
                        required={false}
                        readOnly
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container className={classes.tableTitle}>
                <Grid item xs={12} className={classes.tableTitle}>
                  <Typography>
                    <FormattedMessage module={MODULE_NAME} id={titletwo} values={titleParams} />
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Grid container className={classes.item}>
                <Grid item xs={6} className={classes.item}>
                  <TextInput
                    label="ticket.title"
                    value={stateEdited.title}
                    onChange={(v) => this.updateAttribute('title', v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="core.DatePicker"
                    label="ticket.dateOfIncident"
                    value={stateEdited.dateOfIncident}
                    required={false}
                    onChange={(v) => this.updateAttribute('dateOfIncident', v)}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.FlagPicker"
                    value={stateEdited.flags}
                    onChange={(v) => this.updateAttribute('flags', v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.DropDownCategoryPicker"
                    value={stateEdited.category}
                    onChange={(v) => this.updateAttribute('category', v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={6} className={classes.item}>
                  <PublishedComponent
                    pubRef="grievanceSocialProtection.ChannelPicker"
                    value={stateEdited.channel}
                    onChange={(v) => this.updateAttribute('channel', v)}
                    required
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={12} className={classes.item}>
                  <TextInput
                    label="ticket.ticketDescription"
                    value={stateEdited.description}
                    onChange={(v) => this.updateAttribute('description', v)}
                    required={false}
                    readOnly={isSaved}
                  />
                </Grid>
                <Grid item xs={11} className={classes.item} />
                <Grid item xs={1} className={classes.item}>
                  <IconButton
                    variant="contained"
                    component="label"
                    color="primary"
                    onClick={this.save}
                    disabled={
                      (!stateEdited.channel || !stateEdited.flags || !stateEdited.title || isSaved)
                      || ((
                        stateEdited.reporterType === 'individual'
                        || stateEdited.reporterType === 'beneficiary'
                        || stateEdited.reporterType === 'user')
                        && stateEdited.reporter === null
                      )
                    }
                  >
                    <Save />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, props) => ({
  submittingMutation: state.grievanceSocialProtection.submittingMutation,
  mutation: state.grievanceSocialProtection.mutation,
  grievanceConfig: state.grievanceSocialProtection.grievanceConfig,
  fetchedAutofillIndividual: state.grievanceSocialProtection.fetchedAutofillIndividual,
  autofillIndividual: state.grievanceSocialProtection.autofillIndividual,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ createTicket, journalize, fetchIndividualById }, dispatch);

export default withTheme(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(AddTicketPage)));
