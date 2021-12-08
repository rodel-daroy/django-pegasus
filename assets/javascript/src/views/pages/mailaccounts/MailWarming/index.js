import PropTypes from "prop-types";
import React, { Component } from "react";
import DataTable from "react-data-table-component";
import { connect, useSelector } from "react-redux";
import { Button, Col, Container, Input, Row } from "reactstrap";

import PageContainer from "../../../../components/Containers/PageContainer";
import { Filter } from "../../../../components/Table/TableComponents";
import {
  CustomCheckbox,
  TableStyles,
} from "../../../../components/Table/TableStyles";
import { getMailAccounts } from "../../../../redux/action/MailAccountsActions";
import {
  getWarmings,
  updateWarmings,
} from "../../../../redux/action/WarmingActions";
import { toastOnError, toastOnSuccess } from "../../../../utils/Utils";
import ConfigModal from "./warmingConfiguration";
import WarmingModal from "./warmingModal";

const action = {
  key: "warming_enabled",
  type: "toggle",
  theme: "warning",
  labelPositive: "On",
  labelNegative: "Off",
  disabled: false,
};

const filters = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "SMTP",
    label: "SMTP",
  },
  {
    value: "Google",
    label: "Google",
  },
  {
    value: "Microsoft",
    label: "Microsoft",
  },
];

function TopLoader() {
  const { topLoader } = useSelector((state) => state.notification);
  if (topLoader) {
    return <div className="loader loader-audiences"></div>;
  } else {
    return null;
  }
}

class WarmList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textSearch: "",
      warnUpEmail: "",
      rampUpEmail: "",
      data: [],
      search: undefined,
      selectedFilter: "all",
      sortDirection: "asc",
      sortField: "email",
      currentPage: 1,
      rowsPerPage: 10,
      noPage: null,
      showModalConfig: false,
    };
  }

  async componentDidMount() {
    this.fetchMailAccounts();
  }

  async componentDidUpdate(prevProps) {
    const sessionType = this.props.user.session_type;
    const teamAdminId = this.props.user.team_admin_id;
    const { mailAccounts } = this.props;

    if (prevProps.mailAccounts !== this.props.mailAccounts) {
      const warmings = await this.props.getWarmings(sessionType, teamAdminId);

      this.setState({
        data: {
          ...mailAccounts,
          results: mailAccounts.results.map((item) => {
            const status = warmings.status.filter(
              (warmItem) => warmItem.mail_account_id === item.id
            );
            const logs = warmings.logs.filter(
              (warmItem) => warmItem.mail_account_id === item.id
            );

            const reports = warmings.reports.filter(
              (warmItem) => warmItem.mail_account_id === item.id
            );

            return {
              ...item,
              status,
              logs,
              reports,
            };
          }),
        },
      });
    }
  }

  fetchMailAccounts = async () => {
    const {
      search,
      sortDirection,
      sortField,
      currentPage,
      rowsPerPage,
      selectedFilter,
      noPage,
    } = this.state;
    const sessionType = this.props.user.session_type;
    const teamAdminId = this.props.user.team_admin_id;

    await this.props.getMailAccounts(
      sessionType,
      teamAdminId,
      search,
      currentPage,
      sortDirection,
      sortField,
      rowsPerPage,
      selectedFilter,
      noPage
    );
  };

  handleChangeFilter = (filter) => {
    this.setState({ selectedFilter: filter }, this.fetchMailAccounts);
  };

  handleSearch = (e) => {
    if (e.keyCode === 13) {
      this.setState({ search: e.target.value }, this.fetchMailAccounts);
    }
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page }, this.fetchMailAccounts);
  };

  handleRowsPerPageChange = (newPageSize) => {
    this.setState(
      { rowsPerPage: newPageSize, currentPage: 1 },
      this.fetchMailAccounts
    );
  };

  handleSort = (column, sortDirection) => {
    const sortField =
      column.selector === "warming_status"
        ? "warmingstatus__warming_enabled"
        : column.selector;

    this.setState(
      {
        sortDirection,
        sortField,
      },
      this.fetchMailAccounts
    );
  };

  showDetails = (data) => {
    if (data.status[0]?.warming_enabled)
      this.setState({ showModal: true, element: data });
  };

  async onTblValChange(field, value, record) {
    const { data } = this.state;
    if (field === "warming_enabled") {
      const accountChanged = data.results.filter(
        (item) => item.id === record.id
      );
      if (!accountChanged.length) {
        return;
      }
      const originValue = accountChanged[0][field];
      accountChanged[0][field] = value;
      this.setState({
        data: { ...data },
      });
      try {
        await this.updateValors(accountChanged[0].id, {
          ...accountChanged[0].status[0],
          warming_enabled: value,
        });
      } catch (e) {
        toastOnError(e);
        accountChanged[0][field] = originValue;
        this.setState({
          data: { ...data },
        });
      }
    }
  }

  updateValors = async (id, data) => {
    const response = await this.props.updateWarmings(id, data);
    if (response.success) {
      await this.fetchMailAccounts();
      toastOnSuccess("Updated successfully!");
    } else {
      throw response.message || "Failed to update warming setting!";
    }
  };

  searchFilter = (e) => {
    this.setState({ textSearch: e.target.value });
  };

  render() {
    const { data, warnUpEmail, rampUpEmail } = this.state;
    const { user } = this.props;

    /*     const assigned = data.results.map((item) => {
      item["full_name"] = `${item.first_name}  ${item.last_name}`;

      return item.assigned;
    }); */

    const Actions = ({ row }) => {
      const Toggle = (row) => {
        const theme = `custom-toggle-${action.theme}`;
        return (
          <div>
            <label className={`custom-toggle ${theme} mr-1`}>
              <input
                checked={row.warming_status}
                type="checkbox"
                onChange={(e) => {
                  this.onTblValChange(action.key, e.target.checked, row);
                }}
              />
              <span
                className="custom-toggle-slider switch"
                data-label-off={action.labelNegative}
                data-label-on={action.labelPositive}
              />
            </label>
          </div>
        );
      };

      return (
        <Row>
          <div className="icons" style={{ paddingRight: 5 }}>
            <span
              className="icons"
              id={`edit${row.id}`}
              onClick={(e) => {
                e.preventDefault();
                this.setState({ showModalConfig: true, emailToEdit: row });
              }}
            >
              <i className="fas fa-edit icons" style={{ color: "#717579" }} />
            </span>
          </div>

          {user.is_admin && Toggle(row)}
        </Row>
      );
    };

    const Badge = ({ row }) => {
      return (
        <span className="badge badge-dot ">
          {row.has_error ? (
            <>
              <i className="bg-warning"></i>
            </>
          ) : (
            <>
              <i className="bg-success"></i>
            </>
          )}
        </span>
      );
    };

    Badge.propTypes = {
      row: PropTypes.object,
    };

    const tableTitle = [
      {
        name: "Email",
        selector: "email",
        sortable: true,
      },
      {
        name: "Type",
        selector: "email_provider",
        sortable: true,
      },
      {
        name: "Status",
        selector: "email_provider",
        sortable: true,
        cell: (row) => <Badge row={row} />,
      },
      {
        name: "Warmup status",
        selector: "warming_status",
        sortable: true,
        cell: (row) => <span>{row.warming_status ? "On" : "Off"}</span>,
      },
      {
        name: "Actions",
        cell: (row) => <Actions row={row} />,
        button: true,
      },
    ];

    return (
      <>
        <WarmingModal
          email={this.state.element}
          isOpen={this.state.showModal}
          close={() => this.setState({ showModal: false })}
        />
        <ConfigModal
          user={user}
          warnUpEmail={warnUpEmail}
          rampUpEmail={rampUpEmail}
          isOpen={this.state.showModalConfig}
          close={() => this.setState({ showModalConfig: false })}
          email={this.state.emailToEdit}
          updateConfig={this.updateValors}
        />
        <PageContainer classNameComponent="page-container">
          <TopLoader />

          <Row className="p-4">
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
                  /* onSearch={this.handleSearch} */
                  onChangeFilter={this.handleChangeFilter}
                  filterOptions={filters}
                  openAction={user.is_admin && this.showDetailModal}
                  user={user}
                />
              }
              persistTableHead
              onRowClicked={this.showDetails}
              customStyles={TableStyles}
              selectableRowsComponent={CustomCheckbox}
            />
          </Row>
        </PageContainer>
      </>
    );
  }
}

WarmList.propTypes = {
  user: PropTypes.object,
  mailAccounts: PropTypes.object,
  getMailAccounts: PropTypes.func,
  getWarmings: PropTypes.func,
  updateMailAccount: PropTypes.func,
  deleteMailAccount: PropTypes.func,
  updateWarmings: PropTypes.func,
};

const mapStateToProps = (state) => ({
  mailAccounts: state.mailAccounts.mailAccounts,
  user: state.auth.user,
});

export default connect(mapStateToProps, {
  getMailAccounts,
  getWarmings,
  updateWarmings,
})(WarmList);
