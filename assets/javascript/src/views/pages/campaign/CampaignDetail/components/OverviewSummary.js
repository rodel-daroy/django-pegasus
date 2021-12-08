import PropTypes from "prop-types";
import React, { Component } from "react";
import DataTable from "react-data-table-component";
import { connect } from "react-redux";
import { Badge, Card, CardHeader, Col, Modal, Row, Spinner } from "reactstrap";

import { TableStyles } from "../../../../../components/Table/TableStyles";
import axios from "../../../../../utils/axios";
import { toastOnError } from "../../../../../utils/Utils";
import FunnelCard from "./FunnelCard";

const option = {
  ALL: "all",
  OPENS: "opens",
  CLICKED: "clicked",
  BOUNCES: "bounces",
  REPLIES: "replies",
  UNSUBSCRIBES: "unsubscribes",
};

const tableTitle = [
  {
    name: "Email",
    selector: "email",
    sortable: true,
  },
  {
    name: "Assigned",
    selector: "assigned_name",
    sortable: true,
  },
  {
    name: "Lead Status",
    selector: "lead_status",
  },
];

class OverviewSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isOpen: false,
      isLoading: false,
    };
  }

  componentDidMount() {}

  getEmailData = async (emailId, option) => {
    this.setState({ isLoading: true }, this.toggleModal());
    try {
      const { data } = await axios.get(
        `/campaign/email-stats/${option}/${emailId}/`
      );
      this.setState({ data });
    } catch {
      toastOnError("Failed to retrieve stats.");
    } finally {
      this.setState({ isLoading: false });
    }
  };

  getCampaignData = async (option) => {
    this.setState({ isLoading: true }, this.toggleModal());
    try {
      const { campaignId } = this.props;
      const { data } = await axios.get(
        `/campaign/campaign-stats/${option}/${campaignId}/`
      );

      this.setState({ data });
    } catch {
      toastOnError("Failed to retrieve stats.");
    } finally {
      this.setState({ isLoading: false });
    }
  };

  toggleModal = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  render() {
    let {
      overviewSummary: { funnel, totals },
    } = this.props;

    const { isLoading, data, isOpen } = this.state;

    funnel = funnel || [];
    totals = totals || [];

    const initialFunnel = funnel.filter((item) => item.email_type === 0);
    const followupFunnel = funnel.filter((item) => item.email_type === 1);
    const dripFunnel = funnel.filter((item) => item.email_type === 2);

    return (
      <>
        <Card className="p-4">
          {/* <Row>
            <Col>
              <label>
                <h1 className="ml-4">FUNNEL</h1>
              </label>
              <div style={{ position: 'absolute', top: 20, right: 30 }}>
                <CustomInput
                  type="select"
                  id="selectRecipients"
                  className="form-control-sm custom-select"
                >
                  <option className="custom-select-option">All</option>
                  <option className="custom-select-option" value="date1">
                    Last 7 days
                  </option>
                  <option className="custom-select-option" value="date2">
                    Last 15 days
                  </option>
                  <option className="custom-select-option" value="date3">
                    Last 30 days
                  </option>
                  <option className="custom-select-option" value="date4">
                    MTD
                  </option>
                  <option className="custom-select-option" value="date5">
                    YTD
                  </option>
                </CustomInput>
              </div>
            </Col>
          </Row> */}
          <Col className="data-analysis">
            <Row className="title-detail">INITIAL EMAIL</Row>
            <Row>
              <Badge className="badgeStyle" pill>
                {initialFunnel.length > 0
                  ? initialFunnel[0].recipient_count
                  : 0}{" "}
                Recipients
              </Badge>
            </Row>
            <Row>
              <FunnelCard
                onClick={() =>
                  this.getEmailData(initialFunnel[0].id, option.OPENS)
                }
                count={
                  initialFunnel.length > 0 ? initialFunnel[0].opened_count : 0
                }
                text={"OPENED"}
              />
              <FunnelCard
                onClick={() =>
                  this.getEmailData(initialFunnel[0].id, option.CLICKED)
                }
                count={
                  initialFunnel.length > 0 ? initialFunnel[0].clicked_count : 0
                }
                text={"CLICKED"}
              />
              <FunnelCard
                onClick={() =>
                  this.getEmailData(initialFunnel[0].id, option.REPLIES)
                }
                count={
                  initialFunnel.length > 0 ? initialFunnel[0].replied_count : 0
                }
                text={"REPLIED"}
              />
              <FunnelCard
                onClick={() =>
                  this.getEmailData(initialFunnel[0].id, option.BOUNCES)
                }
                count={
                  initialFunnel.length > 0 ? initialFunnel[0].bounced_count : 0
                }
                text={"BOUNCED"}
              />
              <FunnelCard
                onClick={() =>
                  this.getEmailData(initialFunnel[0].id, option.UNSUBSCRIBES)
                }
                count={0}
                text={"UNSUBSCRIBED"}
              />
            </Row>
          </Col>
          {followupFunnel[0] && (
            <Col className="data-analysis">
              <Row className="title-detail">FOLLOW UP</Row>
              {followupFunnel.map((item, index) => (
                <div key={`item_${index}`}>
                  <Row>
                    <Badge className="badgeStyle" pill>
                      {item.recipient_count} Recipients
                    </Badge>
                  </Row>
                  <Row>
                    <FunnelCard
                      onClick={() => this.getEmailData(item.id, option.OPENS)}
                      count={item.opened_count}
                      text={"OPENED"}
                    />
                    <FunnelCard
                      onClick={() => this.getEmailData(item.id, option.CLICKED)}
                      count={item.clicked_count}
                      text={"CLICKED"}
                    />
                    <FunnelCard
                      onClick={() => this.getEmailData(item.id, option.REPLIES)}
                      count={item.replied_count}
                      text={"REPLIED"}
                    />
                    <FunnelCard
                      onClick={() => this.getEmailData(item.id, option.BOUNCES)}
                      count={item.bounced_count}
                      text={"BOUNCED"}
                    />
                    <FunnelCard
                      onClick={() =>
                        this.getEmailData(item.id, option.UNSUBSCRIBES)
                      }
                      count={0}
                      text={"UNSUBSCRIBED"}
                    />
                  </Row>
                </div>
              ))}
            </Col>
          )}
          {dripFunnel[0] && (
            <Col className="data-analysis">
              <Row className="title-detail">DRIP</Row>
              {dripFunnel.map((item, index) => (
                <div key={`item_${index}`}>
                  <Row>
                    <Badge className="badgeStyle" pill>
                      {item.recipient_count} Recipients
                    </Badge>
                  </Row>
                  <Row>
                    <FunnelCard
                      onClick={() => this.getEmailData(item.id, option.OPENS)}
                      count={item.opened_count}
                      text={"OPENED"}
                    />
                    <FunnelCard
                      onClick={() => this.getEmailData(item.id, option.CLICKED)}
                      count={item.clicked_count}
                      text={"CLICKED"}
                    />
                    <FunnelCard
                      onClick={() => this.getEmailData(item.id, option.REPLIES)}
                      count={item.replied_count}
                      text={"REPLIED"}
                    />
                    <FunnelCard
                      onClick={() => this.getEmailData(item.id, option.BOUNCES)}
                      count={item.bounced_count}
                      text={"BOUNCED"}
                    />
                    <FunnelCard
                      onClick={() =>
                        this.getEmailData(item.id, option.UNSUBSCRIBES)
                      }
                      count={0}
                      text={"UNSUBSCRIBED"}
                    />
                  </Row>
                </div>
              ))}
            </Col>
          )}

          <Col>
            <Row className="justify-content-center">
              <h1 className="title-detail">TOTALS</h1>
            </Row>
          </Col>
          <div className="detail-info p-4 mx-3">
            <div className="container-totals">
              <FunnelCard
                onClick={() => this.getCampaignData(option.ALL)}
                count={totals.recipient_count ? totals.recipient_count : 0}
                text={"RECIPIENT"}
                totals
              />
              <FunnelCard
                onClick={() => this.getCampaignData(option.ALL)}
                count={totals.in_campaign_count ? totals.in_campaign_count : 0}
                text={"IN CAMPAIGN"}
                totals
              />
              <FunnelCard
                onClick={() => this.getCampaignData(option.OPENS)}
                count={totals.opened_count ? totals.opened_count : 0}
                text={"OPENED"}
                totals
              />
              <FunnelCard
                onClick={() => this.getCampaignData(option.CLICKED)}
                count={totals.clicked_count ? totals.clicked_count : 0}
                text={"CLICKED"}
                totals
              />
              <FunnelCard
                onClick={() => this.getCampaignData(option.REPLIES)}
                count={totals.replied_count ? totals.replied_count : 0}
                text={"REPLIED"}
                totals
              />
              <FunnelCard
                onClick={() => this.getCampaignData(option.BOUNCES)}
                count={totals.bounced_count ? totals.bounced_count : 0}
                text={"BOUNCES"}
                totals
              />
              <FunnelCard
                onClick={() => this.getCampaignData(option.UNSUBSCRIBES)}
                count={0}
                text={"UNSUBSCRIBES"}
                totals
              />
            </div>
          </div>
        </Card>
        <Modal
          isOpen={isOpen}
          toggle={() => this.toggleModal()}
          size="xl"
          style={{ background: "white" }}
        >
          <CardHeader className="pb-0 ml-0 mr-0 row">
            <div onClick={() => this.toggleModal()} className="arrow-back">
              <img src={STATIC_FILES.arrow_back} />
            </div>
            <p
              className="title text-bold ff-poppins "
              style={{ marginLeft: 15 }}
            >
              Details
            </p>
          </CardHeader>

          {isLoading ? (
            <Spinner color="primary" className="m-auto" />
          ) : (
            <Row className="pl-6 pr-6 pt-4 pb-6">
              <DataTable
                columns={tableTitle}
                theme="mailerrize"
                data={data}
                customStyles={TableStyles}
              />
            </Row>
          )}
        </Modal>
      </>
    );
  }
}

OverviewSummary.propTypes = {
  overviewSummary: PropTypes.object,
  campaignId: PropTypes.number,
};

// export default OverviewSummary
const mapStateToProps = (state) => ({
  overviewSummary: state.campaignDetails.overviewSummary,
});

export default connect(mapStateToProps)(OverviewSummary);
