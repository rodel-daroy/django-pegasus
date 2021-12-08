import { options } from "dropzone";
import React from "react";
import { connect } from "react-redux";
import { Col, Row } from "reactstrap";
import TabContent from "reactstrap/lib/TabContent";
import TabPane from "reactstrap/lib/TabPane";

import PageContainer from "../../../../components/Containers/PageContainer";
import { getMailAccounts } from "../../../../redux/action/MailAccountsActions";
import CampaignTabs from "../components/CampaignTabs";
import TheCompose from "../components/TheCompose";
import TheOptions from "../components/TheOptions";
import ThePreview from "../components/ThePreview";
import TheRecipient from "../components/TheRecipient";
import TheSend from "../components/TheSend";
// Page Components
import TheStart from "../components/TheStart";

class CampaignStart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 0,
      data: {},
      errorTab: [],
      mailAccounts: null,
      duplicated:
        location.pathname.includes("duplicate") &&
        !location.pathname.includes("create"),
    };

    this.tabs = ["START", "RECIPIENT", "COMPOSE", "PREVIEW", "OPTIONS", "SEND"];
  }

  async  componentDidMount() {
    const mailAccounts = await this.props.getMailAccounts(
      this.props.user.session_type,
      this.props.user.team_admin_id
    );
    this.setState({mailAccounts: mailAccounts})
  }

  onChangeTab = (tabId, tabName) => {
    const tabError = this.state.errorTab.filter(
      (element) => element !== tabName
    );
    this.setState({ activeTab: tabId, errorTab: tabError });
  };

  onPrev = () => {
    this.setState((state) => ({
      activeTab: (state.activeTab - 1) % 6,
    }));
  };

  onNext = () => {
    this.setState((state) => ({
      activeTab: (state.activeTab + 1) % 6,
    }));
  };

  /* UNSAFE_componentWillReceiveProps(preProps) {
    console.log(preProps.campaign);
  } */

  validateData = (data) => {
    this.setState({ errorTab: data });
  };

  render() {
    const { activeTab, errorTab } = this.state;
    const { campaign } = this.props;
    return (
      <>
        <PageContainer title={"New Campaign"}>
          { this.state.mailAccounts ?
              (<Row>
            <Col md={10} className="mx-auto">
              <Row>
                <Col className="new-campaign-header">
                  <CampaignTabs
                    tabs={this.tabs}
                    activeTab={activeTab}
                    errorTab={errorTab}
                    data={this.data}
                    onClick={this.onChangeTab}
                  />
                </Col>
              </Row>
              <Row>
                <Col>
                  <TabContent activeTab={activeTab}>
                    <TabPane tabId={0}>
                      <TheStart onNext={this.onNext} />
                    </TabPane>
                    <TabPane tabId={1}>
                      <TheRecipient onPrev={this.onPrev} onNext={this.onNext} />
                    </TabPane>
                    <TabPane tabId={2}>
                      <TheCompose
                        onPrev={this.onPrev}
                        onNext={this.onNext}
                        duplicated={this.state.duplicated}
                      />
                    </TabPane>
                    <TabPane tabId={3}>
                      <ThePreview
                        onPrev={this.onPrev}
                        onNext={this.onNext}
                        className="campaign-style"
                      />
                    </TabPane>
                    <TabPane tabId={4}>
                      <TheOptions onPrev={this.onPrev} onNext={this.onNext} />
                    </TabPane>
                    <TabPane tabId={5}>
                      <TheSend
                        onPrev={this.onPrev}
                        validateData={this.validateData}
                      />
                    </TabPane>
                  </TabContent>
                </Col>
              </Row>
            </Col>
          </Row>): null }
        </PageContainer>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  campaign: state.campaign,
  user: state.auth.user,
});

export default connect(mapStateToProps, { getMailAccounts })(CampaignStart);
