import PropTypes from "prop-types";
import React, { Component } from "react";
import ReactQuill from "react-quill";
import { connect } from "react-redux";
import { Button, Card, Col, Input, Row } from "reactstrap";

import { formatHeader, parseTemplate } from "../../../../utils/Utils";
import DripPanel from "./DripPanel";
import FollowUpPanel from "./FollowUpPanel";

class ThePreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRecipient: {},
      selectedRecipientIndex: 0,
      selectedEmailIndex: 0,
      preview: true,
      searchMerge: "",
      inputSearch: false,
      show: false,
    };
  }

  _emailBodyQuill = {
    ref: null,
  };

  /* componentDidUpdate(prevProps) {
    const { campaign } = this.props;
    console.log(campaign);
    if (prevProps.campaign !== campaign) {
      if (campaign.recipients) {
        this.setState({ selectedRecipient: campaign.recipients[0] });
      }
    }
  } */

  onPrev = () => {
    // call parent method
    this.props.onPrev();
  };

  onNext = () => {
    // call parent method
    this.props.onNext();
  };

  selectNextEmail = () => {
    const selectedEmailIndex = this.state.selectedEmailIndex + 1;

    // update the selectedEmailIndex if selectedEmailIndex less then the length of campaign emails
    if (this.props.campaign && this.props.campaign.emails && this.props.campaign.emails.length > selectedEmailIndex) {
      this.setState({
        selectedEmailIndex,
      });
    }
  };

  selectPrevEmail = () => {
    const selectedEmailIndex = this.state.selectedEmailIndex - 1;
    // update the selectedEmailIndex if selectedEmailIndex greater then 0
    if (selectedEmailIndex >= 0) {
      this.setState({
        selectedEmailIndex,
      });
    }
  };

  toggleEdit = () => {
    this.setState({ preview: !this.state.preview });
  };

  getEmailSubject = () => {
    const { preview, selectedEmailIndex } = this.state;
    const { campaign } = this.props;

    if (preview && campaign.emails && campaign.emails?.length !== 0) {
      return parseTemplate(
        campaign.emails[selectedEmailIndex].email_subject,
        campaign.emails[selectedEmailIndex].recipient
      );
    } else if (!preview && campaign.emails) {
      return campaign.emails[selectedEmailIndex].email_subject;
    } else {
      return campaign.email_subject;
    }
  };

  getEmailBody = () => {
    const { preview, selectedEmailIndex } = this.state;
    const { campaign } = this.props;

    if (preview && campaign.emails && campaign.emails?.length !== 0) {
      return parseTemplate(
        campaign.emails[selectedEmailIndex].email_body,
        campaign.emails[selectedEmailIndex].recipient
      );
    } else if (!preview && campaign.emails) {
      return campaign.emails[selectedEmailIndex].email_body;
    } else {
      return campaign.email_body;
    }
  };

  onSearchMerge = (e, type, id) => {
    const key = !id ? type : `${type}-${id}`;
    this.setState({ [key]: e.target.value });
  };

  getDNDSource = (panelItem, type) => {
    const {
      campaign: { first_row: firstRow },
    } = this.props;

    const filter = (element, type, id) => {
      const key = !id ? type : `${type}-${id}`;
      if (!this.state[key]) return true;
      return element.toLowerCase().includes(this.state[key].toLowerCase());
    };

    return (
      <div className="d-flex flex-wrap mt-2">
        <div className="row mb-1" style={{ width: "100%" }}>
          {firstRow && (
            <span
              className={
                this.state.inputSearch
                  ? "search-span borderColor"
                  : "search-span"
              }
              style={{ maxWidth: "300px" }}
              id="search-span-merge-fields"
              onClick={() => {
                this.setState({ inputSearch: true });
              }}
              onBlur={() => {
                this.setState({ inputSearch: false });
              }}
            >
              <Input
                placeholder="Search here"
                style={{ border: "none" }}
                className="search-table-merge-fields"
                name="search"
                type="search"
                onKeyUp={(e) => this.onSearchMerge(e, type, panelItem.index)}
              />
              <span className="span-inside">
                <span className="search-span-inside">
                  <i className="fas fa-search" />
                </span>
              </span>
            </span>
          )}
        </div>
        <div className="row" style={{ width: "100%" }}>
          {firstRow &&
            Object.keys(firstRow || {})
              .filter((field) => !!field)
              .filter((field) => filter(field, type, panelItem.index))
              .map((field, index) => {
                return (
                  <div
                    className="outline-button-merge-fields tag-button mr-1 mt-1"
                    key={`template ${index}`}
                    draggable="true"
                    onDragStart={(e) => {
                      const dataTransfer = e.dataTransfer;
                      dataTransfer.setData(
                        "text/html",
                        `<span class="keyword-item p-1 mr-2 my-1" style="font-size: 12px">{{${field}`
                      );
                      dataTransfer.setData("text", `{{${field}}}`);
                    }}
                    onClick={() => {
                      const { ref: _quillRef } = panelItem;
                      if (_quillRef) {
                        const currentLen = _quillRef.getEditor().getLength();
                        _quillRef
                          .getEditor()
                          .insertText(currentLen - 1, `{{${field}}}`);
                      }
                    }}
                  >
                    <p>{formatHeader(field)}</p>
                  </div>
                );
              })}
        </div>
      </div>
    );
  };

  render() {
    const { onPrev, onNext, campaign, sendPreview, className } = this.props;
    const { preview, selectedEmailIndex } = this.state;

    return (
      <>
        <Card
          className={
            className
              ? "send_campaign campaign-style " + className
              : "send_campaign campaign-style"
          }
          style={{ marginTop: 0 }}
        >
          <div className="padding-10-15">
            {!sendPreview && (
              <>
                <Row className="">
                  <Col md={8} className="text-center">
                    <h3 className="text-center my-4 sub-title">
                      Preview and personalize each email
                    </h3>
                  </Col>
                  <Col md={4}>
                    <Row className="justify-content-end">
                      {campaign.recipients &&
                      campaign.recipients?.length > 0 ? (
                        preview ? (
                          <Button
                            type="button"
                            onClick={() => this.toggleEdit()}
                            className="outline-button margin-text  justify-content-end"
                          >
                            EDIT
                          </Button>
                        ) : (
                          <Row>
                            <Button
                              type="button"
                              onClick={() => this.toggleEdit()}
                              className="outline-button margin-text  justify-content-end"
                            >
                              CANCEL
                            </Button>
                            <Button
                              type="button"
                              onClick={() => this.toggleEdit()}
                              className="active margin-text"
                              style={{
                                cursor: "normal",
                                padding: "8px 12px",
                                backgroundColor: "rgba(255,57,188,1.0)",
                                marginRight: 5,
                                borderRadius: 10,
                                color: "white",
                                fontSize: 18,
                                fontWeight: 700,
                              }}
                            >
                              SAVE
                            </Button>
                          </Row>
                        )
                      ) : (
                        <span
                          className="sub-title outline-button p-2"
                          style={{ fontSize: "12px" }}
                        >
                          Recipients not added yet{" "}
                        </span>
                      )}
                    </Row>
                  </Col>
                </Row>
                {campaign.recipients &&
                  campaign.recipients?.length > 0 &&
                  preview && (
                    <Row className="justify-content-between">
                      <div style={{ position: "relative", width: "100%" }}>
                        <label
                          className="ff-poppins ff-blue label_to"
                          style={{ paddingLeft: 15, position: "relative" }}
                        >
                          Recipient:{" "}
                        </label>

                        <span
                          className="ff-poppins ff-blue "
                          style={{ margin: "0 40px" }}
                        >
                          <strong>
                            {campaign.recipients[selectedEmailIndex].email}
                          </strong>
                        </span>
                        {this.state.selectedEmailIndex >0 ?
                        <img
                          src={STATIC_FILES.arrow_left}
                          onClick={() => this.selectPrevEmail()}
                          style={{
                            position: "absolute",
                            border: "1px solid #000041",
                            borderRadius: "50%",
                            right: "50px",
                            padding: "5px",
                          }}
                        /> : null }
                        {this.props.campaign && this.props.campaign.emails && this.props.campaign.emails.length > this.state.selectedEmailIndex+1 ?
                            <img
                              src={STATIC_FILES.arrow_right}
                              onClick={() => this.selectNextEmail()}
                              style={{
                                position: "absolute",
                                border: "1px solid #000041",
                                borderRadius: "50%",
                                right: "15px",
                                padding: "5px",
                              }}
                        /> : null}
                      </div>
                    </Row>
                  )}
              </>
            )}
            {!preview && (
              <Row className="margin-tag pl-3">
                {this.getDNDSource(this._emailBodyQuill, "principal")}
              </Row>
            )}

            <div className="border-compose" style={{ position: "relative" }}>
              <Row className="container_subject">
                <label className="label_to">Subject</label>
                <Input
                  value={this.getEmailSubject()}
                  onChange={(e) => {
                    this.setState({ email_subject: e.target.value });
                    campaign.emails[selectedEmailIndex].email_subject =
                      e.target.value;
                  }}
                  type="text"
                  className="form-control-sm text_blue poppins-semi-bold subject-input"
                  disabled={preview}
                />
              </Row>
              <Row style={{ marginTop: "10px" }}>
                <h3 className="label_to">Message</h3>
              </Row>
              <Row>
                <Col className="p-1">
                <ReactQuill
                  id="react-quill"
                  ref={(ref) => (this._emailBodyQuill.ref = ref)}
                  theme="bubble"
                  readOnly={preview}
                  className="Quill_div container_subject"
                  onChange={(value) => {
                    campaign.emails &&
                      !preview &&
                      (campaign.emails[selectedEmailIndex].email_body = value);
                  }}
                  value={this.getEmailBody()}
                  modules={{
                    toolbar: [
                      ["bold", "italic"],
                      ["link", "blockquote", "code", "image"],
                      [
                        {
                          list: "ordered",
                        },
                        {
                          list: "bullet",
                        },
                      ],
                    ],
                  }}
                  formats={{
                    formats: [
                      ["bold", "italic"],
                      ["link", "blockquote", "code", "image"],
                      ["list", "bullet"],
                    ],
                  }}
                />
                </Col>
              </Row>
            </div>

            <Row>
              <Col>
                {campaign.follow_up && campaign.follow_up[0] && (
                  <>
                    <p className="sub-title-preview">Follow-ups</p>
                    {campaign.follow_up.map((followUp, index) => (
                      <>
                        {!preview && (
                          <Row className="margin-tag pl-3">
                            {this.getDNDSource(followUp, "followUp")}
                          </Row>
                        )}
                        <FollowUpPanel
                          index={index}
                          data={followUp}
                          key={index}
                          preview={preview}
                          selectedEmail={selectedEmailIndex}
                        />
                      </>
                    ))}
                  </>
                )}
              </Col>
            </Row>

            <Row>
              <Col>
                {campaign.drips && campaign.drips[0] && (
                  <>
                    <p className="sub-title-preview">Drips</p>
                    {campaign.drips.map((drip, index) => (
                      <>
                        {!preview && (
                          <Row className="margin-tag pl-3">
                            {this.getDNDSource(drip, "drip")}
                          </Row>
                        )}
                        <DripPanel
                          index={index}
                          data={drip}
                          key={index}
                          preview={preview}
                          selectedEmail={selectedEmailIndex}
                        />
                      </>
                    ))}
                  </>
                )}
              </Col>
            </Row>

            {/* Buttons */}
            <Row className="mt-4 mb-3 justify-content-between campaign-style">
              {onPrev && (
                <Button
                  type="button"
                  className="color-button outline-button"
                  onClick={this.onPrev}
                >
                  <img src={STATIC_FILES.arrow_left} />
                  {"  "}
                  <p>PREV</p>
                </Button>
              )}

              {onNext && (
                <Button
                  type="button"
                  onClick={this.onNext}
                  className="outline-button margin-text"
                >
                  <p>NEXT</p> {"  "} <img src={STATIC_FILES.arrow_right} />
                </Button>
              )}
            </Row>
          </div>
        </Card>
      </>
    );
  }
}

ThePreview.propTypes = {
  onNext: PropTypes.func,
  onPrev: PropTypes.func,
  campaign: PropTypes.object,
  sendPreview: PropTypes.any,
  className: PropTypes.string,
};

const mapStateToProps = (state) => ({
  campaign: state.campaign,
});

export default connect(mapStateToProps)(ThePreview);
