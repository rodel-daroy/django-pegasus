/* eslint-disable no-undef */
import PropTypes from "prop-types";
import React, { Component } from "react";
import ReactQuill from "react-quill";
import { connect } from "react-redux";
import { Button, Card, Col, Form, Input, Row } from "reactstrap";

import { history } from "../../../../index";
import { campaignCompose } from "../../../../redux/action/CampaignActions";
import { formatHeader } from "../../../../utils/Utils";
import DripPanel from "./DripPanel";
import FollowUpPanel from "./FollowUpPanel";

const FILE_ICONS = {
  video: STATIC_FILES.video_icon,
  img: STATIC_FILES.img_icon,
  doc: STATIC_FILES.doc_icon,
  music: STATIC_FILES.music_icon,
};
const imgType = ["jpg", "jpeg", "png", "gif", "tiff", "svg"];
const videoType = ["mp4", "avi", "mkv", "flv", "webm", "mpeg"];
const musicType = ["mp3", "wav", "aiff", "wma", "ogg", "aac"];
class TheCompose extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      subject: "",
      email_body: "",
      selectedField: null,
      followUpList: [],
      dripList: [],
      searchMerge: "",
      inputSearch: false,
    };

    if (this.props.campaignSequenceToCopy && Object.keys(this.props.campaignSequenceToCopy).length!== 0
        && this.props.duplicated) {
      for (
        let i = 0;
        i < this.props.campaignSequenceToCopy.emails.length;
        i++
      ) {
        const email = this.props.campaignSequenceToCopy.emails[i];

        if (email.email_type === 0) {
          this.state.subject = email.email_subject;
          this.state.email_body = email.email_body;
        } else if (email.email_type === 1) {
          this.state.followUpList.push({
            index: this.state.followUpList,
            email_subject: email.email_subject,
            email_body: email.email_body,
            wait_days: email.wait_days,
          });
        } else if (email.email_type === 2) {
          this.state.dripList.push({
            index: this.state.followUpList,
            email_subject: email.email_subject,
            email_body: email.email_body,
            wait_days: email.wait_days,
          });
        }
      }
    } else {
      history.push('/app/admin/campaign/list')
    }
  }

  _emailBodyQuill = {
    ref: null,
  };

  handleSelectedField = (field) => {
    this.setState({selectedField: field});
  }

  onAddFollowUp = () => {
    this.setState((state) => {
      const index = state.followUpList.length;
      const newFollowUp = {
        index,
        email_subject: `Re: ${this.state.subject}`,
        email_body: "Hi",
        wait_days: 1,
      };
      const followUpList = state.followUpList.concat(newFollowUp);
      return {
        ...state,
        followUpList,
      };
    });
  };

  onDeleteFollowUp = (index) => {
    this.setState(
      (state) => {
        const followUpList = state.followUpList.filter(
          (item, i) => i !== index
        );
        return {
          ...state,
          followUpList,
        };
      },
      () => this.props.campaignCompose(this.formatData())
    );
  };

  onAddDrip = () => {
    this.setState(
      (state) => {
        const index = state.dripList.length;
        const newFollowUp = {
          index,
          email_subject: "Re: ",
          email_body: "Hi",
          wait_days: 1,
        };
        const dripList = state.dripList.concat(newFollowUp);
        return {
          ...state,
          dripList,
        };
      },
      () => this.props.campaignCompose(this.formatData())
    );
  };

  onDeleteDrip = (index) => {
    this.setState(
      (state) => {
        const dripList = state.dripList.filter((item, i) => i !== index);
        return {
          ...state,
          dripList,
        };
      },
      () => this.props.campaignCompose(this.formatData())
    );
  };

  buildEmails = (email, recipients) => {
    const emails = [];
    if (recipients) {
      for (const currentRecipient of recipients) {
        const newEmail = {};
        newEmail.email_subject = email.email_subject;
        newEmail.email_body = email.email_body;
        newEmail.recipient = currentRecipient;

        emails.push(newEmail);
      }
    }

    return emails;
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const data = this.formatData();

    this.props.campaignCompose(data);
    // call parent method
    this.props.onNext();
  };

  formatData = () => {
    const { campaign } = this.props;
    const template = {
      email_subject: this.state.subject,
      email_body: this.state.email_body,
    };
    const emails = this.buildEmails(template, campaign.recipients);

    const followUps = this.state.followUpList.map((item) => {
      const dup = {
        ...item,
      };
      delete dup.ref;
      dup.emails = this.buildEmails(item, campaign.recipients);

      return dup;
    });
    const drips = this.state.dripList.map((item) => {
      const dup = {
        ...item,
      };
      delete dup.ref;
      dup.emails = this.buildEmails(item, campaign.recipients);

      return dup;
    });
    const data = {
      ...template,
      emails: emails,
      follow_up: followUps,
      drips: drips,
    };

    return data;
  };

  onPrev = () => {
    // call parent method
    this.props.onPrev();
  };

  getTypeFile = (nameFile) => {
    const typeFile = nameFile.split(".").pop().toLowerCase();
    if (videoType.some((elem) => elem === typeFile)) {
      return FILE_ICONS.video;
    } else if (imgType.some((elem) => elem === typeFile)) {
      return FILE_ICONS.img;
    } else if (musicType.some((elem) => elem === typeFile)) {
      return FILE_ICONS.music;
    } else {
      return FILE_ICONS.doc;
    }
  };

  getFileSize = (file) => {
    const sizeb = file.toString();
    if (sizeb.length < 4) {
      return `${sizeb}bytes`;
    } else if (sizeb.length < 7 && sizeb.length >= 4) {
      return `${sizeb.slice(0, -3)}.${sizeb.slice(-4, -3)}kb`;
    } else {
      return `${sizeb.slice(0, -6)}.${sizeb.slice(-7, -6)}mb`;
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
          {Object.keys(firstRow || {})
            .filter((field) => !!field)
            .filter((field) => filter(field, type, panelItem.index))
            .map((field, index) => {
              return (
                <div
                  className="outline-button-merge-fields tag-button mt-1 mr-1"
                  key={`template ${index}`}
                  draggable="true"
                  onDragStart={(e) => {
                    const dataTransfer = e.dataTransfer;
                    dataTransfer.setData(
                      "text/html",
                      `<span class="keyword-item p-1 mr-2 my-1" style="font-size: 12px">{{${field}}}</span>`
                    );
                    dataTransfer.setData("text", `{{${field}}}`);
                  }}
                  onClick={() => {
                    if (this.state.selectedField && (this.state.selectedField === "subject")) {
                      const {index: elem_index  } = panelItem;
                      if(type === "followUp"){
                        // handle the followUp
                        const followUpList = this.state.followUpList;
                        followUpList[elem_index]["email_subject"] = followUpList[elem_index]["email_subject"] +  `{{${field}}}`;
                        this.setState({ "followUpList": followUpList }, () =>
                          this.props.campaignCompose(this.formatData())
                        );
                      } else if (type === "drip") {
                        // handle the drips
                        const dripList = this.state.dripList;
                        dripList[elem_index]["email_subject"] = dripList[elem_index]["email_subject"] +  `{{${field}}}`;
                        this.setState({ "dripList": dripList }, () =>
                          this.props.campaignCompose(this.formatData())
                        );
                      }
                      else {
                        this.setState({subject: this.state.subject + `{{${field}}}`}, () =>
                            this.props.campaignCompose(this.formatData())
                        );
                      }
                      return
                    }
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

  deleteFile = (index) => {
    const array = [...this.state.files]; // make a separate copy of the array

    array.splice(index, 1);
    this.setState({ files: array }, () =>
      this.props.campaignCompose(this.formatData())
    );
  };

  render() {
    const { onPrev, onNext } = this.props;
    return (
      <Card className="campaign-style">
        <Form onSubmit={this.handleSubmit} className=" position-relative">
          <Row>
            <Col>
              <h2 className="text-center my-4 sub-title">
                Compose the emails in this campaign
              </h2>
            </Col>
          </Row>
          <Row className="pl-3">
            {this.getDNDSource(this._emailBodyQuill, "principal")}
          </Row>
          <div className="border-compose">
            <Row className="margin-compose">
              <label className="label-subject" htmlFor="inputTitle">
                Subject Line
              </label>
              <Input
                type="text"
                className="form-control-sm text_blue text-bold subject-input"
                name="subject"
                value={this.state.subject}
                onChange={(e) => {
                  this.setState({ subject: e.target.value }, () =>
                    this.props.campaignCompose(this.formatData())
                  );
                }}
                onClick={e=> this.setState({selectedField: "subject"})}
                placeholder="Subject"
              />
            </Row>
            <Row className="position-relative">
              <Col className="p-1">
                <label className="label-subject">message</label>
                <ReactQuill
                  id="react-quill"
                  placeholder="Write something..."
                  ref={(ref) => (this._emailBodyQuill.ref = ref)}
                  onChange={(value) => {
                    this.setState({ email_body: value }, () =>
                      this.props.campaignCompose(this.formatData())
                    );
                  }}
                  onFocus={(range, source, editor)=> {
                    this.setState({selectedField: "message"})}
                  }
                  value={this.state.email_body}
                  className="Quill_div container_subject"
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
              {/* Uncomment when implemented in the backend
              <div className="attach-div">
                <div className="attach-files">
                  <div>
                    <img src={STATIC_FILES.attach} />
                  </div>
                  <p className="files-text">
                    ATTACHMENT FILES (
                    {this.state.files ? Array.from(this.state.files).length : 0}
                    )
                  </p>
                </div>
                <div className="attach-files input-files">
                  <div className="attach-img">
                    <img src={STATIC_FILES.arrow_upload2} />
                    <img src={STATIC_FILES.arrow_upload} />
                  </div>
                  <p>Attach Files</p>
                  <input
                    type="file"
                    name="files"
                    multiple
                    className="btn-submit"
                    onChange={(e) => {
                      this.setState({ files: Array.from(e.target.files) }, () =>
                        this.props.campaignCompose(this.formatData())
                      );
                    }}
                  />
                </div>
              </div> */}
            </Row>
          </div>
          {this.state.files && (
            <div className="files-container">
              {this.state.files.map((file, index) => {
                return (
                  <div key={index} className="file-box">
                    <div className="filetype-box">
                      <img src={this.getTypeFile(file.name)} />
                    </div>
                    <div className="fileinfo-box">
                      <p className="file-name">
                        {file.name.substring(0, 8) + "..."}
                      </p>
                      <p className="file-size">{this.getFileSize(file.size)}</p>
                    </div>
                    <img
                      src={STATIC_FILES.delete_x}
                      onClick={() => this.deleteFile(index)}
                    ></img>
                  </div>
                );
              })}
            </div>
          )}

          <Row className="mt-3">
            {this.state.followUpList?.length ? (
              <Col>
                <label className="sub-title follow-title">Follow-ups</label>
                {this.state.followUpList.map((followUp, index) => (
                  <div key={"follow" + index} style={{ position: "relative" }}>
                    <Row className="margin-tag">
                      {this.getDNDSource(followUp, "followUp")}
                    </Row>
                    <FollowUpPanel
                      index={index}
                      onDelete={this.onDeleteFollowUp}
                      data={followUp}
                      selectedField={this.handleSelectedField}
                    />
                    <div
                      className="px-3"
                      style={{ position: "absolute", top: 15 }}
                    />
                  </div>
                ))}
                {this.state.dripList[0] && (
                  <Row className="mt-4 ml-2">
                    <Button
                      type="button"
                      className="button-follow"
                      onClick={this.onAddFollowUp}
                    >
                      <img src={STATIC_FILES.arrow_follow} />
                      {"  "}
                      <p>Add Follow-Up</p>
                    </Button>
                  </Row>
                )}
              </Col>
            ) : (
              0
            )}
          </Row>

          <Row>
            {this.state.dripList[0] && (
              <Col>
                <label className="sub-title follow-title">Drips</label>
                {this.state.dripList.map((drip, index) => (
                  <div key={"drip" + index}>
                    <Row className="margin-tag">
                      {this.getDNDSource(drip, "drip")}
                    </Row>
                    <DripPanel
                      index={index}
                      onDelete={this.onDeleteDrip}
                      data={drip}
                      selectedField={this.handleSelectedField}
                    />
                    <div
                      className="px-3"
                      style={{ position: "absolute", top: 20 }}
                    />
                  </div>
                ))}
              </Col>
            )}
          </Row>

          {/* Button follow */}
          <Row className="group-botton">
            {(!this.state.followUpList[0] || !this.state.dripList[0]) && (
              <Button
                type="button"
                className="button-follow"
                onClick={this.onAddFollowUp}
              >
                <img src={STATIC_FILES.arrow_follow} />
                {"  "}
                <p>Add Follow-Up</p>
              </Button>
            )}
            <Button
              type="button"
              className="button-follow"
              onClick={this.onAddDrip}
            >
              <img src={STATIC_FILES.arrow_follow} />
              {"  "}
              <p>Add Drip</p>
            </Button>
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
    );
  }
}

TheCompose.propTypes = {
  campaignCompose: PropTypes.func,
  onNext: PropTypes.func,
  onPrev: PropTypes.func,
  campaign: PropTypes.object,
  campaignSequenceToCopy: PropTypes.object,
  duplicated: PropTypes.bool,
};

const mapStateToProps = (state) => {
  return {
    campaign: state.campaign,
    campaignSequenceToCopy: state.campaignDetails.detailsSequence,
  };
};

export default connect(mapStateToProps, { campaignCompose })(TheCompose);
