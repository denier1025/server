import { createStore, applyMiddleware, compose } from "redux";
import reduxThunk from "redux-thunk";
import { createLogger } from "redux-logger";
import rootReducer from "./reducers";

const initialState = {};

const store = createStore(
  rootReducer,
  initialState,
  compose(
    applyMiddleware(reduxThunk, createLogger()),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);

export default store;
