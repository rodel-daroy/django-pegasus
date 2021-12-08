import axios from "../../utils/axios";
import { sessionType } from "../../utils/Enums";
import {
  toastOnError,
  toastOnSuccess,
  toggleTopLoader,
} from "../../utils/Utils";
import {
  ADD_MAILACCOUNT,
  DELETE_MAILACCOUNT,
  GET_MAILACCOUNTS,
  UPDATE_MAILACCOUNT,
} from "../actionType/actionType";

export const getMailAccounts =
  (
    session = sessionType.PERSONAL,
    adminId = null,
    search = undefined,
    page = 1,
    sortDirection = "asc",
    sortField = "email",
    rowsPerPage = 10,
    filter = "all",
    no_page = true
  ) =>
  (dispatch) => {
    toggleTopLoader(true);
    return axios
      .get("/mailaccounts/emailaccounts/", {
        search,
        admin_id: adminId,
        session_type: session,
        page,
        size: rowsPerPage,
        sort_direction: sortDirection,
        sort_field: sortField,
        filter,
        no_page,
      })
      .then((response) => {
        dispatch({
          type: GET_MAILACCOUNTS,
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

export const addMailAccount = (mailAccount) => async (dispatch) => {
  toggleTopLoader(true);
  await axios
    .post("/mailaccounts/emailaccounts/", mailAccount)
    .then((response) => {
      dispatch({
        type: ADD_MAILACCOUNT,
        payload: response.data,
      });
      toastOnSuccess("Added successfully!");
    })
    .catch((error) => {
      toastOnError(error);
    })
    .finally(() => {
      toggleTopLoader(false);
    });
};

export const deleteMailAccount = (id) => async (dispatch) => {
  toggleTopLoader(true);
  await axios
    .delete(`/mailaccounts/emailaccounts/${id}/`)
    .then(() => {
      dispatch({
        type: DELETE_MAILACCOUNT,
        payload: id,
      });
      toastOnSuccess("Deleted successfully!");
    })
    .catch((error) => {
      toastOnError(error);
    })
    .finally(() => {
      toggleTopLoader(false);
    });
};

export const updateMailAccount = (id, mailAccount) => async (dispatch) => {
  toggleTopLoader(true);
  await axios
    .patch(`/mailaccounts/emailaccounts/${id}/`, mailAccount)
    .then((response) => {
      dispatch({
        type: UPDATE_MAILACCOUNT,
        payload: response.data,
      });

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
