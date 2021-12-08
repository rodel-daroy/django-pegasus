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
/*eslint-disable*/
import React from "react";
// reactstrap components
import { Col, Container, Nav, NavItem, NavLink, Row } from "reactstrap";

class Login extends React.Component {
  render() {
    return (
      <>
        <footer className="py-5" id="footer-main">
          <Container>
            <Row className="align-items-center justify-content-xl-between">
              <Col xl="6">
                <div className="copyright text-center text-xl-left text-muted">
                  © {new Date().getFullYear()} Mailerrize
                  <a
                    className="font-weight-bold ml-1"
                    href="https://www.creative-tim.com?ref=adpr-auth-footer"
                    target="_blank"
                  >
                    {/* Creative Tim */}
                  </a>
                </div>
              </Col>
              <Col xl="6" className="justify-content-end">
                <div className="copyright text-center text-xl-right text-muted">
                  <a href="/terms" target="_blank">
                    Terms
                  </a>
                  &nbsp;and&nbsp;
                  <a href="/terms" target="_blank">
                    Condition
                  </a>
                </div>
                {/* <Nav className="nav-footer justify-content-center justify-content-xl-end">
                  <NavItem>
                    <NavLink
                      href="https://www.creative-tim.com?ref=adpr-auth-footer"
                      target="_blank"
                    >
                      Terms
                    </NavLink>
                  </NavItem>
                </Nav> */}
              </Col>
            </Row>
          </Container>
        </footer>
      </>
    );
  }
}

export default Login;
