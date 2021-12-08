// nodejs library that concatenates classes
import classnames from "classnames";
// nodejs library to set properties for components
import { PropTypes } from "prop-types";
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
// react library that creates nice scrollbar on windows devices
import PerfectScrollbar from "react-perfect-scrollbar";
import { connect } from "react-redux";
// react library for routing
import { Link, NavLink as NavLinkRRD } from "react-router-dom";
// reactstrap components
import {
  Collapse,
  Nav,
  NavItem,
  NavLink,
  Navbar,
  NavbarBrand,
} from "reactstrap";

import { sessionType } from "../../utils/Enums";

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.getCollapseStates(props.routes),
    };
  }

  componentWillMount = () => {
    this.setState(this.getCollapseStates(this.props.routes));
  };

  // verifies if routeName is the one active (in browser input)
  activeRoute = (routeName) => {
    return this.props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };

  // makes the sidenav normal on hover (actually when mouse enters on it)
  /*  onMouseEnterSidenav = () => {
    if (!document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.add("g-sidenav-show");
    }
  };
  // makes the sidenav mini on hover (actually when mouse leaves from it)
  onMouseLeaveSidenav = () => {
    if (!document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.remove("g-sidenav-show");
    }
  }; */
  // this creates the intial state of this component based on the collapse routes
  // that it gets through this.props.routes
  getCollapseStates = (routes) => {
    let initialState = {};
    routes.map((prop, key) => {
      if (prop.collapse) {
        initialState = {
          [prop.state]: this.getCollapseInitialState(prop.views),
          ...this.getCollapseStates(prop.views),
          ...initialState,
        };
      }
      return null;
    });
    return initialState;
  };

  // this verifies if any of the collapses should be default opened on a rerender of this component
  // for example, on the refresh of the page,
  // while on the src/views/forms/RegularForms.js - route /admin/regular-forms
  getCollapseInitialState(routes) {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse && this.getCollapseInitialState(routes[i].views)) {
        return true;
      } else if (window.location.href.indexOf(routes[i].path) !== -1) {
        return true;
      }
    }
    return false;
  }

  // this is used on mobile devices, when a user navigates
  // the sidebar will autoclose
  closeSidenav = () => {
    if (window.innerWidth < 1200) {
      this.props.toggleSidenav();
    }
  };

  // this function creates the links and collapses that appear in the sidebar (left menu)
  createLinks = (routes) => {
    return routes.map((prop, key) => {
      if (prop.redirect) {
        return null;
      }
      if (
        this.props.user.session_type === sessionType.TEAM &&
        !this.props.user.is_admin &&
        prop.name === "Billing"
      ) {
        return null;
      }
      if (prop.collapse) {
        const st = {};
        st[prop.state] = !this.state[prop.state];
        const arrayPath = prop.views.map((collapse) => {
          return collapse.path;
        });
        const isCampaign =
          this.props.location.pathname.slice(10).includes("/campaign/") &&
          prop.name == "Campaign";

        return (
          <NavItem key={key}>
            <NavLink
              href="#"
              data-toggle="collapse"
              aria-expanded={this.state[prop.state]}
              className={classnames({
                active: this.getCollapseInitialState(prop.views),
              })}
              onClick={(e) => {
                e.preventDefault();
                this.setState(st);
              }}
            >
              {prop.icon && (
                <>
                  {(arrayPath.includes(
                    this.props.location.pathname.slice(10)
                  ) ||
                    isCampaign) && <div className="margin-left-pink" />}
                  <img
                    src={
                      arrayPath.includes(
                        this.props.location.pathname.slice(10)
                      ) || isCampaign
                        ? prop.activeIcon
                        : prop.icon
                    }
                    style={prop.principal ? { width: 20 } : { width: 15 }}
                  />
                  <span
                    className={
                      prop.principal
                        ? "nav-link-text nav-link-text-principal"
                        : "nav-link-text nav-link-text-collapse "
                    }
                    style={{
                      color:
                        arrayPath.includes(
                          this.props.location.pathname.slice(10)
                        ) || isCampaign
                          ? "#FF60C6"
                          : "#717579",
                      marginLeft: 10,
                    }}
                  >
                    {prop.name}
                  </span>
                </>
              )}
            </NavLink>
            <Collapse isOpen={this.state[prop.state]}>
              <Nav
                className="nav-sm flex-column"
                style={prop.principal ? { paddingLeft: 10 } : ""}
              >
                {this.createLinks(prop.views)}
                {/* .filter(({open}) => open) */}
              </Nav>
            </Collapse>
          </NavItem>
        );
      }
      return (
        <NavItem
          className={
            !prop.principal
              ? `${this.activeRoute(
                  prop.layout + prop.path
                )} padding-navbar-collapse nav-link-collapse`
              : this.activeRoute(prop.layout + prop.path)
          }
          key={key}
        >
          <NavLink
            href={prop.layout + prop.path}
            className={prop.principal ? "" : "nav-link-collapse"}
            onClick={this.closeSidenav}
            // tag={NavLinkRRD}
          >
            {prop.icon !== undefined ? (
              <>
                {this.props.location.pathname.slice(10) == prop.path && (
                  <div className="margin-left-pink-collapse" />
                )}
                <img
                  src={
                    this.props.location.pathname.slice(10) == prop.path
                      ? prop.activeIcon
                      : prop.icon
                  }
                  style={prop.principal ? { width: 20 } : { width: 15 }}
                />
                <span
                  className={
                    prop.principal
                      ? "nav-link-text nav-link-text-principal"
                      : "nav-link-text nav-link-text-collapse "
                  }
                  style={{
                    color:
                      this.props.location.pathname.slice(10) == prop.path
                        ? "#FF60C6"
                        : "#717579",
                    marginLeft: 10,
                  }}
                >
                  {prop.name}
                </span>
              </>
            ) : prop.miniName !== undefined ? (
              <>
                <span className="sidenav-mini-icon"> {prop.miniName} </span>
                <span
                  className={
                    prop.principal
                      ? "sidenav-normal nav-link-text-principal"
                      : "sidenav-normal nav-link-text-collapse "
                  }
                  style={{
                    color:
                      this.props.location.pathname.slice(10) == prop.path
                        ? "#FF60C6"
                        : "#717579",

                    paddingLeft: 18,
                  }}
                >
                  {" "}
                  {prop.name}{" "}
                </span>
              </>
            ) : (
              prop.name
            )}
          </NavLink>
        </NavItem>
      );
    });
  };

  render() {
    const { routes, logo, user } = this.props;

    let navbarBrandProps;
    if (logo && logo.innerLink) {
      navbarBrandProps = {
        to: logo.innerLink,
        tag: Link,
      };
    } else if (logo && logo.outterLink) {
      navbarBrandProps = {
        href: logo.outterLink,
        target: "_blank",
      };
    }
    const scrollBarInner = (
      <div className="scrollbar-inner">
        <div className="sidenav-header d-flex align-items-center">
          {logo ? (
            <NavbarBrand {...navbarBrandProps} to="/app/" tag={Link}>
              {
                <img
                  alt={logo.imgAlt}
                  className="navbar-brand-img"
                  src={logo.imgSrc}
                />
              }
            </NavbarBrand>
          ) : null}
          <div className="ml-auto menu-barr">
            <div
              className="sidenav-toggler d-none d-xl-block "
              onClick={this.props.toggleSidenav}
            >
              <div className="sidenav-toggler-inner">
                <i className="sidenav-toggler-line" />
                <i className="sidenav-toggler-line" />
                <i className="sidenav-toggler-line" />
              </div>
            </div>
          </div>
        </div>
        <div className="navbar-inner">
          <p className="text-tools">Your Toolbox</p>
          <Collapse navbar isOpen={true}>
            <Nav navbar>{this.createLinks(routes)}</Nav>
          </Collapse>
        </div>
      </div>
    );
    return (
      <Navbar
        className={
          "sidenav navbar-vertical navbar-expand-xs navbar-light bg-white " +
          (this.props.rtlActive ? "" : "fixed-left")
        }
        /* onMouseEnter={this.onMouseEnterSidenav}
    onMouseLeave={this.onMouseLeaveSidenav} */
      >
        {navigator.platform.indexOf("Win") > -1 ? (
          <PerfectScrollbar>{scrollBarInner}</PerfectScrollbar>
        ) : (
          scrollBarInner
        )}
      </Navbar>
    );
  }
}

Sidebar.defaultProps = {
  routes: [{}],
  toggleSidenav: () => {},
  sidenavOpen: false,
  rtlActive: false,
};

Sidebar.propTypes = {
  // function used to make sidenav mini or normal
  toggleSidenav: PropTypes.func,
  // prop to know if the sidenav is mini or normal
  sidenavOpen: PropTypes.bool,
  // links that will be displayed inside the component
  routes: PropTypes.arrayOf(PropTypes.object),
  // logo
  logo: PropTypes.shape({
    // innerLink is for links that will direct the user within the app
    // it will be rendered as <Link to="...">...</Link> tag
    innerLink: PropTypes.string,
    // outterLink is for links that will direct the user outside the app
    // it will be rendered as simple <a href="...">...</a> tag
    outterLink: PropTypes.string,
    // the image src of the logo
    // imgSrc: PropTypes.string.isRequired,
    // the alt for the img
    imgAlt: PropTypes.string.isRequired,
  }),
  // rtl active, this will make the sidebar to stay on the right side
  rtlActive: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps, {})(Sidebar);
