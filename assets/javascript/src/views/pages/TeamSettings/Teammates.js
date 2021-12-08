import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Row,
  Spinner,
  Tooltip
} from "reactstrap";
import validator from "validator";

import {
  CustomCheckbox,
  TableStyles,
} from "./../../../components/Table/TableStyles";
import PageContainer from "../../../components/Containers/PageContainer";
import DetailModal from "../../../components/Modals/ChangeSubscriptionModal";
import { Filter } from "../../../components/Table/TableComponents";
import { updateTeam } from "../../../redux/action/AuthAction";
import { updateTrackingDomain } from "../../../redux/action/ProfileAction";
import axios from "../../../utils/axios";
import { sessionType } from "../../../utils/Enums";
import {
  messages,
  toastOnError,
  toastOnSuccess,
  toggleTopLoader,
} from "../../../utils/Utils";

export function Teammates() {
  const tableTitle = [
    {
      name: "First name",
      selector: "first_name",
      sortable: true,
    },
    {
      name: "Role",
      selector: "role",
      sortable: true,
    },
    {
      name: "Permission",
      selector: "permission",
      sortable: true,
    },
  ];

  const filters = [
    {
      value: "all",
      label: "All",
    },
    {
      value: "admin",
      label: "Admin",
    },
    {
      value: "member",
      label: "Members",
    },
  ];
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState(user?.team);
  const [members, setMembers] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortField, setSortField] = useState("user__first_name");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [trackingDomain, setTrackingDomain] = useState(user.tracking_domain);

  const dispatch = useDispatch();

  const [invite, setInvite] = useState({
    email: "",
    role: "read",
  });

  useEffect(async () => {
    try {
      toggleTopLoader(true);
      const { data } = await axios.get("/teams/get-team/");
      setTeam(data);
    } catch (e) {
      toastOnError(messages.api_failed);
    } finally {
      toggleTopLoader(false);
    }
  }, []);

  useEffect(async () => {
    setLoading(true);
    try {
      if (team?.id) fetchTeamMembers();

      setLoading(false);
    } catch (e) {
      toastOnError(messages.api_failed);
    } finally {
      toggleTopLoader(false);
    }
  }, [
    team,
    selectedFilter,
    searchTerm,
    currentPage,
    sortDirection,
    sortField,
    rowsPerPage,
  ]);
  const toggle = () => setTooltipOpen(!tooltipOpen);
  const fetchTeamMembers = async () => {
    const payload = {
      filter: selectedFilter,
      search_term: searchTerm,
      sort_field: sortField,
      sort_direction: sortDirection,
      page: currentPage,
      size: rowsPerPage,
    };

    const { data } = await axios.get(
      `/teams/get-members/${team?.id}/`,
      payload
    );
    const list = formatMemberForList(data.results);
    data.results = list;

    setMembers(data);
  };

  const handleChangeFilter = (filter) => {
    setSelectedFilter(filter);
  };

  const handleSearch = (e) => {
    if (e.keyCode === 13) {
      setSearchTerm(e.target.value);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newPageSize) => {
    setCurrentPage(1);
    setRowsPerPage(newPageSize);
  };

  const handleSort = (column, selSortDirection) => {
    const selSortField =
      column.selector === "first_name" ? "user__first_name" : column.selector;

    setSortDirection(selSortDirection);
    setSortField(selSortField);
  };

  const handleUpdateTrackingDomain = async () => {
    const options = {
      require_protocol: true,
    };

    if (!validator.isURL(trackingDomain, options)) {
      toastOnError("Tracking domain is not a valid URL.");
      return;
    }

    try {
      toggleTopLoader(true);
      const payload = {
        tracking_domain: trackingDomain,
      };
      await dispatch(updateTrackingDomain(payload));
      toastOnSuccess("Tracking domain updated");
    } finally {
      toggleTopLoader(false);
    }
  };

  const sendInvite = async (e) => {
    e?.preventDefault?.();
    const userCanResponse = await userCanAddOtherUser();
    if (!userCanResponse.status) {
      setShowModal(true);
      setSubscriptionData(userCanResponse);
      return;
    }

    const data = {
      team: team?.id,
      email: invite.email,
      permission: invite.permission,
      invited_by: user.id,
    };
    try {
      toggleTopLoader(true);
      await axios.post("/teams/api/send-invite/", data);
    } catch (e) {
      toastOnError(messages.api_failed);
      return;
    } finally {
      toggleTopLoader(false);
    }

    toastOnSuccess("Sent invitation successfully!");
  };

  const handleTeamInfo = async (e) => {
    e.preventDefault();
    if (team?.id) {
      saveTeam();
    } else {
      createTeam();
    }
  };

  const createTeam = async () => {
    try {
      toggleTopLoader(true);
      const { data } = await axios.post("/teams/api/teams/", team);
      setTeam(data);
      await dispatch(updateTeam(data));
    } catch (e) {
      toastOnError(messages.api_failed);
      return;
    } finally {
      toggleTopLoader(false);
    }

    toastOnSuccess("Created a team successfully!");
  };

  const saveTeam = async () => {
    try {
      toggleTopLoader(true);
      const { data } = await axios.put(`/teams/api/teams/${team?.id}/`, {
        ...team,
      });
      setTeam(data);
      await dispatch(updateTeam(data));
    } catch (e) {
      toastOnError(messages.api_failed);
      return;
    } finally {
      toggleTopLoader(false);
    }

    toastOnSuccess("Updated team successfully!");
  };

  const userCanAddOtherUser = async () => {
    try {
      toggleTopLoader(true);
      const { data } = await axios.get(
        "/subscriptions/api/approve_creation_of_asset/?type=team"
      );
      return data;
    } catch (e) {
      toastOnError(messages.api_failed);
    } finally {
      toggleTopLoader(false);
    }
    return false;
  };

  const formatMemberForList = (list) => {
    return list.map((member) => ({
      ...member,
      first_name: member.first_name,
      role: member.role === "admin" ? "Admin" : "Member",
      permission:
        member.role === "admin"
          ? "All permissions"
          : member.permission.charAt(0).toUpperCase() +
            member.permission.slice(1),
      settings: [{ label: "edit" }, { label: "delete" }],
    }));
  };

  const messagePermissionAddUser = () => {
    if (user.session_type === sessionType.PERSONAL)
      return "You already belong to another team";
    if (!team?.id) return "Please create a team first";
    return "You are not allowed to add members to this team";
  };
  return (
    <div className="team_settings">
      <DetailModal
        isOpen={showModal}
        close={() => setShowModal(false)}
        subscription={subscriptionData?.subscription}
        amount={
          (subscriptionData?.quantity + 1) *
          Number(subscriptionData?.plan?.amount)
        }
        number={subscriptionData?.quantity + 1}
        user={user}
        next={sendInvite}
      />
      {/* <PageHeader current="My team" parent="Team settings" showStatus={false} /> */}
      {user.session_type !== sessionType.PERSONAL ? (
        <PageContainer title="My team" classNameTitle="title">
          {loading && (
            <div className="d-flex my-5">
              <Spinner color="primary" className="m-auto" />
            </div>
          )}
          {!loading && (
            <Container>
              <Card className="mh-15">
                <CardHeader className="pb-0">
                  <h3 className="mb-0 input_label">Tracking Domain <i id="TooltipTrackingDomains" style={{cursor: "pointer"}} className="fas fa-question-circle" onClick={e=> window.open("https://www.mailerrize.com/support-post/custom-tracking-domains", "_blank")}></i>
                    <Tooltip placement="right" isOpen={tooltipOpen} target="TooltipTrackingDomains" toggle={toggle}>
                      Click here to see, how to add custom tracking domains to Mailerrize?
                    </Tooltip>
                  </h3>
                </CardHeader>
                <Col className="mt-3 mh-15">
                  <p>
                    1. Use your DNS provider to create a CNAME record that
                    points to{" "}
                    <span className="bold-txt">app.mailerrize.com</span>.
                  </p>
                  <p>2. Enter your sub-domain below and save. (For more help <a rel={"noreferrer"} href={"https://www.mailerrize.com/support-post/custom-tracking-domains"} target={"_blank"}>click here</a>)</p>
                </Col>
                <Form className="needs-validation">
                  <CardBody className="pb-0">
                    <FormGroup>
                      <Input
                        placeholder="Tracking Domain"
                        required
                        type="text"
                        disabled={!user.is_admin}
                        value={trackingDomain}
                        className="input_text"
                        onChange={(e) => setTrackingDomain(e.target.value)}
                      />
                    </FormGroup>
                  </CardBody>
                  <CardFooter className="bg-transparent">
                    {user.is_admin && (
                      <Button
                        color="info"
                        size="sm"
                        className="text-uppercase submit_button"
                        onClick={handleUpdateTrackingDomain}
                      >
                        Save
                      </Button>
                    )}
                  </CardFooter>
                </Form>
              </Card>
              <Row>
                <Col lg={6} md={6} sm={12} className="mobile-p-0">
                  <Card>
                    <CardHeader className="pb-0">
                      <h3 className="mb-0 input_label">Team information</h3>
                    </CardHeader>
                    <Form
                      className="needs-validation"
                      onSubmit={handleTeamInfo}
                    >
                      <CardBody className="pb-0">
                        <FormGroup>
                          <Input
                            placeholder="Team Name"
                            required
                            type="text"
                            disabled={!user.is_admin}
                            value={team?.name || ""}
                            className="input_text"
                            onChange={(e) =>
                              setTeam({
                                ...team,
                                name: e.target.value,
                                slug: e.target.value.replace(" ", "-"),
                              })
                            }
                          />
                        </FormGroup>
                        <FormGroup>
                          <label className="form-control-label input_label">
                            Bcc Email
                          </label>
                          <Input
                            placeholder="Bcc every email"
                            type="text"
                            value={team?.bcc_email || ""}
                            disabled={!user.is_admin}
                            className="input_text"
                            onChange={(e) => {
                              setTeam({
                                ...team,
                                bcc_email: e.target.value,
                              });
                            }}
                          />
                        </FormGroup>
                      </CardBody>
                      <CardFooter className="bg-transparent">
                        {user.is_admin && (
                          <Button
                            color="info"
                            type="submit"
                            size="sm"
                            className="text-uppercase submit_button"
                          >
                            {team?.id ? "Save" : "Create"}
                          </Button>
                        )}
                      </CardFooter>
                    </Form>
                  </Card>
                </Col>
                <Col lg="6" md="6" sm="12" className="mobile-p-0">
                  <Card>
                    <CardHeader className="pb-0">
                      <h3 className="mb-0 input_label">Add teammate</h3>
                    </CardHeader>
                    {team?.id && user.is_admin ? (
                      <>
                        <Form
                          className="needs-validation"
                          onSubmit={sendInvite}
                        >
                          <CardBody className="pb-0">
                            <FormGroup>
                              <Input
                                placeholder="Email Address"
                                required
                                type="email"
                                value={invite.email}
                                className="input_text"
                                onChange={(e) => {
                                  setInvite({
                                    ...invite,
                                    email: e.target.value,
                                  });
                                }}
                              />
                            </FormGroup>
                            <FormGroup>
                              <label className="form-control-label input_label">
                                Permission
                              </label>
                              <Input
                                type="select"
                                value={invite.permission}
                                className="input_text"
                                onChange={(e) =>
                                  setInvite({
                                    ...invite,
                                    permission: e.target.value,
                                  })
                                }
                              >
                                <option value="read">Read Campaign</option>
                                <option value="create">Create Campaign</option>
                                <option value="update">Update Campaign</option>
                              </Input>
                            </FormGroup>
                          </CardBody>
                          <CardFooter className="bg-transparent">
                            <Button
                              color="info"
                              size="sm"
                              className="text-uppercase submit_button"
                              type="submit"
                            >
                              Send Invite
                            </Button>
                          </CardFooter>
                        </Form>
                      </>
                    ) : (
                      <>
                        <CardBody className="card-container">
                          <h3 className="mb-0 input_label disabled-text">
                            {messagePermissionAddUser()}
                          </h3>
                        </CardBody>
                      </>
                    )}
                  </Card>
                </Col>
              </Row>
              {team && (
                <Row>
                  <Col sm="12" className="mb-5 mobile-p-0">
                    {user.is_admin && (
                      <p>
                        Administrator can update billing, connect new mail
                        accounts, and invite people.
                      </p>
                    )}
                    <Row>
                      {members && (
                        <DataTable
                          columns={tableTitle}
                          theme="mailerrize"
                          data={members.results}
                          pagination
                          paginationServer
                          paginationTotalRows={members.count}
                          onChangeRowsPerPage={handleRowsPerPageChange}
                          onChangePage={handlePageChange}
                          sortServer
                          onSort={handleSort}
                          selectableRows
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
                              onSearch={handleSearch}
                              onChangeFilter={handleChangeFilter}
                              filterOptions={filters}
                              openAction={null}
                              user={user}
                            />
                          }
                          persistTableHead
                          customStyles={TableStyles}
                          selectableRowsComponent={CustomCheckbox}
                        />
                      )}
                    </Row>
                  </Col>
                </Row>
              )}
            </Container>
          )}
        </PageContainer>
      ) : (
        <CardBody className="card-container">
          <h3 className="mb-0 input_label disabled-text">
            {messagePermissionAddUser()}
          </h3>
        </CardBody>
      )}
    </div>
  );
}

export default Teammates;
