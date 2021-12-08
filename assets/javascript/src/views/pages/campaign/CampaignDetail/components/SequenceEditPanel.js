import React, { Component } from "react";
import ReactQuill from "react-quill";
import { connect } from "react-redux";
import { Button, Col, Form, Input, Row } from "reactstrap";
import _ from "lodash";

import { SaveIcon } from "../../../../../components/icons";
import { campaignUpdate } from "../../../../../redux/action/CampaignActions";
import { formatHeader, showNotification } from "../../../../../utils/Utils";
import DripPanel from "../../components/DripPanel";
import FollowUpPanel from "../../components/FollowUpPanel";

const FILE_ICONS = {
  video: STATIC_FILES.video_icon,
  img: STATIC_FILES.img_icon,
  doc: STATIC_FILES.doc_icon,
  music: STATIC_FILES.music_icon,
};
const imgType = ["jpg", "jpeg", "png", "gif", "tiff", "svg"];
const videoType = ["mp4", "avi", "mkv", "flv", "webm", "mpeg"];
const musicType = ["mp3", "wav", "aiff", "wma", "ogg", "aac"];
class SequenceEditPanel extends Component {
  constructor(props) {
    super(props);

    const {
      detailsSequence: { emails },
    } = props;

    const main = emails ? emails.find((e) => e.email_type === 0) : undefined;
    const followups = emails ? _.sortBy(emails.filter((e) => e.email_type == 1), ["email_order"]): [];
    const drips = emails ? _.sortBy(emails.filter((e) => e.email_type == 2), ["email_order"]) : [];

    this.state = {
      main: main,
      followups: followups,
      drips: drips,
    };
  }

  _emailBodyQuill = {
    ref: null,
  };

  componentDidMount() {}

  onAddFollowUp = () => {
    const { id } = this.props;
    this.setState((state) => {
      const newFollowUp = {
        files: [],
        campaign: id,
        email_subject: "Re: ",
        email_body: "Hi",
        wait_days: 1,
        is_deleted: false,
        email_type: 1,
      };
      const followups = state.followups.concat(newFollowUp);
      return {
        ...state,
        followups,
      };
    });
  };

  deleteFile = (index) => {
    const array = [...this.state.files]; // make a separate copy of the array

    array.splice(index, 1);
    this.setState({ files: array });
  };

  getTypeFile = (nameFile) => {
    const typeFile = nameFile.split(".").pop().toLowerCase();

    if (videoType.some((elem) => elem == typeFile)) {
      return FILE_ICONS.video;
    } else if (imgType.some((elem) => elem == typeFile)) {
      return FILE_ICONS.img;
    } else if (musicType.some((elem) => elem == typeFile)) {
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

  onDeleteFollowUp = (index) => {
    this.setState((state) => {
      const followups = state.followups.map((item, i) => {
        if (index == i) {
          item.is_deleted = true;
        }
        return item;
      });
      return {
        ...state,
        followups,
      };
    });
  };

  onAddDrip = () => {
    const { id } = this.props;
    this.setState((state) => {
      const newFollowUp = {
        campaign: id,
        email_subject: "Re: ",
        email_body: "Hi",
        wait_days: 1,
        is_deleted: false,
        email_type: 2,
      };
      const drips = state.drips.concat(newFollowUp);
      return {
        ...state,
        drips,
      };
    });
  };

  onDeleteDrip = (index) => {
    this.setState((state) => {
      const drips = state.drips.map((item, i) => {
        if (index == i) {
          item.is_deleted = true;
        }
        return item;
      });
      return {
        ...state,
        drips,
      };
    });
  };

  onSave = async () => {
    const main = this.state.main;
    const followups = this.state.followups
      .filter(
        (followup) => followup.id !== undefined || followup.is_deleted === false
      )
      .map((followup, index) => {
        followup.email_order = index;
        followup.ref = null;
        return followup;
      });
    const drips = this.state.drips
      .filter((drip) => drip.id !== undefined || drip.is_deleted === false)
      .map((drip, index) => {
        drip.email_order = index;
        drip.ref = null;
        return drip;
      });
    const emails = [main].concat(followups).concat(drips);

    if (!main.email_subject) {
      showNotification("danger", "The email subject should not be empty.");
      return false;
    }

    if (!main.email_body) {
      showNotification("danger", "The email body should not be empty.");
      return false;
    }

    for (const followup of followups) {
      if (!followup.email_subject) {
        showNotification("danger", "The email subject should not be empty.");
        return false;
      }

      if (!followup.email_body) {
        showNotification("danger", "The email body should not be empty.");
        return false;
      }

      if (followup.wait_days <= 0) {
        showNotification("danger", "The wait days should be greater than 0.");
        return false;
      }
    }

    for (const drip of drips) {
      if (!drip.email_subject) {
        showNotification("danger", "The email subject should not be empty.");
        return false;
      }

      if (!drip.email_body) {
        showNotification("danger", "The email body should not be empty.");
        return false;
      }

      if (drip.wait_days <= 0) {
        showNotification("danger", "The wait days should be greater than 0.");
        return false;
      }
    }

    await this.props.campaignUpdate(emails);
    this.props.onSave();
  };

  onCancel = () => {
    this.props.onCancel();
  };

  getDNDSource = (panelItem) => {
    const { detailsSequence } = this.props;

    return (
      <div className="d-flex flex-wrap mt-2">
        {(detailsSequence.csv_fields || "").split(",").map((field, index) => {
          return (
            <div
              className="outline-button tag-button mr-2 mt-3"
              key={`template ${index}`}
              draggable="true"
              onDragStart={(e) => {
                const dataTransfer = e.dataTransfer;
                dataTransfer.setData(
                  "text/html",
                  `<span class="keyword-item p-1 mr-2 my-1">{{${field}}}</span>`
                );
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
    );
  };

  render() {
    return (
      <Row>
        <Col md={10} className="mx-auto campaign-style">
          <Row className="my-3">
            <Col className="text-right">
              <Button
                type="button"
                size="sm"
                className="btn-outline-details"
                onClick={this.onCancel}
              >
                <i className="fa fa-times" aria-hidden="true"></i>
                &nbsp;Cancel
              </Button>
              <Button
                type="button"
                className="btn-details flex-row"
                size="sm"
                onClick={this.onSave}
              >
                <img src={STATIC_FILES.save} /> Save
              </Button>
            </Col>
          </Row>
          <Form>
            <label className="sub-title follow-title mt-2">
              Initial campaign email
            </label>
            <Row className="margin-tag">
              {this.getDNDSource(this._emailBodyQuill)}
            </Row>
            <div className="border-compose">
              <Row className="margin-compose">
                <Col>
                  <label className="label-subject" htmlFor="inputTitle">
                    Subject Line
                  </label>
                  {this.state.main && (
                    <Input
                      type="text"
                      className="form-control-sm text_blue poppins-semi-bold subject-input"
                      name="email_subject"
                      defaultValue={this.state.main.email_subject}
                      onChange={(e) => {
                        const { main } = this.state;
                        main.email_subject = e.target.value;
                        this.setState({
                          ...this.state,
                          main,
                        });
                      }}
                      placeholder="Subject"
                      required
                    />
                  )}
                </Col>
              </Row>
              <Row className="position-relative">
                <Col className="p-1">
                  {this.state.main && (
                    <>
                      <label className="label-subject">message</label>
                      <ReactQuill
                        ref={(ref) => (this._emailBodyQuill.ref = ref)}
                        defaultValue={this.state.main.email_body}
                        onChange={(value) => {
                          const { main } = this.state;
                          main.email_body = value;
                          this.setState({
                            ...this.state,
                            main,
                          });
                        }}
                        theme="snow"
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
                      />
                    </>
                  )}
                </Col>
                <div className="attach-div">
                  <div className="attach-files">
                    <div>
                      <img src={STATIC_FILES.attach} />
                    </div>
                    <p className="files-text">
                      ATTACHMENT FILES (
                      {this.state.files
                        ? Array.from(this.state.files).length
                        : 0}
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
                        this.setState({ files: Array.from(e.target.files) });
                      }}
                    />
                  </div>
                </div>
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
                        <p className="file-size">
                          {this.getFileSize(file.size)}
                        </p>
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
              {this.state.followups[0] && (
                <Col>
                  <label className="sub-title follow-title">Follow-ups</label>
                  {this.state.followups.map(
                    (followup, index) =>
                      !followup.is_deleted && (
                        <div
                          key={"follow" + index}
                          style={{ position: "relative" }}
                        >
                          <Row className="margin-tag">
                            {this.getDNDSource(followup)}
                          </Row>
                          <FollowUpPanel
                            index={index}
                            onDelete={this.onDeleteFollowUp}
                            data={followup}
                          />
                          <div
                            className="px-3"
                            style={{ position: "absolute", top: 15 }}
                          />
                        </div>
                      )
                  )}
                  {this.state.drips[0] && (
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
              )}
            </Row>

            <Row>
              {this.state.drips[0] && (
                <Col>
                  <label className="sub-title follow-title">Drips</label>
                  {this.state.drips.map(
                    (drip, index) =>
                      !drip.is_deleted && (
                        <div key={"drip" + index}>
                          <Row className="margin-tag">
                            {this.getDNDSource(drip)}
                          </Row>
                          <DripPanel
                            index={index}
                            onDelete={this.onDeleteDrip}
                            data={drip}
                          />
                          <div
                            className="px-3"
                            style={{ position: "absolute", top: 20 }}
                          />
                        </div>
                      )
                  )}
                </Col>
              )}
            </Row>

            <Row className="group-botton">
              {(!this.state.followups[0] || !this.state.drips[0]) && (
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
          </Form>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  id: state.campaignDetails.id,
  title: state.campaignDetails.title,
  detailsSequence: state.campaignDetails.detailsSequence,
});

export default connect(mapStateToProps, {
  campaignUpdate,
})(SequenceEditPanel);
