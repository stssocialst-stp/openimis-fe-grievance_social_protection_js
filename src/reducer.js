// Disabled due to consistency with other modules
/* eslint-disable default-param-last */

import {
  parseData, pageInfo, formatServerError, formatGraphQLError,
  dispatchMutationReq, dispatchMutationResp, dispatchMutationErr,
  decodeId,
} from '@stssocialst-stp/fe-core';
import {
  CLEAR, ERROR, REQUEST, SUCCESS,
} from './utils/action-type';

export const ACTION_TYPE = {
  GET_GRIEVANCE_CONFIGURATION: 'GET_GRIEVANCE_CONFIGURATION',
  MUTATION: 'GRIEVANCE_SOCIAL_PROTECTION_MUTATION',
  RESOLVE_BY_COMMENT: 'RESOLVE_BY_COMMENT',
  REOPEN_TICKET: 'REOPEN_TICKET',
  CLEAR_TICKET: 'CLEAR_TICKET',
};

function reducer(
  state = {
    fetchingTickets: false,
    errorTickets: null,
    fetchedTickets: false,
    tickets: [],
    ticketsPageInfo: { totalCount: 0 },

    fetchingTicket: false,
    errorTicket: null,
    fetchedTicket: false,
    ticket: null,
    ticketPageInfo: { totalCount: 0 },

    fetchingCategory: false,
    fetchedCategory: false,
    errorCategory: null,
    category: [],
    categoryPageInfo: { totalCount: 0 },

    fetchingTicketAttachments: false,
    fetchedTicketAttachments: false,
    errorTicketAttachments: null,
    ticketAttachments: null,

    fetchingGrievanceConfig: false,
    fetchedGrievanceConfig: false,
    errorGrievanceConfig: null,
    grievanceConfig: null,

    fetchingTicketCategories: false,
    fetchedTicketCategories: false,
    errorTicketCategories: null,
    ticketCategories: [],

    fetchingTicketChannels: false,
    fetchedTicketChannels: false,
    errorTicketChannels: null,
    ticketChannels: [],

    fetchingTicketFlags: false,
    fetchedTicketFlags: false,
    errorTicketFlags: null,
    ticketFlags: [],

    fetchingTicketPriorities: false,
    fetchedTicketPriorities: false,
    errorTicketPriorities: null,
    ticketPriorities: [],

    fetchingTicketAttachmentTypes: false,
    fetchedTicketAttachmentTypes: false,
    errorTicketAttachmentTypes: null,
    ticketAttachmentTypes: [],

    fetchingAutofillIndividual: false,
    fetchedAutofillIndividual: false,
    errorAutofillIndividual: null,
    autofillIndividual: null,

    submittingMutation: false,
    mutation: {},

    fetchingTicketComments: false,
    fetchedTicketComments: false,
    errorTicketComments: null,
    ticketComments: null,
  },
  action,
) {
  switch (action.type) {
    case 'TICKET_TICKETS_REQ':
      return {
        ...state,
        fetchingTickets: true,
        fetchedTickets: false,
        tickets: [],
        ticketsPageInfo: { totalCount: 0 },
        errorTickets: null,
      };
    case 'TICKET_TICKETS_RESP':
      return {
        ...state,
        fetchingTickets: false,
        fetchedTickets: true,
        tickets: parseData(action.payload.data.tickets),
        ticketsPageInfo: pageInfo(action.payload.data.tickets),
        errorTickets: formatGraphQLError(action.payload),
      };
    case 'TICKET_TICKETS_ERR':
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };
    case 'TICKET_TICKET_REQ':
      return {
        ...state,
        fetchingTicket: true,
        fetchedTicket: false,
        ticket: null,
        errorTicket: null,
      };
    case 'TICKET_TICKET_RESP':
      return {
        ...state,
        fetchingTicket: false,
        fetchedTicket: true,
        ticket: parseData(action.payload.data.tickets).map((ticket) => ({
          ...ticket,
          id: decodeId(ticket.id),
          reporterInfo: ticket.reporterInfo ? JSON.parse(ticket.reporterInfo) : {}, // Parse reporterInfo JSON
        }))?.[0],
        errorTicket: formatGraphQLError(action.payload),
      };
    case CLEAR(ACTION_TYPE.CLEAR_TICKET):
      return {
        ...state,
        fetchingTicket: false,
        fetchedTicket: false,
        ticket: null,
        errorTicket: null,
        fetchingTicketComments: false,
        fetchedTicketComments: false,
        ticketComments: [],
        ticketCommentsPageInfo: { totalCount: 0 },
        errorTicketComments: null,
      };
    case 'COMMENT_COMMENTS_REQ':
      return {
        ...state,
        fetchingTicketComments: false,
        fetchedTicketComments: false,
        ticketComments: state.ticketComments || [],
        ticketCommentsPageInfo: { totalCount: 0 },
        errorTicketComments: null,
      };
    case 'COMMENT_COMMENTS_RESP':
      return {
        ...state,
        fetchingTicketComments: false,
        fetchedTicketComments: true,
        ticketComments: parseData(action.payload.data.comments).map(
          (comment) => ({ ...comment, id: decodeId(comment.id) }),
        ),
        ticketCommentsPageInfo: pageInfo(action.payload.data.comments),
        errorTicketComments: formatGraphQLError(action.payload),
      };
    case 'COMMENT_COMMENTS_ERR':
      return {
        ...state,
        fetchingTicketComments: false,
        ticketComments: [],
        error: formatServerError(action.payload),
      };
    case 'CATEGORY_CATEGORY_REQ':
      return {
        ...state,
        fetchingCategory: true,
        fetchedCategory: false,
        category: [],
        errorCategory: null,
      };
    case 'CATEGORY_CATEGORY_RESP':
      return {
        ...state,
        fetchingCategory: false,
        fetchedCategory: true,
        category: parseData(action.payload.data.category),
        categoryPageInfo: pageInfo(action.payload.data.category),
        errorCategory: formatGraphQLError(action.payload),
      };
    case 'CATEGORY_CATEGORY_ERR':
      return {
        ...state,
        fetching: false,
        error: formatServerError(action.payload),
      };
    case 'TICKET_TICKET_ATTACHMENTS_REQ':
      return {
        ...state,
        fetchingTicketAttachments: true,
        fetchedTicketAttachments: false,
        ticketAttachments: null,
        errorTicketAttachments: null,
      };
    case 'TICKET_TICKET_ATTACHMENTS_RESP':
      return {
        ...state,
        fetchingTicketAttachments: false,
        fetchedTicketAttachments: true,
        ticketAttachments: parseData(action.payload.data.ticketAttachments),
        errorTicketAttachments: formatGraphQLError(action.payload),
      };
    case 'TICKET_TICKET_ATTACHMENTS_ERR':
      return {
        ...state,
        fetchingTicketAttachments: false,
        errorTicketAttachments: formatServerError(action.payload),
      };
    case 'TICKET_INSUREE_TICKETS_REQ':
      return {
        ...state,
        fetchingTickets: true,
        fetchedTickets: false,
        tickets: null,
        policy: null,
        errorTickets: null,
      };
    case 'TICKET_INSUREE_TICKETS_RESP':
      return {
        ...state,
        fetchingTickets: false,
        fetchedTickets: true,
        tickets: parseData(action.payload.data.ticketsByInsuree),
        ticketsPageInfo: pageInfo(action.payload.data.ticketsByInsuree),
        errorTickets: formatGraphQLError(action.payload),
      };
    case 'TICKET_INSUREE_TICKETS_ERR':
      return {
        ...state,
        fetchingTickets: false,
        errorTickets: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.GET_GRIEVANCE_CONFIGURATION):
      return {
        ...state,
        fetchingGrievanceConfig: true,
        fetchedGrievanceConfig: false,
        errorGrievanceConfig: null,
        grievanceConfig: null,
      };
    case SUCCESS(ACTION_TYPE.GET_GRIEVANCE_CONFIGURATION):
      return {
        ...state,
        fetchingGrievanceConfig: false,
        fetchedGrievanceConfig: true,
        errorGrievanceConfig: null,
        grievanceConfig: action.payload.data.grievanceConfig,
      };
    case ERROR(ACTION_TYPE.GET_GRIEVANCE_CONFIGURATION):
      return {
        ...state,
        fetchingGrievanceConfig: false,
        fetchedGrievanceConfig: false,
        errorGrievanceConfig: formatGraphQLError(action.payload),
        grievanceConfig: null,
      };
    case REQUEST(ACTION_TYPE.MUTATION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.MUTATION):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.RESOLVE_BY_COMMENT):
      return dispatchMutationResp(state, 'resolveGrievanceByComment', action);
    case SUCCESS(ACTION_TYPE.REOPEN_TICKET):
      return dispatchMutationResp(state, 'reopenTicket', action);
    case 'TICKET_MUTATION_REQ':
      return dispatchMutationReq(state, action);
    case 'TICKET_MUTATION_ERR':
      return dispatchMutationErr(state, action);
    case 'TICKET_CREATE_TICKET_RESP':
      return dispatchMutationResp(state, 'createTicket', action);
    case 'TICKET_UPDATE_TICKET_RESP':
      return dispatchMutationResp(state, 'updateTicket', action);
    case 'TICKET_DELETE_TICKET_RESP':
      return dispatchMutationResp(state, 'deleteTicket', action);
    case 'TICKET_PICKER_CATEGORIES_REQ':
      return { ...state, fetchingTicketCategories: true, fetchedTicketCategories: false, errorTicketCategories: null };
    case 'TICKET_PICKER_CATEGORIES_RESP':
      return {
        ...state,
        fetchingTicketCategories: false,
        fetchedTicketCategories: true,
        ticketCategories: (action.payload.data.ticketCategories?.edges ?? []).map((e) => e.node),
        errorTicketCategories: null,
      };
    case 'TICKET_PICKER_CATEGORIES_ERR':
      return { ...state, fetchingTicketCategories: false, errorTicketCategories: formatServerError(action.payload) };

    case 'TICKET_PICKER_CHANNELS_REQ':
      return { ...state, fetchingTicketChannels: true, fetchedTicketChannels: false, errorTicketChannels: null };
    case 'TICKET_PICKER_CHANNELS_RESP':
      return {
        ...state,
        fetchingTicketChannels: false,
        fetchedTicketChannels: true,
        ticketChannels: (action.payload.data.ticketChannels?.edges ?? []).map((e) => e.node),
        errorTicketChannels: null,
      };
    case 'TICKET_PICKER_CHANNELS_ERR':
      return { ...state, fetchingTicketChannels: false, errorTicketChannels: formatServerError(action.payload) };

    case 'TICKET_PICKER_FLAGS_REQ':
      return { ...state, fetchingTicketFlags: true, fetchedTicketFlags: false, errorTicketFlags: null };
    case 'TICKET_PICKER_FLAGS_RESP':
      return {
        ...state,
        fetchingTicketFlags: false,
        fetchedTicketFlags: true,
        ticketFlags: (action.payload.data.ticketFlags?.edges ?? []).map((e) => e.node),
        errorTicketFlags: null,
      };
    case 'TICKET_PICKER_FLAGS_ERR':
      return { ...state, fetchingTicketFlags: false, errorTicketFlags: formatServerError(action.payload) };

    case 'TICKET_PICKER_PRIORITIES_REQ':
      return { ...state, fetchingTicketPriorities: true, fetchedTicketPriorities: false, errorTicketPriorities: null };
    case 'TICKET_PICKER_PRIORITIES_RESP':
      return {
        ...state,
        fetchingTicketPriorities: false,
        fetchedTicketPriorities: true,
        ticketPriorities: (action.payload.data.ticketPriorities?.edges ?? []).map((e) => e.node),
        errorTicketPriorities: null,
      };
    case 'TICKET_PICKER_PRIORITIES_ERR':
      return { ...state, fetchingTicketPriorities: false, errorTicketPriorities: formatServerError(action.payload) };

    case 'TICKET_PICKER_ATTACHMENT_TYPES_REQ':
      return { ...state, fetchingTicketAttachmentTypes: true, fetchedTicketAttachmentTypes: false, errorTicketAttachmentTypes: null };
    case 'TICKET_PICKER_ATTACHMENT_TYPES_RESP':
      return {
        ...state,
        fetchingTicketAttachmentTypes: false,
        fetchedTicketAttachmentTypes: true,
        ticketAttachmentTypes: (action.payload.data.ticketAttachmentType?.edges ?? []).map((e) => e.node),
        errorTicketAttachmentTypes: null,
      };
    case 'TICKET_PICKER_ATTACHMENT_TYPES_ERR':
      return { ...state, fetchingTicketAttachmentTypes: false, errorTicketAttachmentTypes: formatServerError(action.payload) };

    case 'TICKET_INDIVIDUAL_AUTOFILL_REQ':
      return { ...state, fetchingAutofillIndividual: true, fetchedAutofillIndividual: false, autofillIndividual: null, errorAutofillIndividual: null };
    case 'TICKET_INDIVIDUAL_AUTOFILL_RESP': {
      const edges = action.payload.data.individual?.edges ?? [];
      const node = edges.length > 0 ? edges[0].node : null;
      return { ...state, fetchingAutofillIndividual: false, fetchedAutofillIndividual: true, autofillIndividual: node, errorAutofillIndividual: null };
    }
    case 'TICKET_INDIVIDUAL_AUTOFILL_ERR':
      return { ...state, fetchingAutofillIndividual: false, errorAutofillIndividual: formatServerError(action.payload) };

    case 'TICKET_ATTACHMENT_MUTATION_REQ':
      return dispatchMutationReq(state, action);
    case 'TICKET_ATTACHMENT_MUTATION_ERR':
      return dispatchMutationErr(state, action);
    case 'TICKET_CREATE_TICKET_ATTACHMENT_RESP':
      return dispatchMutationResp(state, 'createTicketAttachment', action);
    case "TICKET_CREATE_TICKET_ATTACHMENT_RESP":
      return dispatchMutationResp(state, "createTicketAttachment", action);
    case "TICKET_UPDATE_TICKET_ATTACHMENT_RESP":
      return dispatchMutationResp(state, "updateTicketAttachment", action);
    case "TICKET_DELETE_TICKET_ATTACHMENT_RESP":
      return dispatchMutationResp(state, "deleteTicketAttachment", action);
    default:
      return state;
  }
}

export default reducer;
