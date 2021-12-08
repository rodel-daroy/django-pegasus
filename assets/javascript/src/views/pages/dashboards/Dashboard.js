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
// importing routing module
import { Link } from "react-router-dom";

import PageContainer from "../../../components/Containers/PageContainer";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Row,
  CardText,
  Spinner
} from "reactstrap";
class Dashboard extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() { }

  render() {
    const { campaigns } = this.props;

    return (
      <>
        <PageContainer title="Welcome to Mailerrize">
          <Row>

            <Container fluid>
              <Row className="mt-5 mb-5">
                <Col lg={4} md={6} sm={12}>
                  {this.props.user.user_permission !== "read" && (
                    <Link to="/app/admin/campaign/create">
                      <Button className="btn-icon" color="primary" type="button">
                        <span className="btn-inner--icon mr-1">
                          <i className="ni ni-fat-add" />
                        </span>
                        <span className="btn-inner--text">NEW CAMPAIGN</span>
                      </Button>
                    </Link>
                  )}
                </Col>
              </Row>

              <Row className="mt-5 mb-5">

                <Col lg={4} md={6} sm={12}>
                  <Card>
                    <CardBody>
                      <div className="pt-4 ">
                        <h5 className="h3 title">
                          <span className="d-block mb-1">Step 1:</span>
                          <small className="h4 font-weight-light text-muted">
                            Learn how to add a mail account.<br /><br />
                          </small>
                        </h5>
                        <div className="mt-3">
                          <a href="https://www.mailerrize.com/support-post/how-to-add-email-accounts" target="_blank" className="btn-icon" color="primary" type="button">

                            <span className="btn-inner--text">Watch now</span>
                            <span className="btn-inner--icon mr-1">
                              <i className="ni ni-bold-right" />
                            </span>
                          </a>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg={4} md={6} sm={12}>
                  <Card>
                    <CardBody>

                      <div className="pt-4 ">
                        <h5 className="h3 title">
                          <span className="d-block mb-1">Step 2:</span>
                          <small className="h4 font-weight-light text-muted">
                            Learn how to use custom tracking domains for better deliverability.

                    </small>
                        </h5>
                        <div className="mt-3">
                          <a href="https://www.mailerrize.com/support-post/custom-tracking-domains" target="_blank" className="btn-icon" color="primary" type="button">

                            <span className="btn-inner--text">Watch now</span>
                            <span className="btn-inner--icon mr-1">
                              <i className="ni ni-bold-right" />
                            </span>
                          </a>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg={4} md={6} sm={12}>
                  <Card>
                    <CardBody>

                      <div className="pt-4 ">
                        <h5 className="h3 title">
                          <span className="d-block mb-1">Step 3:</span>
                          <small className="h4 font-weight-light text-muted">
                            Join the private Telegram group.<br /><br />
                          </small>
                        </h5>
                        <div className="mt-3">
                          <a href="https://t.me/joinchat/kLrzBZHbn3gzZTRh" target="_blank" className="btn-icon" color="primary" type="button">
                            <span className="btn-inner--text">Join now</span>
                            <span className="btn-inner--icon mr-1">
                              <i className="ni ni-bold-right" />
                            </span>
                          </a>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Container>

          </Row>
        </PageContainer>


      </>
    );
  }
}

// export default Dashboard;

const mapStateToProps = (state) => {
  return {
    campaigns: state.CampaignTableReducer.CampaignTableData,
    user: state.auth.user,
  };
};
export default connect(mapStateToProps)(Dashboard);
