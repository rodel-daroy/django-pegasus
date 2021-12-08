import React, { Component } from "react";
import PageContainer from "../../../components/Containers/PageContainer";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  CardHeader,
  CardFooter,
  FormGroup,
  Form,
  Input,
} from "reactstrap";
import {
  toggleTopLoader,
  toastOnError,
  toastOnSuccess,
  showNotification,
} from "../../../utils/Utils";
import axios from "../../../utils/axios";
import { SaveIcon } from "../../../components/icons";

export class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      first_name: "",
      last_name: "",
      email: "",
      avatar_url: "",
      user: {},
      old_password: "",
      new_password: "",
      confirm_password: "",
      has_old_password: true
    };
  }

  componentDidMount() {
    this.readUserInfo();
  }

  readUserInfo = () => {
    toggleTopLoader(true);
    axios
      .get(`/rest-auth/user/`)
      .then((response) => {
        const user = response.data;
        this.setState({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          avatar_url: user.avatar_url,
          user: user,
          has_old_password: user.has_old_password
        });
      })
      .catch((error) => {
        toastOnError(error);
      })
      .finally(() => {
        toggleTopLoader(false);
      });
  };

  saveUserInfo = () => {
    const { user } = this.state;

    toggleTopLoader(true);
    axios
      .put(`/rest-auth/user/`, user)
      .then((response) => {
        const user = response.data;
        this.setState({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          avatar_url: user.avatar_url,
          user: user,
        });
        toastOnSuccess("Successfully updated");
      })
      .catch((error) => {
        toastOnError(error);
      })
      .finally(() => {
        toggleTopLoader(false);
      });
  };

  savePassword = () => {
    const { old_password, new_password, confirm_password, has_old_password } = this.state;

    if (has_old_password && !old_password) {
      showNotification("warning", "Please enter the old password");
      return;
    }

    if (!new_password) {
      showNotification("warning", "Please enter the new password");
      return;
    }

    if (new_password !== confirm_password) {
      showNotification(
        "warning",
        "New password and confirm password must be same"
      );
      return;
    }
    const that = this;
    toggleTopLoader(true);
    axios
      .post(`/rest-auth/password/change/`, {
        new_password1: new_password,
        new_password2: confirm_password,
        old_password: old_password,
      })
      .then((response) => {
        toastOnSuccess("Successfully updated");
        that.setState({has_old_password: true})
      })
      .catch((error) => {
        toastOnError(error);
      })
      .finally(() => {
        toggleTopLoader(false);
      });
  };

  render() {
    const { first_name, last_name, email, avatar_url } = this.state;
    const { user, old_password, new_password, confirm_password, has_old_password } = this.state;

    return (

      <div>
        <PageContainer classNameComponent="prospect-main-container">
          <Row>
            <Col className="col-12">
              <Card className="card-profile margin-profile">
                <CardHeader className="p-0 mb-5 border-0">
                  <Row className="justify-content-center">
                    <div className="card-profile-image">
                      <img
                        alt="..."
                        className="profile-rounded-img"
                        style={{ background: "ghostwhite" }}
                        src={
                          avatar_url ? avatar_url : STATIC_FILES.default_avatar
                        }
                      />
                    </div>
                  </Row>
                </CardHeader>
                <CardBody className="pt-0">
                  <Row>
                    <div className="col">
                      <div className="card-profile-stats d-flex justify-content-center"></div>
                    </div>
                  </Row>
                  <div className="text-center">
                    <h5 className="h3">
                      {first_name && last_name && `${first_name} ${last_name}`}
                    </h5>
                    <div className="h5 font-weight-300">
                      <i className="ni location_pin mr-2" />
                      {email}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col className="col-6">
              <Card>
                <CardHeader>
                  <h3 className="mb-0 title">User information</h3>
                </CardHeader>
                <CardBody>
                  <Form>
                    <div className="pl-lg-4">
                      <Row>
                        <Col lg="6">
                          <FormGroup>
                            <label
                              className="form-control-label input_label"
                              htmlFor="first-name"
                            >
                              First name
                            </label>
                            <Input
                              id="first-name"
                              placeholder="First name"
                              type="text"
                              value={user.first_name || ""}
                              className="input_text"
                              onChange={(e) => {
                                user.first_name = e.target.value;
                                this.setState({
                                  user: user,
                                });
                              }}
                              name="firstName"
                            />
                          </FormGroup>
                        </Col>
                        <Col lg="6">
                          <FormGroup>
                            <label
                              className="form-control-label input_label"
                              htmlFor="last-name"
                            >
                              Last name
                            </label>
                            <Input
                              id="last-name"
                              placeholder="Last name"
                              type="text"
                              className="input_text"
                              value={user.last_name || ""}
                              onChange={(e) => {
                                user.last_name = e.target.value;
                                this.setState({
                                  user: user,
                                });
                              }}
                              name="lastName"
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col lg="12">
                          <FormGroup>
                            <label
                              className="form-control-label input_label"
                              htmlFor="companyName"
                            >
                              Company name
                            </label>
                            <Input
                              id="company-name"
                              placeholder="Company name"
                              type="text"
                              className="input_text"
                              value={user.company_name || ""}
                              onChange={(e) => {
                                user.company_name = e.target.value;
                                this.setState({
                                  user: user,
                                });
                              }}
                              name="companyName"
                              autoComplete="off"
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col lg="12">
                          <FormGroup>
                            <label
                              className="form-control-label input_label"
                              htmlFor="email"
                            >
                              Email address
                            </label>
                            <Input
                              id="email"
                              placeholder="jesse@example.com"
                              type="email"
                              className="input_text"
                              value={user.email || ""}
                              onChange={(e) => {
                                user.email = e.target.value;
                                this.setState({
                                  user: user,
                                });
                              }}
                              name="email"
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    </div>
                  </Form>
                </CardBody>
                <CardFooter className="bg-transparent text-right">
                  <Button
                    color="info"
                    type="submit"
                    className="text-uppercase submit_button"
                    onClick={this.saveUserInfo}
                  >
                    <Row>
                      <SaveIcon></SaveIcon>
                      <div>SAVE PROFILE</div>
                    </Row>
                  </Button>
                </CardFooter>
              </Card>
            </Col>
            <Col className="col-6">
              <Card>
                <CardHeader>
                  <h3 className="mb-0 title">Password</h3>
                </CardHeader>
                <CardBody>
                  <Form>
                    <div className="pl-lg-4">
                      <Row>
                        {has_old_password && (
                        <Col md="12">
                          <FormGroup>
                            <label
                              className="form-control-label input_label"
                              htmlFor="old-password"
                            >
                              OLD PASSWORD
                            </label>
                            <Input
                              id="old-password"
                              placeholder="Old Password"
                              type="password"
                              className="input_text"
                              value={old_password}
                              onChange={(e) => {
                                this.setState({
                                  old_password: e.target.value,
                                });
                              }}
                            />
                          </FormGroup>
                        </Col>) }
                        <Col md="12">
                          <FormGroup>
                            <label
                              className="form-control-label input_label"
                              htmlFor="new-password"
                            >
                              NEW PASSWORD
                            </label>
                            <Input
                              id="new-password"
                              placeholder="New Password"
                              type="password"
                              className="input_text"
                              value={new_password}
                              onChange={(e) => {
                                this.setState({
                                  new_password: e.target.value,
                                });
                              }}
                            />
                          </FormGroup>
                        </Col>
                        <Col md="12">
                          <FormGroup>
                            <label
                              className="form-control-label input_label"
                              htmlFor="confirm-password"
                            >
                              CONFIRM PASSWORD
                            </label>
                            <Input
                              id="confirm-password"
                              placeholder="Confirm Password"
                              type="password"
                              className="input_text"
                              value={confirm_password}
                              onChange={(e) => {
                                this.setState({
                                  confirm_password: e.target.value,
                                });
                              }}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    </div>
                  </Form>
                </CardBody>
                <CardFooter className="bg-transparent text-right">
                  <Button
                    color="info"
                    type="submit"
                    className="text-uppercase submit_button"
                    onClick={this.savePassword}
                  >
                    <Row>
                      <SaveIcon></SaveIcon>
                      <div>SAVE PASSWORD</div>
                    </Row>
                  </Button>
                </CardFooter>
              </Card>
            </Col>
          </Row>
        </PageContainer>
      </div>
    );
  }
}

export default Profile;
