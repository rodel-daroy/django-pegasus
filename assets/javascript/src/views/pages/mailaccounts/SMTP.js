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
  Modal,
  Row,
} from "reactstrap";

export class SmtpModal extends Component {
  constructor(props) {
    super(props);
  }
  componentWillUnmount() {
    console.group("unmount in model");
  }
  render() {
    // console.log(this.props.imapPassword,"props")
    return (
      <div>
        <Modal isOpen={this.props.isOpen} toggle={this.props.toggle} size="xl">
          <Form onSubmit={this.props.handleSubmit}>
            <Card className="no-shadow">
              <CardHeader>
                <h2>Connect a mail account</h2>
                <p>How will you be sending emails?</p>
              </CardHeader>
              <CardBody>
                <Container>
                  <Row>
                    <Col md={2}>
                      <i class="fa fa-user fa-3x"></i>
                    </Col>
                    <Col md={10}>
                      <FormGroup>
                        <label
                          className="form-control-label"
                          htmlFor="exampleFormControlInput1"
                        >
                          <h4>Sending address</h4>
                          This will be the “from” name and address on your
                          emails and must be an address allowed by your email
                          provider.
                        </label>
                        <Input
                          type="email"
                          name="emailAddress"
                          value={this.props.emailAddress}
                          autoComplete="off"
                          onChange={this.props.handleChange}
                          placeholder="Email Address"
                        ></Input>
                      </FormGroup>
                      <FormGroup>
                        <Input
                          type="text"
                          name="FullName"
                          value={this.props.FullName}
                          onChange={this.props.handleChange}
                          placeholder="Full Name"
                        ></Input>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={2}>
                      <i class="fa fa-paper-plane fa-3x"></i>
                    </Col>
                    <Col md={10}>
                      <FormGroup>
                        <label
                          className="form-control-label"
                          htmlFor="exampleFormControlInput1"
                        >
                          <h4>SMTP connection</h4>
                          This information comes from your email provider and is
                          how we‘ll send your emails.
                        </label>
                        <Row>
                          <Col md={8}>
                            <Input
                              name="smtpHost"
                              value={this.props.smtpHost}
                              onChange={this.props.handleChange}
                              type="text"
                              placeholder="Host(e.g.mail.server.com)"
                            ></Input>
                          </Col>
                          <Col md={4}>
                            <Input
                              name="smtpPort"
                              type="select"
                              onChange={this.props.handleChange}
                              defaultValue="587"
                            >
                              <option value="25">25</option>
                              <option value="465">465</option>
                              <option value="587">587</option>
                              <option value="2525">2525</option>
                            </Input>
                          </Col>
                        </Row>
                      </FormGroup>
                      <FormGroup>
                        <Input
                          type="email"
                          name="emailAddress"
                          onChange={this.props.handleChange}
                          value={this.props.emailAddress}
                          placeholder="Username(usually your email address)"
                        ></Input>
                      </FormGroup>
                      <FormGroup>
                        <Input
                          type="password"
                          name="smtpPassword"
                          onChange={this.props.handleChange}
                          value={this.props.smtpPassword}
                          placeholder="Password"
                        ></Input>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={2}>
                      <i class="fa fa-inbox fa-3x"></i>
                    </Col>
                    <Col md={10}>
                      <FormGroup>
                        <label
                          className="form-control-label"
                          htmlFor="exampleFormControlInput1"
                        >
                          <h4>IMAP connection</h4>
                          This information comes from your email provider and is
                          how we‘ll check your inbox for replies.
                        </label>
                        <Row>
                          <Col md={8}>
                            <Input
                              onChange={this.props.handleChange}
                              name="imapHost"
                              value={this.props.imapHost}
                              type="text"
                              placeholder="Host(e.g.mail.server.com)"
                            ></Input>
                          </Col>
                          <Col md={4}>
                            <Input
                              type="select"
                              name="imapPort"
                              onChange={this.props.handleChange}
                              defaultValue="993"
                            >
                              <option value="143">143</option>
                              <option value="993">993</option>
                              <option value="995">995</option>
                            </Input>
                          </Col>
                        </Row>
                      </FormGroup>
                      <FormGroup>
                        <Input
                          type="email"
                          name="emailAddress"
                          onChange={this.props.handleChange}
                          value={this.props.emailAddress}
                          placeholder="Username(usually your email address)"
                        ></Input>
                      </FormGroup>
                      <FormGroup>
                        <Input
                          type="password"
                          name="imapPassword"
                          onChange={this.props.handleChange}
                          value={this.props.imapPassword}
                          placeholder="Password"
                        ></Input>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={2}>
                      <i class="fa fa-question fa-3x"></i>
                    </Col>
                    <Col md={10}>
                      <label
                        className="form-control-label"
                        htmlFor="exampleFormControlInput1"
                      >
                        <h4>Help</h4>
                        In most cases you‘ll need to contact your email provider
                        or administrator to get help connecting your mail
                        account. We‘re here to help as best we can.
                        <br />
                        Not having luck? Let Mailerrize try auto-configuration.
                      </label>
                    </Col>
                  </Row>
                </Container>
              </CardBody>
              <CardFooter className="bg-transparent text-right">
                <Button type="submit" color="danger">
                  NEXT<i className="fa fa-right-arrow "></i>
                </Button>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault,
                      this.setState({ modal: !this.props.modal });
                  }}
                >
                  CANCEL
                </Button>
              </CardFooter>
            </Card>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default SmtpModal;
