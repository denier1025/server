import axios from "axios";
import jwtDecode from "jwt-decode";
import setAuthToken from "../utils/setAuthToken";
import { GET_ERRORS, SET_CURRENT_USER } from "./types";

export const registerUser = (userData, routeHistoryArray) => dispatch => {
  axios
    .post("/api/register", userData)
    .then(() => routeHistoryArray.push("/login"))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

export const loginUser = (userData, routeHistoryArray) => dispatch => {
  axios
    .post("/api/login", userData)
    .then(res => {
      const token = res.data.token;
      localStorage.setItem("jwtToken", token);
      setAuthToken(token);
      dispatch(setCurrentUser(jwtDecode(token)));
      routeHistoryArray.push("/");
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

export const setCurrentUser = decodedJWTData => ({
  type: SET_CURRENT_USER,
  payload: decodedJWTData
});

export const logoutUser = routeHistoryArray => dispatch => {
  localStorage.removeItem("jwtToken");
  setAuthToken(false);
  dispatch(setCurrentUser({}));
  routeHistoryArray.push("/");
};
