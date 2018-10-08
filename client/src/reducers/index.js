import { combineReducers } from "redux";
import auth from "./auth";
import errors from "./error";
import news from "./news"

export default combineReducers({
  auth,
  errors,
  news
});
