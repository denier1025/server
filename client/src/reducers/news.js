import { GET_ALL_NEWS } from "../actions/types";

const initialState = {
  data: []
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case GET_ALL_NEWS:
      return {
        ...state,
        data: action.payload
      }
    default:
      return state;
  }
};