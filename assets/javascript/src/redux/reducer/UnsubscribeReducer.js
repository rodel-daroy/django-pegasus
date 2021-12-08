import {
    GET_UNSUBSCRIBES,
    ADD_UNSUBSCRIBE_EMAILS,
    ADD_UNSUBSCRIBE_CSV,
    DELETE_UNSUBSCRIBE_EMAILS,
  } from "../actionType/actionType";
  
  const initialState = {
    unsubscribes: [],
  };
  
  export const unsubscribesReducer = (state = initialState, action) => {
    switch (action.type) {
      case GET_UNSUBSCRIBES:
        return {
          ...state,
          unsubscribes: action.payload,
        };
      case ADD_UNSUBSCRIBE_EMAILS:
        return {
          ...state,
          unsubscribes: [...state.unsubscribes, ...action.payload],
        };
      case ADD_UNSUBSCRIBE_CSV:
        return {
          ...state,
          unsubscribes: [...state.unsubscribes, ...action.payload],
        };
      case DELETE_UNSUBSCRIBE_EMAILS:
        console.log(action.payload);
        return {
          ...state,
          unsubscribes: state.unsubscribes.filter(
            (item, index) => action.payload.indexOf(item.id) < 0
          ),
        };
      default:
        return state;
    }
  };
  