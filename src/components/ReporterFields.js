import React from 'react';
import { Grid } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { TextInput, PublishedComponent } from '@stssocialst-stp/fe-core';
import { EMPTY_STRING, MODULE_NAME } from '../constants';
import GrievantSexPicker from '../pickers/GrievantSexPicker';

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

const ReporterFields = ({
  classes, stateEdited, updateAttribute, isSaved, individualSelected,
}) => {
  const reporter = stateEdited?.reporter && typeof stateEdited.reporter === 'object'
    ? stateEdited.reporter
    : stateEdited?.reporter
      ? (() => { try { return JSON.parse(JSON.parse(stateEdited.reporter)); } catch { return {}; } })()
      : {};

  const reporterInfo = stateEdited?.reporterInfo || {};
  const isReadOnly = isSaved || !!individualSelected;

  // Helper to update a single key in reporterInfo JSON
  const updateReporterInfo = (key, value) => {
    updateAttribute('reporterInfo', { ...reporterInfo, [key]: value });
  };

  return (
    <Grid container className={classes.item}>
      <Grid item xs={4}>
        <TextInput
          module={MODULE_NAME}
          label="ticket.name"
          value={
            reporterInfo.name
              ? reporterInfo.name
              : reporter.firstName && reporter.lastName
                ? `${reporter.firstName} ${reporter.lastName}`
                : EMPTY_STRING
          }
          onChange={(v) => updateReporterInfo('name', v)}
          required={false}
          readOnly={isReadOnly}
        />
      </Grid>
      <Grid item xs={4}>
        <PublishedComponent
          pubRef="core.DatePicker"
          module={MODULE_NAME}
          label="ticket.dob"
          value={
            reporterInfo.dob
              ? reporterInfo.dob
              : reporter.dob || EMPTY_STRING
          }
          onChange={(v) => updateReporterInfo('dob', v)}
          required={false}
          readOnly={isReadOnly}
        />
      </Grid>
      <Grid item xs={4}>
        <GrievantSexPicker
          value={reporterInfo.gender || EMPTY_STRING}
          onChange={(v) => updateReporterInfo('gender', v)}
          required={false}
          readOnly={isReadOnly}
          withNull
          withLabel
        />
      </Grid>
      <Grid item xs={4}>
        <TextInput
          module={MODULE_NAME}
          label="ticket.phone"
          value={reporterInfo.phone || EMPTY_STRING}
          onChange={(v) => updateReporterInfo('phone', v)}
          required={false}
          readOnly={isReadOnly}
        />
      </Grid>
      <Grid item xs={4}>
        <TextInput
          module={MODULE_NAME}
          label="ticket.phone2"
          value={reporterInfo.phone2 || EMPTY_STRING}
          onChange={(v) => updateReporterInfo('phone2', v)}
          required={false}
          readOnly={isReadOnly}
        />
      </Grid>
      <Grid item xs={4}>
        <TextInput
          module={MODULE_NAME}
          label="ticket.otherInfo"
          value={reporterInfo.otherInfo || EMPTY_STRING}
          onChange={(v) => updateReporterInfo('otherInfo', v)}
          required={false}
          readOnly={isReadOnly}
        />
      </Grid>
      <Grid item xs={4}>
        <TextInput
          module={MODULE_NAME}
          label="ticket.idNumber"
          value={reporterInfo.idNumber || EMPTY_STRING}
          onChange={(v) => updateReporterInfo('idNumber', v)}
          required={false}
          readOnly={isReadOnly}
        />
      </Grid>
      <Grid item xs={4}>
        <TextInput
          module={MODULE_NAME}
          label="ticket.district"
          value={reporterInfo.district || EMPTY_STRING}
          onChange={(v) => updateReporterInfo('district', v)}
          required={false}
          readOnly={isReadOnly}
        />
      </Grid>
      <Grid item xs={4}>
        <TextInput
          module={MODULE_NAME}
          label="ticket.subDistrict"
          value={reporterInfo.subDistrict || EMPTY_STRING}
          onChange={(v) => updateReporterInfo('subDistrict', v)}
          required={false}
          readOnly={isReadOnly}
        />
      </Grid>
      <Grid item xs={4}>
        <TextInput
          module={MODULE_NAME}
          label="ticket.locality"
          value={reporterInfo.locality || EMPTY_STRING}
          onChange={(v) => updateReporterInfo('locality', v)}
          required={false}
          readOnly={isReadOnly}
        />
      </Grid>
    </Grid>
  );
};

export default withTheme(withStyles(styles)(ReporterFields));