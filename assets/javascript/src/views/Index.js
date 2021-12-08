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
import React, { Component } from "react";
// react library for routing
import { Link } from "react-router-dom";
// reactstrap components
import {
  Badge,
  Button,
  Card,
  CardBody,
  Container,
  Row,
  Col,
  UncontrolledTooltip
} from "reactstrap";
// core components
import IndexNavbar from "../components/Navbars/IndexNavbar.js";
import IndexHeader from "../components/Headers/IndexHeader.js";
import AuthFooter from "../components/Footers/AuthFooter.js";

class Index extends Component {
  render() {
    return (
      <>
        <IndexNavbar />
        <div className="main-content">
          <IndexHeader />
          <section className="py-6 pb-9 bg-default">
            <Container fluid>
              <Row className="justify-content-center text-center">
                <Col md="6">
                  <h2 className="display-3 text-white">
                    Currently in beta
                  </h2>
                  <p className="lead text-white">
                    We are launching soon!
                  </p>
                </Col>
              </Row>
            </Container>
          </section>
        </div>
        <AuthFooter />
      </>
    );
  }
}

export default Index;
