import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Container,
  Row,
  Col,
  Table,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Form,
  FormGroup,
  Input,
  Button,
  Badge,
  Card,
  CardHeader,
  CardBody,
} from 'reactstrap'
import _ from "lodash"
import PreviewPanelList from './PreviewPanelList'
import MainPreviewPanel from './MainPreviewPanel'
import FollowUpPreviewPanel from './FollowUpPreviewPanel'
import DripPreviewPanel from './DripPreviewPanel'
import { permission } from '../../../../../utils/Enums'

class SequencePreviewPanel extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {}

  onEdit = () => {
    this.props.onEdit()
  }

  render() {
    const { detailsSequence } = this.props

    const main = detailsSequence.emails
      ? detailsSequence.emails.find((e) => e.email_type === 0)
      : undefined
    const followups = detailsSequence.emails
      ? _.sortBy(detailsSequence.emails.filter((e) => e.email_type === 1), ["email_order"])
      : []
    const drips = detailsSequence.emails
      ? _.sortBy(detailsSequence.emails.filter((e) => e.email_type === 2), ["email_order"])
      : []

    return (
      <>
        <Col md={12}>
          <Row className="my-3">
            {this.props.user.user_permission === permission.UPDATE && (
              <Button
                type="button"
                className="btn-details"
                size="sm"
                onClick={this.onEdit}
              >
                EDIT SEQUENCE
              </Button>
            )}
          </Row>
        </Col>
        <Row>
          <Col md="12">
            <Card>
              <CardHeader className="bg-transparent py-2">
                <h3 className="title-detail">Initial campaign email</h3>
              </CardHeader>
              <CardBody className="py-2">
                <PreviewPanelList>
                  {main && (
                    <MainPreviewPanel
                      subject={main.email_subject}
                      body={main.email_body}
                    />
                  )}
                </PreviewPanelList>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          {followups[0] && (
            <Col md={12}>
              <Card>
                <CardHeader className="bg-transparent py-2">
                  <h3 className="title-detail">Follow-Ups</h3>
                </CardHeader>
                <CardBody className="py-2">
                  <PreviewPanelList>
                    {followups.map((followup, index) => (
                      <FollowUpPreviewPanel
                        key={`item_${index}`}
                        subject={followup.email_subject}
                        body={followup.email_body}
                        waitDays={followup.wait_days}
                      />
                    ))}
                  </PreviewPanelList>
                </CardBody>
              </Card>
            </Col>
          )}
        </Row>
        <Row>
          {drips[0] && (
            <Col md={12}>
              <Card>
                <CardHeader className="bg-transparent py-2">
                  <h3 className="title-detail">Drips</h3>
                </CardHeader>
                <CardBody className="py-2">
                  <PreviewPanelList>
                    {drips.map((drip, index) => (
                      <DripPreviewPanel
                        key={`item_${index}`}
                        subject={drip.email_subject}
                        body={drip.email_body}
                        waitDays={drip.wait_days}
                      />
                    ))}
                  </PreviewPanelList>
                </CardBody>
              </Card>
            </Col>
          )}
        </Row>
      </>
    )
  }
}

const mapStateToProps = (state) => ({
  id: state.campaignDetails.id,
  title: state.campaignDetails.title,
  detailsSequence: state.campaignDetails.detailsSequence,
  user: state.auth.user,
})

export default connect(mapStateToProps)(SequencePreviewPanel)
