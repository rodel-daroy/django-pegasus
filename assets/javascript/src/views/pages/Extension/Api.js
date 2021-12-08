import React, { Component } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Container,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  Row,
  Table,
} from "reactstrap";
// import Row from 'reactstrap/lib/Row'

// import CardFooter from 'reactstrap/lib/CardFooter'
// import CardBody from 'reactstrap/lib/CardBody'
// import CardHeader from 'reactstrap/lib/CardHeader'

export class Api extends Component {
  render() {
    return (
      <div>
        <div className="campaign_navbar">
          <h1
            style={{
              color: "white",
              fontSize: "20px",
              marginLeft: "20px",
              marginTop: "20px",
            }}
          >
            API
          </h1>
          <p
            style={{
              color: "white",
              fontSize: "20px",
              marginTop: "20px",
              marginRight: "20px",
            }}
          >
            <i className="fa fa-question-circle-o" aria-hidden="true"></i>
          </p>
        </div>
        <Container fluid>
          <Row>
            <Col md="7">
              <div>
                <p>
                  Get started with the Mailerrize API to automate and integrate
                  your team's campaigns. Learn how to:
                </p>
                <ul>
                  <li>Add recipients to your campaigns</li>
                  <li>Pause recipients</li>
                  <li>Create leads</li>
                  <li>React in real-time to clicks, opens, and replies</li>
                </ul>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md="4">
              <Button style={{ background: "#ffff" }}>
                <a href="">
                  <span style={{ fontSize: "15px" }}>
                    <i className="fa fa-external-link"></i>{" "}
                  </span>
                  <span style={{ fontSize: "15px" }}> view document</span>
                </a>
              </Button>
            </Col>
          </Row>
        </Container>
        {/* </div> */}
        <div style={{ marginTop: "30px" }}>
          <Container fluid>
            <Row>
              <Col md="3">
                <Card>
                  <CardHeader style={{ color: "black", border: "none" }}>
                    Api Access
                  </CardHeader>
                  <CardBody>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "12px", color: "blue" }}>
                        Api key
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "rgba(0,0,0, 0.54)",
                          marginBottom: "10px",
                        }}
                      >
                        6d8ca340-a9fe-40a1-b5f7-4bc61e420240
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "12px", color: "blue" }}>
                        Quota units per hour
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "rgba(0,0,0, 0.54)",
                          marginBottom: "10px",
                        }}
                      >
                        2,000
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "12px", color: "blue" }}>
                        Recipients you can add per month
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "rgba(0,0,0, 0.54)",
                          marginBottom: "10px",
                        }}
                      >
                        span1
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col md="4">
                <Card>
                  <CardHeader style={{ color: "black", border: "none" }}>
                    Need higher limits?
                  </CardHeader>
                  <CardBody>
                    Upgrading to Email Outreach increases your base limits.
                    Upgrading the number of users on your account multiplies
                    your base limits.
                  </CardBody>
                  <CardFooter>
                    <Button>Upgrade</Button>
                  </CardFooter>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    );
  }
}

export default Api;
