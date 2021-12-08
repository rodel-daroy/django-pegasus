import {
  SUCCESS_START_CAMPAIGN,
  SUCCESS_RECIPIENT,
  SUCCESS_MAIL_SENDER,
  SUCCESS_MAIL_GET_DATA,
  SUCCESS_FETCH_UNSUBSCRIPTION,
  SUCCESS_OPTION,
  // SUCCESS_SEND_CAMPAIGN,
  REQUEST_FOR_OPTION,
  FAILURE_OPTION,
  REQUEST_FOR_CAMPAIGN_CREATE_PREVIEW,
  SUCCESS_FETCH_CAMPAIGN_CREATE_PREVIEW,
  FAILURE_FETCH_CAMPAIGN_CREATE_PREVIEW,
  SUCCESS_CAMPAIGN_OVERVIEW,
  SUCCESS_MAIL_ACCOUNT_DELETE,
  SUCCESS_MAIL_ACCOUNT_UPDATE,
  FAILURE_MAIL_ACCOUNT_UPDATE,
  SUCCESS_CREATE_CAMPAIGN,
  SUCCESS_FETCH_CAMPAIGN_UPDATE_PREVIEW,
  FAILURE_FETCH_CAMPAIGN_UPDATE_PREVIEW,
  SUCCESS_SAVE_CAMPAIGN,
  SUCCESS_CAMPAIGN_TABLE_DATA,
  REQUEST_FOR_UNSUBSCRIBE_WITH_CSV,
  SUCCESS_UNSUBSCRIBE_WITH_CSV,
  FAILURE_UNSUBSCRIBE_WITH_CSV,
  REQUEST_FOR_GET_SCHEDULE,
  SUCCESS_GET_SCHEDULE,
  FAILURE_GET_SCHEDULE,
  // UPDATE_REQUEST_FOR_GET_SCHEDULE,
  UPDATE_SUCCESS_GET_SCHEDULE,
  SUCCESS_LEAD_CATCHER,
  SUCCESS_LEAD_CATCHER_GET,
  SUCCESS_FOR_CAMPAIGN_PEOPLE,
  SUCCESS_LEAD_DELETE,
  SUCCESS_LEAD_UPDATE,
  SUCCESS_LEAD_VIEW,
} from "../actionType/actionType";

const initialState = {
  startCampaignData: [],
  recipientData: "",
  mailGetData: null,
  mailData: "",
  sendData: "",
  saveData: "",
  viewData: "",
  unsubscribeData: [],
  optionData: "",
  prospectData: [],
  prospectOnclickData: [],
  mailAccountId: "",
  CampaignOverviewData: [],
  CampaignPreviewData: [],
  campaignPreviewUpdateData: [],
  CampaignTableData: [],
  loading: false,
  ScheduleGetData: [],
  UpdateScheduleData: [],
  leadData: "",
  leadGetData: "",
  campaignPeopleData: "",
  leadViewData: "",
  updateLeadData: "",
};
export const StartCampaignReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUCCESS_START_CAMPAIGN:
      return {
        ...state,
        startCampaignData: action.data,
      };
    default:
      return state;
      break;
  }
};
export const RecipientReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUCCESS_RECIPIENT:
      return {
        ...state,
        recipientData: action.recipientData,
      };
    default:
      return state;
      break;
  }
};
export const CampaignCreateReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUCCESS_CREATE_CAMPAIGN:
      return {
        ...state,
        sendData: action.sendData,
      };
    default:
      return state;
      break;
  }
};
export const CamapignSaveReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUCCESS_SAVE_CAMPAIGN:
      return {
        ...state,
        saveData: action.saveData,
      };
    default:
      return state;
      break;
  }
};
export const MailSenderReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUCCESS_MAIL_SENDER:
      return {
        ...state,
        mailData: action.mailData,
      };
    case SUCCESS_MAIL_ACCOUNT_UPDATE:
      return {
        ...state,
      };
    case FAILURE_MAIL_ACCOUNT_UPDATE:
      return {
        ...state,
      };
    default:
      return state;
      break;
  }
};
export const MailGetDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUCCESS_MAIL_GET_DATA:
      return {
        ...state,
        mailGetData: action.payload,
      };
    case SUCCESS_MAIL_ACCOUNT_DELETE:
      return {
        ...state,
      };
    default:
      return state;
      break;
  }
};

// CAMPAIGN OPTION REDUCER
export const CampaignOptionReducer = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_FOR_OPTION:
      return {};
    case SUCCESS_OPTION:
      return {
        ...state,
        optionData: action.data,
      };
    default:
      return state;
      break;
  }
};

// CAMPAIGN_PREVIEW_DATA
export const CampaignPreviewGetReducer = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_FOR_CAMPAIGN_CREATE_PREVIEW:
      return {};
    case SUCCESS_FETCH_CAMPAIGN_CREATE_PREVIEW:
      return {
        ...state,
        CampaignPreviewData: action.CampaignPreviewData,
      };
    case FAILURE_FETCH_CAMPAIGN_CREATE_PREVIEW:
      return {};
    default:
      return state;
      break;
  }
};
// CAMPAIGN_PREVIEW_UPDATE_DATA
export const CampaignPreviewUpdateReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUCCESS_FETCH_CAMPAIGN_UPDATE_PREVIEW:
      return {
        ...state,
        campaignPreviewUpdateData: action.campaignPreviewUpdateData,
      };
    case FAILURE_FETCH_CAMPAIGN_UPDATE_PREVIEW:
      return {};
    default:
      return state;
      break;
  }
};
// CAMPAIGN_OVERVIEW_DATA
export const CampaignOverviewReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUCCESS_CAMPAIGN_OVERVIEW:
      return {
        ...state,
        CampaignOverviewData: action.CampaignOverviewData,
      };
    default:
      return state;
      break;
  }
};
//  CAMPAIGN PEOPLE
export const CampaignPeopleReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUCCESS_FOR_CAMPAIGN_PEOPLE:
      return {
        ...state,
        campaignPeopleData: action.campaignPeopleData,
      };
    default:
      return state;
      break;
  }
};

// SCHEDULE_GET_DATAampaignOverview
export const ScheduleGetDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUCCESS_GET_SCHEDULE:
    case UPDATE_SUCCESS_GET_SCHEDULE:
      return {
        ...state,
        ScheduleGetData: action.payload,
      };

    default:
      return state;
      break;
  }
};

// CAMPAIGN TABLE DATA

export const CampaignTableReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUCCESS_CAMPAIGN_TABLE_DATA:
      return {
        ...state,
        CampaignTableData: action.CampaignTableData,
      };
    default:
      return state;
      break;
  }
};

export const LeadCatcherReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUCCESS_LEAD_CATCHER:
      return {
        ...state,
        leadData: action.leadData,
      };
    default:
      return state;
      break;
  }
};

// LEAD CATCHER GET DATA
export const LeadGetReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUCCESS_LEAD_CATCHER_GET:
      return {
        ...state,
        leadGetData: action.leadGetData,
      };
    default:
      return state;
      break;
  }
};
// lead view all
export const LeadViewReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUCCESS_LEAD_VIEW:
      return {
        ...state,
        leadViewData: action.payload,
      };
    default:
      return state;
      break;
  }
};

// update lead
export const LeadUpdateReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUCCESS_LEAD_UPDATE:
      return {
        ...state,
        updateLeadData: action.payload,
      };
    default:
      return state;
      break;
  }
};
