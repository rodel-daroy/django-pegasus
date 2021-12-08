import React from "react";
import { Container, Row, Col, Input, Card, CardBody } from "reactstrap";

export default function OverviewActivity() {
  return (
    <>
      {/* <Container fluid>
        <Row>
          <Col>
            <Card className="card-summary-funnel mb-0">
              <div className="funnel-item-header px-3 pt-3 align-items-center">
                <span className="mr-3">GOOD TEST</span>
                <Badge color="danger" pill>
                  2 Recipients
                </Badge>
              </div>
              <CardBody className="pt-0 pb-3">
                <Row>
                  {
                    ["OPENED", "CLICKED", "REPLIED", "BOUNCED", "UNSUBSCRIBED"].map((item, index) => 
                    <Col className="detail-item px-1 px-md-2" key={"summary" + index}>
                      <Card className="card-stats mb-0">
                        <CardBody className="p-1 square-box-60">
                          <div className="dummy"></div>
                          <div className="content d-flex flex-column justify-content-around align-items-center mx-0">
                            <span className="h2 font-weight-bold mb-0">
                              0
                            </span>
                            <CardTitle
                              tag="h5"
                              className="text-uppercase text-muted mb-0"
                            >
                              {item}
                            </CardTitle>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>)
                  }
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card className="card-summary-funnel mb-0 mt-3">
              <div className="funnel-item-header px-4 pt-3">
                <span className="mr-3">FOLLOW UP</span>
                <Badge color="danger" pill>
                  Recipients
                </Badge>
              </div>
              <CardBody className="pt-0 pb-3">
                <Row>
                  <Col className="detail-item px-1 px-md-2">
                    <Card className="card-stats mb-0">
                      <CardBody className="p-1 square-box-60">
                        <div className="dummy"></div>
                        <div className="content d-flex flex-column justify-content-around align-items-center mx-0">
                          <span className="h2 font-weight-bold mb-0">
                            
                          </span>
                          <CardTitle
                            tag="h5"
                            className="text-uppercase text-muted mb-0"
                          >
                            OPENED
                          </CardTitle>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col className="detail-item px-1 px-md-2">
                    <Card className="card-stats mb-0">
                      <CardBody className="p-1 square-box-60">
                        <div className="dummy"></div>
                        <div className="content d-flex flex-column justify-content-around align-items-center mx-0">
                          <span className="h2 font-weight-bold mb-0">
                            0
                          </span>
                          <CardTitle
                            tag="h5"
                            className="text-uppercase text-muted mb-0"
                          >
                            CLICKED
                          </CardTitle>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col className="detail-item px-1 px-md-2">
                    <Card className="card-stats mb-0">
                      <CardBody className="p-1 square-box-60">
                        <div className="dummy"></div>
                        <div className="content d-flex flex-column justify-content-around align-items-center mx-0">
                          <span className="h2 font-weight-bold mb-0">
                          </span>
                          <CardTitle
                            tag="h5"
                            className="text-uppercase text-muted mb-0"
                          >
                            REPLIED
                          </CardTitle>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col className="detail-item px-1 px-md-2">
                    <Card className="card-stats mb-0">
                      <CardBody className="p-1 square-box-60">
                        <div className="dummy"></div>
                        <div className="content d-flex flex-column justify-content-around align-items-center mx-0">
                          <span className="h2 font-weight-bold mb-0">
                            0
                          </span>
                          <CardTitle
                            tag="h5"
                            className="text-uppercase text-muted mb-0"
                          >
                            BOUNCED
                          </CardTitle>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col className="detail-item px-1 px-md-2">
                    <Card className="card-stats mb-0">
                      <CardBody className="p-1 square-box-60">
                        <div className="dummy"></div>
                        <div className="content d-flex flex-column justify-content-around align-items-center mx-0">
                          <span className="h2 font-weight-bold mb-0">
                          </span>
                          <CardTitle
                            tag="h5"
                            className="text-uppercase text-muted mb-0"
                          >
                            UNSUBSCRIBED
                          </CardTitle>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="mt-5">
          <h1 className="display-4">TOTALS</h1>
        </Row>
        <Row className="mt-2">
          <div className="w_h-100">
            <div className="w-14">
              <h1>
                {overviewSummary.recipientCount || 0}
              </h1>
              <span className="over_sapn">RECIPIENT</span>
            </div>
            <div className="w-14">
              <h1>6</h1>
              <span className="over_sapn">IN CAMPAIGN</span>
            </div>
            <div className="w-14">
              <h1>6</h1>
              <span className="over_sapn">ENGAGED</span>
            </div>
            <div className="w-14">
              <h1>6</h1>
              <span className="over_sapn">LEADS</span>
            </div>
            <div className="w-14">
              <h1>6</h1>
              <span className="over_sapn">BOUNCES</span>
            </div>
            <div className="w-14">
              <h1>6</h1>
              <span className="over_sapn">UNSUBSCRIBES</span>
            </div>
            <div className="w-14">
              <h1>6</h1>
              <span className="over_sapn">UNSUBSCRIBES</span>
            </div>
          </div>
        </Row>
        <Row className="mt-5">
          <Col md={4}>
            <Table className="table" hover responsive>
              <thead>
                <tr>
                  <th colSpan="2">SUMMARY</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>8</td>
                  <td>Recipients</td>
                </tr>
              </tbody>
            </Table>
          </Col>
          <Col md={4}>
            <Table hover responsive>
              <thead>
                <tr>
                  <th colSpan="2">REPLIES</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>8</td>
                  <td>Recipients</td>
                </tr>
              </tbody>
            </Table>
          </Col>
          <Col md={4}>
            <Table hover responsive>
              <thead>
                <tr>
                  <th colSpan="2">LEADS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0</td>
                  <td>Recipients</td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container> */}
    </>
  );
}
