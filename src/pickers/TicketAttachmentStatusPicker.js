import React, { Component } from "react";
import { ConstantBasedPicker } from "@stssocialst-stp/fe-core";

import { TICKET_ATTACHMENT_STATUS } from "../constants";

class TicketAttachmentStatusPicker extends Component {
  render() {
    return <ConstantBasedPicker module="grievanceSocialProtection" label="ticketAttachmentStatus" constants={TICKET_ATTACHMENT_STATUS} {...this.props} />;
  }
}

export default TicketAttachmentStatusPicker;