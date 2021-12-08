import {
  ADD_MAILACCOUNT,
  DELETE_MAILACCOUNT,
  GET_MAILACCOUNTS,
  UPDATE_MAILACCOUNT,
} from "../actionType/actionType";

const initialState = {
  mailAccounts: [],
};

export const mailAccountsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_MAILACCOUNTS:
      return {
        ...state,
        mailAccounts: action.payload,
      };
    case ADD_MAILACCOUNT:
      return {
        ...state,
        mailAccounts: [...state.mailAccounts.results, action.payload],
      };
    case DELETE_MAILACCOUNT:
      const deleteMail = state.mailAccounts.results.filter(
        (item) => item.id !== action.payload
      );
      return {
        ...state,
        mailAccounts: deleteMail,
      };
    case UPDATE_MAILACCOUNT:
      const updatedMailAccounts = state.mailAccounts.results.map((item) => {
        if (item.id === action.payload.id) {
          return { ...item, ...action.payload };
        }
        return item;
      });
      return {
        ...state,
        mailAccounts: updatedMailAccounts,
      };
    default:
      return state;
  }
};
