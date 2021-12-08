import axios from "../../utils/axios";
import { sessionType } from "../../utils/Enums";
import { toastOnError, toggleTopLoader } from "../../utils/Utils";
import {
  ADD_UNSUBSCRIBE_CSV,
  DELETE_UNSUBSCRIBE_EMAILS,
  GET_UNSUBSCRIBES,
} from "../actionType/actionType";

export const getUnsubscribes =
  (
    search,
    session = sessionType.PERSONAL,
    adminId = null,
    page = 1,
    sortDirection = "asc",
    sortField = "email",
    rowsPerPage = 10,
    filter = "address"
  ) =>
  (dispatch) => {
    toggleTopLoader(true);
    axios
      .get("/unsubscribes/", {
        search,
        admin_id: adminId,
        session_type: session,
        page,
        size: rowsPerPage,
        sort_direction: sortDirection,
        sort_field: sortField,
        filter,
      })
      .then((response) => {
        dispatch({
          type: GET_UNSUBSCRIBES,
          payload: response.data,
        });
      })
      .catch((error) => {
        toastOnError(error);
      })
      .finally(() => {
        toggleTopLoader(false);
      });
  };

export const addUnsubscribeEmails = (emailList, user) => (dispatch) => {
  toggleTopLoader(true);
  const data = emailList.map((email) => ({
    email: email,
    mail_account: user.email,
    name: user.first_name,
  }));
  return axios
    .post("/unsubscribes/add-emails", data)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      toastOnError(error);
    })
    .finally(() => {
      toggleTopLoader(false);
    });
};

export const addUnsubscribeCSV = (file) => (dispatch) => {
  const fileData = new FormData();
  fileData.append("file", file);
  toggleTopLoader(true);
  return axios
    .post("/unsubscribes/add-csv", fileData)
    .then((response) => {
      dispatch({
        type: ADD_UNSUBSCRIBE_CSV,
        payload: response.data,
      });
    })
    .catch((error) => {
      toastOnError(error);
    })
    .finally(() => {
      toggleTopLoader(false);
    });
};

export const deleteUnsubscribeEmails = (ids) => (dispatch) => {
  toggleTopLoader(true);
  return axios
    .post("/unsubscribes/delete-emails", ids)
    .then((response) => {
      dispatch({
        type: DELETE_UNSUBSCRIBE_EMAILS,
        payload: ids,
      });
    })
    .catch((error) => {
      toastOnError(error);
    })
    .finally(() => {
      toggleTopLoader(false);
    });
};
