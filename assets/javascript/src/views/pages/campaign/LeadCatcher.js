import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import DataTable from "react-data-table-component";
import ReactQuill from "react-quill";
import { connect } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Spinner,
  UncontrolledDropdown,
} from "reactstrap";

import {
  CustomCheckbox,
  TableStyles,
} from "./../../../components/Table/TableStyles";
import { Filter } from "../../../components/Table/TableComponents";
import { CampaignLeadViewAction } from "../../../redux/action/CampaignAction";
import axios from "../../../utils/axios";
import { permission } from "../../../utils/Enums";
import {
  formatHeader,
  messages,
  toastOnError,
  toastOnSuccess,
  toggleTopLoader,
} from "../../../utils/Utils";

const filters = [
  {
    label: "All status",
    value: "all",
  },
  {
    label: "Open",
    value: "open",
  },
  {
    label: "Replied",
    value: "replied",
  },
  {
    label: "Won",
    value: "won",
  },
  {
    label: "Lost",
    value: "lost",
  },
  {
    label: "Ignored",
    value: "ignored",
  },
];

class LeadCatcher extends Component {
  constructor() {
    super();
    this.state = {
      campaignFilters: [
        {
          value: "all",
          label: "All Leads",
        },
      ],
      modal: false,
      detailLoading: false,
      detailPanelVisible: false,
      detailLeadId: null,
      detailData: null,
      detailReplyEnable: false,
      detailReplySubject: "",
      detailReplyBody: "",
      detailReplyProgress: false,
      filterStatus: [
        {
          key: "lead_status",
          label: "Open",
          filter: "open",
        },
        {
          key: "lead_status",
          label: "Replied",
          filter: "replied",
        },
        {
          key: "lead_status",
          label: "Won",
          filter: "won",
        },
        {
          key: "lead_status",
          label: "Lost",
          filter: "lost",
        },
        {
          key: "lead_status",
          label: "Ignored",
          filter: "ignored",
        },
      ],
      search: undefined,
      data: [],
      selectedFilter: "all",
      selectedCampaignFilter: "all",
      sortDirection: "asc",
      sortField: "email",
      currentPage: 1,
      rowsPerPage: 10,
      noPage: null,
    };
  }

  _emailBodyQuill = {
    ref: null,
  };

  fetchLeads = async () => {
    const {
      search,
      sortDirection,
      sortField,
      currentPage,
      rowsPerPage,
      selectedFilter,
      noPage,
      selectedCampaignFilter,
    } = this.state;
    const { data } = await axios.get("/campaign/leads/", {
      admin_id: this.props.user.team_admin_id,
      session_type: this.props.user.session_type,
      search,
      page: currentPage,
      size: rowsPerPage,
      sort_direction: sortDirection,
      sort_field: sortField,
      filter: selectedFilter,
      no_page: noPage,
      campaign_filter: selectedCampaignFilter,
    });

    const { data: campaigns } = await axios.get(
      "/campaign/leads/list-campaigns/",
      {
        admin_id: this.props.user.team_admin_id,
        session_type: this.props.user.session_type,
      }
    );

    const { campaignFilters } = this.state;

    for (const item of campaigns) {
      campaignFilters.push({
        value: item.id,
        label: item.title,
      });
    }

    const set = new Set(campaignFilters.map(JSON.stringify));
    const campaignTitles = Array.from(set).map(JSON.parse);

    this.setState({
      data: {
        ...data,
        results: data.results.map((item) => {
          item.opened = moment(item.update_date_time).format("MMM DD, YYYY");
          return item;
        }),
      },
      campaignFilters: [...campaignTitles],
    });
  };

  async componentDidMount() {
    try {
      toggleTopLoader(true);
      await this.fetchLeads();
    } catch (e) {
      console.log(e);
      toastOnError(messages.api_failed);
    } finally {
      toggleTopLoader(false);
    }
  }

  handleChangeFilter = (filter) => {
    this.setState({ selectedFilter: filter }, this.fetchLeads);
  };

  handleChangeCampaignFilter = (filter) => {
    this.setState({ selectedCampaignFilter: filter }, this.fetchLeads);
  };

  handleSearch = (e) => {
    if (e.keyCode === 13) {
      this.setState({ search: e.target.value }, this.fetchLeads);
    }
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page }, this.fetchLeads);
  };

  handleRowsPerPageChange = (newPageSize) => {
    this.setState(
      { rowsPerPage: newPageSize, currentPage: 1 },
      this.fetchLeads
    );
  };

  handleSort = (column, sortDirection) => {
    const sortOptions = {
      campaign_title: "campaign__title",
      assigned_name: "campaign__assigned__full_name",
      opened: "update_date_time",
    };

    const sortField = sortOptions[column.selector] || column.selector;

    this.setState(
      {
        sortDirection,
        sortField,
      },
      this.fetchLeads
    );
  };

  toggle = () => {
    this.setState({ modal: !this.state.modal });
  };

  showDetails = async (data) => {
    // this.props.history.push(`/app/admin/lead/detail/${data.campaign_id}/${data.id}`);
    const { campaign_id, id: lead_id } = data;

    // Get campaign detail
    this.setState({
      detailLoading: true,
      detailPanelVisible: true,
      detailLeadId: lead_id,
      detailData: null,
      detailReplyEnable: false,
      detailReplySubject: "",
      detailReplyBody: "",
    });
    try {
      toggleTopLoader(true);
      const {
        data: { success, content },
      } = await axios.get(`/campaign/lead-detail/${campaign_id}/${lead_id}/`);
      if (success) {
        this.setState({
          detailData: content,
        });
      } else {
        toastOnError("Failed to fetch lead detail.");
      }
    } catch (e) {
      toastOnError(messages.api_failed);

      this.setState({
        detailPanelVisible: false,
        detailLeadId: null,
      });
    } finally {
      toggleTopLoader(false);
      this.setState({
        detailLoading: false,
      });
    }
  };

  hideDetails = () => {
    this.setState({
      detailPanelVisible: false,
      detailData: null,
      detailLeadId: null,
    });
  };

  showDetailByID = (lead_id) => {
    const { data } = this.state;
    const detailData = data.results.filter((item) => item.id == lead_id);
    if (!detailData.length) {
      return false;
    }
    this.showDetails(detailData[0]);
  };

  updateLeadStatus = async (lead, status) => {
    const { campaign_id, id: lead_id } = lead;
    try {
      toggleTopLoader(true);

      this.cancelReplyLead();

      const {
        data: { success, content },
      } = await axios.post(`/campaign/lead/status/${lead_id}/`, { status });
      if (success) {
        const { detailData, data } = this.state;

        // Add log
        if (content && content.log) {
          this.setState({
            detailData: {
              ...detailData,
              logs: [...(detailData.logs || []), content.log],
            },
          });
        }

        // Update lead status
        let lead_status = status;
        if (status === "reopen") {
          lead_status = "open";
        }
        this.setState({
          data: {
            ...data,
            results: data.results.map((item) => {
              if (item.id === lead_id) {
                item.lead_status = lead_status;
              }
              return item;
            }),
          },
        });
      } else {
        toastOnError("Failed to update lead status.");
      }
    } catch (e) {
      console.log(e);
      toastOnError(messages.api_failed);
    } finally {
      toggleTopLoader(false);
    }
  };

  replyLead = () => {
    this.setState({
      detailReplyEnable: true,
      detailReplySubject: "",
      detailReplyBody: "",
    });
  };

  cancelReplyLead = () => {
    this.setState({
      detailReplyEnable: false,
      detailReplySubject: "",
      detailReplyBody: "",
    });
  };

  getFullName = (first_name, last_name) => {
    const arr = [];
    if (first_name) arr.push(first_name);
    if (last_name) arr.push(last_name);
    return arr.join(" ");
  };

  getLogIcon = ({ lead_action }) => {
    switch (lead_action) {
      case "opened": {
        return "fas fa-eye";
      }
      case "clicked": {
        return "fas fa-mouse-pointer";
      }
      case "replied": {
        return "fas fa-comment-dots";
      }
      case "sent": {
        return "ni ni-send";
      }
      case "me_replied": {
        return "ni ni-send";
      }
      case "open": {
        return "fas fa-exclamation";
      }
      case "won": {
        return "fas fa-thumbs-up";
      }
      case "lost": {
        return "fas fa-thumbs-down";
      }
      case "ignored": {
        return "fas fa-ban";
      }
      default: {
        return "ni ni-send";
      }
    }
  };

  getLogBadgeClass = ({ lead_action }) => {
    switch (lead_action) {
      case "opened": {
        return "badge-secondary";
      }
      case "clicked": {
        return "badge-secondary";
      }
      case "replied": {
        return "badge-secondary";
      }
      case "sent": {
        return "badge-default";
      }
      case "me_replied": {
        return "badge-default";
      }
      case "open": {
        return "badge-success";
      }
      case "won": {
        return "badge-warning";
      }
      case "lost": {
        return "badge-light";
      }
      case "ignored": {
        return "badge-light";
      }
      default: {
        return "badge-secondary";
      }
    }
  };

  getLogLabel = ({ lead_action }) => {
    switch (lead_action) {
      case "opened": {
        return "Opened";
      }
      case "clicked": {
        return "Clicked";
      }
      case "replied": {
        return "Replied";
      }
      case "sent": {
        return "Sent";
      }
      case "me_replied": {
        return "You replied";
      }
      case "open": {
        return "Lead opened";
      }
      case "won": {
        return "Lead won";
      }
      case "lost": {
        return "Lead lost";
      }
      case "ignored": {
        return "Lead ignored";
      }
      default: {
        return "";
      }
    }
  };

  isLeadOpen = ({ lead_status }) => {
    return lead_status === "open";
  };

  handleRely = async (e) => {
    e.preventDefault();
    const {
      data,
      detailLeadId,
      detailReplySubject,
      detailReplyBody,
      detailData,
    } = this.state;
    let detailLead = null;
    if (detailLeadId) {
      detailLead = data.results.filter((item) => item.id == detailLeadId);
      if (detailLead.length > 0) {
        detailLead = detailLead[0];
      }
    }

    const { campaign_id, id: lead_id } = detailLead;

    try {
      toggleTopLoader(true);
      this.setState({
        detailReplyProgress: true,
      });

      const {
        data: { success, content },
      } = await axios.post(`/campaign/lead/reply/${campaign_id}/${lead_id}/`, {
        subject: detailReplySubject,
        body: detailReplyBody,
      });
      if (success) {
        // Add log
        if (content && content.log) {
          this.setState({
            detailData: {
              ...detailData,
              logs: [...(detailData.logs || []), content.log],
            },
          });
        }

        toastOnSuccess("Email sent successfully!");
      } else {
        toastOnError("Failed to reply.");
      }
    } catch (err) {
      console.log(err);
      toastOnError(messages.api_failed);
    } finally {
      toggleTopLoader(false);
      this.setState({
        detailReplyProgress: false,
        detailReplyEnable: false,
      });
    }
  };

  cleanTrackingEmail = (email) => {
    const index = email.indexOf("/mailaccounts/tracking/open");
    let initialIndex = -1;
    if (index === -1) return email;
    for (let i = index; i > 0; i--) {
      const evaluate = email[i] + email[i + 1] + email[i + 2];

      if (evaluate === "htt") {
        initialIndex = i;
        break;
      }
    }
    const textToReplace = `${email.slice(
      initialIndex,
      index
    )}/mailaccounts/tracking/open`;

    return email.replace(textToReplace, "");
  };

  renderEmail = ({ lead_action: leadAction, inbox, outbox }) => {
    let email = {};
    const { detailData, detailLeadId, data } = this.state;

    if (leadAction === "sent" || leadAction === "me_replied") {
      email = {
        ...outbox,
        from_fullname: this.getFullName(
          detailData.from_first_name,
          detailData.from_last_name
        ),
        from_addr: detailData.from_email_addr,
      };
    } else if (leadAction === "replied") {
      let detailLead = {};
      if (detailLeadId) {
        detailLead = data.results.filter((item) => item.id === detailLeadId);
        if (detailLead.length > 0) {
          detailLead = detailLead[0];
        }
      }
      email = {
        ...inbox,
        from_fullname: detailLead.full_name,
        from_addr: detailLead.email,
      };
    } else {
      return null;
    }
    email.email_body = this.cleanTrackingEmail(email.email_body);
    return (
      <Card className="lead-initial-email mt-3 mb-0">
        <CardHeader className="p-3">
          <label>From:</label>
          <span>
            {!email.from_fullname || <strong>{email.from_fullname} </strong>}
            {email.from_addr}
          </span>
          <br />
          <label>Subject:</label>
          <span>
            <strong>{email.email_subject}</strong>
          </span>
        </CardHeader>

        <CardBody className="p-3">
          <div dangerouslySetInnerHTML={{ __html: email.email_body }}></div>
        </CardBody>
      </Card>
    );
  };

  getDNDSource = (keys) => {
    return (
      <div className="d-flex flex-wrap mt-2">
        {keys.map((field, index) => {
          return (
            <div
              className="keyword-item text-danger px-1 mr-2 my-1"
              key={`template ${index}`}
              draggable="true"
              onDragStart={(e) => {
                const dataTransfer = e.dataTransfer;
                dataTransfer.setData(
                  "text/html",
                  `<span class="keyword-item p-1 mr-2 my-1">{{${field}}}</span>`
                );
                dataTransfer.setData("text", `{{${field}}}`);
              }}
              onClick={() => {
                const { ref: _quillRef } = this._emailBodyQuill;
                if (_quillRef) {
                  const currentLen = _quillRef.getEditor().getLength();
                  _quillRef
                    .getEditor()
                    .insertText(currentLen - 1, `{{${field}}}`);
                }
              }}
            >
              <i className="fas fa-bars text-danger mr-1"></i>
              {formatHeader(field)}
            </div>
          );
        })}
      </div>
    );
  };

  getNextDetailId = () => {
    const { detailLeadId, data } = this.state;
    let nextId = null;
    const items = data.results || [];
    for (let i = 0; i < items.length - 1; i++) {
      if (items[i].id === detailLeadId) {
        nextId = items[i + 1].id;
        break;
      }
    }
    return nextId;
  };

  getPrevDetailId = () => {
    const { data, detailLeadId } = this.state;
    let nextId = null;
    const items = data.results || [];
    for (let i = 1; i < items.length; i++) {
      if (items[i].id === detailLeadId) {
        nextId = items[i - 1].id;
        break;
      }
    }
    return nextId;
  };

  render() {
    const Open = ({ row }) => {
      return (
        <Button type="button" onClick={() => this.showDetails(row)}>
          Open
        </Button>
      );
    };
    const tableTitle = [
      {
        name: "Campaign",
        selector: "campaign_title",
        sortable: true,
      },
      {
        name: "Email",
        selector: "email",
        sortable: true,
      },
      {
        name: "Assigned",
        selector: "assigned_name",
        sortable: true,
      },
      {
        name: "Lead Status",
        selector: "lead_status",
      },
      {
        name: "Opened",
        selector: "opened",
        sortable: true,
      },
      /* {
        cell: (row) => <Open row={row} />,
      }, */
    ];

    const {
      data,
      detailLeadId,
      detailData,
      detailPanelVisible,
      detailLoading,
      detailReplyEnable,
      detailReplySubject,
      detailReplyProgress,
      campaignFilters,
    } = this.state;
    let detailLead = null;
    if (detailLeadId) {
      detailLead = data.results.filter((item) => item.id === detailLeadId);
      if (detailLead.length > 0) {
        detailLead = detailLead[0];
      }
    }

    let timeline = [];
    let DNDkeys = [];
    if (detailPanelVisible && detailData) {
      if (detailData.logs) {
        timeline = [...detailData.logs];
      }

      timeline.push({
        lead_action: "sent",
        created_date_time: moment(
          detailData.sent_date + " " + detailData.sent_time
        ),
        outbox: {
          email_subject: detailData.email_subject,
          email_body: detailData.email_body,
        },
      });
      timeline.sort((a, b) => {
        const ma = moment(a.created_date_time);
        const mb = moment(b.created_date_time);
        if (ma.isAfter(mb)) return 1;
        if (ma.isBefore(mb)) return -1;
        return 0;
      });

      const tmp = timeline;
      tmp.push({});
      timeline = [];
      for (let i = 0, seriesCnt = 0; i < tmp.length - 1; i++) {
        const item = tmp[i];
        let duplicated = false;
        if (item.lead_action === tmp[i + 1].lead_action) {
          if (item.lead_action === "opened" || item.lead_action === "clicked") {
            duplicated = true;
            seriesCnt++;
          }
        }
        if (!duplicated) {
          if (seriesCnt > 0) {
            item.badge_cnt = seriesCnt + 1;
          }
          timeline.push(item);
          seriesCnt = 0;
        }
      }

      try {
        const replacement = JSON.parse(detailLead.replacement);
        DNDkeys = Object.keys(replacement);
      } catch (e) {
        DNDkeys = [];
      }
    }

    return (
      <>
        <Row className="pl-6 pr-6 pt-4">
          <DataTable
            columns={tableTitle}
            theme="mailerrize"
            data={data.results}
            pagination
            paginationServer
            paginationTotalRows={data.count}
            onChangeRowsPerPage={this.handleRowsPerPageChange}
            onChangePage={this.handlePageChange}
            selectableRows
            sortServer
            onSort={this.handleSort}
            paginationComponentOptions={{
              rowsPerPageText: "Rows per page:",
              rangeSeparatorText: "of",
              noRowsPerPage: false,
              selectAllRowsItem: true,
              selectAllRowsItemText: "All",
            }}
            paginationServerOptions={{
              persistSelectedOnPageChange: true,
              persistSelectedOnSort: true,
            }}
            actions={
              <Filter
                onSearch={this.handleSearch}
                onChangeFilter={this.handleChangeFilter}
                filterOptions={filters}
                openAction={null}
                secondFilterOptions={campaignFilters}
                onChangeSecondFilter={this.handleChangeCampaignFilter}
              />
            }
            persistTableHead
            onRowClicked={this.showDetails}
            customStyles={TableStyles}
            selectableRowsComponent={CustomCheckbox}
          />
        </Row>

        <Modal
          isOpen={detailPanelVisible}
          toggle={this.hideDetails}
          size="lg"
          className="lead-detail-modal"
        >
          <ModalHeader toggle={this.hideDetails}>
            {!!detailLead && detailLead.email}
          </ModalHeader>
          <ModalBody className="pt-0">
            <div className="px-0 px-sm-5">
              {detailLoading && (
                <div className="d-flex">
                  <Spinner color="primary" className="m-auto" />
                </div>
              )}
              {!detailLoading && timeline.length === 0 && (
                <p className="text-muted text-center mb-0">
                  Lead detail data doesn&apos;t exist for this lead.
                </p>
              )}

              {!detailLoading && !!timeline.length && (
                <>
                  <div className="d-flex justify-content-center align-items-center">
                    {this.isLeadOpen(detailLead) ? (
                      <>
                        {this.props.user.user_permission !==
                          permission.READ && (
                          <Button
                            className="btn-icon"
                            color="danger"
                            type="button"
                            size="sm"
                            onClick={this.replyLead}
                            disabled={detailReplyEnable}
                          >
                            <span className="btn-inner--icon">
                              <i className="ni ni-chat-round" />
                            </span>
                            <span className="btn-inner--text">REPLY</span>
                          </Button>
                        )}
                        {this.props.user.user_permission !==
                          permission.READ && (
                          <UncontrolledDropdown size="sm">
                            <DropdownToggle caret color="secondary">
                              STATUS
                            </DropdownToggle>
                            <DropdownMenu>
                              <DropdownItem
                                onClick={(e) =>
                                  this.updateLeadStatus(detailLead, "won")
                                }
                              >
                                Won
                              </DropdownItem>
                              <DropdownItem
                                onClick={(e) =>
                                  this.updateLeadStatus(detailLead, "lost")
                                }
                              >
                                Lost
                              </DropdownItem>
                              <DropdownItem
                                onClick={(e) =>
                                  this.updateLeadStatus(detailLead, "ignored")
                                }
                              >
                                Ignore
                              </DropdownItem>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        )}
                      </>
                    ) : (
                      <Button
                        color="secondary"
                        type="button"
                        size="sm"
                        onClick={(e) =>
                          this.updateLeadStatus(detailLead, "reopen")
                        }
                      >
                        RE-OPEN
                      </Button>
                    )}
                    <Button
                      className="btn-icon"
                      color="secondary"
                      type="button"
                      size="sm"
                      disabled={!this.getPrevDetailId()}
                      onClick={() =>
                        this.showDetailByID(this.getPrevDetailId())
                      }
                    >
                      <span className="btn-inner--icon">
                        <i
                          className="ni ni-curved-next"
                          style={{ transform: "scaleX(-1)" }}
                        />
                      </span>
                      <span className="btn-inner--text">PREV</span>
                    </Button>
                    <Button
                      className="btn-icon"
                      color="secondary"
                      type="button"
                      size="sm"
                      disabled={!this.getNextDetailId()}
                      onClick={() =>
                        this.showDetailByID(this.getNextDetailId())
                      }
                    >
                      <span className="btn-inner--icon">
                        <i className="ni ni-curved-next" />
                      </span>
                      <span className="btn-inner--text">NEXT</span>
                    </Button>
                  </div>

                  {!detailReplyEnable || (
                    <Form
                      onSubmit={this.handleRely}
                      className="reply-container my-3"
                    >
                      <Input
                        type="text"
                        className="form-control"
                        name="subject"
                        value={detailReplySubject}
                        onChange={(e) => {
                          this.setState({
                            detailReplySubject: e.target.value,
                          });
                        }}
                        size="sm"
                        placeholder="Subject"
                        required
                      />
                      <ReactQuill
                        ref={(ref) => (this._emailBodyQuill.ref = ref)}
                        onChange={(value) => {
                          this.setState({ detailReplyBody: value });
                        }}
                        theme="snow"
                        className="Quill_div mt-1"
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
                      {this.getDNDSource(DNDkeys)}
                      <div className="mt-1 d-flex justify-content-end align-items-center">
                        <Button
                          color="danger"
                          type="submit"
                          size="sm"
                          disabled={detailReplyProgress}
                        >
                          SEND
                        </Button>
                        <Button
                          color="secondary"
                          type="button"
                          size="sm"
                          onClick={this.cancelReplyLead}
                        >
                          CANCEL
                        </Button>
                      </div>
                    </Form>
                  )}

                  <div
                    className="timeline timeline-one-side lead-timeline pt-4"
                    data-timeline-axis-style="dashed"
                    data-timeline-content="axis"
                  >
                    {timeline.reverse().map((item, index) => {
                      return (
                        <div className="timeline-block" key={`${index}`}>
                          <span
                            className={`timeline-step ${this.getLogBadgeClass(
                              item
                            )} ${item.badge_cnt > 1 && "has-badge"}`}
                            data-badge={item.badge_cnt}
                          >
                            <i className={this.getLogIcon(item)} />
                          </span>
                          <div className="timeline-content">
                            <div>
                              <span className="font-weight-bold">
                                {this.getLogLabel(item)}
                              </span>
                              <small className="text-muted ml-2">
                                {moment(item.created_date_time).format(
                                  "MMM DD, YYYY hh:mm a"
                                )}
                              </small>
                            </div>
                            {this.renderEmail(item)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </ModalBody>
        </Modal>
      </>
    );
  }
}

LeadCatcher.propTypes = {
  user: PropTypes.object,
  leadData: PropTypes.any,
  CampaignLeadViewAction: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    leadData: state.LeadViewReducer && state.LeadViewReducer.leadViewData,
    user: state.auth.user,
  };
};
const mapDispatchToProps = (dispatch) => ({
  // CampaignLeadGetAction:()=>dispatch(CampaignLeadGetAction)
  CampaignLeadViewAction: () => dispatch(CampaignLeadViewAction()),
});
export default connect(mapStateToProps, mapDispatchToProps)(LeadCatcher);
