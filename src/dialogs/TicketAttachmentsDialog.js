import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";

import {
  Dialog,
  DialogTitle,
  Divider,
  Button,
  DialogActions,
  DialogContent,
  Link,
  IconButton,
} from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import SaveIcon from "@material-ui/icons/Save";
import DeleteIcon from "@material-ui/icons/Delete";
import FileIcon from "@material-ui/icons/Add";
import LinkIcon from "@material-ui/icons/Link";

import {
  FormattedMessage,
  withModulesManager,
  ProgressOrError,
  Table,
  TextInput,
  PublishedComponent,
  withTooltip,
  formatMessage,
  formatMessageWithValues,
  journalize,
  coreConfirm,
  coreAlert,
} from "@stssocialst-stp/fe-core";
import {
  fetchTicketAttachments,
  downloadAttachment,
  deleteAttachment,
  createAttachment,
  updateAttachment,
} from "../actions";
import { DEFAULT, RIGHT_TICKET_ADD, URL_TYPE_STRING } from "../constants";
import AttachmentGeneralTypePicker from "../pickers/TicketAttachmentGeneralTypePicker";

const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
});

class TicketAttachmentsDialog extends Component {
  constructor(props) {
    super(props);
    this.allowedDomainsAttachments = props.modulesManager.getConf(
      "fe-grievance_social_protection",
      "allowedDomainsAttachments",
      DEFAULT.ALLOWED_DOMAINS_ATTACHMENTS,
    );
  }

  state = {
    open: false,
    ticketUuid: null,
    ticketAttachments: [],
    attachmentToDelete: null,
    updatedAttachments: new Set(),
    reset: 0,
  };

  componentDidUpdate(prevProps, props, snapshot) {
    const { readOnly = false } = this.props;
    // debugger
    if (!_.isEqual(prevProps.ticketAttachments, this.props.ticketAttachments)) {
      var ticketAttachments = [...(this.props.ticketAttachments || [])];
      if (!this.props.readOnly && this.props.rights.includes(RIGHT_TICKET_ADD)) {
        ticketAttachments.push({ title: "", type: "" });
      }
      this.setState({ ticketAttachments, updatedAttachments: new Set() });
    } else if (!_.isEqual(prevProps.ticket, this.props.ticket) && !!this.props.ticket && !!this.props.ticket.id) {
      this.setState(
        (state, props) => ({
          open: true,
          ticketUuid: props.ticket.id,
          ticketAttachments: readOnly ? [] : [{}],
          updatedAttachments: new Set(),
        }),
        (e) => {
          if (!!this.props.ticket && !!this.props.ticket.id) {
            this.props.fetchTicketAttachments(this.props.ticket);
          }
        },
      );
    } else if (!_.isEqual(prevProps.ticket, this.props.ticket) && !!this.props.ticket && !this.props.ticket.id) {
      let ticketAttachments = [...(this.props.ticket.attachments || [])];
      if (!readOnly) {
        ticketAttachments.push({});
        this.props.onUpdated();
      }
      this.setState({ open: true, ticketUuid: null, ticketAttachments, updatedAttachments: new Set() });
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      var ticketAttachments = [...this.state.ticketAttachments];
      if (!!this.state.attachmentToDelete) {
        ticketAttachments = ticketAttachments.filter((a) => a.id !== this.state.attachmentToDelete.id);
      } else if (!_.isEqual(_.last(ticketAttachments), {})) {
        ticketAttachments.push({});
      }
      this.setState((state) => ({
        ticketAttachments,
        updatedAttachments: new Set(),
        attachmentToDelete: null,
        reset: state.reset + 1,
      }));
    } else if (
      prevProps.confirmed !== this.props.confirmed &&
      !!this.props.confirmed &&
      !!this.state.attachmentToDelete
    ) {
      const title = this.state.attachmentToDelete.title ? `${this.state.attachmentToDelete.title}` : "";
      const filename = this.state.attachmentToDelete.filename ? `(${this.state.attachmentToDelete.filename})` : "";
      this.props.deleteAttachment(
        this.state.attachmentToDelete,
        formatMessageWithValues(this.props.intl, "ticket", "ticket.TicketAttachment.delete.mutationLabel", {
          file: `${title} ${filename}`,
          code: `${this.props.ticket.code}`,
        }),
      );
    }
  }

  onClose = () => this.setState({ open: false }, (e) => !!this.props.close && this.props.close());

  validateUrl(url, omitValidation = false) {
    let parsedUrl;

    if (omitValidation) {
      return { isValid: true, error: null };
    }

    try {
      parsedUrl = new URL(url);
    } catch (error) {
      return { isValid: false, error: "url.validation.invalidURL" };
    }

    if (this.allowedDomainsAttachments.length === 0) {
      return { isValid: true, error: null };
    }

    const enteredDomain = parsedUrl.hostname;
    const isDomainAllowed = this.allowedDomainsAttachments.some((allowedDomain) =>
      enteredDomain.endsWith(allowedDomain),
    );

    if (!isDomainAllowed) {
      return { isValid: false, error: "url.validation.notAllowed" };
    }

    return { isValid: true, error: null };
  }

  delete = (a, i) => {
    if (!!a.id) {
      const filename = a.filename ? `(${a.filename})` : "";
      this.setState({ attachmentToDelete: a }, (e) =>
        this.props.coreConfirm(
          formatMessage(this.props.intl, "ticket", "deleteTicketAttachment.confirm.title"),
          formatMessageWithValues(this.props.intl, "ticket", "deleteTicketAttachment.confirm.message", {
            file: `${a.title} ${filename}`,
          }),
        ),
      );
    } else {
      var ticketAttachments = [...this.state.ticketAttachments];
      ticketAttachments.splice(i, 1);
      ticketAttachments.pop();
      this.props.ticket.attachments = [...ticketAttachments];
      this.props.ticket.attachmentsCount =
        this.props.ticket.attachments.length > 0 ? this.props.ticket.attachments.length : 0;
      ticketAttachments.push({});
      this.setState((state) => ({ ticketAttachments, reset: state.reset + 1 }));
    }
  };

  addAttachment = (document) => {
    let attachment = { ..._.last(this.state.ticketAttachments), document };
    if (!!this.state.ticketUuid) {
      const filename = attachment.filename ? `(${attachment.filename})` : "";
      this.props
        .createAttachment(
          { ...attachment, ticketUuid: this.state.ticketUuid },
          formatMessageWithValues(this.props.intl, "ticket", "ticket.TicketAttachment.create.mutationLabel", {
            file: `${attachment.title || ""} ${filename}`,
            code: `${this.props.ticket.code}`,
          }),
        )
        .then(() => {
          if (
            !!this.props.ticket &&
            !!this.props.ticket.id &&
            attachment.generalType === URL_TYPE_STRING &&
            attachment.predefinedType?.isAutogenerated
          ) {
            this.props.fetchTicketAttachments(this.props.ticket);
          }
        });
    } else {
      if (!this.props.ticket.attachments) {
        this.props.ticket.attachments = [];
      }
      this.props.ticket.attachments.push(attachment);
      var ticketAttachments = [...this.state.ticketAttachments];
      this.props.ticket.attachmentsCount = this.props.ticket.attachments.length;
      ticketAttachments.push({});
      this.setState({ ticketAttachments });
    }
  };

  update = (i) => {
    let attachment = { ticketUuid: this.state.ticketUuid, ...this.state.ticketAttachments[i] };
    const filename = attachment.filename ? `(${attachment.filename})` : "";
    this.props.updateAttachment(
      attachment,
      formatMessageWithValues(this.props.intl, "ticket", "ticket.TicketAttachment.update.mutationLabel", {
        file: `${attachment.title || ""} ${filename}`,
        code: `${this.props.ticket.code}`,
      }),
    );
  };

  download = (a) => {
    this.props.downloadAttachment(a);
  };

  fileSelected = (f, i) => {
    if (!!f.target.files) {
      const file = f.target.files[0];
      let ticketAttachments = [...this.state.ticketAttachments];
      ticketAttachments[i].filename = file.name;
      ticketAttachments[i].mime = file.type;
      this.setState({ ticketAttachments }, (e) => {
        var reader = new FileReader();
        reader.onloadend = (loaded) => {
          this.addAttachment(btoa(loaded.target.result));
        };
        reader.readAsBinaryString(file);
      });
    }
  };

  formatFileName(a, i) {
    if (!!a.id)
      return (
        <Link onClick={(e) => this.download(a)} reset={this.state.reset}>
          {a.filename || ""}
        </Link>
      );
    if (!!a.filename) return <i>{a.filename}</i>;
    return (
      <IconButton variant="contained" component="label">
        <FileIcon />
        <input type="file" style={{ display: "none" }} onChange={(f) => this.fileSelected(f, i)} />
      </IconButton>
    );
  }

  urlSelected = (f, i, autogeneratedUrl) => {
    const { coreAlert, intl } = this.props;
    const url = this.validateUrl(f, autogeneratedUrl);

    if (!url.isValid) {
      coreAlert(
        formatMessage(intl, "ticket", "url.validation.error"),
        url.error
          ? formatMessage(intl, "ticket", url.error)
          : formatMessage(intl, "ticket", "url.validation.generalError"),
      );
      return;
    }

    if (!!f || autogeneratedUrl) {
      let ticketAttachments = [...this.state.ticketAttachments];
      ticketAttachments[i].url = autogeneratedUrl ? "AUTO" : f;
      ticketAttachments[i].mime = "text/x-uri";
      this.setState({ ticketAttachments }, (e) => {
        this.addAttachment(f);
      });
    }
  };

  formatUrl(a, i) {
    const { ticketAttachments, reset } = this.state;
    const autogeneratedUrl =
      ticketAttachments[i].generalType === URL_TYPE_STRING && ticketAttachments[i].predefinedType?.isAutogenerated;

    if (!!a.mime) {
      return (
        <Link onClick={() => window.open(a.url)} reset={reset}>
          {withTooltip(<LinkIcon />, a.url)}
        </Link>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        {!autogeneratedUrl && (
          <TextInput
            reset={reset}
            value={ticketAttachments[i].url}
            onChange={(v) => this.updateAttachment(i, "url", v)}
          />
        )}
        <IconButton
          variant="contained"
          component="label"
          onClick={(f) => this.urlSelected(ticketAttachments[i].url, i, autogeneratedUrl)}
        >
          <FileIcon />
        </IconButton>
      </div>
    );
  }

  updateAttachment = (i, key, value) => {
    var state = { ...this.state };
    state.ticketAttachments[i][key] = value;
    state.updatedAttachments.add(i);
    state.reset = state.reset + 1;
    this.setState({ ...state });
  };

  cannotUpdate = (a, i) => {
    return i < this.state.ticketAttachments.length - 1 && !!this.state.ticketUuid && !a.id;
  };

  render() {
    const { classes, ticket, readOnly = false, fetchingTicketAttachments, errorTicketAttachments } = this.props;
    const { open, ticketAttachments, reset, updatedAttachments } = this.state;

    if (!ticket) return null;

    const headers = [
      "ticketAttachment.generalType",
      "ticketAttachment.predefinedType",
      "ticketAttachment.type",
      "ticketAttachment.title",
      "ticketAttachment.date",
      "ticketAttachment.fileName",
    ];

    const itemFormatters = [
      (attachment, index) =>
        this.cannotUpdate(attachment, index) ? (
          ticketAttachments[index].generalType
        ) : (
          <AttachmentGeneralTypePicker
            readOnly={ticketAttachments[index].id}
            reset={reset}
            withNull={false}
            value={ticketAttachments[index].generalType}
            onChange={(v) => this.updateAttachment(index, "generalType", v)}
          />
        ),
      (attachment, index) =>
        this.cannotUpdate(attachment, index) ? (
          ticketAttachments[index].predefinedType?.ticketAttachmentType ?? ""
        ) : (
          <PublishedComponent
            pubRef="ticket.TicketAttachmentPredefinedTypePicker"
            label="TicketAttachmentPredefinedType"
            value={ticketAttachments[index].predefinedType}
            module="ticket"
            reset={reset}
            withLabel={false}
            withPlaceholder={false}
            readOnly={readOnly || !ticketAttachments[index].generalType || ticketAttachments[index].id}
            withNull={false}
            ticketGeneralType={ticketAttachments[index].generalType}
            required={true}
            onChange={(v) => this.updateAttachment(index, "predefinedType", v)}
          />
        ),
      (attachment, index) =>
        this.cannotUpdate(attachment, index) ? (
          ticketAttachments[index].type
        ) : (
          <TextInput
            reset={reset}
            readOnly={readOnly}
            value={ticketAttachments[index].type}
            onChange={(v) => this.updateAttachment(index, "type", v)}
          />
        ),
      (attachment, index) =>
        this.cannotUpdate(attachment, index) ? (
          ticketAttachments[index].title
        ) : (
          <TextInput
            reset={reset}
            readOnly={readOnly}
            value={ticketAttachments[index].title}
            onChange={(v) => this.updateAttachment(index, "title", v)}
          />
        ),
      (attachment, index) =>
        this.cannotUpdate(attachment, index) ? (
          ticketAttachments[index].date
        ) : (
          <PublishedComponent
            pubRef="core.DatePicker"
            readOnly={readOnly}
            onChange={(v) => this.updateAttachment(index, "date", v)}
            value={ticketAttachments[index].date || null}
            reset={reset}
          />
        ),
      (attachment, index) =>
        ticketAttachments[index].url || ticketAttachments[index].generalType === URL_TYPE_STRING
          ? this.formatUrl(attachment, index)
          : this.formatFileName(attachment, index),
    ];

    if (!readOnly) {
      headers.push("ticketAttachment.action");
      itemFormatters.push((attachment, index) => {
        if (attachment.id && updatedAttachments.has(index)) {
          return (
            <IconButton onClick={(e) => this.update(index)}>
              <SaveIcon />
            </IconButton>
          );
        } else if (index < ticketAttachments.length - 1) {
          return (
            <IconButton onClick={(e) => this.delete(attachment, index)}>
              <DeleteIcon />
            </IconButton>
          );
        }
        return null;
      });
    }

    return (
      <Dialog
        open={open}
        fullWidth={true}
        PaperProps={{
          style: {
            width: "800px",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle className={classes.dialogTitle}>
          <FormattedMessage module="ticket" id="attachments.title" values={{ code: ticket.code }} />
        </DialogTitle>
        <Divider />
        <DialogContent className={classes.dialogContent}>
          <ProgressOrError progress={fetchingTicketAttachments} error={errorTicketAttachments} />
          {!fetchingTicketAttachments && !errorTicketAttachments && (
            <Table module="ticket" items={ticketAttachments} headers={headers} itemFormatters={itemFormatters} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.onClose} variant="contained" color="primary">
            <FormattedMessage module="ticket" id="close" />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  confirmed: state.core.confirmed,
  // ticket: state.ticket,
  submittingMutation: state.grievanceSocialProtection.submittingMutation,
  mutation: state.grievanceSocialProtection.mutation,
  fetchingTicketAttachments: state.grievanceSocialProtection.fetchingTicketAttachments,
  fetchedTicketAttachments: state.grievanceSocialProtection.fetchedTicketAttachments,
  errorTicketAttachments: state.grievanceSocialProtection.errorTicketAttachments,
  ticketAttachments: state.grievanceSocialProtection.ticketAttachments,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchTicketAttachments: fetchTicketAttachments,
      downloadAttachment,
      deleteAttachment,
      createAttachment,
      updateAttachment,
      coreConfirm,
      journalize,
      coreAlert,
    },
    dispatch,
  );
};

export default withModulesManager(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(TicketAttachmentsDialog)))),
);