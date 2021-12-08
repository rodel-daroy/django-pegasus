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
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
// react library for routing
import { Redirect, Route, Switch } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";

// import routes from "routes.js";
import routes from "./../routes";
// core components
import AdminNavbar from "../components/Navbars/AdminNavbar.js";
import Sidebar from "../components/Sidebar/Sidebar.js";
import Api from "../redux/api/api";
import { toggleTopLoader } from "../utils/Utils";

function TopLoader() {
  const { topLoader } = useSelector((state) => state.notification);
  const ref = useRef(null);

  useEffect(() => {}, []);

  useEffect(() => {
    if (topLoader) {
      !ref.current || ref.current.continuousStart();
    } else {
      !ref.current || ref.current.complete();
    }
  }, [topLoader]);

  return <LoadingBar color={"#f40b3a"} ref={ref} />;
}

class Admin extends React.Component {
  state = {
    sidenavOpen: false,
  };

  componentDidMount() {
    if (window.innerWidth > 1200) {
      document.body.classList.add("g-sidenav-pinned");
      document.body.classList.remove("g-sidenav-hidden");
      document.body.classList.add("g-sidenav-show");
      var head = document.head;
      // HyRos Script
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = "https://179113.tracking.hyros.com/v1/lst/universal-script?ph=38f479f47c69635982fa293ee16c5d1fa5760ae6ec7ba883566b86542436e9fd&tag=!tracking";
      head.appendChild(script);
      this.setState({
        sidenavOpen: true,
      });

      window.intercomSettings = {app_id: "yln55azg"};
      // We pre-filled your app ID in the widget URL: 'https://widget.intercom.io/widget/yln55azg'
      (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/yln55azg';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
    }
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
      if (prop.layout && prop.layout.indexOf("/app/admin") !== -1) {
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

  getBrandText = (path) => {
    for (let i = 0; i < routes.length; i++) {
      if (
        this.props.location.pathname.indexOf(
          routes[i].layout + routes[i].path
        ) !== -1
      ) {
        return routes[i].name;
      }
    }
    return "Brand";
  };

  // toggles collapse between mini sidenav and normal
  toggleSidenav = (e) => {
    if (document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.remove("g-sidenav-pinned");
      document.body.classList.add("g-sidenav-hidden");
      document.body.classList.remove("g-sidenav-show");
    } else {
      document.body.classList.add("g-sidenav-pinned");
      document.body.classList.remove("g-sidenav-hidden");
      document.body.classList.add("g-sidenav-show");
    }
    this.setState({
      sidenavOpen: !this.state.sidenavOpen,
    });
  };

  getNavbarTheme = () => {
    return this.props.location.pathname.indexOf("dashboard") === -1
      ? "dark"
      : "light";
  };

  render() {
    return (
      <>
        <Sidebar
          {...this.props}
          routes={routes}
          toggleSidenav={this.toggleSidenav}
          sidenavOpen={this.state.sidenavOpen}
          logo={{
            innerLink: "/",
            imgSrc: this.state.sidenavOpen
              ? STATIC_FILES.mailerrize_logo_complete
              : STATIC_FILES.mailerrize_icon,
            imgAlt: "Mailerrize",
          }}
        />
        <div
          className="main-content-admin"
          ref="mainContent"
          onClick={this.closeSidenav}
        >
          <TopLoader />
          <AdminNavbar
            toggleSidenav={this.toggleSidenav}
            {...this.props}
            sidenavOpen={this.state.sidenavOpen}
            routes={routes}
          />
          <Switch>
            {this.getRoutes(routes)}
            <Redirect from="*" to="/app/admin/dashboard" />
          </Switch>
          {/* <AdminFooter /> */}
        </div>
        {/* {this.state.sidenavOpen ? (
          <div className="backdrop d-xl-none" onClick={this.toggleSidenav} />
        ) : null} */}
      </>
    );
  }
}

export default Admin;
