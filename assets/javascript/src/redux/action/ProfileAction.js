import axios from "../../utils/axios";
import { toastOnError, toggleAuthLoader } from "../../utils/Utils";
import { GET_PROFILE, UPDATE_TRACKING_DOMAIN } from "../actionType/actionType";

export const getProfile = () => (dispatch) => {
  toggleAuthLoader(true);
  axios
    .get(`/rest-auth/user/`)
    .then((response) => {
      dispatch({
        type: GET_PROFILE,
        payload: response.data,
      });
    })
    .catch((error) => {
      toastOnError(error);
    })
    .finally(() => {
      toggleAuthLoader(false);
    });
};

export const updateTrackingDomain = (payload) => (dispatch) => {
  toggleAuthLoader(true);
  axios
    .put(`/users/update-tracking-domain/`, payload)
    .then((response) => {
      dispatch({
        type: UPDATE_TRACKING_DOMAIN,
        payload: response.data.tracking_domain,
      });
    })
    .catch((error) => {
      toastOnError(error);
    })
    .finally(() => {
      toggleAuthLoader(false);
    });
};
