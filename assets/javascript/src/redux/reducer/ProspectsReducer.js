import {
  FILTER_RECIPIENTS,
  COUNT_RECIPIENTS,
} from "../actionType/actionType";

const initialState = {
  recipients: [],
  counts: [],
};

export const prospectsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FILTER_RECIPIENTS:
      return {
        ...state,
        recipients: action.payload,
      };
    case COUNT_RECIPIENTS:
      return {
        ...state,
        counts: action.payload
      }
    default:
      return state;
  }
};
