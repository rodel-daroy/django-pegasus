import React from "react";
import { connect } from "react-redux";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  Button,
  Card,
  Col,
  CustomInput,
  Form,
  FormGroup,
  Input,
  Row,
} from "reactstrap";

import { campaignStart } from "../../../../redux/action/CampaignActions";
import { showNotification } from "../../../../utils/Utils";
import { history } from '../../../../index'

const styleSelect = {
  control: (base) => ({
    ...base,
    border: "1px solid #c2c2c2",
  }),
  input: (base) => ({
    height: "50px",
    alignItems: "center",
    paddingTop: 13,
  }),
};

class TheStart extends React.Component {
  constructor(props) {
    super(props);
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const now = new Date();
    const thisMonth = months[now.getMonth()];
    const title = thisMonth + " " + now.getDate() + " Outreach";
    this.state = {
      title: title,
      from_address: "",
      mailsExist: null,
      openSearch: false,
    };
  }

  handleChange = (e) => {
    this.setState(
      {
        [e.target.name]: e.target.value,
      },
      () => this.props.campaignStart(this.formatData())
    );
  };

  validateForm = () => {
    if (this.state.title === "" || this.state.from_address === "") {
      showNotification("warning", "Info", "Please complete the data");
    }
  };

  getSelectValues = (select) => {
    const result = [];
    const options = select && select.options;
    let opt;

    for (let i = 0, iLen = options?.length; i < iLen; i++) {
      opt = options[i];

      if (opt.selected) {
        result.push(opt.value || opt.text);
      }
    }
    return result;
  };

  handleChangeSelect = (e) => {
    this.setState(
      { from_address: e.map((_) => _.value), multiValue: e },
      () => {
        this.props.campaignStart(this.formatData());
      }
    );
  };

  formatData = () => {
    const data = {
      session_type: this.props.user.session_type,
      admin_id: this.props.user.team_admin_id,
      title: this.state.title,
      from_address: this.state.from_address,
    };

    return data;
  };

  handleSubmit = (e) => {
    e.preventDefault();
    if(this.props.mailAccounts?.length === 0) {
      // redirect user to create an email account
      showNotification("danger", "Info", "Please add an email account first");
      history.push("/app/admin/mail-account", {id: this.props.campaign.admin_id });
    } else {
      const data = this.formatData();    
      this.props.campaignStart(data);
      this.props.onNext();
    }
  };

  render() {
    const { onPrev, onNext, mailAccounts } = this.props;
    const animatedComponents = makeAnimated();

    const optionSelect = [];
    mailAccounts.map((item) => {
      optionSelect.push({ value: item.id, label: item.email });
    });

    return (
      <>
        <Card>
          <Form onSubmit={this.handleSubmit} className="campaign-style">
            <Row>
              <Col>
                <h2 className="text-center sub-title my-4">
                  Let's get started
                </h2>
              </Col>
            </Row>
            <Row>
              <Col>
                <FormGroup>
                  <label className="label-custom" htmlFor="inputTitle">
                    Title (for your team's eyes only)
                  </label>
                  <Input
                    id="inputTitle"
                    type="text"
                    name="title"
                    value={this.state.title}
                    onChange={this.handleChange}
                    placeholder={this.state.title}
                    className="form-control"
                    required
                  />
                </FormGroup>
                <FormGroup className="form-select">
                  <label className="label-custom" htmlFor="selectFromAddress">
                    From Address
                  </label>
                  {mailAccounts?.length !== 0 ? (
                    <Select
                      options={optionSelect}
                      components={animatedComponents}
                      className="search_from_address"
                      theme={(theme) => ({
                        ...theme,
                        borderRadius: 14,
                        colors: {
                          ...theme.colors,
                          primary: "#ff60c6",
                          primary25: "#ffeefc",
                          danger: "#ff60c6",
                          dangerLight: "#ffeefc",
                        },
                      })}
                      styles={styleSelect}
                      value={this.state.multiValue}
                      onChange={this.handleChangeSelect}
                      isMulti
                    />
                  ) : (
                    <Row>
                      <Col>
                        <span className="ff-poppins sub-title">
                          You don't have any emails yet
                        </span>
                      </Col>
                    </Row>
                  )}
                </FormGroup>
              </Col>
            </Row>

            {/* Buttons */}
            <Row className="mt-4 mb-3 justify-content-between campaign-style">
              <Button
                type="button"
                className="color-button outline-button"
                onClick={() => history.back()}
              >
                <img src={STATIC_FILES.arrow_back} className="icon-delete" />
                <p>CANCEL</p> {"  "}{" "}
              </Button>
              {onNext && (
                <Button type="submit" className="outline-button margin-text">
                  <p>NEXT</p> {"  "}{" "}
                  <img src={STATIC_FILES.arrow_right} className="icon-delete" />
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
  mailAccounts: state.mailAccounts.mailAccounts,
  user: state.auth.user,
});
export default connect(mapStateToProps, { campaignStart })(TheStart);
