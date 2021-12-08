import classnames from "classnames";
import React, { Component } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormGroup,
  Input,
  Row,
  UncontrolledAlert,
} from "reactstrap";

import axios from "../../../../utils/axios";
import {
  showNotification,
  toastOnError,
  toastOnSuccess,
} from "../../../../utils/Utils";

export default class ResetPassword extends Component {
  constructor(props) {
    super(props);

    const uid = props.match.params.uid;
    const token = props.match.params.token;

    this.state = {
      newPassword: "",
      confirmPassword: "",
      focusedNewPassword: false,
      focusedConfirmPassword: false,
      uid: uid,
      token: token,
      loading: false,
      error: false,
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      error: false,
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const { newPassword, confirmPassword, uid, token } = this.state;

    this.setState({ loading: true, error: false });
    axios
      .post(`/rest-auth/password/reset/confirm/`, {
        uid: uid,
        token: token,
        new_password1: newPassword,
        new_password2: confirmPassword,
      })
      .then((response) => {
        toastOnSuccess("Password has been reset with the new password");
        this.props.history.push("/app/auth/login");
      })
      .catch((e) => {
        this.setState({ error: true });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  render() {
    const { loading } = this.state;

    return (
      <>
        <div
          className="auth login"
          style={{
            backgroundImage: `url(${STATIC_FILES.background_auth}), linear-gradient(180deg, #111111 0%, #333333 100%)`,
          }}
        >
          <Row className="justify-content-center background-auth forget-password">
            <Col lg="5" md="6" sm="10" xs="10">
              <Card className="bg-secondary border-0 mb-0">
                <CardHeader className="bg-transparent px-lg-5">
                  {this.state.error && (
                    <UncontrolledAlert color="danger" fade={false}>
                      <span className="alert-inner--icon">
                        <i className="ni ni-bell-55" />
                      </span>{" "}
                      <span className="alert-inner--text">
                        <strong>Error!</strong>
                        <p>The two password fields didn’t match.</p>
                      </span>
                    </UncontrolledAlert>
                  )}
                  <div className="text-left mt-3 mb-4">
                    <div>
                      <small className="title text-black">Reset Password</small>
                    </div>
                    <div>
                      <small className="sub-title text-black">
                        Please enter your new password
                      </small>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="px-lg-5 py-lg-2">
                  <Form
                    onSubmit={this.handleSubmit}
                    role="form"
                    style={{ height: 150 }}
                  >
                    <FormGroup
                      className={classnames("mb-3", {
                        focused: this.state.focusedNewPassword,
                      })}
                    >
                      <label className="form-control-label label-input">
                        New Password
                      </label>

                      <Input
                        placeholder="New Password"
                        type="password"
                        name="newPassword"
                        className={this.state.error ? "input-error" : "input"}
                        onChange={this.handleChange}
                        value={this.state.email}
                        onFocus={() =>
                          this.setState({ focusedNewPassword: true })
                        }
                        onBlur={() =>
                          this.setState({ focusedNewPassword: false })
                        }
                        autoComplete="off"
                        required
                      />
                    </FormGroup>
                    <FormGroup
                      className={classnames({
                        focused: this.state.focusedConfirmPassword,
                      })}
                    >
                      <label className="form-control-label label-input">
                        Confirm Password
                      </label>
                      <Input
                        placeholder="Confirm Password"
                        className={this.state.error ? "input-error" : "input"}
                        type="password"
                        name="confirmPassword"
                        onChange={this.handleChange}
                        value={this.state.confirmPassword}
                        onFocus={() =>
                          this.setState({ focusedConfirmPassword: true })
                        }
                        onBlur={() =>
                          this.setState({ focusedConfirmPassword: false })
                        }
                        autoComplete="off"
                        required
                      />
                    </FormGroup>
                    <div className="text-center">
                      <Button
                        className="mt-4 mb-4 button-fuchsia"
                        color="info"
                        type="submit"
                      >
                        Reset password
                      </Button>
                    </div>
                  </Form>
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
