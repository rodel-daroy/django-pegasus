// nodejs library to set properties for components
import PropTypes from "prop-types";
import React from "react";
// reactstrap components
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Container,
  Row,
} from "reactstrap";

function PageHeader({ current, parent, showStatus, showBreadcrumb }) {
  return (
    <>
      <div className="header bg-info pb-5">
        <Container fluid>
          <div className="header-body">
            {(showBreadcrumb == undefined || showStatus) && (
              <Row className="align-items-center pb-3  px-0">
                <Col lg="6" xs="7" className="px-0">
                  {/* <h6 className="h2 text-white d-inline-block mb-0">{current}</h6>{" "} */}
                  <Breadcrumb
                    className="d-none d-md-inline-block ml-md-4"
                    listClassName="breadcrumb-links breadcrumb-dark"
                  >
                    <BreadcrumbItem>
                      <a href="#pablo" onClick={(e) => e.preventDefault()}>
                        <i className="fa fa-home fa-lg" />
                      </a>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                      <a href="#pablo" onClick={(e) => e.preventDefault()}>
                        {parent}
                      </a>
                    </BreadcrumbItem>
                    <BreadcrumbItem aria-current="page" className="active">
                      {current}
                    </BreadcrumbItem>
                  </Breadcrumb>
                </Col>
              </Row>
            )}

            {(showStatus === undefined || showStatus) && (
              <Row>
                <Col md="3" xl="3" sm="6" xs="6">
                  <Card className="card-stats">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle
                            tag="h5"
                            className="text-uppercase text-muted mb-0"
                          >
                            Campaigns
                          </CardTitle>
                          <span className="h1 font-weight-bold mb-0">76</span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-gradient-red text-white rounded-circle shadow">
                            <i className="ni ni-active-40" />
                          </div>
                        </Col>
                      </Row>
                      <p className="mt-3 mb-0 text-sm">
                        <span className="text-success mr-2">53%</span>{" "}
                      </p>
                    </CardBody>
                  </Card>
                </Col>
                <Col md="3" xl="3" sm="6" xs="6">
                  <Card className="card-stats">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle
                            tag="h5"
                            className="text-uppercase text-muted mb-0"
                          >
                            Started
                          </CardTitle>
                          <span className="h1 font-weight-bold mb-0">12</span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-gradient-orange text-white rounded-circle shadow">
                            <i className="ni ni-chart-pie-35" />
                          </div>
                        </Col>
                      </Row>
                      <p className="mt-3 mb-0 text-sm">
                        <span className="text-success mr-2">5%</span>{" "}
                      </p>
                    </CardBody>
                  </Card>
                </Col>
                <Col md="3" xl="3" sm="6" xs="6">
                  <Card className="card-stats">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle
                            tag="h5"
                            className="text-uppercase text-muted mb-0"
                          >
                            Paused
                          </CardTitle>
                          <span className="h1 font-weight-bold mb-0">42</span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-gradient-green text-white rounded-circle shadow">
                            <i className="ni ni-money-coins" />
                          </div>
                        </Col>
                      </Row>
                      <p className="mt-3 mb-0 text-sm">
                        <span className="text-success mr-2">32%</span>{" "}
                      </p>
                    </CardBody>
                  </Card>
                </Col>
                <Col md="3" xl="3" sm="6" xs="6">
                  <Card className="card-stats">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle
                            tag="h5"
                            className="text-uppercase text-muted mb-0"
                          >
                            Mail Accounts
                          </CardTitle>
                          <span className="h1 font-weight-bold mb-0">10</span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-gradient-primary text-white rounded-circle shadow">
                            <i className="ni ni-email-83" />
                          </div>
                        </Col>
                      </Row>
                      <p className="mt-3 mb-0 text-sm">
                        <span className="text-success mr-2"> </span>{" "}
                      </p>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            )}
          </div>
        </Container>
      </div>
    </>
  );
}

PageHeader.propTypes = {
  current: PropTypes.string,
  parent: PropTypes.string,
};

export default PageHeader;
