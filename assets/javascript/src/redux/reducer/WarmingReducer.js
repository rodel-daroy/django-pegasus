import {
  GET_WARMINGS,
} from "../actionType/actionType";

const initialState = {
  warmings: [],
};

export const warmingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_WARMINGS:
      return {
        ...state,
        warmings: action.payload,
      };
    default:
      return state;
  }
};
