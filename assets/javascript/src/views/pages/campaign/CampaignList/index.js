import moment from "moment";
import PropTypes from "prop-types";
import React, { Component } from "react";
import DataTable from "react-data-table-component";
import { connect } from "react-redux";
// nodejs library that concatenates classes
import { Badge, Row, UncontrolledTooltip } from "reactstrap";

import PageContainer from "../../../../components/Containers/PageContainer";
import DeleteModal from "../../../../components/DeleteModal/DeleteModal";
import { Filter } from "../../../../components/Table/TableComponents";
import {
  CustomCheckbox,
  TableStyles,
} from "../../../../components/Table/TableStyles";
import axios from "../../../../utils/axios";
import { permission } from "../../../../utils/Enums";
import {
  messages,
  toastOnError,
  toastOnSuccess,
  toggleTopLoader,
} from "../../../../utils/Utils";

const filters = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Last week",
    value: "lastWeek",
  },
  {
    label: "Last month",
    value: "lastMonth",
  },
  {
    label: "Last 2 months",
    value: "lastTwoMonths",
  },
  {
    label: "Last year",
    value: "lastYear",
  },
];

class CampaignList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deleteModal: false,
      deleteItem: null,
      columnStyle: { paddingLeft: "0.5rem", paddingRight: "0.5rem" },
      search: undefined,
      data: [],
      selectedFilter: "all",
      selectedAssignedFilter: "all",
      sortDirection: "asc",
      sortField: "-id",
      currentPage: 1,
      rowsPerPage: 10,
      noPage: null,
    };
  }

  async componentDidMount() {
    this.fetchCampaigns();
  }

  async fetchCampaigns() {
    try {
      toggleTopLoader(true);

      const { team_admin_id: teamAdminId, session_type: sessionType } =
        this.props.user;

      const {
        search,
        sortDirection,
        sortField,
        currentPage,
        rowsPerPage,
        selectedFilter,
        noPage,
        selectedAssignedFilter,
      } = this.state;

      const payload = {
        admin_id: teamAdminId,
        session_type: sessionType,
        search,
        page: currentPage,
        size: rowsPerPage,
        sort_direction: sortDirection,
        sort_field: sortField,
        filter: selectedFilter,
        no_page: noPage,
        campaign_filter: selectedAssignedFilter,
      };

      const { data } = await axios.get("/campaign/list/", payload);

      data.results.map((item) => {
        item.control = item.campaign_status ? "pause" : "play";
        item.tooltip = item.campaign_status
          ? "click to pause"
          : "click to start";
        item.from_address = item.from_emails
          .map((email) => email.email)
          .join(", ");

        return null;
      });

      this.setState({ data });

      return data;
    } catch (e) {
      console.log(e);
      toastOnError(messages.api_failed);
    } finally {
      toggleTopLoader(false);
    }
  }

  handleChangeFilter = (filter) => {
    const Filters = {
      all: "all",
      lastWeek: moment().subtract(1, "week").format("YYYY-MM-DD"),
      lastMonth: moment().subtract(1, "month").format("YYYY-MM-DD"),
      lastTwoMonths: moment().subtract(2, "month").format("YYYY-MM-DD"),
      lastYear: moment().subtract(1, "year").format("YYYY-MM-DD"),
    };

    this.setState({ selectedFilter: Filters[filter] }, this.fetchCampaigns);
  };

  handleSearch = (e) => {
    if (e.keyCode === 13) {
      this.setState({ search: e.target.value }, this.fetchCampaigns);
    }
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page }, this.fetchCampaigns);
  };

  handleRowsPerPageChange = (newPageSize) => {
    this.setState(
      { rowsPerPage: newPageSize, currentPage: 1 },
      this.fetchCampaigns
    );
  };

  handleSort = (column, sortDirection) => {
    const sortOptions = {
      from_address: "from_address__email",
      created: "created_date_time",
    };

    const sortField = sortOptions[column.selector] || column.selector;

    this.setState(
      {
        sortDirection,
        sortField,
      },
      this.fetchCampaigns
    );
  };

  deleteDuplicates = (array) => {};

  showDetails = (item) => {
    this.props.history.push(`/app/admin/campaign/${item.id}/details-overview`);
  };

  createCampaign = () => {
    this.props.history.push("/app/admin/campaign/create");
  };

  actionCallback = () => {};

  controlCallback = (e) => {
    if (!e) return;

    toggleTopLoader(true);
    axios
      .post(`/campaign/update-status/${e.id}`, { status: e.control === "play" })
      .then((response) => {
        toastOnSuccess("Updated successfully!");
        this.fetchCampaigns();
      })
      .catch((error) => {
        toastOnError(error);
      })
      .finally(() => {
        toggleTopLoader(false);
      });
  };

  paginationCallback = () => {};

  showDeleteModal = (item) => {
    // Save the item to delete
    this.setState({ deleteItem: item });

    // Show delete confirmation dialog
    this.setState({ deleteModal: true });
  };

  deleteCampaign = () => {
    const { deleteItem } = this.state;

    toggleTopLoader(true);
    axios
      .patch(`/campaign/delete/${deleteItem.id}/`, { is_deleted: true })
      .then((response) => {
        this.fetchCampaigns();
        toastOnSuccess("Successfully deleted campaign");
      })
      .catch((error) => {
        toastOnError(error);
      })
      .finally(() => {
        toggleTopLoader(false);
      });

    this.closeDeleteModal();
  };

  closeDeleteModal = () => {
    this.setState({ deleteModal: false, deleteItem: null });
  };

  render() {
    const { data, deleteModal } = this.state;

    const Delete = ({ row }) => {
      return (
        <div className="icons">
          <img
            src={STATIC_FILES.trash_icon}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              this.showDeleteModal(row);
            }}
          />
        </div>
      );
    };

    const Action = ({ row }) => {
      return (
        <>
          <Badge
            id={`action${row.id}`}
            color={row.control === "play" ? "success" : "danger"}
            onClick={(e) => {
              e.stopPropagation();
              this.controlCallback(row);
            }}
            style={{ marginRight: 15 }}
          >
            <i className={`fa fa-${row.control}`}></i>
          </Badge>
          <UncontrolledTooltip
            delay={0}
            placement="bottom"
            target={`action${row.id}`}
          >
            {row.tooltip}
          </UncontrolledTooltip>
        </>
      );
    };

    const tableTitle = [
      {
        name: "Title",
        selector: "title",
        wrap: true,
        sortable: true,
      },
      {
        name: "Email accounts",
        selector: "from_address",
        wrap: true,
        grow: 2,
      },
      {
        name: "Recipients",
        selector: "recipients",
        sortable: true,
      },
      {
        name: "Sent",
        selector: "sent",
        sortable: true,
      },
      {
        name: "Replies",
        selector: "replies",
        sortable: true,
      },
      {
        name: "Opens",
        selector: "opens",
        sortable: true,
      },
      {
        name: "Leads",
        selector: "leads",
        sortable: true,
      },
      {
        name: "Bounces",
        selector: "bounces",
        sortable: true,
      },
      {
        name: "Last update",
        selector: "created",
        sortable: true,
      },
      {
        name: "Actions",
        cell: (row) =>
          this.props.user.is_admin && (
            <Row>
              <Action row={row} />
              <Delete row={row} />
            </Row>
          ),
        button: true,
      },
    ];

    return (
      <PageContainer>
        <Row className="pr-6 pt-4">
          <DataTable
            onRowClicked={this.showDetails}
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
                openAction={
                  this.props.user.user_permission !== permission.READ &&
                  this.createCampaign
                }
              />
            }
            persistTableHead
            customStyles={TableStyles}
            selectableRowsComponent={CustomCheckbox}
          />
        </Row>

        <DeleteModal
          isOpen={deleteModal}
          close={this.closeDeleteModal}
          delete={this.deleteCampaign}
          location="campaign"
        />
      </PageContainer>
    );
  }
}

CampaignList.propTypes = {
  user: PropTypes.object,
  history: PropTypes.array,
};

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(CampaignList);
