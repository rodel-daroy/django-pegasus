// nodejs library that concatenates classes
import classnames from "classnames";
import * as passwordValidator from "password-validator";
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
  Row,
  UncontrolledAlert,
} from "reactstrap";
import Label from "reactstrap/lib/Label";

import { history } from "../../../../index";
import {
  googleLogin,
  login,
  register,
} from "../../../../redux/action/AuthAction";
import axios from "../../../../utils/axios";
import { permission, sessionType } from "../../../../utils/Enums.js";

// core components

const DJANGO_OAUTH_CLIENT_ID = process.env.DJANGO_OAUTH_CLIENT_ID;
const DJANGO_OAUTH_CLIENT_SECRET = process.env.DJANGO_OAUTH_CLIENT_SECRET;
const GOOGLE_OAUTH2_CLIENT_ID = process.env.GOOGLE_OAUTH2_CLIENT_ID;

class Register extends React.Component {
  constructor(props) {
    super(props);

    const params = new URLSearchParams(props.location.search);
    const email = params.get("email");
    const invitation_id = params.get("invitation_id");

    this.state = {
      FirstName: "",
      LastName: "",
      Email: email || "",
      CompanyName: "",
      Password: "",
      mailsaas_type: "Sales",
      isOpen: false,
      loading: false,
      error: false,
      typePassword: true,
      invitation_id: invitation_id,
      errors: {},
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      errors: {
        ...this.state.errors,
        [this.camel_to_snake(e.target.name)]: undefined,
      },
      error: false,
    });
  };

  camel_to_snake = (str) =>
    str[0].toLowerCase() +
    str
      .slice(1, str.length)
      .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

  handleSubmit = (e) => {
    e.preventDefault();

    const schema = new passwordValidator();

    schema
      .is()
      .min(8) // Minimum length 8
      .has()
      .uppercase() // Must have uppercase letters
      .has()
      .lowercase() // Must have lowercase letters// Must have at least 1 digit
      .has()
      .not()
      .spaces();

    const isPasswordValid = schema.validate(this.state.Password);

    /* if (!isPasswordValid) {
      this.setState({
        errors: {
          ...this.state.errors,
          password1:
            "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number.",
        },
      });
      return;
    } */

    const user = {
      first_name: this.state.FirstName,
      last_name: this.state.LastName,
      full_name: this.state.FirstName, // Assume full name is same to first name
      email: this.state.Email,
      company_name: this.state.CompanyName,
      password1: this.state.Password1,
      mailsaas_type: this.state.mailsaas_type,
    };

    this.setState({ loading: true, error: false });
    axios
      .post("/rest-auth/registration/", user)
      .then(async (response) => {
        const token = response.data.token;
        localStorage.setItem("access_token", token);
        if (this.state.invitation_id) {
          await this.acceptInvitationAndLogin(response.data.user, token);
        } else {
          history.push("/app/admin/dashboard");
          window.location.reload();
        }
        this.props.register(response.data.user);
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          error: true,
          errors: Object.keys(error.response.data).reduce((acc, key) => {
            acc[key] = error.response.data[key][0];
            return acc;
          }, {}),
        });
      })
      .finally(() => {
        this.setState({ loading: false });
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
        localStorage.setItem("access_token", token);

        this.props.googleLogin(user);

        if (this.state.invitation_id) {
          await this.acceptInvitationAndLogin(user, token);
        } else {
          history.push("/app/admin/dashboard");
          window.location.reload();
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

  showPassword = () => {
    this.setState({ typePassword: !this.state.typePassword });
  };

  onGoogleAuthFailure = (response) => {};

  renderError = (name) => {
    return (
      <div>
        {this.state.errors[name] ? (
          <span className="password-message"> {this.state.errors[name]}</span>
        ) : null}
      </div>
    );
  };

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

    history.push("/app/admin/dashboard");
  };

  acceptInvitationAndLogin = async (user, token) => {
    axios.setToken(token);
    await axios
      .post(`/teams/invitation/${this.state.invitation_id}/confirm/`)
      .then((response) => {
        user.team_admin_id = response.data.team_admin_id;
        user.team = response.data.team;
        user.is_admin = false;
        user.user_permission = user.team.members.find(
          (member) => member.email === user.email
        ).permission;
        user.session_type = sessionType.TEAM;
        this.setState({ user: user });
      })
      .finally(() => {
        this.handleLogin(sessionType.TEAM);
      });
  };

  render() {
    const { loading, error } = this.state;
    return (
      <div
        className="auth register"
        style={{
          backgroundImage: `url(${STATIC_FILES.background_auth}), linear-gradient(180deg, #111111 0%, #333333 100%)`,
        }}
      >
        <Row className="justify-content-center background-auth">
          <Col
            lg="5"
            md="8"
            sm="10"
            xs="10"
            className="card-container-register"
          >
            <Card className="bg-secondary border-0">
              <CardHeader className="bg-transparent px-lg-5 ">
                {error && (
                  <UncontrolledAlert color="danger" fade={false}>
                    <span className="alert-inner--icon">
                      <i className="ni ni-bell-55" />
                    </span>{" "}
                    <span className="alert-inner--text">
                      <strong>Error!</strong> Unable to register with provided
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
                      Please register
                    </small>
                  </div>
                </div>
                <Row className="text-center mt-3 mb-3 pl-3 pr-3">
                  <GoogleLogin
                    clientId={GOOGLE_OAUTH2_CLIENT_ID}
                    buttonText="Register"
                    onSuccess={this.onGoogleAuthSuccess}
                    onFailure={this.onGoogleAuthFailure}
                    cookiePolicy={"single_host_origin"}
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
                            Sign up with Google
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
                  <Row>
                    <Col>
                      <FormGroup>
                        <label className="form-control-label label-input">
                          First name
                        </label>
                        <Input
                          placeholder="Your first Name"
                          type="text"
                          name="FirstName"
                          className={classnames({
                            input: true,
                            "input-error": this.state.errors.first_name,
                          })}
                          value={this.state.FirstName}
                          onChange={this.handleChange}
                          autoComplete="off"
                          required
                        />
                        {this.renderError("first_name")}
                      </FormGroup>
                    </Col>
                    <Col>
                      <FormGroup>
                        <label className="form-control-label label-input">
                          Last name
                        </label>
                        <Input
                          placeholder="Your last Name"
                          type="text"
                          name="LastName"
                          className={classnames({
                            input: true,
                            "input-error": this.state.errors.last_name,
                          })}
                          value={this.state.LastName}
                          onChange={this.handleChange}
                          autoComplete="off"
                          required
                        />
                        {this.renderError("last_name")}
                      </FormGroup>
                    </Col>
                  </Row>
                  <FormGroup>
                    <label className="form-control-label label-input">
                      Email
                    </label>
                    <Input
                      placeholder="email@example.com"
                      type="email"
                      name="Email"
                      className={classnames({
                        input: true,
                        "input-error": this.state.errors.email,
                      })}
                      value={this.state.Email}
                      onChange={this.handleChange}
                      autoComplete="off"
                      required
                    />
                    {this.renderError("email")}
                  </FormGroup>
                  <FormGroup>
                    <label className="form-control-label label-input">
                      Company name
                    </label>
                    <Input
                      placeholder="Your company Name"
                      type="text"
                      center-horizontal="true"
                      name="Company"
                      className={classnames({
                        input: true,
                        "input-error": this.state.errors.company,
                      })}
                      onChange={this.handleChange}
                      autoComplete="off"
                    />
                  </FormGroup>

                  <FormGroup>
                    <label className="form-control-label label-input">
                      Password
                    </label>
                    <InputGroup className="input-group-merge input-group-alternative input">
                      <Input
                        placeholder="Password"
                        type={this.state.typePassword ? "password" : "text"}
                        name="Password1"
                        className={classnames({
                          input: true,
                          "input-error": this.state.errors.password1,
                        })}
                        onChange={this.handleChange}
                        center-horizontal="true"
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
                    {this.renderError("password1")}
                    <FormGroup className="mt-4">
                      <Label for="mailsaas_type" className="label-input">
                        What are you using this for?
                      </Label>
                      <Input
                        id="mailsaas_type"
                        type="select"
                        name="mailsaas_type"
                        className={classnames({
                          input: true,
                          "input-error": this.state.errors.mailsaas_type,
                        })}
                        value={this.state.mailsaas_type}
                        onChange={this.handleChange}
                      >
                        <option value="Sales">Sales</option>
                        <option value="Marketing">Marketing/PR</option>
                        <option value="Recruiting">Recruiting</option>
                      </Input>
                    </FormGroup>
                  </FormGroup>

                  <div className="text-center mt-3">
                    <Button
                      className="mt-4 mb-4 button-fuchsia"
                      color="info"
                      type="submit"
                    >
                      Create an account
                      {false && <i className="ml-2 fas fa-spinner fa-spin"></i>}
                    </Button>
                  </div>

                  <Row className="mt-3">
                    <Col xs="6"></Col>
                    <Col xs="6" className="text-right center-vertical">
                      <Link to="/app/auth/login">
                        <small className="sub-title text-black underline ">
                          Already have account
                        </small>
                      </Link>
                    </Col>
                  </Row>
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
    );
  }
}

export default connect(null, {
  register,
  googleLogin,
  login,
})(Register);
