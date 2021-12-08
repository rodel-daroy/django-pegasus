import axios from "../../utils/axios";
import {
  toastOnError,
  toastOnSuccess,
  toggleTopLoader,
} from "../../utils/Utils";
import { GET_WARMINGS } from "../actionType/actionType";
import { sessionType } from "../../utils/Enums";

export const getWarmings = (session = sessionType.PERSONAL, adminId = null) => (
  dispatch
) => {
  toggleTopLoader(true);
  return axios
    .get("/mailaccounts/warmings/", {
      admin_id: adminId,
      session_type: session,
    })
    .then((response) => {
      dispatch({
        type: GET_WARMINGS,
        payload: response.data,
      });
      return response.data;
    })
    .catch((error) => {
      toastOnError(error);
    })
    .finally(() => {
      toggleTopLoader(false);
    });
};

export const updateWarmings = (id, data) => (dispatch) => {
  toggleTopLoader(true);
  return axios
    .post(`/mailaccounts/warmings/${id}/`, data)
    .then((response) => {
      // dispatch({
      //   type: UPDATE_MAILACCOUNT,
      //   payload: response.data,
      // });
      return response.data;
    })
    .catch((error) => {
      toastOnError(error);
    })
    .finally(() => {
      toggleTopLoader(false);
    });
};
