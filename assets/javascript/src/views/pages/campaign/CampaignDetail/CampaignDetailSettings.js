import { compareNumbers } from "@fullcalendar/core";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Row,
} from "reactstrap";

import PageContainer from "../../../../components/Containers/PageContainer";
import { DeleteIcon } from "../../../../components/icons";
import {
  getDetailsSettings,
  getLeadSettings,
  updateLeadSettings,
  updateSendingAddress,
} from "../../../../redux/action/CampaignDetailsActions";
import { getMailAccounts } from "../../../../redux/action/MailAccountsActions";
import { CAMPAIGN_LEAD_CATCHER_ITEM_TYPE } from "../../../../utils/Common";
import { permission } from "../../../../utils/Enums";
import { showNotification } from "../../../../utils/Utils";
import DetailHeader from "./components/DetailHeader";

export class CampaignDetailSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sendingAddressesId: "",
      leadAddressesId: "",

      leadConditions: [],
      operator: false,
    };
  }

  async componentDidMount() {
    this.props.getMailAccounts(
      this.props.user.session_type,
      this.props.user.team_admin_id
    );

    try {
      const detailsSettings = await this.props.getDetailsSettings(
        this.props.id,
        this.props.user.session_type,
        this.props.user.team_admin_id
      );
      this.setState({
        sendingAddressesId: detailsSettings.from_address,
        leadAddressesId: detailsSettings.from_address,
      });

      const leadSettings = await this.props.getLeadSettings(this.props.id);
      if (leadSettings && leadSettings.length > 0) {
        const item = leadSettings[0];
        const conditions = [];
        for (const field in CAMPAIGN_LEAD_CATCHER_ITEM_TYPE) {
          if (item[field]) {
            conditions.push({
              action: field,
              times: item[field],
            });
          }
        }
        this.setState({
          leadConditions: [...conditions],
          operator: item.join_operator == "or",
        });
      }
    } catch (error) {}
  }

  componentWillReceiveProps(preProps, nextProps) {}

  onSendingAddressChange = (e, index) => {
    this.state.sendingAddressesId[index] = Number(e.target.value);
    this.setState({
      sendingAddressesId: this.state.sendingAddressesId,
    });
  };

  onLeadAddressChange = (e) => {
    this.setState({
      leadAddressId: e.target.value,
    });
  };

  onAddCondition = () => {
    this.setState({
      leadConditions: [
        ...this.state.leadConditions,
        { action: "replies", times: 1 },
      ],
    });
  };

  onDeleteCondition = (index) => {
    const leadConditions = [...this.state.leadConditions];
    leadConditions.splice(index, 1);
    this.setState({ leadConditions });
  };

  onToggleOperator = () => {
    this.setState({ operator: !this.state.operator });
  };

  saveSendingAccount = () => {
    const { id } = this.props;
    const { sendingAddressesId } = this.state;

    if (!sendingAddressesId.length) {
      showNotification("warning", null, "Please select the sending account.");
      return;
    }
    this.props.updateSendingAddress(id, sendingAddressesId);
  };

  onClickSaveLeadCatcher = async () => {
    const { leadConditions, operator } = this.state;
    const payload = {};

    // Validate input
    leadConditions.forEach((item) => {
      payload[item.action] = item.times;
    });
    if (Object.keys(payload).length < leadConditions.length) {
      showNotification(
        "danger",
        "Invalid content",
        "There are multiple items for the same action."
      );
      return;
    }
    const negativeValues = leadConditions.filter((item) => item.times <= 0);
    if (negativeValues.length) {
      showNotification(
        "danger",
        "Invalid content",
        "Number of times must be positive."
      );
      return;
    }

    // Call API
    payload.join_operator = operator ? "or" : "and";
    try {
      await this.props.updateLeadSettings(this.props.id, payload);
    } catch (e) {}
  };

  addNewSender = () => {
    const { mailAccounts } = this.props;
    const { sendingAddressesId } = this.state;
    const noActiveSendingAddresses = mailAccounts.filter(
      (m) => sendingAddressesId.indexOf(m.id) === -1
    );
    if (!noActiveSendingAddresses.length) {
      showNotification(
        "danger",
        "No more emails",
        "You don't have more account emails"
      );
      return;
    }

    sendingAddressesId.push(noActiveSendingAddresses[0].id);
    this.setState({ sendingAddressesId });
  };

  removeSender = (index) => {
    const { sendingAddressesId } = this.state;
    sendingAddressesId.splice(index, 1);
    this.setState({ sendingAddressesId });
  };

  duplicateCampaign = () => {
    this.props.history.push("/app/admin/campaign/duplicate");
  };

  render() {
    const { sendingAddressesId, leadAddressesId, leadConditions } = this.state;
    const { id, title, mailAccounts } = this.props;
    const campTitle = title || "Date Outreach";

    const activeSendingAddresses = mailAccounts.filter(
      (m) => sendingAddressesId.indexOf(m.id) !== -1
    );

    const activeLeadAddresses = mailAccounts.filter(
      (m) => leadAddressesId.indexOf(m.id) !== -1
    );

    return (
      <>
        <PageContainer title={campTitle}>
          <Row className="mx-3">
            <Col md={4} className="mx-auto float-left">
              <h1 className="ff-poppins">{title}</h1>
            </Col>
            <Col md={8} className="mx-auto">
              <Row>
                <Col>
                  <DetailHeader activeItem="SETTINGS" id={id} />
                </Col>
              </Row>
            </Col>
          </Row>

          <Row className="mx-3 mt-5 campaign-style p-0">
            <Col md={6}>
              <Card>
                <CardHeader>
                  <h3 className="my-0 sub-title follow-title">
                    Duplicate Campaign
                  </h3>
                </CardHeader>
                <CardBody>
                  <span>
                    This will create a new campaign with the same sequence that
                    this one
                  </span>
                </CardBody>
                <CardFooter>
                  <Row>
                    <Button
                      className="btn-details py-1 px-2 mr-0 mt-0"
                      size="sm"
                      onClick={this.duplicateCampaign}
                    >
                      Duplicate
                    </Button>
                  </Row>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="my-0 sub-title follow-title">
                    Sending Account
                  </h3>
                </CardHeader>
                <CardBody>
                  {activeSendingAddresses.map((activeSendingAddress, index) => {
                    const activeSendingName = `${activeSendingAddress.first_name} ${activeSendingAddress.last_name}`;

                    return (
                      <div key={index} className="content-account">
                        <FormGroup className="mb-0">
                          <Row className="mx-0 justify-content-between mb-2">
                            <label
                              className="label-custom mb-0 mt-2"
                              htmlFor="selectFromAddress"
                            >
                              From address
                            </label>
                            {activeSendingAddress.has_error && (
                              <span className="badge badge-dot ml-2">
                                <i className="bg-warning"></i>
                              </span>
                            )}
                            <DeleteIcon
                              onClick={() => this.removeSender(index)}
                            />
                          </Row>
                          <Input
                            id="selectFromAddress"
                            type="select"
                            className="form-control-sm small-select"
                            value={activeSendingAddress.id}
                            disabled={
                              this.props.user.user_permission !==
                              permission.UPDATE
                            }
                            onChange={(e) =>
                              this.onSendingAddressChange(e, index)
                            }
                          >
                            {mailAccounts &&
                              mailAccounts.map((mailAccount, id) => (
                                <option
                                  key={`item_${id}`}
                                  value={mailAccount.id}
                                >
                                  {mailAccount.email}
                                </option>
                              ))}
                          </Input>
                        </FormGroup>

                        <FormGroup className="mb-0">
                          <label className="label-custom mt-2">From name</label>
                          <Input
                            type="text"
                            className="form-control-sm small-select"
                            disabled
                            value={activeSendingName}
                            disabled={
                              this.props.user.user_permission !==
                              permission.UPDATE
                            }
                          />
                        </FormGroup>
                      </div>
                    );
                  })}
                  {this.props.user.user_permission === permission.UPDATE && (
                    <Row>
                      <Col className="center-bottom">
                        <Button
                          className="btn-details flex-row py-1 px-2 mr-0 mt-0"
                          size="sm"
                          onClick={this.saveSendingAccount}
                        >
                          <img src={STATIC_FILES.save} /> Save
                        </Button>
                      </Col>
                      <Col className="center-bottom">
                        <Button
                          className="btn-details py-1 px-2 mr-0 mt-0"
                          size="sm"
                          onClick={this.addNewSender}
                        >
                          + ADD
                        </Button>
                      </Col>
                    </Row>
                  )}
                </CardBody>
              </Card>
            </Col>

            <Col md={6}>
              <Card>
                <CardHeader>
                  <h3 className="my-0 sub-title follow-title">Lead Catcher</h3>
                </CardHeader>
                <CardBody>
                  <label className="form-control-label sub-title-details">
                    When does a recipient become a lead?
                  </label>
                  {leadConditions.map((leadCondition, index) => (
                    <div key={`${index}`}>
                      {index == 0 || (
                        <div className="d-flex justify-content-center">
                          <Button
                            color="secondary mb-3"
                            type="button"
                            size="sm"
                            onClick={this.onToggleOperator}
                          >
                            {this.state.operator ? "OR" : "AND"}
                          </Button>
                        </div>
                      )}
                      <div
                        key={`item_${index}`}
                        className="d-flex flex-row content-account"
                      >
                        <Col className=" mb-0 col-5 p-0 mr-2">
                          <label className="label-custom mb-0 mt-2">
                            Recipient
                          </label>
                          <Input
                            type="select"
                            className="form-control-sm small-select"
                            value={leadCondition.action}
                            onChange={(e) => {
                              leadCondition.action = e.target.value;
                              this.setState({
                                leadConditions: [...leadConditions],
                              });
                            }}
                          >
                            {Object.keys(CAMPAIGN_LEAD_CATCHER_ITEM_TYPE).map(
                              (item, index1) => {
                                return (
                                  <option key={index1} value={item}>
                                    {CAMPAIGN_LEAD_CATCHER_ITEM_TYPE[item]}
                                  </option>
                                );
                              }
                            )}
                          </Input>
                        </Col>
                        <Col className="mb-0 col-7 p-0 pr-2">
                          <Row className="mx-0 justify-content-between mb-0">
                            <label
                              className="label-custom mb-0 mt-2"
                              htmlFor="selectFromAddress"
                            >
                              # of times
                            </label>
                            <img
                              src={STATIC_FILES.trash}
                              className="mb-1"
                              onClick={() => {
                                this.onDeleteCondition(index);
                              }}
                            />
                          </Row>
                          <Input
                            type="number"
                            className="form-control-sm small-select"
                            value={leadCondition.times}
                            onChange={(e) => {
                              leadCondition.times = e.target.value;
                              this.setState({
                                leadConditions: [...leadConditions],
                              });
                            }}
                          />
                        </Col>
                      </div>
                    </div>
                  ))}
                  {this.props.user.user_permission === permission.UPDATE && (
                    <Row className="mt-3">
                      <Col className="center-bottom">
                        <Button
                          className="btn-details flex-row py-1 px-2 mr-0 mt-0"
                          size="sm"
                          onClick={this.onClickSaveLeadCatcher}
                        >
                          <img src={STATIC_FILES.save} /> Save
                        </Button>
                      </Col>
                      <Col className="center-bottom">
                        <Button
                          className="btn-details py-1 px-2 mr-0 mt-0"
                          size="sm"
                          onClick={this.onAddCondition}
                        >
                          + Add condition
                        </Button>
                      </Col>
                    </Row>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </PageContainer>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    id: state.campaignDetails.id,
    title: state.campaignDetails.title,
    mailAccounts: state.mailAccounts.mailAccounts,
    user: state.auth.user,
  };
};

export default connect(mapStateToProps, {
  getDetailsSettings,
  getLeadSettings,
  updateLeadSettings,
  updateSendingAddress,
  getMailAccounts,
})(CampaignDetailSettings);
