import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./index.css";

import Navbar from "../header";
import Footer from "../footer";
import Landing from "../landing";

import Register from "../auth/register";
import Login from "../auth/login";

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Navbar />
          <Route exact path="/" component={Landing} />
          <div className="container">
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
          </div>
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;