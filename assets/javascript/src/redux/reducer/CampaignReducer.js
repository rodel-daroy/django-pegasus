import {
  CAMPAIGN_COMPOSE,
  CAMPAIGN_OPTIONS,
  CAMPAIGN_RECIPIENT,
  CAMPAIGN_START,
} from "../actionType/actionType";

const initialState = {
  title: "",
  from_address: "",
  csvfile: "",
  first_row: "",
  csv_fields: "",
  tag: "",
  tagName: "",
  email_subject: "",
  email_body: "",
  follow_up: "",
  drips: "",
  track_opens: "",
  track_linkclick: "",
  terms_and_laws: "",
  tag: null,
};

export const campaignReducer = (state = initialState, action) => {
  switch (action.type) {
    case CAMPAIGN_START:
      return {
        ...state,
        ...action.payload,
      };
    case CAMPAIGN_RECIPIENT:
      return {
        ...state,
        csvfile: action.payload.csvfile,
        first_row: action.payload.first_row,
        csv_fields: action.payload.csv_fields,
        tag: action.payload.tag,
        tagName: action.payload.tagName,
        recipients: action.payload.recipients,
      };
    case CAMPAIGN_COMPOSE:
      return {
        ...state,
        email_subject: action.payload.email_subject,
        email_body: action.payload.email_body,
        follow_up: action.payload.follow_up,
        drips: action.payload.drips,
        emails: action.payload.emails,
      };
    case CAMPAIGN_OPTIONS:
      return {
        ...state,
        track_opens: action.payload.track_opens,
        track_linkclick: action.payload.track_linkclick,
        terms_and_laws: action.payload.terms_and_laws,
      };
    default:
      return state;
  }
};
