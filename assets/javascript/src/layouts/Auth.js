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
import React from "react";
// react library for routing
import { Redirect, Route, Switch } from "react-router-dom";

import routes from "./../routes";
import AuthFooter from "../components/Footers/AuthFooter.js";
// core components
import AuthNavbar from "../components/Navbars/AuthNavbar.js";

class Auth extends React.Component {
  componentDidMount() {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    this.refs.mainContent.scrollTop = 0;
    document.body.classList.add("bg-default");
    // HyRos Script
    var head = document.head;
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = "https://179113.tracking.hyros.com/v1/lst/universal-script?ph=38f479f47c69635982fa293ee16c5d1fa5760ae6ec7ba883566b86542436e9fd&tag=!tracking";
    head.appendChild(script);
    window.intercomSettings = {app_id: "yln55azg"};
    // We pre-filled your app ID in the widget URL: 'https://widget.intercom.io/widget/yln55azg'
    (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/yln55azg';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
  }
  componentWillUnmount() {
    document.body.classList.remove("bg-default");
  }
  componentDidUpdate(e) {
    if (e.history.pathname !== e.location.pathname) {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      this.refs.mainContent.scrollTop = 0;
    }
  }
  getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.collapse) {
        return this.getRoutes(prop.views);
      }
      if (prop.layout && prop.layout.indexOf("/auth") !== -1) {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };
  render() {
    return (
      <div
        className="main-content p-0 m-0"
        ref="mainContent"
        style={{ height: "100%" }}
      >
        <AuthNavbar />
        <Switch>
          {this.getRoutes(routes)}
          <Redirect from="*" to="/app/auth/login" />
        </Switch>
        {this.props.location.pathname.includes("auth") ? null : <AuthFooter />}
      </div>
    );
  }
}

export default Auth;
