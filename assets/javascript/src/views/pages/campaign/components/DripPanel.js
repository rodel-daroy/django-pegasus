import PropTypes from "prop-types";
import React from "react";
import ReactQuill from "react-quill";
import { Button, Col, FormGroup, Input, Label, Row } from "reactstrap";

import { parseTemplate } from "../../../../utils/Utils";

const modules = {
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
};

export default class DripPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wait_days: 1,
      email_subject: "",
      email_body: "",
    };
  }

  getPlural = (val, unit) => {
    if (!val) return unit;

    if (val > 1) {
      return val + " " + unit + "s";
    } else {
      return val + " " + unit;
    }
  };

  getEmailSubject = () => {
    const { data, preview, selectedEmail } = this.props;
    if (preview && data.emails && data.emails?.length !== 0) {
      return parseTemplate(
        data.emails[selectedEmail].email_subject,
        data.emails[selectedEmail].recipient
      );
    } else if (!preview && data.emails) {
      return data.emails[selectedEmail].email_subject;
    } else {
      return data.email_subject;
    }
  };

  getEmailBody = () => {
    const { data, preview, selectedEmail } = this.props;
    if (preview && data.emails && data.emails?.length !== 0) {
      return parseTemplate(
        data.emails[selectedEmail].email_body,
        data.emails[selectedEmail].recipient
      );
    } else if (!preview && data.emails) {
      return data.emails[selectedEmail].email_body;
    } else {
      return data.email_body;
    }
  };

  handleOnChangeSubject = (e) => {
    const { preview, data, selectedEmail } = this.props;
    this.setState({ email_subject: e.target.value });
    if (!preview && !data.emails) {
      data.email_subject = e.target.value;
    } else {
      data.emails[selectedEmail].email_subject = e.target.value;
    }
  };

  handleOnChangeBody = (value) => {
    const { preview, data, selectedEmail } = this.props;

    if (!preview && !data.emails) {
      data.email_body = value;
    } else if (!preview && data.emails) {
      data.emails[selectedEmail].email_body = value;
    }
  };

  render() {
    const { index, onDelete, data, preview } = this.props;

    return (
      <div className="send_campaign">
        <Row style={{ marginTop: -20 }}>
          <Col md={12} className="alignRight border-followup">
            {preview ? (
              <Row>
                <i
                  className="fas fa-stopwatch"
                  style={{ color: "rgba(255, 57, 188, 1)" }}
                  aria-hidden="true"
                ></i>
                <span className="text-gray">
                  &nbsp;&nbsp;{this.getPlural(data.wait_days, "day")} later
                </span>
              </Row>
            ) : (
              <>
                <Row>
                  <Col>
                    <FormGroup className="row align-center">
                      <Label
                        className="form-control-label label_to"
                        htmlFor="inputWaitDays"
                      >
                        <i className="fas fa-stopwatch" aria-hidden="true"></i>
                        &nbsp; Wait X days:&nbsp;
                      </Label>
                      <Col md="2">
                        <Input
                          defaultValue={data.wait_days}
                          className="form-control-sm text-compose"
                          id="inputWaitDays"
                          type="number"
                          onChange={(e) => {
                            this.setState({ wait_days: e.target.value });
                            data.wait_days = e.target.value;
                          }}
                        />
                      </Col>
                    </FormGroup>
                    {onDelete && (
                      <Button
                        className="button-delete justify-content-between"
                        type="button"
                        onClick={() => onDelete(index)}
                        style={{ position: "absolute", right: 15, top: 5 }}
                      >
                        <img
                          style={{ marginRight: "15px" }}
                          src={STATIC_FILES.delete_fuchsia}
                        ></img>
                        DELETE
                      </Button>
                    )}
                  </Col>
                </Row>
              </>
            )}

            <div>
              <Row className="margin-compose">
                <label className="label-subject">Subject</label>
                <Input
                  value={this.getEmailSubject()}
                  onChange={(e) => this.handleOnChangeSubject(e)}
                  type="text"
                  className="form-control-sm text_blue text-bold subject-input"
                  name="email_subject"
                  placeholder="Subject"
                  required={!preview}
                  disabled={preview}
                  onClick={e=> {if( this.props.selectedField ) { this.props.selectedField("subject");}}}
                />
              </Row>
            </div>
            <Row style={{ marginTop: "10px" }}>
              <h3 className="label_to">Message</h3>
            </Row>
            <Row>
              <Col className="p-0">
                <ReactQuill
                  ref={(ref) => {
                    if (!preview) data.ref = ref;
                  }}
                  value={this.getEmailBody()}
                  onChange={(value) => this.handleOnChangeBody(value)}
                  theme={preview ? "bubble" : "snow"}
                  className="Quill_div container_subject"
                  readOnly={preview}
                  modules={modules}
                  onFocus={(range, source, editor)=> {
                    if ( this.props.selectedField ) { this.props.selectedField("message");}
                  }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}

DripPanel.propTypes = {
  index: PropTypes.number,
  onDelete: PropTypes.func,
  selectedField: PropTypes.func,
  data: PropTypes.object,
  preview: PropTypes.bool,
  selectedEmail: PropTypes.number,
};
