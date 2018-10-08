import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./store";
import jwtDecode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/auth";
import "./index.css";
import App from "./containers/app";
import registerServiceWorker from "./registerServiceWorker";

if (localStorage.jwtToken) {
  setAuthToken(localStorage.jwtToken);
  const decodedJWTToken = jwtDecode(localStorage.jwtToken);
  store.dispatch(setCurrentUser(decodedJWTToken));

  const currentTime = Date.now() / 1000;
  if (decodedJWTToken.exp < currentTime) {
    store.dispatch(logoutUser());
    // TODO: Clear account data (if any exists)
    window.location.href = "/login";
  }
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector("#root")
);
registerServiceWorker();
