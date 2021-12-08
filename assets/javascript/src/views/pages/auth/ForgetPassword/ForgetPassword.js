import classnames from "classnames";
import React, { Component } from "react";
import { Link } from "react-router-dom";
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
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Label,
  Row,
} from "reactstrap";

import axios from "../../../../utils/axios";

export default class ForgetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      sent: false,
      loading: false,
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const { email } = this.state;

    this.setState({ loading: true });
    axios
      .post(`/rest-auth/password/reset/`, { email: email })
      .then((response) => {
        // toastOnSuccess("Password reset e-mail has been sent");
        this.setState({ sent: true });
      })
      .catch(console.log)
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  render() {
    const { sent, loading } = this.state;

    return (
      <>
        <div
          className="auth login"
          style={{
            backgroundImage: `url(${STATIC_FILES.background_auth}), linear-gradient(180deg, #111111 0%, #333333 100%)`,
          }}
        >
          <Row className="justify-content-center background-auth forget-password">
            <Col lg="6" md="8" sm="10" xs="10">
              <Card className="bg-secondary border-0 mb-0">
                <CardHeader className="bg-transparent px-lg-5 ">
                  <div className="text-left mt-3 mb-4">
                    <div>
                      <small className="title text-black">
                        Forget Password
                      </small>
                    </div>
                    <div>
                      <small className="sub-title text-black">
                        Please enter the email which you are registered
                      </small>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="px-lg-5 py-lg-5">
                  <Form
                    onSubmit={this.handleSubmit}
                    role="form"
                    style={{ height: 150 }}
                  >
                    {sent ? (
                      <>
                        <label className="d-flex justify-content-center pt-5">
                          <span className="text-black ff-poppins text-bold">
                            Password reset e-mail has been sent!
                          </span>
                        </label>
                      </>
                    ) : (
                      <>
                        <FormGroup
                          className={classnames("mb-3", {
                            focused: this.state.focusedEmail,
                          })}
                        >
                          <label className="form-control-label label-input">
                            Email
                          </label>

                          <Input
                            placeholder="Your email"
                            name="email"
                            type="email"
                            className="input"
                            onChange={this.handleChange}
                            value={this.state.email}
                            autoComplete="on"
                          />
                        </FormGroup>
                        <div className="text-center">
                          <Button
                            className="mt-4 mb-4 button-fuchsia"
                            type="submit"
                            color="info"
                          >
                            Send password reset email
                          </Button>
                        </div>
                      </>
                    )}
                  </Form>
                  <Row className="mt-3">
                    <Col xs="6">
                      <span className="sub-title  text-black ">
                        Already have account
                      </span>
                    </Col>
                    <Col xs="6" className="text-right center-vertical ">
                      <Link
                        className="sub-title underline text-black text-bold"
                        to="/app/auth/login"
                      >
                        Log In
                      </Link>
                    </Col>
                  </Row>
                </CardBody>
                {loading && (
                  <div className="auth-loading-wrapper">
                    <i className="ml-2 fas fa-spinner fa-spin"></i>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}
