import classnames from "classnames";
import React, { Component } from "react";
import ReactQuill from "react-quill";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Modal,
  Nav,
  NavItem,
  NavLink,
  Row,
} from "reactstrap";

import { SaveIcon } from "../../../../../components/icons";

const initialState = {
  id:null,
  email_provider: "SMTP",
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  smtp_host: "",
  smtp_port: "",
  smtp_username: "",
  smtp_password: "",
  use_smtp_ssl: false,
  imap_host: "",
  imap_port: "",
  imap_username: "",
  imap_password: "",
  use_imap_ssl: false,
  has_error: false,
  error_was_notified: false,
  send_from_name: "",
  signature: "",
};

export default class DetailModal extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  _emailBodyQuill = {
    ref: null,
  };

  componentDidUpdate(prevProps) {
    if (this.props.data != prevProps.data) {
      if (this.props.data) {
        this.setState({ ...this.props.data });
      } else {
        this.setState({ ...initialState });
      }
    }
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const mailAccount = Object.assign({}, this.state);

    if (this.state.id) {
      console.log("update:", this.state);
      this.props.update(mailAccount);
    } else {
      console.log("create:", this.state);
      this.props.create(mailAccount);
    }
  };

  render() {
    return (
      <>
        <Modal
          isOpen={this.props.isOpen}
          toggle={this.props.close}
          size="lg"
          className="modal-customized"
        >
          <Form onSubmit={this.handleSubmit}>
            <Card className="no-shadow">
              <CardHeader className="pb-0 ml-0 mr-0 row">
                <div onClick={this.props.close} className="arrow-back">
                  <img src={STATIC_FILES.arrow_back} />
                </div>
                <p className="title-modal">Connect a Email Account</p>
              </CardHeader>
              <CardBody className="pt-3 pb-0">
                <Row>
                  <Col>
                    <Nav pills>
                      <NavItem>
                        <NavLink
                          className={classnames({
                            active: this.state.email_provider == "SMTP",
                          })}
                          onClick={() => {
                            this.setState({ email_provider: "SMTP" });
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="btn-inner--icon mr-2">
                            <i className="fas fa-envelope" />
                          </span>
                          <span className="btn-inner--text">SMTP</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({
                            active: this.state.email_provider == "Google",
                          })}
                          onClick={() => {
                            this.setState({ email_provider: "Google" });
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="btn-inner--icon mr-2">
                            <i className="fab fa-google" />
                          </span>
                          <span className="btn-inner--text">GOOGLE</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({
                            active: this.state.email_provider == "Microsoft",
                          })}
                          onClick={() => {
                            this.setState({ email_provider: "Microsoft" });
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="btn-inner--icon mr-2">
                            <i className="fab fa-microsoft" />
                          </span>
                          <span className="btn-inner--text">MICROSOFT</span>
                        </NavLink>
                      </NavItem>
                    </Nav>

                    <Row className="mt-3">
                      <Col md={6}>
                        <FormGroup className="mb-2">
                          <label className="label-modal" htmlFor="email">
                            EMAIL
                          </label>
                          <Input
                            id="email"
                            name="email"
                            placeholder="Email"
                            className="form-control-sm input-customized"
                            onChange={this.handleChange}
                            value={this.state.email}
                            required
                          />
                        </FormGroup>

                        {this.state.email_provider == "Google" && (
                          <>
                            <FormGroup className="mb-2">
                              <label className="label-modal" htmlFor="password">
                                PASSWORD
                              </label>
                              <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Password"
                                className="form-control-sm input-customized"
                                onChange={this.handleChange}
                                value={this.state.password}
                                required
                              />
                            </FormGroup>
                          </>
                        )}

                        {this.state.email_provider == "Microsoft" && (
                          <>
                            <FormGroup className="mb-2">
                              <label className="label-modal" htmlFor="password">
                                PASSWORD
                              </label>
                              <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Password"
                                className="form-control-sm input-customized"
                                onChange={this.handleChange}
                                value={this.state.password}
                                required
                              />
                            </FormGroup>
                          </>
                        )}

                        <FormGroup className="mb-2">
                          <label className="label-modal" htmlFor="first_name">
                            FIRST NAME
                          </label>
                          <Input
                            id="first_name"
                            name="first_name"
                            type="text"
                            placeholder="First Name"
                            className="form-control-sm input-customized"
                            onChange={this.handleChange}
                            value={this.state.first_name}
                            required
                          />
                        </FormGroup>

                        <FormGroup className="mb-2">
                          <label className="label-modal" htmlFor="last_name">
                            LAST NAME
                          </label>
                          <Input
                            id="last_name"
                            name="last_name"
                            type="text"
                            placeholder="Last Name"
                            className="form-control-sm input-customized"
                            onChange={this.handleChange}
                            value={this.state.last_name}
                            required
                          />
                        </FormGroup>
                        {
                          this.state.email_provider == "SMTP" &&
                            <>
                              <FormGroup className="mb-2">
                                <label className="label-modal" htmlFor="send_from_name">
                                  SEND FROM NAME
                                </label>
                                <Input
                                  id="send_from_name"
                                  name="send_from_name"
                                  type="text"
                                  maxLength={200}
                                  placeholder="Send From Name"
                                  className="form-control-sm input-customized"
                                  onChange={this.handleChange}
                                  value={this.state.send_from_name}
                                  required
                                />
                              </FormGroup>
                              <FormGroup className="mb-2">
                                <label className="label-modal">SIGNATURE</label>
                                <ReactQuill
                                  id="react-quill"
                                  placeholder="Write your signature..."
                                  ref={(ref) => (this._emailBodyQuill.ref = ref)}
                                  onChange={(value) => {
                                    this.setState({ signature: value });
                                  }}
                                  value={this.state.signature}
                                  className="Quill_div container_subject"
                                  modules={{
                                    toolbar: [
                                      ["bold", "italic"],
                                      ["link", "blockquote", "code"],
                                      [
                                        {
                                          list: "ordered",
                                        },
                                        {
                                          list: "bullet",
                                        },
                                      ],
                                    ],
                                  }}
                                  formats={{
                                    formats: [
                                      ["bold", "italic"],
                                      ["link", "blockquote", "code"],
                                      ["list", "bullet"],
                                    ],
                                  }}
                                />
                              </FormGroup>
                          </>

                        }

                      </Col>
                      <Col md={6}>
                        {this.state.email_provider == "SMTP" && (
                          <>
                            <FormGroup className="mb-2">
                              <label
                                className="label-modal"
                                htmlFor="smtp_username"
                              >
                                SMTP USER NAME
                              </label>
                              <Input
                                id="smtp_username"
                                name="smtp_username"
                                type="text"
                                placeholder="SMTP User Name"
                                className="form-control-sm input-customized"
                                onChange={this.handleChange}
                                value={this.state.smtp_username}
                                required
                              />
                            </FormGroup>

                            <FormGroup className="mb-2">
                              <label
                                className="label-modal"
                                htmlFor="smtp_password"
                              >
                                SMTP PASSWORD
                              </label>
                              <Input
                                id="smtp_password"
                                name="smtp_password"
                                type="password"
                                placeholder="SMTP Password"
                                className="form-control-sm input-customized"
                                onChange={this.handleChange}
                                value={this.state.smtp_password}
                                required
                              />
                            </FormGroup>

                            <Row>
                              <Col>
                                <FormGroup className="mb-2">
                                  <label
                                    className="label-modal"
                                    htmlFor="smtp_host"
                                  >
                                    SMTP HOST
                                  </label>
                                  <Input
                                    id="smtp_host"
                                    name="smtp_host"
                                    type="text"
                                    placeholder="SMTP Host"
                                    className="form-control-sm input-customized"
                                    onChange={this.handleChange}
                                    value={this.state.smtp_host}
                                    required
                                  />
                                </FormGroup>
                              </Col>
                              <Col>
                                <FormGroup className="mb-2">
                                  <label
                                    className="label-modal"
                                    htmlFor="smtp_port"
                                  >
                                    SMTP PORT
                                  </label>
                                  <Input
                                    id="smtp_port"
                                    name="smtp_port"
                                    type="text"
                                    placeholder="SMTP Port"
                                    className="form-control-sm input-customized"
                                    onChange={this.handleChange}
                                    value={this.state.smtp_port}
                                    required
                                  />
                                </FormGroup>
                              </Col>
                            </Row>

                            <div className="custom-control custom-checkbox mb-3">
                              <input
                                className="custom-control-input"
                                id="use_smtp_ssl"
                                name="use_smtp_ssl"
                                type="checkbox"
                                checked={this.state.use_smtp_ssl}
                                onChange={(e) => {
                                  this.handleChange({
                                    target: {
                                      name: e.target.name,
                                      value: e.target.checked,
                                    },
                                  });
                                }}
                              />
                              <label
                                className="custom-control-label label-modal"
                                htmlFor="use_smtp_ssl"
                              >
                                USE SMTP SSL/TLS
                              </label>
                            </div>

                            <FormGroup className="mb-2">
                              <label
                                className="label-modal"
                                htmlFor="imap_username"
                              >
                                IMAP USER NAME
                              </label>
                              <Input
                                id="imap_username"
                                name="imap_username"
                                type="text"
                                placeholder="IMAP User Name"
                                className="form-control-sm input-customized"
                                onChange={this.handleChange}
                                value={this.state.imap_username}
                                required
                              />
                            </FormGroup>

                            <FormGroup className="mb-2">
                              <label
                                className="label-modal"
                                htmlFor="imap_password"
                              >
                                IMAP PASSWORD
                              </label>
                              <Input
                                id="imap_password"
                                name="imap_password"
                                type="password"
                                placeholder="IMAP Password"
                                className="form-control-sm input-customized"
                                onChange={this.handleChange}
                                value={this.state.imap_password}
                                required
                              />
                            </FormGroup>

                            <Row>
                              <Col>
                                <FormGroup className="mb-2">
                                  <label
                                    className="label-modal"
                                    htmlFor="imap_host"
                                  >
                                    IMAP HOST
                                  </label>
                                  <Input
                                    id="imap_host"
                                    name="imap_host"
                                    type="text"
                                    placeholder="IMAP Host"
                                    className="form-control-sm input-customized"
                                    onChange={this.handleChange}
                                    value={this.state.imap_host}
                                    required
                                  />
                                </FormGroup>
                              </Col>
                              <Col>
                                <FormGroup className="mb-2">
                                  <label
                                    className="label-modal"
                                    htmlFor="imap_port"
                                  >
                                    IMAP PORT
                                  </label>
                                  <Input
                                    id="imap_port"
                                    name="imap_port"
                                    type="text"
                                    placeholder="IMAP Port"
                                    className="form-control-sm input-customized"
                                    onChange={this.handleChange}
                                    value={this.state.imap_port}
                                    required
                                  />
                                </FormGroup>
                              </Col>
                            </Row>

                            <div className="custom-control custom-checkbox mb-3">
                              <input
                                className="custom-control-input"
                                id="use_imap_ssl"
                                name="use_imap_ssl"
                                type="checkbox"
                                checked={this.state.use_imap_ssl}
                                onChange={(e) => {
                                  this.handleChange({
                                    target: {
                                      name: e.target.name,
                                      value: e.target.checked,
                                    },
                                  });
                                }}
                              />
                              <label
                                className="custom-control-label label-modal"
                                htmlFor="use_imap_ssl"
                              >
                                USE IMAP SSL/TLS
                              </label>
                            </div>
                          </>
                        )}
                      </Col>
                      { ["Google", "Microsoft"].includes(this.state.email_provider) &&
                      <Col md={6}>
                        <FormGroup className="mb-2">
                          <label className="label-modal" htmlFor="send_from_name">
                            SEND FROM NAME
                          </label>
                          <Input
                            id="send_from_name"
                            name="send_from_name"
                            type="text"
                            maxLength={200}
                            placeholder="Send From Name"
                            className="form-control-sm input-customized"
                            onChange={this.handleChange}
                            value={this.state.send_from_name}
                            required
                          />
                        </FormGroup>
                        <FormGroup className="mb-2">
                          <label className="label-modal">SIGNATURE</label>
                          <ReactQuill
                            id="react-quill"
                            placeholder="Write your signature..."
                            ref={(ref) => (this._emailBodyQuill.ref = ref)}
                            onChange={(value) => {
                              this.setState({ signature: value });
                            }}
                            value={this.state.signature}
                            className="Quill_div container_subject"
                            modules={{
                              toolbar: [
                                ["bold", "italic"],
                                ["link", "blockquote", "code"],
                                [
                                  {
                                    list: "ordered",
                                  },
                                  {
                                    list: "bullet",
                                  },
                                ],
                              ],
                            }}
                            formats={{
                              formats: [
                                ["bold", "italic"],
                                ["link", "blockquote", "code"],
                                ["list", "bullet"],
                              ],
                            }}
                          />
                        </FormGroup>
                      </Col> }
                    </Row>
                  </Col>
                </Row>

                <Row className="mt-2">
                  <Col md={6}>
                    <Button
                      type="submit"
                      color="danger"
                      block
                      className="color-button"
                    >
                      <SaveIcon /> <p>SAVE EMAIL</p>
                    </Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Form>
        </Modal>
      </>
    );
  }
}
