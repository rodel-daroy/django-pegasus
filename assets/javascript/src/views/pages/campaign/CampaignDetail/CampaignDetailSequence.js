import React, { Component } from "react";
import { connect } from "react-redux";
import { Col, Row } from "reactstrap";

import PageContainer from "../../../../components/Containers/PageContainer";
import { getDetailsSequence } from "../../../../redux/action/CampaignDetailsActions";
import DetailHeader from "./components/DetailHeader";
import MainPreviewPanel from "./components/MainPreviewPanel";
import SequenceEditPanel from "./components/SequenceEditPanel";
import SequencePreviewPanel from "./components/SequencePreviewPanel";

class CampaignDetailSequence extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
    };
  }

  componentDidMount() {
    this.props.getDetailsSequence(
      this.props.id,
      this.props.user.session_type,
      this.props.user.team_admin_id
    );
  }

  handleSubmit = () => {};

  onEdit = () => {
    this.setState({
      editing: true,
    });
  };

  onSave = () => {
    this.setState({
      editing: false,
    });
    this.props.getDetailsSequence(
      this.props.id,
      this.props.user.session_type,
      this.props.user.team_admin_id
    );
  };

  onCancel = () => {
    this.setState({
      editing: false,
    });
  };

  render() {
    const { editing } = this.state;
    const { id, title } = this.props;
    const campTitle = title || "Date Outreach";

    return (
      <PageContainer title={campTitle}>
        <Row className="mx-3">
          <Col md={4} className="mx-auto float-left">
            <h1 className="ff-poppins">{title}</h1>
          </Col>
          <Col md={8} className="mx-auto">
            <Row>
              <Col>
                <DetailHeader activeItem="SEQUENCE" id={id} />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mx-3">
          <Col md={12}>
            {editing ? (
              <SequenceEditPanel
                onSave={this.onSave}
                onCancel={this.onCancel}
              />
            ) : (
              <SequencePreviewPanel onEdit={this.onEdit} />
            )}
          </Col>
        </Row>
      </PageContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  id: state.campaignDetails.id,
  title: state.campaignDetails.title,
  user: state.auth.user,
});

export default connect(mapStateToProps, {
  getDetailsSequence,
})(CampaignDetailSequence);
