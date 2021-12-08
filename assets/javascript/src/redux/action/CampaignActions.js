import axios from "../../utils/axios";
import {
  showNotification,
  toastOnError,
  toastOnSuccess,
  toggleTopLoader,
} from "../../utils/Utils";
import { history } from "../..";
import {
  CAMPAIGN_COMPOSE,
  CAMPAIGN_OPTIONS,
  CAMPAIGN_RECIPIENT,
  CAMPAIGN_START,
} from "../actionType/actionType";

export const campaignStart = (payload) => ({
  type: CAMPAIGN_START,
  payload,
});

export const campaignRecipient = (payload) => ({
  type: CAMPAIGN_RECIPIENT,
  payload,
});

export const campaignCompose = (payload) => ({
  type: CAMPAIGN_COMPOSE,
  payload,
});

export const campaignOptions = (payload) => ({
  type: CAMPAIGN_OPTIONS,
  payload,
});

export const campaignSend = (payload) => (dispatch) => {
  const formData = new FormData();
  formData.append("campaign", JSON.stringify(payload));
  formData.append("csvfile", payload.csvfile);
  toggleTopLoader(true);
  axios
    .post("/campaign/create/", formData)
    .then((response) => {
      history.push("/app/admin/campaign/list");
      showNotification("success", "Success", response.data.message);
    })
    .catch((error) => {
      toastOnError(error);
    })
    .finally(() => {
      toggleTopLoader(false);
    });
};

export const campaignUpdate = (payload) => (dispatch) => {
  toggleTopLoader(true);
  return axios
    .post("/campaign/sequence-update/", payload)
    .then((response) => {
      // TODO: reload page
      return response;
    })
    .catch((error) => {
      toastOnError(error);
    })
    .finally(() => {
      toggleTopLoader(false);
    });
};

export const campaignChangeStatus = (id, status) => {
  toggleTopLoader(true);
  axios
    .post(`/campaign/update-status/${id}`, status)
    .then((response) => {
      toastOnSuccess("Updated successfully!");
      return response.data;
    })
    .catch((error) => {
      toastOnError(error);
    })
    .finally(() => {
      toggleTopLoader(false);
    });
};
