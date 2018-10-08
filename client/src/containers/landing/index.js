import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import { getAllNews } from "../../actions/news";
import News from "../../components/news";
import "./index.css";

class Landing extends Component {
  componentDidMount() {
    this.props.getAllNews()
  }

  render() {
    return (
      <div className="landing">
        <div className="dark-overlay landing-inner text-light">
          <div className="container">
            <div className="row">
              <div className="col-md-12 text-center">
                <h1 className="display-3 mb-4">Computer Literacy Society</h1>
                <p className="lead">
                  One plus step for understanding, how in works and what to
                  expect, it's not a magic
                </p>
                <News news={this.props.news}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Landing.propTypes = {
  getAllNews: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  news: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  news: state.news
});

export default connect(
  mapStateToProps,
  { getAllNews }
)(Landing);
