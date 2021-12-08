import {
  GET_PROFILE,
  GOOGLE_LOGIN_USER,
  LOGIN_USER,
  LOGOUT_USER,
  REGISTER_USER,
  UPDATE_TEAM,
  UPDATE_TRACKING_DOMAIN,
} from "../actionType/actionType";
const initialState = {
  user: {
    username: null,
    email: null,
    first_name: "",
    last_name: "",
    company_name: null,
    avatar: null,
    team: null,
  },
  isLogin: false,
  socialType: "none",
};

export const AuthReducer = (state = initialState, action) => {
  switch (action.type) {
    case REGISTER_USER:
      return {
        ...state,
        user: action.payload,
        isLogin: true,
        socialType: "none",
      };
    case LOGIN_USER:
      return {
        ...state,
        user: action.payload,
        isLogin: true,
        socialType: "none",
      };
    case GOOGLE_LOGIN_USER:
      return {
        ...state,
        user: action.payload,
        isLogin: true,
        socialType: "google",
      };
    case LOGOUT_USER:
      return initialState;
    case GET_PROFILE:
      return {
        ...state,
        user: action.payload,
      };
    case UPDATE_TRACKING_DOMAIN:
      return {
        ...state,
        user: { ...state.user, tracking_domain: action.payload },
      };
    case UPDATE_TEAM:
      return {
        ...state,
        user: { ...state.user, team: action.payload },
      };
    default:
      return state;
  }
};
