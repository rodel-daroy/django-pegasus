import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Card, CardBody, CardHeader, Col, Row } from "reactstrap";

import PageContainer from "../../../../components/Containers/PageContainer";
import {
  campaignCompose,
  campaignOptions,
  campaignRecipient,
  campaignSend,
  campaignStart,
} from "../../../../redux/action/CampaignActions";
import {
  showNotification,
  toastOnError,
  toggleTopLoader,
} from "../../../../utils/Utils";
import ThePreview from "./ThePreview";

export class TheSend extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.tabError = [];
  }

  createCampaign = (e) => {
    this.tabError = [];
    e.preventDefault();
    const resultStart = this.validateStart();
    const resultRecipient = this.validateRecipient();
    const resultCompose = this.validateCompose();
    const resultOption = this.validateOption();

    if (!resultStart || !resultRecipient || !resultCompose || !resultOption) {
      showNotification("danger", "Info", "Please complete the information");
      this.props.validateData(this.tabError)
    }
    else {
      delete this.props.campaign.recipients;
      this.props.campaignSend(this.props.campaign);
    }
  };

  validateStart = () => {
    if (
      this.props.campaign.title === "" ||
      this.props.campaign.from_address === "" || 
      this.props.campaign.from_address.length === 0
    ) {
      this.tabError.push("START");
      return false;
    }

    this.tabError = this.tabError.filter((element) => element !== "START");
    return true;
  };

  validateRecipient = () => {
    if (!this.props.campaign.tag && this.props.campaign.csvfile === "") {
      this.tabError.push("RECIPIENT");
      return false;
    }
    this.tabError = this.tabError.filter((element) => element !== "RECIPIENT");
    return true;
  };

  validateCompose = () => {
    if (this.props.campaign.email_subject === "") {
      this.tabError.push("COMPOSE");
      return false;
    }

    if (this.props.campaign.email_body === "") {
      this.tabError.push("COMPOSE");
      return false;
    }

    for (const follow_up of this.props.campaign.follow_up) {
      if (!follow_up.email_subject) {
        this.tabError.push("COMPOSE");
        return false;
      }

      if (!follow_up.email_body) {
        this.tabError.push("COMPOSE");
        return false;
      }

      if (follow_up.wait_days <= 0) {
        this.tabError.push("COMPOSE");
        return false;
      }
    }

    for (const drip of this.props.campaign.drips) {
      if (!drip.email_subject) {
        this.tabError.push("COMPOSE");
        return false;
      }

      if (!drip.email_body) {
        this.tabError.push("COMPOSE");
        return false;
      }

      if (drip.wait_days <= 0) {
        this.tabError.push("COMPOSE");
        return false;
      }
    }
    if (this.props.campaign.tag === "" || this.props.campaign.csvFile === "") {
      this.tabError.push("COMPOSE");
      return false;
    }
    this.tabError = this.tabError.filter((element) => element !== "COMPOSE");
    return true;
  };

  validateOption = () => {
    if (
      this.props.campaign.track_opens === "" ||
      this.props.campaign.track_linkclick === "" ||
      this.props.campaign.terms_and_laws === ""
    ) {
      this.tabError.push("OPTIONS");
      return false;
    }
    this.tabError = this.tabError.filter((element) => element !== "OPTIONS");
    return true;
  };

  onPrev = () => {
    // call parent method
    this.props.onPrev();
  };

  render() {
    const { onPrev, campaign, mailAccounts, campaignRecipient } = this.props;
    const activeMailAccounts = mailAccounts.filter(
      (m) => campaign.from_address.indexOf(m.id.toString()) !== -1
    );

    return (
      <>
        <div className="send_campaign">
          <Row>
            <Col>
              <h2 className="text-center text_blue my-4">
                Are you ready to create your campaign?
              </h2>
            </Col>
          </Row>
          <Card className="mb-0 padding_10">
            <Row className="content-mails mt-2">
              <Row className="mx-auto mail-address">
                <h4 className="label_to">From address</h4>
                <div className="container-mails">
                  {activeMailAccounts.map((activeMailAccount, index) => (
                    <div className="container_to" key={index}>
                      <div className="profile_picture"></div>
                      <div>
                        <h5 className="label_show">
                          {activeMailAccount.email}
                        </h5>
                        <h5 className="sub_title_to">
                          {activeMailAccount.first_name}{" "}
                          {activeMailAccount.last_name}
                        </h5>
                      </div>
                    </div>
                  ))}
                </div>
              </Row>
            </Row>
            {campaign.tag && (
              <Row className="content-mails mt-4 mb--4">
                <div className="mx-auto mail-address">
                  <div className=" row mb-0 ml-0" style={{ height: 60 }}>
                    <h4 className="label_to">Recipient Tag</h4>

                    <div className="container_tags">
                      <Row style={{ margin: "auto" }}>
                        <p className="text_blue">{campaign.tagName}</p>
                      </Row>
                    </div>
                  </div>
                </div>
              </Row>
            )}
            <ThePreview sendPreview={true} className={"box-shadow-none"} />
          </Card>

          {/* Buttons */}
          <Row className="mt-4 mb-3 justify-content-between campaign-style">
            {onPrev && (
              <Button
                type="button"
                onClick={this.onPrev}
                className="color-button outline-button"
              >
                <img src={STATIC_FILES.arrow_left} />
                {"  "}
                <p>PREV</p>
              </Button>
            )}

            <Button
              type="button"
              className="margin-text button_fuchsia_2"
              onClick={this.createCampaign}
            >
              CREATE
            </Button>
          </Row>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  campaign: state.campaign,
  mailAccounts: state.mailAccounts.mailAccounts,
});

export default connect(mapStateToProps, { campaignSend })(TheSend);
