import axios from "../../utils/axios";
import {
  toastOnError,
  toastOnSuccess,
  toggleAuthLoader,
  toggleTopLoader,
} from "../../utils/Utils";
import { history } from "../..";
import {
  GOOGLE_LOGIN_USER,
  LOGIN_USER,
  LOGOUT_USER,
  REGISTER_USER,
  UPDATE_TEAM,
} from "../actionType/actionType";
import Api from "../api/api";

export const register = (user) => (dispatch) => {
  dispatch({
    type: REGISTER_USER,
    payload: user,
  });
};

export const login = (user) => (dispatch) => {
  dispatch({
    type: LOGIN_USER,
    payload: user,
  });
};

export const logout = () => (dispatch) => {
  toggleTopLoader(true);
  axios
    .post("/rest-auth/logout/")
    .then((response) => {
      localStorage.removeItem("access_token");
      dispatch({
        type: LOGOUT_USER,
      });
    })
    .catch((error) => {
      toastOnError(error);
    })
    .finally(() => {
      window.location.reload();
      toggleTopLoader(false);
    });
};

export const googleLogin = (user) => (dispatch) => {
  dispatch({
    type: GOOGLE_LOGIN_USER,
    payload: user,
  });
};

export const updateTeam = (team) => (dispatch) => {
  dispatch({
    type: UPDATE_TEAM,
    payload: team,
  });
};
