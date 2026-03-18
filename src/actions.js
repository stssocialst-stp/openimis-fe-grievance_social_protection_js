/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import {
  graphql, formatMutation, formatPageQueryWithCount, formatGQLString, formatPageQuery,
  baseApiUrl, decodeId, openBlob, formatQuery,
} from '@stssocialst-stp/fe-core';
import { ACTION_TYPE } from './reducer';
import { FETCH_INDIVIDUAL_REF } from './constants';
import { isBase64Encoded } from './utils/utils';
import {
  CLEAR, ERROR, REQUEST, SUCCESS,
} from './utils/action-type';

const GRIEVANCE_CONFIGURATION_PROJECTION = () => [
  'grievanceTypes{id, uuid, codigo, nome}',
  'grievanceFlags{id, uuid, codigo, nome}',
  'grievanceChannels{id, uuid, codigo, nome}',
  'grievanceDefaultResolutionsByCategory{category, resolutionTime}',
];

const CATEGORY_FULL_PROJECTION = () => [
  'id',
  'uuid',
  'categoryTitle',
  'slug',
  'validityFrom',
  'validityTo',
];

export function fetchCategoryForPicker(mm, filters) {
  const payload = formatPageQueryWithCount('category', filters, CATEGORY_FULL_PROJECTION(mm));
  return graphql(payload, 'CATEGORY_CATEGORY');
}

export function fetchTicketSummaries(mm, filters) {
  const projections = [
    'id', 'title', 'code', 'description', 'status',
    'priority {id uuid codigo nome ordem}', 'dueDate', 'reporter', 'reporterId',
    'reporterType', 'reporterTypeName', 'category {id uuid codigo nome}', 'flags {id uuid codigo nome}',
    'channel {id uuid codigo nome}', 'resolution', 'title', 'dateOfIncident', 'dateCreated', 'version', 'isHistory',
    'reporterFirstName', 'reporterLastName', 'reporterDob',
  ];
  const payload = formatPageQueryWithCount(
    'tickets',
    filters,
    projections,
  );
  return graphql(payload, 'TICKET_TICKETS');
}

export function fetchTicket(mm, filters) {
  const projections = [
    'id', 'title', 'code', 'description', 'status',
    'priority {id uuid codigo nome ordem}', 'dueDate', 'reporter', 'reporterId',
    'reporterType', 'reporterTypeName', 'reporterInfo', 'category {id uuid codigo nome}', 'flags {id uuid codigo nome}', 'channel {id uuid codigo nome}',
    'resolution', 'title', 'dateOfIncident', 'dateCreated',
    'attendingStaff {id username}', 'version', 'isHistory,', 'jsonExt',
    'reporterFirstName', 'reporterLastName', 'reporterDob',
  ];
  const payload = formatPageQueryWithCount(
    'tickets',
    filters,
    projections,
  );
  return graphql(payload, 'TICKET_TICKET');
}

export function fetchComments(ticket) {
  if (ticket && ticket.id) {
    const filters = [
      `ticket_Id: "${ticket.id}"`,
      'orderBy: ["-dateCreated"]',
    ];
    const projections = [
      'id',
      'commenter',
      'commenterId',
      'commenterType',
      'commenterTypeName',
      'comment',
      'isResolution',
      'dateCreated',
      'commenterFirstName',
      'commenterLastName',
      'commenterDob',
    ];
    const payload = formatPageQueryWithCount(
      'comments',
      filters,
      projections,
    );
    return graphql(payload, 'COMMENT_COMMENTS');
  }
  return { type: 'COMMENT_COMMENTS', payload: { data: [] } };
}

export function formatTicketGQL(ticket) {
  const reporter_info = JSON.stringify(JSON.stringify(ticket.reporterInfo));
  const reporterId = ticket.reporter ? (
    isBase64Encoded(ticket.reporter.id) ? decodeId(ticket.reporter.id) : ticket.reporter.id
  ) : '';

  return `
    ${ticket.id !== undefined && ticket.id !== null ? `id: "${ticket.id}"` : ''}
    ${ticket.code ? `code: "${formatGQLString(ticket.code)}"` : ''}
    ${ticket.category ? `categoryId: "${ticket.category?.id ?? ticket.category?.uuid ?? ticket.category}"` : ''}
    ${ticket.title ? `title: "${ticket.title}"` : ''}
    ${ticket.description ? `description: "${ticket.description}"` : ''}
    ${ticket.reporterType ? `reporterType: "${ticket.reporterType}"` : ''}
    ${ticket.reporter ? `reporterId: "${reporterId}"` : ''}
    ${ticket.reporterInfo ? `reporterInfo: ${reporter_info}` : ''}
    ${ticket.status ? `status: "${ticket.status}"` : ''}
    ${ticket.priority ? `priorityId: "${ticket.priority?.id ?? ticket.priority?.uuid ?? ticket.priority}"` : ''}
    ${ticket.dueDate ? `dueDate: "${ticket.dueDate}"` : ''}
    ${ticket.dateOfIncident ? `dateOfIncident: "${ticket.dateOfIncident}"` : ''}
    ${ticket.channel ? `channelId: "${ticket.channel?.id ?? ticket.channel?.uuid ?? ticket.channel}"` : ''}
    ${ticket.flags ? `flagsId: "${ticket.flags?.id ?? ticket.flags?.uuid ?? ticket.flags}"` : ''}
  `;
}

export function formatUpdateTicketGQL(ticket) {
  const reporter_info = JSON.stringify(JSON.stringify(ticket.reporterInfo));

  // eslint-disable-next-line no-param-reassign
  if (ticket.reporter) ticket.reporter = JSON.parse(JSON.parse(ticket.reporter || '{}'), '{}');
  return `
    ${ticket.id !== undefined && ticket.id !== null ? `id: "${ticket.id}"` : ''}
    ${!!ticket.category ? `categoryId: "${ticket.category?.id ?? ticket.category?.uuid ?? ticket.category}"` : ''}
    ${!!ticket.title ? `title: "${ticket.title}"` : ''}
    ${!!ticket.description ? `description: "${ticket.description}"` : ''}
    ${!!ticket.attendingStaff ? `attendingStaffId: "${decodeId(ticket.attendingStaff.id)}"` : ''}
    ${ticket.reporter
      ? (isBase64Encoded(ticket.reporter.id)
        ? `reporterId: "${decodeId(ticket.reporter.id)}"`
        : `reporterId: "${ticket.reporter.id}"`)
      : ''}
    ${!!ticket.reporter ? `reporterType: "${ticket.reporterTypeName}"` : ''}
    ${ticket.nameOfComplainant ? `nameOfComplainant: "${formatGQLString(ticket.nameOfComplainant)}"` : ''}
    ${ticket.reporterInfo ? `reporterInfo: ${reporter_info}` : ''}
    ${ticket.resolution ? `resolution: "${formatGQLString(ticket.resolution)}"` : ''}
    ${ticket.status ? `status: ${formatGQLString(ticket.status)}` : ''}
    ${ticket.priority ? `priorityId: "${ticket.priority?.id ?? ticket.priority?.uuid ?? formatGQLString(ticket.priority)}"` : ''}
    ${ticket.dueDate ? `dueDate: "${formatGQLString(ticket.dueDate)}"` : ''}
    ${ticket.dateSubmitted ? `dateSubmitted: "${formatGQLString(ticket.dateSubmitted)}"` : ''}
    ${ticket.dateOfIncident ? `dateOfIncident: "${formatGQLString(ticket.dateOfIncident)}"` : ''}
    ${!!ticket.channel ? `channelId: "${ticket.channel?.id ?? ticket.channel?.uuid ?? ticket.channel}"` : ''}
    ${!!ticket.flags ? `flagsId: "${ticket.flags?.id ?? ticket.flags?.uuid ?? ticket.flags}"` : ''}
  `;
}

export function resolveTicketGQL(ticket) {
  return `
    ${ticket.uuid !== undefined && ticket.uuid !== null ? `uuid: "${ticket.uuid}"` : ''}
    ${ticket.ticketStatus ? 'ticketStatus: "Close"' : ''}
    ${!!ticket.insuree && !!ticket.insuree.id ? `insureeUuid: "${ticket.insuree.uuid}"` : ''}
    ${!!ticket.category && !!ticket.category.id ? `categoryUuid: "${ticket.category.uuid}"` : ''}
  `;
}

export function createTicket(ticket, grievanceConfig, clientMutationLabel) {
  const resolutionTimeMap = {};
  grievanceConfig.grievanceDefaultResolutionsByCategory.forEach((item) => {
    resolutionTimeMap[item.category] = item.resolutionTime;
  });
  // eslint-disable-next-line no-param-reassign
  const categoryKey = ticket.category?.codigo ?? ticket.category;
  ticket.resolution = resolutionTimeMap[categoryKey];
  const mutation = formatMutation('createTicket', formatTicketGQL(ticket), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ['TICKET_MUTATION_REQ', 'TICKET_CREATE_TICKET_RESP', 'TICKET_MUTATION_ERR'], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,

  });
}

export function updateTicket(ticket, clientMutationLabel) {
  const mutation = formatMutation('updateTicket', formatUpdateTicketGQL(ticket), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ['TICKET_MUTATION_REQ', 'TICKET_UPDATE_TICKET_RESP', 'TICKET_MUTATION_ERR'], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
    id: ticket.id,
  });
}

export function resolveTicket(ticket, clientMutationLabel) {
  const mutation = formatMutation('updateTicket', resolveTicketGQL(ticket), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ['TICKET_MUTATION_REQ', 'TICKET_UPDATE_TICKET_RESP', 'TICKET_MUTATION_ERR'], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
    ticketUuid: ticket.uuid,
  });
}

export function fetchTicketAttachments(ticket) {
  if (ticket && ticket.uuid) {
    const payload = formatPageQuery(
      'ticketAttachments',
      [`ticket_Uuid: "${ticket.uuid}"`],
      ['id', 'uuid', 'date', 'filename', 'mimeType',
        'ticket{id, uuid, ticketCode}'],
    );
    return graphql(payload, 'TICKET_TICKET_ATTACHMENTS');
  }
  return { type: 'TICKET_TICKET_ATTACHMENTS', payload: { data: [] } };
}

export function formatTicketAttachment(attach) {
  return `
    ${!!attach.id ? `id: "${decodeId(attach.id)}"` : ""}
    ${!!attach.ticketUuid ? `ticketUuid: "${attach.ticketUuid}"` : ""}
    ${!!attach.type ? `type: "${formatGQLString(attach.type)}"` : ""}
    ${!!attach.title ? `title: "${formatGQLString(attach.title)}"` : ""}
    ${!!attach.date ? `date: "${attach.date}"` : ""}
    ${!!attach.mime ? `mime: "${attach.mime}"` : ""}
    ${!!attach.url ? `url: "${attach.url}"` : ""}
    ${!!attach.generalType ? `generalType: "${attach.generalType}"` : ""}
    ${attach.predefinedType ? `predefinedType: "${attach.predefinedType.ticketAttachmentType}"` : ""}
    ${!!attach.filename ? `filename: "${formatGQLString(attach.filename)}"` : ""}
    ${!!attach.document ? `document: "${attach.document}"` : ""}
  `;
}

export function createAttachment(attach, clientMutationLabel) {
  debugger;
  const payload = formatTicketAttachment(attach);
  const mutation = formatMutation("createTicketAttachment", payload, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ["TICKET_MUTATION_REQ", "TICKET_CREATE_TICKET_ATTACHMENT_RESP", "TICKET_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
  });
}

export function updateAttachment(attach, clientMutationLabel) {
  let payload = formatTicketAttachment(attach);
  let mutation = formatMutation("updateTicketAttachment", payload, clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(mutation.payload, ["TICKET_MUTATION_REQ", "TICKET_UPDATE_TICKET_ATTACHMENT_RESP", "TICKET_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
  });
}

export function deleteAttachment(attach, clientMutationLabel) {
  let mutation = formatMutation("deleteTicketAttachment", `id: "${decodeId(attach.id)}"`, clientMutationLabel);
  var requestedDateTime = new Date();
  return graphql(mutation.payload, ["TICKET_MUTATION_REQ", "TICKET_DELETE_TICKET_ATTACHMENT_RESP", "TICKET_MUTATION_ERR"], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
  });
}

export function downloadAttachment(attach) {
  const url = new URL(`${window.location.origin}${baseApiUrl}/ticket/attach`);
  url.search = new URLSearchParams({ id: decodeId(attach.id) });
  return () => fetch(url)
    .then((response) => response.blob())
    .then((blob) => openBlob(blob, attach.filename, attach.mime));
}

export function formatTicketAttachmentGQL(ticketattachment) {
  debugger;
  return `
    ${ticketattachment.uuid !== undefined && ticketattachment.uuid !== null ? `uuid: "${ticketattachment.uuid}"` : ''}
    ${!!ticketattachment.ticket && !!ticketattachment.ticket.id ? `ticketUuid: "${ticketattachment.ticket.uuid}"` : ''}
    ${ticketattachment.filename ? `filename: "${formatGQLString(ticketattachment.filename)}"` : ''}
    ${ticketattachment.mimeType ? `mimeType: "${formatGQLString(ticketattachment.mimeType)}"` : ''}
    ${ticketattachment.url ? `url: "${formatGQLString(ticketattachment.url)}"` : ''}
    ${ticketattachment.date ? `date: "${formatGQLString(ticketattachment.date)}"` : ''}
    ${ticketattachment.document ? `document: "${formatGQLString(ticketattachment.document)}"` : ''}
  `;
}

export function formatTicketCommentGQL(ticketComment, ticket, commenterType) {
  return `
    ${ticketComment.uuid !== undefined && ticketComment.uuid !== null ? `uuid: "${ticketComment.uuid}"` : ''}
    ${ticket.id ? `ticketId: "${ticket.id}"` : ''}
    ${ticketComment.commenter ? `commenterId: "${decodeId(ticketComment.commenter.id)}"` : ''}
    ${commenterType ? `commenterType: "${commenterType}"` : ''}
    ${ticketComment.comment ? `comment: "${formatGQLString(ticketComment.comment)}"` : ''}
  `;
}

export function createTicketAttachment(ticketattachment, clientMutationLabel) {
  const mutation = formatMutation(
    'createTicketAttachment',
    formatTicketAttachmentGQL(ticketattachment),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['TICKET_ATTACHMENT_MUTATION_REQ', 'TICKET_CREATE_TICKET_ATTACHMENT_RESP', 'TICKET_ATTACHMENT_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,

    },
  );
}

export function createTicketComment(ticketComment, ticket, commenterType, clientMutationLabel) {
  const mutation = formatMutation(
    'createComment',
    formatTicketCommentGQL(ticketComment, ticket, commenterType),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['TICKET_ATTACHMENT_MUTATION_REQ', 'TICKET_CREATE_TICKET_ATTACHMENT_RESP', 'TICKET_ATTACHMENT_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,

    },
  );
}

export function resolveGrievanceByComment(id, clientMutationLabel) {
  const mutation = formatMutation(
    'resolveGrievanceByComment',
    `id: "${id}"`,
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.RESOLVE_BY_COMMENT), ERROR(ACTION_TYPE.MUTATION)],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,

    },
  );
}

export function reopenTicket(id, clientMutationLabel) {
  const mutation = formatMutation(
    'reopenTicket',
    `id: "${id}"`,
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.REOPEN_TICKET), ERROR(ACTION_TYPE.MUTATION)],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,

    },
  );
}

export function fetchIndividual(mm, id) {
  const fetchIndividualCallable = mm.getRef(FETCH_INDIVIDUAL_REF);
  return fetchIndividualCallable([`id: ${id}`]);
}

export function fetchIndividualById(id) {
  const payload = `{
    individual(id: "${id}") {
      edges {
        node {
          id
          firstName
          lastName
          dob
          sexo
          contactoTelefonico
          vulgo
          numDocId
          distrito
          subdistrito
          localidade
        }
      }
    }
  }`;
  return graphql(payload, 'TICKET_INDIVIDUAL_AUTOFILL');
}

export function fetchInsureeTicket(mm, chfId) {
  const filters = [
    `chfId: "${chfId}"`,
  ];
  const projections = [
    'id', 'uuid', 'ticketTitle', 'ticketCode', 'ticketDescription',
    'name', 'phone', 'email', 'dateOfIncident', 'nameOfComplainant', 'witness',
    'resolution', 'ticketStatus', 'ticketPriority', 'dateSubmitted', 'dateSubmitted',
    'category{id, uuid, categoryTitle, slug}',
    'insuree{id, uuid, otherNames, lastName, dob, chfId, phone, email}',
    'attachment{edges{node{id, uuid, filename, mimeType, url, document, date}}}',
  ];
  const payload = formatPageQueryWithCount(
    `ticketsByInsuree(chfId: "${chfId}", orderBy: "ticketCode", ticketCode: false, first: 5)`,
    filters,
    projections,
  );
  return graphql(payload, 'TICKET_TICKET');
}

export function fetchGrievanceConfiguration(params) {
  const payload = `
    {
      grievanceConfig {
        grievanceTypes { uuid, codigo, nome }
        grievanceFlags { uuid, codigo, nome }
        grievanceChannels { uuid, codigo, nome }
        grievanceDefaultResolutionsByCategory { category, resolutionTime }
      }
    }
  `;
  return graphql(payload, ACTION_TYPE.GET_GRIEVANCE_CONFIGURATION);
}

export function fetchTicketAttachmentTypes() {
  const payload = `{
    ticketAttachmentType(first: 200) {
      edges { node { id isAutogenerated ticketGeneralType ticketAttachmentType } }
    }
  }`;
  return graphql(payload, 'TICKET_PICKER_ATTACHMENT_TYPES');
}

export function fetchTicketCategories() {
  const payload = '{ ticketCategories(ativo: true) { edges { node { id uuid codigo nome } } } }';
  return graphql(payload, 'TICKET_PICKER_CATEGORIES');
}

export function fetchTicketChannels() {
  const payload = '{ ticketChannels(ativo: true) { edges { node { id uuid codigo nome } } } }';
  return graphql(payload, 'TICKET_PICKER_CHANNELS');
}

export function fetchTicketFlags() {
  const payload = '{ ticketFlags(ativo: true) { edges { node { id uuid codigo nome } } } }';
  return graphql(payload, 'TICKET_PICKER_FLAGS');
}

export function fetchTicketPriorities() {
  const payload = '{ ticketPriorities(ativo: true, orderBy: ["ordem"]) { edges { node { id uuid codigo nome ordem } } } }';
  return graphql(payload, 'TICKET_PICKER_PRIORITIES');
}

export const clearTicket = () => (dispatch) => {
  dispatch({
    type: CLEAR(ACTION_TYPE.CLEAR_TICKET),
  });
};
