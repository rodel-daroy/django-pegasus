// file for option pick in campaign
import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Card, Col, Form, Input, Row } from "reactstrap";

import { campaignOptions } from "../../../../redux/action/CampaignActions";

class TheOptions extends Component {
  constructor() {
    super();
    this.state = {
      trackOpen: true,
      trackLink: true,
      termsandlaws: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = (event) => {
    this.setState(
      {
        [event.target.name]: event.target.checked,
      },
      () => this.props.campaignOptions(this.formatData())
    );
  };

  formatData = () => {
    const optionData = {
      track_opens: this.state.trackOpen,
      terms_and_laws: this.state.termsandlaws,
      track_linkclick: this.state.trackLink,
    };
    return optionData;
  };

  handleSubmit = (event) => {
    event.preventDefault();

    const optionData = this.formatData();
    this.props.campaignOptions(optionData);
    this.props.onNext();
  };

  onPrev = () => {
    this.props.onPrev();
  };

  render() {
    const { onPrev, onNext } = this.props;
    return (
      <>
        <Card>
          <Form
            onSubmit={this.handleSubmit}
            className=" campaign-style options_campaigns"
          >
            <Row>
              <Col>
                <h3 className="text-center my-4 sub_title">
                  Tweak how your campaign will be sent
                </h3>
              </Col>
            </Row>
            <Row>
              <Col className="mx-auto">
                <div className="custom-control custom-checkbox checkbox mb-3">
                  <input
                    className="custom-control-input checkbox_container"
                    id="check1"
                    type="checkbox"
                    defaultChecked={this.state.trackOpen}
                    name="trackOpen"
                    onChange={this.handleChange}
                  />
                  <label className="custom-control-label" htmlFor="check1">
                    Track opens
                  </label>
                </div>

                <div className="custom-control custom-checkbox checkbox mb-3">
                  <input
                    className="custom-control-input checkbox_container"
                    id="check2"
                    type="checkbox"
                    defaultChecked={this.state.trackLink}
                    name="trackLink"
                    onChange={this.handleChange}
                  />
                  <label className="custom-control-label" htmlFor="check2">
                    Track link clicks
                  </label>
                  {(!this.state.trackOpen || !this.state.trackLink) && (
                    <Card
                      className="pt-3 pl-3 mt-3"
                      style={{ backgroundColor: "#EEEEEE" }}
                    >
                      <span>
                        <i className="ni ni-air-baloon text_fuchsia"></i>
                        &nbsp;&nbsp;
                        <b className="text_blue">Friendly remember</b>
                      </span>
                      <p className="text_gray">
                        Disabling tracking may affect your rules for follow-ups
                        or lead-catcher and may prevent click-triggered messages
                        from sending.
                      </p>
                    </Card>
                  )}
                </div>

                <div className="custom-control custom-checkbox checkbox mb-3">
                  <input
                    className="custom-control-input checkbox_container"
                    id="check3"
                    type="checkbox"
                    checked={this.state.termsandlaws}
                    name="termsandlaws"
                    onChange={this.handleChange}
                  />
                  <label className="custom-control-label" htmlFor="check3">
                    I'll obey pertinent laws and I've read the
                    <a
                      href="/app/admin/terms-conditions"
                      target="_blank"
                      className="text_blue text-bold"
                    >
                      {" "}
                      important notes.
                    </a>
                  </label>
                </div>
              </Col>
            </Row>

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

              {onNext && (
                <Button type="submit" className="outline-button margin-text">
                  <p>NEXT</p> {"  "} <img src={STATIC_FILES.arrow_right} />
                </Button>
              )}
            </Row>
          </Form>
        </Card>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  campaign: state.campaign,
});

export default connect(mapStateToProps, { campaignOptions })(TheOptions);
