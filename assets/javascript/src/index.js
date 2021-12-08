// plugins styles from node_modules
import "react-notification-alert/dist/animate.css";
import "react-perfect-scrollbar/dist/css/styles.css";
import "sweetalert2/dist/sweetalert2.min.css";
import "quill/dist/quill.core.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "regenerator-runtime/runtime";

// plugins styles downloaded
import "../../vendor/nucleo/css/nucleo.css";
// core styles
import "../../scss/argon-dashboard-pro-react.scss?v1.2.0";

import { createBrowserHistory } from "history";
/*!

=========================================================
* Argon Dashboard PRO React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-pro-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Provider, connect } from "react-redux";
// react library for routing
import { Redirect, Route, Router, Switch } from "react-router-dom";
import { Spinner } from "reactstrap";
import { createStore } from "redux";
import { PersistGate } from "redux-persist/integration/react";

// import RTLLayout from "layouts/RTL.js";
// import AuthLayout from "layouts/Auth.js";
import AdminLayout from "./layouts/Admin";
import AuthLayout from "./layouts/Auth";
import PrivateRoute from "./layouts/PrivateRoute";
import { persistor, store } from "./redux/store/store";
import axios from "./utils/axios";
import IndexView from "./views/Index.js";

import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import ReactGA from 'react-ga';
import ReactPixel from 'react-facebook-pixel';


// bootstrap rtl for rtl support page
// // import "assets/vendor/bootstrap-rtl/bootstrap-rtl.scss";

export const history = createBrowserHistory();
const token = localStorage.getItem("access_token");

let CleanUser = (props) => {
  let token = localStorage.getItem("access_token");

  const params = new URLSearchParams(props.location.search);
  const email = params.get("email");
  const invitation_id = params.get("invitation_id");

  if (invitation_id && email) {
    token = null;
    localStorage.removeItem("access_token");
  }

  if (token) {
    return <Redirect to="/app/admin" />;
  }
  return <AuthLayout {...props} />;
};

const mapStateToProps = (state) => {
  return {
    isLogin: state.auth === undefined ? false : state.auth.isLogin,
  };
};

CleanUser = connect(mapStateToProps)(CleanUser);

// Setup React Sentry for errors log
// TODO -> move link to .env file
Sentry.init({
  dsn: "https://0e9197e01ed741b79bea406f04f06fc6@o423610.ingest.sentry.io/5701236",
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
});

// TODO -> move ID to .env file
ReactGA.initialize('G-LYJLMDTGBR');
ReactGA.pageview(window.location.pathname + window.location.search);
const options = {
  autoConfig: true, // set pixel's autoConfig. More info: https://developers.facebook.com/docs/facebook-pixel/advanced/
  debug: false, // enable logs
};

// TODO -> move ID to .env file
ReactPixel.init('4115424105174897', options);
ReactPixel.pageView();
ReactDOM.render(
  <Router history={history}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Switch>
          <PrivateRoute
            path="/app/admin"
            render={(props) => <AdminLayout {...props} />}
          />
          <Route
            path="/app/auth"
            render={(props) => <CleanUser {...props} />}
          />
          <Route
            path="/"
            render={(props) =>
              token ? <Redirect to="/app/admin" /> : (location.pathname = "/")
            }
          />
        </Switch>
      </PersistGate>
    </Provider>
  </Router>,
  document.getElementById("object-lifecycle-home")
);
