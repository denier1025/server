import axios from "axios";
import { GET_ERRORS, GET_ALL_NEWS } from "./types";

export const getAllNews = () => dispatch => {
  axios
    .get("/api/news")
    .then(res => dispatch({type: GET_ALL_NEWS, payload: res.data}))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};