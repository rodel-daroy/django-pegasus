import React, { Component } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Row,
} from "reactstrap";

import PageContainer from "../../../components/Containers/PageContainer";

export class Setting extends Component {
  render() {
    return (
      <>
        <PageContainer>
          <Container>
            <Row>
              <Col lg={6} md={8} sm={12} className="mobile-p-0">
                <Card>
                  <CardHeader>
                    <h3 className="mb-0">Team Information</h3>
                  </CardHeader>
                  <Form className="needs-validation" noValidate>
                    <CardBody>
                      <FormGroup>
                        <label
                          className="form-control-label"
                          htmlFor="team-name"
                        >
                          Team Name
                        </label>
                        <Input
                          id="team-name"
                          placeholder="Team Name"
                          required
                          type="text"
                        />
                      </FormGroup>
                      <FormGroup>
                        <Input
                          id="bcc-email"
                          placeholder="Bcc every email"
                          required
                          type="text"
                        />
                      </FormGroup>
                    </CardBody>
                    <CardFooter className="bg-transparent">
                      <Button
                        color="info"
                        type="submit"
                        className="text-uppercase"
                      >
                        Save
                      </Button>
                      <Button
                        color="danger"
                        type="submit"
                        className="text-uppercase ml-xs-0 mt-xs-1"
                      >
                        Delete Team
                      </Button>
                    </CardFooter>
                  </Form>
                </Card>
              </Col>
            </Row>
          </Container>
          {/*
          // commented it because functionality is not implemented yet. we can uncomment and use it when we implement
          <Container>
            <h1 className="mt-5 mb-3">SENDING SETTINGS</h1>
            <Row>
              <Col md={6} sm={12} className="mobile-p-0">
                <Card>
                  <CardHeader>
                    <h3 className="mb-0">Custom tracking domains</h3>
                  </CardHeader>
                  <Form className="needs-validation" noValidate>
                    <CardBody>
                      <Row>
                        <Col>
                          <p className="mb-0">
                            Use your own domain to track opens and clicks
                          </p>
                          <p>
                            <a href="#">Learn how his works</a>
                          </p>
                          <ol>
                            <li>
                              <p className="text-muted mb-0">
                                Use your DNS provider to create a CNAME record
                                that points to{" "}

                              </p>
                            </li>
                            <li>
                              <p className="text-muted mb-0">
                                Enter your sub-domain below save these changes
                              </p>
                            </li>
                          </ol>
                          <Alert color="default">
                            <span className="alert-inner--icon">
                              <i class="fa fa-info-circle"></i>
                            </span>
                            <span className="alert-inner--text ml-1">
                              You should use a sub-domain like{" "}

                            </span>
                          </Alert>
                        </Col>
                      </Row>
                      <FormGroup>
                        <Input
                          id="your-domain-name"
                          placeholder="Your domain name"
                          required
                          type="text"
                        />
                      </FormGroup>
                    </CardBody>
                    <CardFooter className="bg-transparent">
                      <Button
                        color="info"
                        type="submit"
                        className="text-uppercase"
                      >
                        Save
                      </Button>
                    </CardFooter>
                  </Form>
                </Card>
              </Col>
              <Col md={6} sm={12} className="mobile-p-0">
                <Card>
                  <CardHeader>
                    <h3 className="mb-0">Campaign settings</h3>
                  </CardHeader>
                  <Form className="needs-validation" noValidate>
                    <CardBody>
                      <FormGroup>
                        <Input
                          id="bcc-email"
                          placeholder="Bcc every email"
                          required
                          type="text"
                        />
                      </FormGroup>
                      <FormGroup>
                        <label
                          className="form-control-label"
                          htmlFor="list-cleaning"
                        >
                          show list-cleaning feature?
                        </label>
                        <Input id="list-cleaning" required type="select">
                          <option>Yes</option>
                          <option selected>No</option>
                        </Input>
                      </FormGroup>
                      <FormGroup>
                        <label
                          className="form-control-label"
                          htmlFor="unsubscribe-link"
                        >
                          How should unsubscribe link works?
                        </label>
                        <Input id="unsubscribe-link" required type="select">
                          <option>One-Click</option>
                          <option selected>Two-click</option>
                        </Input>
                      </FormGroup>
                      <FormGroup>
                        <label
                          className="form-control-label"
                          htmlFor="enable-dialer"
                        >
                          Enable mailassas dialer
                        </label>
                        <Input id="enable-dialer" required type="select">
                          <option>Yes</option>
                          <option selected>No</option>
                        </Input>
                      </FormGroup>
                      <a href="#">looking to hookup your CRM?</a>
                    </CardBody>
                    <CardFooter className="bg-transparent">
                      <Button
                        color="info"
                        type="submit"
                        className="text-uppercase"
                      >
                        Save
                      </Button>
                    </CardFooter>
                  </Form>
                </Card>
              </Col>
            </Row>
          </Container>
          <Container>
            <h1 className="mt-5 mb-3">USEFUL LINKS</h1>
            <ListGroup>
              <ListGroupItem
                className="list-group-item-action"
                href="#"
                onClick={(e) => e.preventDefault()}
                tag="a"
              >
                CHANGE TEAMMATES
              </ListGroupItem>
              <ListGroupItem
                className="list-group-item-action"
                href="#"
                onClick={(e) => e.preventDefault()}
                tag="a"
              >
                UPDATE BILLING
              </ListGroupItem>
              <ListGroupItem
                className="list-group-item-action"
                href="#"
                onClick={(e) => e.preventDefault()}
                tag="a"
              >
                YOUR PERSONAL SETTINGS
              </ListGroupItem>
            </ListGroup>
          </Container>
          */}
        </PageContainer>
      </>
    );
  }
}

export default Setting;
