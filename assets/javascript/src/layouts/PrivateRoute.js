import React from "react";
import { connect } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";

class PrivateRoute extends React.Component {
  render() {
    const token = localStorage.getItem("access_token");
    return token ? (
      <Route {...this.props} />
    ) : (
      <Redirect from="*" to="/app/auth/login" />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLogin: state.auth === undefined ? false : state.auth.isLogin,
  };
};

export default connect(mapStateToProps)(PrivateRoute);
