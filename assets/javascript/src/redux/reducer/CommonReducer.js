import { SHOW_NOTIFICATION, HIDE_NOTIFICATION, TOP_LOADER, AUTH_LOADER } from "../actionType/actionType";

const initialState = {
  showNotification: false,
  type: 0,
  title: "",
  message: "",
  topLoader: false,
  authLoader: false,
};

export const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_NOTIFICATION:
      return {
        showNotification: true,
        type: action.payload.type,
        title: action.payload.title,
        message: action.payload.message,
      };
    case HIDE_NOTIFICATION:
      return initialState;
    case TOP_LOADER:
      return {
        ...state,
        topLoader: action.payload.visible
      }
    case AUTH_LOADER:
      return {
          ...state,
          authLoader: action.payload,
      }
    default:
      return state;
  }
};
