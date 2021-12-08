// nodejs library that concatenates classes
import classnames from "classnames";
import React from "react";
import GoogleLogin from "react-google-login";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
// reactstrap components
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormGroup,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  UncontrolledAlert,
} from "reactstrap";

import { history } from "../../../../index";
import { googleLogin, login } from "../../../../redux/action/AuthAction";
import { getProfile } from "../../../../redux/action/ProfileAction";
import axios from "../../../../utils/axios";
import { permission, sessionType } from "../../../../utils/Enums.js";

const DJANGO_OAUTH_CLIENT_ID = process.env.DJANGO_OAUTH_CLIENT_ID;
const DJANGO_OAUTH_CLIENT_SECRET = process.env.DJANGO_OAUTH_CLIENT_SECRET;
const GOOGLE_OAUTH2_CLIENT_ID = process.env.GOOGLE_OAUTH2_CLIENT_ID;

class Login extends React.Component {
  constructor(props) {
    super(props);

    const params = new URLSearchParams(props.location.search);

    const savedEmail = localStorage.getItem("email") || "";
    const savedPassword = localStorage.getItem("password") || "";

    const email = params.get("email") ? params.get("email") : savedEmail;
    const invitationId = params.get("invitation_id");

    this.state = {
      email: email,
      password: savedPassword,
      focusedEmail: false,
      focusedPassword: false,
      loading: false,
      error: false,
      invitation_id: invitationId,
      isMember: null,
      user: null,
      token: null,
      typePassword: true,
      isRememberMeChecked: false,
      isGoogleLogin: false,
    };
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  showPassword = () => {
    this.setState({ typePassword: !this.state.typePassword });
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const user = {
      email: this.state.email,
      password: this.state.password,
    };

    if (this.state.isRememberMeChecked) {
      this.rememberCredentials(user.email, user.password);
    } else {
      this.forgetCredentials();
    }

    this.setState({ loading: true, error: false });
    axios
      .post("/rest-auth/login/", user)
      .then(async (response) => {
        const token = response.data.token;
        this.setState({ user: response.data.user, token });
        if (response.data.user.is_admin || !response.data.user.team) {
          localStorage.setItem("access_token", token);
          localStorage.setItem("user_email", response.data.user.email);
          response.data.user.user_permission = permission.UPDATE;

          const user = {
            ...response.data.user,
            session_type: sessionType.TEAM,
          };

          this.props.login(user);

          if (this.state.invitation_id) {
            await this.acceptInvitationAndLogin(user, token);
          } else {
            history.push("/app/admin/dashboard");
          }
        } else {
          if (this.state.invitation_id) {
            this.handleLogin(sessionType.TEAM);
          } else {
            this.setState({
              isMember: true,
            });
          }
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({ error: true });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  acceptInvitationAndLogin = async (user, token) => {
    axios.setToken(token);
    await axios
      .post(`/teams/invitation/${this.state.invitation_id}/confirm/`)
      .then((response) => {
        user.team_admin_id = response.data.team_admin_id;
        user.team = response.data.team;
        user.is_admin = false;
        this.setState({ user: user });
      })
      .finally(() => {
        this.handleLogin(sessionType.TEAM);
      });
  };

  onGoogleAuthSuccess = (response) => {
    const { email, name, givenName, familyName } = response.profileObj;
    const user = {
      username: name,
      email: email,
      first_name: givenName,
      last_name: familyName,
      invitation_id: this.state.invitation_id,
    };
    const token = response.tokenObj.access_token;
    this.props.googleLogin(user);

    const data = {
      grant_type: "convert_token",
      client_id: DJANGO_OAUTH_CLIENT_ID,
      client_secret: DJANGO_OAUTH_CLIENT_SECRET,
      backend: "google-oauth2",
      token: token,
    };
    this.setState({ loading: true, error: false });
    axios
      .post("/auth/convert-token", data)
      .then(async (response) => {
        const token = response.data.access_token;
        axios.setToken(token);
        localStorage.setItem("session_type", sessionType.PERSONAL);

        await this.getProfile(token);
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          error: true,
          loading: false,
        });
      });
  };

  getProfile = async (token) => {
    await axios
      .get(`/rest-auth/user/`)
      .then((response) => {
        this.setState({ user: response.data, token });
        if (response.data.is_admin || !response.data.team) {
          localStorage.setItem("access_token", token);
          localStorage.setItem("user_email", response.data.email);
          response.data.user_permission = permission.UPDATE;

          const user = {
            ...response.data,
            session_type: sessionType.TEAM,
          };

          this.setState({
            isGoogleLogin: true,
          });

          if (this.state.invitation_id) {
            this.acceptInvitationAndLogin(user, token);
          } else {
            this.props.googleLogin(user);
            history.push("/app/admin/dashboard");
          }
        } else {
          this.setState({
            isGoogleLogin: true,
            isMember: true,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          error: true,
          loading: false,
        });
      });
  };

  onGoogleAuthFailure = (response) => {};

  handleLogin = (option) => {
    const user = { ...this.state.user, session_type: option };

    if (option === sessionType.PERSONAL) {
      user.user_permission = permission.UPDATE;
      user.is_admin = true;
    }

    if (this.state.isGoogleLogin) {
      this.props.googleLogin(user);
    } else {
      this.props.login(user);
    }

    this.setState({
      isMember: false,
    });

    localStorage.setItem("access_token", this.state.token);
    history.push("/app/admin/dashboard");
  };

  rememberCredentials = (email, password) => {
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);
  };

  forgetCredentials = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("password");
  };

  switchRememberMe = () => {
    this.setState({ isRememberMeChecked: !this.state.isRememberMeChecked });
  };

  render() {
    const { loading, error } = this.state;

    return (
      <>
        {this.state.isMember && (
          <div>
            <Modal isOpen={this.state.isMember} centered>
              <ModalHeader className="text-center">
                Select an account to login with
              </ModalHeader>
              <ModalBody className="centered-body">
                <Button
                  color="primary"
                  onClick={() => this.handleLogin(sessionType.PERSONAL)}
                  className="login-btn"
                >
                  Personal
                </Button>
                <Button
                  color="primary"
                  onClick={() => this.handleLogin(sessionType.TEAM)}
                  className="login-btn"
                >
                  My team ({this.state.user.team.name})
                </Button>
              </ModalBody>
            </Modal>
          </div>
        )}
        <div
          className="auth login"
          style={{
            backgroundImage: `url(${STATIC_FILES.background_auth}), linear-gradient(180deg, #111111 0%, #333333 100%)`,
          }}
        >
          <Row>
            <Col
              className="col-lg-6 center-horizontal container-logo"
              style={{ position: "relative", zIndex: 2 }}
            >
              <div className="img-box">
                <img
                  src={STATIC_FILES.illustration_login}
                  className="center-horizontal illustration-image"
                />
              </div>
              <div className="logo-box">
                <img
                  src={STATIC_FILES.mailerrize_logo_complete}
                  className="logo-container"
                ></img>
                {/* <span className="offer-login text-bold text-center">
                  Try Free Now For <br />7 Days!
                </span> */}
              </div>
            </Col>
            <Col className="col-12 col-lg-6">
              <div className="justify-content-center background-auth">
                <Card className="bg-secondary border-0 center-horizontal center-vertical c-width-login">
                  <CardHeader className="bg-transparent px-lg-5">
                    {error && (
                      <UncontrolledAlert color="danger" fade={false}>
                        <span className="alert-inner--icon">
                          <i className="ni ni-bell-55" />
                        </span>{" "}
                        <span className="alert-inner--text">
                          <strong>Error!</strong> Unable to log in with provided
                          credentials.
                        </span>
                      </UncontrolledAlert>
                    )}
                    <div className="text-left mt-3 mb-4">
                      <div>
                        <small className="title text-black">Welcome</small>
                      </div>
                      <div>
                        <small className="sub-title text-black">
                          Please login using your account
                        </small>
                      </div>
                    </div>
                    <Row className="text-center mb-3 mt-3 pl-3 pr-3">
                      <GoogleLogin
                        clientId={GOOGLE_OAUTH2_CLIENT_ID}
                        buttonText="Register"
                        onSuccess={this.onGoogleAuthSuccess}
                        onFailure={this.onGoogleAuthFailure}
                        cookiePolicy="single_host_origin"
                        render={({ onClick }) => {
                          return (
                            <Button
                              className="btn-neutral btn-icon full-width"
                              color="default"
                              onClick={() => {
                                onClick();
                              }}
                            >
                              <span className="btn-inner--icon mr-1">
                                <img alt="..." src={STATIC_FILES.google} />
                              </span>
                              <span className="btn-inner--text text-black">
                                Sign in with Google
                              </span>
                            </Button>
                          );
                        }}
                      />
                    </Row>
                    <Row className="text-center">
                      <div className="sub-title text-black center-horizontal">
                        OR
                      </div>
                    </Row>
                  </CardHeader>
                  <CardBody className="px-lg-5">
                    <Form onSubmit={this.handleSubmit} role="form">
                      <FormGroup
                        className={classnames("mb-3", {
                          focused: this.state.focusedEmail,
                        })}
                      >
                        <label className="form-control-label label-input">
                          Email
                        </label>
                        <Input
                          placeholder="Email"
                          type="email"
                          name="email"
                          className="input"
                          onChange={this.handleChange}
                          value={this.state.email}
                          onFocus={() => this.setState({ focusedEmail: true })}
                          onBlur={() => this.setState({ focusedEmail: false })}
                          autoComplete="off"
                        />
                      </FormGroup>
                      <FormGroup
                        className={classnames({
                          focused: this.state.focusedPassword,
                        })}
                      >
                        <label className="form-control-label label-input">
                          Password
                        </label>
                        <InputGroup className="input-group-merge input-group-alternative">
                          <Input
                            placeholder="Password"
                            type={this.state.typePassword ? "password" : "text"}
                            name="password"
                            className="input"
                            onChange={this.handleChange}
                            value={this.state.password}
                            onFocus={() =>
                              this.setState({ focusedPassword: true })
                            }
                            onBlur={() =>
                              this.setState({ focusedPassword: false })
                            }
                          />
                          <i
                            className={
                              !this.state.typePassword
                                ? "fas fa-eye i-pass-active"
                                : "fas fa-eye i-pass-disabled"
                            }
                            onClick={this.showPassword}
                          ></i>
                        </InputGroup>
                      </FormGroup>
                      {/* <div className="custom-control custom-control-alternative custom-checkbox">
                        <input
                          className="custom-control-input"
                          id=" customCheckLogin"
                          type="checkbox"
                          value={isRememberMeChecked}
                          onChange={() => this.switchRememberMe()}
                        />
                        <label
                          className="custom-control-label"
                          htmlFor=" customCheckLogin"
                        >
                          <span className="text-muted">Remember me</span>
                        </label>
                      </div> */}
                      <div className="text-center">
                        <Button
                          className="mt-4 mb-4 button-black"
                          type="submit"
                        >
                          LOGIN
                        </Button>
                      </div>
                    </Form>
                    <Row className="mt-3">
                      <Col xs="6">
                        <small className="sub-title text-black ">
                          Forgot you password?
                        </small>
                      </Col>
                      <Col xs="6" className="text-right center-vertical ">
                        <Link
                          className="sub-title  underline text-black text-bold"
                          to="/app/auth/forgetPassword"
                        >
                          Reset Here
                        </Link>
                      </Col>
                    </Row>
                    <div className="text-center mt-3">
                      <Button
                        className="mt-4 mb-4 button-fuchsia"
                        color="info"
                        type="button"
                        onClick={() =>
                          (location.pathname = "/app/auth/register")
                        }
                      >
                        Create an account
                      </Button>
                    </div>
                  </CardBody>
                  {loading && (
                    <div className="auth-loading-wrapper">
                      <i className="ml-2 fas fa-spinner fa-spin"></i>
                    </div>
                  )}
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
});
export default connect(mapStateToProps, {
  login,
  googleLogin,
  getProfile,
})(Login);
