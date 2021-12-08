import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Col, Row } from "reactstrap";

import PageContainer from "../../../../components/Containers/PageContainer";
import {
  getDetailsSequence,
  getOverviewSummary,
} from "../../../../redux/action/CampaignDetailsActions";
import DetailHeader from "./components/DetailHeader";
import OverviewSummary from "./components/OverviewSummary";

class CampaignDetailOverview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 0,
    };
  }

  onSelectTab(activeTab) {
    this.setState({
      activeTab,
    });
  }

  componentDidMount() {
    const id = this.props.match.params.id;
    if (!parseInt(id)) {
      this.props.history.push("/app/admin/campaign/list");
    } else {
      this.props.getOverviewSummary(id);
      this.props.getDetailsSequence(
        this.props.id,
        this.props.user.session_type,
        this.props.user.team_admin_id
      );
    }
  }

  render() {
    const { id, title } = this.props;

    return (
      <PageContainer>
        <Row className="mx-3">
          <Col md={4} className="mx-auto float-left">
            <h1 className="ff-poppins">{title}</h1>
          </Col>
          <Col md={8} className="mx-auto">
            <Row>
              <Col>
                <DetailHeader activeItem="OVERVIEW" id={id} />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mx-3 mt-5">
          <Col md={12}>
            <OverviewSummary campaignId={id} />
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

CampaignDetailOverview.propTypes = {
  id: PropTypes.number,
  title: PropTypes.string,
  user: PropTypes.object,
  getOverviewSummary: PropTypes.func,
  getDetailsSequence: PropTypes.func,
  match: PropTypes.any,
  history: PropTypes.any,
};

export default connect(mapStateToProps, {
  getOverviewSummary,
  getDetailsSequence,
})(CampaignDetailOverview);
