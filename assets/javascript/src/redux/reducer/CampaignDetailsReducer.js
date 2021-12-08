import {
  DELETE_RECIPIENT,
  GET_DETAILS_RECIPIENTS,
  GET_DETAILS_SEQUENCE,
  GET_DETAILS_SEQUENCE_TO_COPY,
  GET_DETAILS_SETTINGS,
  GET_OVERVIEW_SUMMARY,
  IMPORT_CONTACTS_FROM_CSV,
  UPDATE_RECIPIENT_STATUS,
} from "../actionType/actionType";

const initialState = {
  overviewSummary: {},
  detailsSequence: {},
  detailRecipients: [],
  id: "",
  title: "",
};

export const campaignDetailsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_OVERVIEW_SUMMARY:
      return {
        ...state,
        overviewSummary: action.payload,
        detailsSequence: {},
        detailRecipients: [],
        id: action.payload.id,
        title: action.payload.title,
      };
    case GET_DETAILS_SEQUENCE:
      return {
        ...state,
        detailsSequence: action.payload,
      };
    case GET_DETAILS_SEQUENCE_TO_COPY:
      return {
        ...state,
        detailsSequenceToCopy: action.payload,
      };
    case GET_DETAILS_RECIPIENTS:
      return {
        ...state,
        detailRecipients: action.payload,
      };
    case GET_DETAILS_SETTINGS:
      return {
        ...state,
        detailsSettings: action.payload,
      };
    case IMPORT_CONTACTS_FROM_CSV:
      return {
        ...state,
        detailRecipients: [...state.detailRecipients, ...action.payload],
      };
    case UPDATE_RECIPIENT_STATUS:
      const updatedRecipient = action.payload;
      const recipients = state.detailRecipients;
      const index = recipients.findIndex((e) => e.id === updatedRecipient.id);
      recipients[index] = {
        ...updatedRecipient,
      };
      return {
        ...state,
        detailRecipients: [...recipients],
      };
    case DELETE_RECIPIENT:
      const deletedRecipient = action.payload;
      const remainedRecipients = state.detailRecipients.filter(
        (e) => e.id !== deletedRecipient.id
      );
      return {
        ...state,
        detailRecipients: [...remainedRecipients],
      };
    default:
      return state;
  }
};
