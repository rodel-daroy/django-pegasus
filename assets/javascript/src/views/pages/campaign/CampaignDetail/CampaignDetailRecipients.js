import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Col, Row } from "reactstrap";

import PageContainer from "../../../../components/Containers/PageContainer";
import DeleteModal from "../../../../components/DeleteModal/DeleteModal";
import {
  recipientsFilters,
  recipientsTable,
} from "../../../../components/TableHeader";
import Tables from "../../../../components/Tables";
import {
  deleteRecipient,
  getDetailRecipients,
  updateRecipientStatus,
} from "../../../../redux/action/CampaignDetailsActions";
import { permission } from "../../../../utils/Enums";
import CSVDownloadModal from "./components/CSVDownloadModal";
import DetailHeader from "./components/DetailHeader";
import ImportContactsModal from "./components/ImportContactsModal";
import RecipientDetailModal from "./components/RecipientDetailModal";

class CampaignDetailRecipients extends Component {
  constructor() {
    super();
    this.state = {
      recipientsFilters: recipientsFilters,
      importContactsModal: false,
      recipientDetailItem: null,
      recipientDetailModal: false,
      recipientDeleteItem: null,
      recipientDeleteModal: false,
      downloadCSVModal: false,
      titleFilters: [{ label: "Emails" }],
    };
  }

  componentDidMount() {
    this.props.getDetailRecipients(this.props.id);
  }

  closeImportContactsModal = () => {
    this.setState({ importContactsModal: false });
  };

  showRecipientDetailModal = (item) => {
    this.setState({
      recipientDetailItem: item,
      recipientDetailModal: true,
    });
  };

  showImportContactsModal = (item) => {
    this.setState({
      importContactsModal: true,
    });
  };

  closeRecipientDetailModal = () => {
    this.setState({ recipientDetailModal: false });
  };

  showRecipientDeleteModal = (item) => {
    this.setState({
      recipientDeleteItem: item,
      recipientDeleteModal: true,
    });
  };

  closeRecipientDeleteModal = () => {
    this.setState({ recipientDeleteModal: false });
  };

  showDownloadCSVModal = () => {
    this.setState({ downloadCSVModal: true });
  };

  closeDownloadCSVModal = () => {
    this.setState({ downloadCSVModal: false });
  };

  updateRecipientStatus = (data) => {
    this.props.updateRecipientStatus(data.id, !data.recipient_status);
  };

  deleteRecipient = (data) => {
    this.props.deleteRecipient(data.id);
    this.setState({ recipientDeleteModal: false });
  };

  showImportContactsModal = () => {
    this.setState({ importContactsModal: true });
  };

  render() {
    const { id, title } = this.props;
    const campTitle = title || "Date Outreach";

    const { importContactsModal, recipientDetailModal, recipientDeleteModal } =
      this.state;
    const { recipientsFilters } = this.state;
    let { recipients } = this.props;

    recipients = recipients.map((recipient) => ({
      ...recipient,
      control: recipient.recipient_status ? "pause" : "play",
      tooltip: recipient.recipient_status ? "click to pause" : "click to start",
    }));

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
                  <DetailHeader activeItem="RECIPIENTS" id={id} />
                </Col>
              </Row>
            </Col>
          </Row>

          <Row className="mx-3" style={{ paddingLeft: 15, paddingRight: 15 }}>
            <Col md={12}>
              <Row className="my-3">
                {this.props.user.user_permission === permission.UPDATE && (
                  <Button
                    type="button"
                    className="btn-details"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      this.showImportContactsModal();
                    }}
                  >
                    ADD RECIPIENTS
                  </Button>
                )}
              </Row>

              <Row>
                <Tables
                  titles={recipientsFilters} // required
                  tablePropsData={recipients} // required
                  showPagination={true} // optional
                  showControl={true}
                  controlCallback={this.updateRecipientStatus}
                  onClick={this.showRecipientDetailModal}
                  onDelete={this.showRecipientDeleteModal}
                  searchKeys={["email", "name"]} // optional to enable search
                  filters={this.state.titleFilters} // optional
                />
              </Row>
            </Col>
          </Row>

          <ImportContactsModal
            isOpen={importContactsModal}
            close={this.closeImportContactsModal}
          />

          <RecipientDetailModal
            isOpen={recipientDetailModal}
            close={this.closeRecipientDetailModal}
            campaign_id={id}
            recipient_id={this.state.recipientDetailItem?.id}
            title={this.state.recipientDetailItem?.email}
          />

          <DeleteModal
            isOpen={recipientDeleteModal}
            close={this.closeRecipientDeleteModal}
            delete={() => this.deleteRecipient(this.state.recipientDeleteItem)}
            location="recipient"
          />

          <CSVDownloadModal
            data={recipients}
            isOpen={this.state.downloadCSVModal}
            close={this.closeDownloadCSVModal}
          />
        </PageContainer>
      </>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    id: state.campaignDetails.id,
    title: state.campaignDetails.title,
    recipients: state.campaignDetails.detailRecipients,
    user: state.auth.user,
  };
};
export default connect(mapStateToProps, {
  getDetailRecipients,
  deleteRecipient,
  updateRecipientStatus,
})(CampaignDetailRecipients);
