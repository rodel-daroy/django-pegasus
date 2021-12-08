import {
  COUNT_RECIPIENTS,
  FILTER_RECIPIENTS,
} from "../../redux/actionType/actionType";
import axios from "../../utils/axios";
import { sessionType } from "../../utils/Enums";
import { toastOnError, toggleTopLoader } from "../../utils/Utils";

export const filterRecipients =
  (
    selectedTag,
    session = sessionType.PERSONAL,
    adminId = null,
    searchTerm = "",
    sortDirection = "asc",
    sortField = "email",
    page = 1,
    rowsPerPage = 10
  ) =>
  (dispatch) => {
    toggleTopLoader(true);
    axios
      .get("/campaign/audience/list/", {
        page,
        size: rowsPerPage,
        tag_id: selectedTag,
        admin_id: adminId,
        session_type: session,
        search_term: searchTerm,
        sort_direction: sortDirection,
        sort_field: sortField,
      })
      .then((response) => {
        dispatch({
          type: FILTER_RECIPIENTS,
          payload: response.data,
        });
      })
      .finally(() => {
        toggleTopLoader(false);
      });
  };

export const countRecipients = () => (dispatch) => {
  axios
    .get("/campaign/prospects/count")
    .then((response) => {
      dispatch({
        type: COUNT_RECIPIENTS,
        payload: response.data,
      });
    })
    .catch((error) => {
      toastOnError(error);
    })
    .finally(() => {});
};
