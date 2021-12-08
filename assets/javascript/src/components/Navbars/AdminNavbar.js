// nodejs library that concatenates classes
import classnames from "classnames";
// nodejs library to set properties for components
import PropTypes from "prop-types";
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
import { connect } from "react-redux";
// reactstrap components
import {
  Col,
  Collapse,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  Media,
  Nav,
  NavItem,
  Navbar,
  Row,
  UncontrolledDropdown,
} from "reactstrap";

import { logout } from "../../redux/action/AuthAction";
import { getProfile } from "../../redux/action/ProfileAction";

class AdminNavbar extends React.Component {
  /* componentDidMount() {
    this.props.getProfile();
  } */

  // function that on mobile devices makes the search open
  openSearch = () => {
    document.body.classList.add("g-navbar-search-showing");
    setTimeout(function () {
      document.body.classList.remove("g-navbar-search-showing");
      document.body.classList.add("g-navbar-search-show");
    }, 150);
    setTimeout(function () {
      document.body.classList.add("g-navbar-search-shown");
    }, 300);
  };

  // function that on mobile devices makes the search close
  closeSearch = () => {
    document.body.classList.remove("g-navbar-search-shown");
    setTimeout(function () {
      document.body.classList.remove("g-navbar-search-show");
      document.body.classList.add("g-navbar-search-hiding");
    }, 150);
    setTimeout(function () {
      document.body.classList.remove("g-navbar-search-hiding");
      document.body.classList.add("g-navbar-search-hidden");
    }, 300);
    setTimeout(function () {
      document.body.classList.remove("g-navbar-search-hidden");
    }, 500);
  };

  // handle logout
  handleLogout = (event) => {
    event.preventDefault();
    // const auth2 = gapi.auth2.getAuthInstance();
    // if (auth2 != null) {
    //   auth2.signOut().then(
    //     auth2.disconnect().then(console.log('LOGOUT SUCCESSFUL'))
    //   )
    // }
    this.props.logout();
  };

  getNamePage = () => {
    let name = this.props.routes.filter((prop) => {
      if (prop.collapse) {
        return;
      }
    });
  };
  pathName = {
    "/dashboard": "Dashboards",
    "/campaign/create": "Campaign",
    "/campaign/list": "Campaign",
    "/lead-catcher": "Leads",
    "/prospects": "Audiences",
    "/unsubscribes": "Unsubscribes",
    "/mail-account": "Email Accounts",
    "/mail-warming": "Email Warming",
    "/sending-calendar": "Sending Schedule",
    "/setting": "Setting",
    "/teammates": "Team Setting",
    "/billing": "Billing",
    "/redeem": "Redeem",
    "/integrations": "Automation",
    "/profile": "Profile",
    "/forgetPassword": "Forget Password",
    "/login": "Login",
    "/register": "Sing up",
    "/terms-conditions": "Terms and Conditions",
    "/404": "Not found",
  };

  render() {
    let { toggleSidenav } = this.props;
    let { sidenavOpen } = this.props;
    return (
      <>
        <Navbar
          className={classnames(
            `navbar-top navbar-expand border-bottom ${
              sidenavOpen && "nav-padding"
            }`,
            { "navbar-dark bg-info": this.props.theme === "dark" },
            { "navbar-light bg-secondary": this.props.theme === "light" }
          )}
        >
          <Container fluid>
            <Collapse navbar isOpen={true}>
              <div className="flex-row-nav">
                <Nav>
                  <NavItem className="d-xl-none">
                    <div
                      className="pr-3 sidenav-toggler menu-nav"
                      onClick={toggleSidenav}
                    >
                      <div className="sidenav-toggler-inner">
                        <i className="sidenav-toggler-line" />
                        <i className="sidenav-toggler-line" />
                        <i className="sidenav-toggler-line" />
                      </div>
                    </div>
                  </NavItem>
                </Nav>
                <Form className="navbar-search form-inline">
                  <div
                    style={{
                      textAlign: "left",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <h1 className="title-navbar ff-bold ff-poppins">
                      {this.pathName[this.props.location.pathname.slice(10)]
                        ? this.pathName[this.props.location.pathname.slice(10)]
                        : "Campaigns"}
                    </h1>
                  </div>
                </Form>
              </div>

              <Nav
                className="align-items-center ml-auto ml-md-0"
                navbar
                style={{
                  maxWidth: "500px",
                  textAlign: "right",
                  width: "270px",
                }}
              >
                <UncontrolledDropdown nav style={{ width: "100%" }}>
                  <DropdownToggle
                    className="nav-link pr-0 mr-4"
                    color=""
                    tag="a"
                  >
                    <Media className="align-items-center nav-pointer">
                      <Col className="col-8 p-0">
                        <Media className="d-sm-block opt-lang text-end">
                          <Row>
                            <span className="mb-0 text-name fw-medium ff-poppins">
                              {this.props.user !== undefined &&
                                `${this.props.user.first_name} ${this.props.user.last_name}`}
                            </span>
                          </Row>
                          <Row>
                            <span className="text-second ff-poppins fw-regular">
                              {this.props.user !== undefined &&
                                `${this.props.team ? this.props.team : ""}`}
                            </span>
                          </Row>
                        </Media>
                      </Col>
                      <Col className=" col-4 p-0">
                        <span className="avatar avatar-sm rounded-circle">
                          <img
                            alt="..."
                            src={
                              this.props.user.avatar_url
                                ? this.props.user.avatar_url
                                : STATIC_FILES.default_avatar
                            }
                            style={{ background: "ghostwhite" }}
                          />
                        </span>
                      </Col>
                    </Media>
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem className="noti-title" header tag="div">
                      <h6 className="text-overflow m-0">Welcome!</h6>
                    </DropdownItem>
                    <DropdownItem href="/app/admin/profile">
                      <i className="ni ni-single-02" />
                      <span>My profile</span>
                    </DropdownItem>
                    {/* <DropdownItem
                      href="#pablo"
                      onClick={(e) => e.preventDefault()}
                    >
                      <i className="ni ni-settings-gear-65" />
                      <span>Settings</span>
                    </DropdownItem> */}
                    <DropdownItem divider />
                    <DropdownItem onClick={this.handleLogout}>
                      <i className="ni ni-user-run" />
                      <span>Logout</span>
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </Nav>
            </Collapse>
          </Container>
        </Navbar>
      </>
    );
  }
}
AdminNavbar.defaultProps = {
  toggleSidenav: () => {},
  sidenavOpen: false,
  theme: "dark",
};
AdminNavbar.propTypes = {
  toggleSidenav: PropTypes.func,
  sidenavOpen: PropTypes.bool,
  theme: PropTypes.oneOf(["dark", "light"]),
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    socialType: state.auth.socialType,
    isLogin: state.auth.isLogin,
  };
};

export default connect(mapStateToProps, {
  getProfile,
  logout,
})(AdminNavbar);
