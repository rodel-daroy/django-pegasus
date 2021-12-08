// imports
import { history } from "../..";
import {
  FAILURE_CAMPAIGN_OVERVIEW,
  FAILURE_FETCH_CAMPAIGN_CREATE_PREVIEW,
  FAILURE_FETCH_CAMPAIGN_UPDATE_PREVIEW,
  FAILURE_RECIPIENT,
  REQUEST_FOR_CAMPAIGN_OVERVIEW,
  REQUEST_FOR_COMPOSE_DATA,
  REQUEST_FOR_RECIPIENT,
  SUCCESS_CAMPAIGN_OVERVIEW,
  SUCCESS_CAMPAIGN_TABLE_DATA,
  SUCCESS_CREATE_CAMPAIGN,
  SUCCESS_CREATE_LEAD,
  SUCCESS_FETCH_CAMPAIGN_CREATE_PREVIEW,
  SUCCESS_FETCH_CAMPAIGN_UPDATE_PREVIEW,
  SUCCESS_FOR_CAMPAIGN_PEOPLE,
  SUCCESS_LEAD_CATCHER,
  SUCCESS_LEAD_CATCHER_GET,
  SUCCESS_LEAD_DELETE,
  SUCCESS_LEAD_UPDATE,
  SUCCESS_LEAD_VIEW,
  SUCCESS_OPTION,
  SUCCESS_RECIPIENT,
  SUCCESS_SAVE_CAMPAIGN,
  SUCCESS_START_CAMPAIGN,
} from "../actionType/actionType";
import Api from "../api/api";
// START_CAMPAIGN
export const StartCampaignSuccess = (data) => {
  return {
    type: SUCCESS_START_CAMPAIGN,
    data,
  };
};

// Campaign option
export const OptionSuccess = (data) => {
  return {
    type: SUCCESS_OPTION,
    data,
  };
};

// Campaign RECIPIENTS
export const RecipientSuccess = (recipientData) => {
  return {
    type: SUCCESS_RECIPIENT,
    recipientData,
  };
};
// CAMPAIGN_CREATE_PREVIEW
export const requestForCampaignPreview = () => {
  return {
    type: REQUEST_FOR_CAMPAIGN_CREATE_PREVIEW,
  };
};
export const CampaignPreviewSuccess = (CampaignPreviewData) => {
  return {
    type: SUCCESS_FETCH_CAMPAIGN_CREATE_PREVIEW,
    CampaignPreviewData,
  };
};
export const CampaignPreviewFailure = () => {
  return {
    type: FAILURE_FETCH_CAMPAIGN_CREATE_PREVIEW,
  };
};
// CAMPAIGN UPDATE PREVIEW
export const CampaignPreviewUpdateSuccess = (CampaignPreviewData) => {
  return {
    type: SUCCESS_FETCH_CAMPAIGN_UPDATE_PREVIEW,
    campaignPreviewUpdateData: campaignPreviewUpdateData,
  };
};
export const CampaignPreviewUpdateFailure = () => {
  return {
    type: FAILURE_FETCH_CAMPAIGN_UPDATE_PREVIEW,
  };
};

// Campaign_send
export const CampaignCreateSuccess = (sendData) => {
  return {
    type: SUCCESS_CREATE_CAMPAIGN,
    sendData,
  };
};
// CAMPAIGN_SAVE
export const CampaignSaveSuccess = (saveData) => {
  return {
    type: SUCCESS_SAVE_CAMPAIGN,
    saveData,
  };
};

// CAMPAIGN_TABLE_DATA
export const requestForCampaignTableData = () => {
  return {
    type: REQUEST_FOR_CAMPAIGN_TABLE_DATA,
  };
};
export const CampaignTableDataSuccess = (CampaignTableData) => {
  return {
    type: SUCCESS_CAMPAIGN_TABLE_DATA,
    CampaignTableData,
  };
};
export const CampaignTableDataFailure = () => {
  return {
    type: FAILURE_CAMPAIGN_TABLE_DATA,
  };
};

// CAMPAIGN_OVERVIEW
export const CampaignOverviewSuccess = (CampaignOverviewData) => {
  return {
    type: SUCCESS_CAMPAIGN_OVERVIEW,
    CampaignOverviewData,
  };
};
// campaighn compose
export const requestForCampaignCompose = () => {
  return {
    type: REQUEST_FOR_COMPOSE_DATA,
  };
};
// CAMPAIGN_PEOPLE
export const requestForCampaignPeopleSuccess = (campaignPeopleData) => {
  // console.log(peopleData, 'data')
  return {
    type: SUCCESS_FOR_CAMPAIGN_PEOPLE,
    campaignPeopleData,
  };
};

// lead catcher
export const leadCatcherSuccess = (leadData) => {
  return {
    type: SUCCESS_LEAD_CATCHER,
    payload: leadData,
  };
};

// lead catcher get
export const leadCatcherGetSuccess = (leadGetData) => {
  return {
    type: SUCCESS_LEAD_CATCHER_GET,
    leadGetData,
  };
};

// lead catcher delete
export const leadCatcherDeleteSuccess = () => {
  return {
    type: SUCCESS_LEAD_DELETE,
  };
};
// lead catcher UPDATE
export const leadCatcherUpdateSuccess = (leadUpdateData) => {
  return {
    type: SUCCESS_LEAD_UPDATE,
    payload: leadUpdateData,
  };
};
// view all leads
export const leadViewSuccess = (leadViewData) => {
  return {
    type: SUCCESS_LEAD_VIEW,
    payload: leadViewData,
  };
};

// lead catcher
export const leadCreateSuccess = (createLeadData) => {
  return {
    type: SUCCESS_CREATE_LEAD,
    payload: createLeadData,
  };
};

// CAMPAIGN_OVERVIEW_MIDDLEWARE
export const CampaignOverviewAction = (id) => {
  return function (dispatch) {
    const token = localStorage.getItem("access_token");
    Api.CampaignOverviewApi(token, id)
      .then((result) => {
        result.data.id = id;
        dispatch(CampaignOverviewSuccess(result.data));
        setTimeout(() => {
          history.push("/app/admin/OverView", { id: result.data.id });
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
      });
  };
};

export const StartCampaignAction = (data) => {
  return function (dispatch) {
    const token = localStorage.getItem("access_token");

    Api.StartCampaignApi(data, token)
      .then((result) => {
        dispatch(StartCampaignSuccess(result.data));

        setTimeout(() => {
          history.push("/app/admin/CampaignRecipient", { id: result.data.id });
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
      });
  };
};

export const RecipientAction = (recipientData) => {
  return function (dispatch) {
    const token = localStorage.getItem("access_token");
    Api.RecipientApi(recipientData, token)
      .then((result) => {
        setTimeout(() => {
          dispatch(RecipientSuccess(result.data));
          history.push("/app/admin/CampaignCompose", {
            id: recipientData.campaign,
          });
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
      });
  };
};

export const CampaignComposeAction = (data) => {
  return function (dispatch) {
    const token = localStorage.getItem("access_token");
    // dispatch(requestForCampaignCompose())
    Api.CampaignComposeApi(token, data)
      .then((result) => {
        setTimeout(() => {
          dispatch(requestForCampaignCompose(result.data));
          history.push("/app/admin/CampaignPreview", {
            id: data.normal.campaign,
          });
        }, 1000);
      })
      .catch((err) => {
        console.log(err, "error-");
      });
  };
};

export const CampaignOptionAction = (optionData) => {
  return function (dispatch) {
    const token = localStorage.getItem("access_token");
    Api.OptionApi(optionData, token)
      .then((result) => {
        setTimeout(() => {
          dispatch(OptionSuccess(result.data));
          history.push("/app/admin/CampaignSend", { id: result.data.id });
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
      });
  };
};

// CAMPAIGN_CREATE_PREVIEW MIDDLEWARE
export const PreviewCampaignAction = (id) => {
  return function (dispatch) {
    const token = localStorage.getItem("access_token");
    Api.CampaignPreviewApi(token, id)
      .then((result) => {
        dispatch(CampaignPreviewSuccess(result.data));
      })
      .catch((err) => {
        console.log(err);
      });
  };
};

export const CampaignTableAction = () => {
  return function (dispatch) {
    const token = localStorage.getItem("access_token");
    Api.CampaignTableDataApi(token)
      .then((result) => {
        setTimeout(() => {
          dispatch(CampaignTableDataSuccess(result.data));
          history.push({ id: result.data.id });
        }, 100);
      })
      .catch((err) => {
        console.log(err);
      });
  };
};
export const CampaignCreateAction = (id) => {
  return function (dispatch) {
    const token = localStorage.getItem("access_token");
    Api.CampaignCreateGetApi(token, id).then((result) => {
      setTimeout(() => {
        dispatch(CampaignCreateSuccess(result.data));
      }, 1000);
    });
  };
};

export const CampaignSaveAction = (saveData, id) => {
  return function (dispatch) {
    const token = localStorage.getItem("access_token");
    Api.CampaignSaveApi(token, id, saveData)
      .then((result) => {
        setTimeout(() => {
          dispatch(CampaignSaveSuccess(result.data));
          history.push("/app/admin/CampaignList", {
            id: id,
            saveData: saveData,
          });
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
      });
  };
};
//  CAMPAIGN_UPDATE_PREVIEW MIDDLEWARE
export const PreviewUpdateCampaignAction = (id) => {
  return function (dispatch) {
    const token = localStorage.getItem("access_token");

    Api.CampaignUpdatePreviewApi(token, id)
      .then((result) => {
        dispatch(CampaignPreviewUpdateSuccess(result.data));
      })
      .catch((err) => {
        console.log(err);
      });
  };
};

// CAMPAIGN PEOPLE DATA
export const CampaignPeopleAction = (id) => {
  return function (dispatch) {
    const token = localStorage.getItem("access_token");
    Api.CampaignRecipientPeopleApi(token, id)
      .then((result) => {
        dispatch(requestForCampaignPeopleSuccess(result.data));
      })
      .catch((err) => {
        console.log(err, "error-");
      });
  };
};

// LEAD CATCHER ACTION

export const CampaignLeadCatcherAction = (id, leadData) => {
  return function (dispatch) {
    const token = localStorage.getItem("access_token");
    Api.CampaignLeadCatcherApi(token, id, leadData)
      .then((result) => {
        dispatch(CampaignLeadGetAction(id));
      })
      .catch((err) => {
        console.log(err, "error-");
      });
  };
};

// LEAD CATCHER GET ACTION

export const CampaignLeadGetAction = (id) => {
  return function (dispatch) {
    const token = localStorage.getItem("access_token");
    Api.CampaignLeadGetApi(token, id)
      .then((result) => {
        console.log("result getdata", result.data);
        dispatch(leadCatcherGetSuccess(result.data));
        // dispatch(CampaignLeadUpdateAction(id))
      })
      .catch((err) => {
        console.log(err, "error-");
      });
  };
};

// LEAD CATCHER DELETE ACTION

export const CampaignLeadDeleteAction = (id) => {
  return function (dispatch) {
    const token = localStorage.getItem("access_token");
    Api.CampaignLeadDeleteApi(token, id)
      .then((result) => {
        dispatch(leadCatcherDeleteSuccess());
      })
      .catch((err) => {
        console.log(err, "error-");
      });
  };
};
// LEAD CATCHER UPDATE ACTION
export const CampaignLeadUpdateAction = (getId, id, updateLeadData) => {
  return function (dispatch) {
    const token = localStorage.getItem("access_token");
    Api.CampaignLeadUpadteApi(token, getId, id, updateLeadData)
      .then((result) => {
        dispatch(leadCatcherUpdateSuccess());
      })
      .catch((err) => {
        console.log(err, "error-");
      });
  };
};

// CREATE LEAD
export const CampaignCreateLeadAction = (id, createLeadData) => {
  return function (dispatch) {
    const token = localStorage.getItem("access_token");
    Api.CampaignCreateLeadApi(token, id, createLeadData)
      .then((result) => {
        dispatch(leadCreateSuccess(result.data));
        // dispatch(CampaignLeadViewAction(id))
      })
      .catch((err) => {
        console.log(err, "error-");
      });
  };
};

// LEAD CATCHER VIEW ALL
export const CampaignLeadViewAction = () => {
  return function (dispatch) {
    const token = localStorage.getItem("access_token");
    Api.CampaignLeadViewApi(token)
      .then((result) => {
        dispatch(leadViewSuccess(result.data));
      })
      .catch((err) => {
        console.log(err, "error-");
      });
  };
};
export const unsubscribeRecipientAction = (data, id) => {
  return function (dispatch) {
    const token = localStorage.getItem("access_token");
    Api.unsubscribeRecipientApi(data, token)
      .then((response) => {
        dispatch(CampaignPeopleAction(id));
      })
      .catch((err) => {
        console.log(err, "err");
      });
  };
};
