import * as Sentry from "@sentry/react";

import {
  AUTH_LOADER,
  HIDE_NOTIFICATION,
  SHOW_NOTIFICATION,
  TOP_LOADER,
} from "../redux/actionType/actionType";
import { store } from "../redux/store/store";

export const toastOnError = (error) => {
  let errMessage = "";
  if (error.response) {
    // known error
    errMessage =
      typeof error.response.data === "string"
        ? error.response.data
        : typeof error.response.data?.message === "string"
        ? error.response.data.message
        : JSON.stringify(error.response.data);
  } else if (error.message) {
    errMessage = JSON.stringify(error.message);
  } else if (typeof error !== "string") {
    errMessage = messages.api_failed;
  } else {
    errMessage = error;
  }
  Sentry.captureMessage("Frontend Call Error", errMessage);
  if (errMessage.length > 100) {
    showNotification(
      "warning",
      "API Call Error",
      "The server encountered an internal error. Please try again."
    );
  } else {
    showNotification("warning", "API Call Error", errMessage);
  }
};

export const toastOnSuccess = (msg) => {
  showNotification("success", "Success", msg);
};

export const showNotification = (notificationType, title, message) => {
  store.dispatch({
    type: SHOW_NOTIFICATION,
    payload: {
      type: notificationType,
      title,
      message,
    },
  });
};

export const hideNotification = () => {
  store.dispatch({
    type: HIDE_NOTIFICATION,
  });
};

export const toggleTopLoader = (visible) => {
  store.dispatch({
    type: TOP_LOADER,
    payload: {
      visible,
    },
  });
};

export const toggleAuthLoader = (visible) => {
  store.dispatch({
    type: AUTH_LOADER,
    payload: visible,
  });
};

export const formatHeader = (str) => {
  const strArr = str.split(/[\-\_]+/);
  const formatStrArr = strArr.map((s) => {
    if (s) {
      return s.charAt(0).toUpperCase() + s.slice(1);
    } else {
      return "";
    }
  });
  return formatStrArr.join(" ");
};

export const parseCSVRow = (row) => {
  const tableHeaders = [];
  Object.keys(row).forEach((key) => {
    if (
      key &&
      (key.toLowerCase().indexOf("name") > -1 ||
        key.toLowerCase().indexOf("email") > -1)
    ) {
      tableHeaders.push({
        key: key,
        value: formatHeader(key),
      });
    }
  });
  return tableHeaders;
};

export const parseTemplate = (str, row) => {
  // extract matches {{...}}
  if (!str) return "";

  const matches = str.match(/\{\{([^{}]*)\}\}/g);
  if (matches && matches.length > 0) {
    matches.forEach((m) => {
      const key = m.slice(2, -2).trim();
      if (key && key in row) {
        str = str.replaceAll(m, row[key]);
      }
    });
  }
  return str;
};

export const messages = {
  add_success: "Successfully created",
  update_success: "Successfully updated",
  delete_success: "Successfully removed",
  api_failed: "Sorry, server connection failed. please try again.",
  not_found_id: "Sorry, there is no item with this id",
};

export const makeTokenKeyword = (socialType) => {
  if (socialType === "none") {
    return "jwt";
  } else if (socialType === "google") {
    return "bearer";
  }
  return "jwt";
};

export const popupWindow = (url, title, w, h) => {
  // Fixes dual-screen position most browsers
  const dualScreenLeft =
    window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop =
    window.screenTop !== undefined ? window.screenTop : window.screenY;
  const width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
    ? document.documentElement.clientWidth
    : screen.width;
  const height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
    ? document.documentElement.clientHeight
    : screen.height;
  if (!w) {
    w = width / 2;
  }
  if (!h) {
    h = height * 0.8;
  }
  const systemZoom = width / window.screen.availWidth;
  const left = (width - w) / 2 / systemZoom + dualScreenLeft;
  const top = (height - h) / 2 / systemZoom + dualScreenTop;
  const newWindow = window.open(
    url,
    title,
    `scrollbars=yes, width=${w / systemZoom}, height=${
      h / systemZoom
    }, top=${top}, left=${left}`
  );
  if (window.focus) newWindow.focus();
};
