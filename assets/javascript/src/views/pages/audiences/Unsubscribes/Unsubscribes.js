import PropTypes from "prop-types";
import React, { Component } from "react";
import DataTable from "react-data-table-component";
import { connect, useSelector } from "react-redux";
import { Row } from "reactstrap";

import DeleteModal from "../../../../components/DeleteModal/DeleteModal";
import { Filter } from "../../../../components/Table/TableComponents";
import {
  addUnsubscribeCSV,
  addUnsubscribeEmails,
  deleteUnsubscribeEmails,
  getUnsubscribes,
} from "../../../../redux/action/UnsubscribeActions";
import UnsubscribesModal from "./components/UnsubscribesModal";
import {
  CustomCheckbox,
  TableStyles,
} from "../../../../components/Table/TableStyles";
import { setConstantValue } from "typescript";

// import CSVDownloadModal from "./components/CSVDownloadModal";

const filters = [
  {
    value: "address",
    label: "Address",
  },
  {
    value: "domain",
    label: "Domain",
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

class Unsubscribes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: undefined,
      activeTab: "Address",
      deleteItem: null,
      unsubscribeModal: false,
      downloadCSVModal: false,
      deleteModal: false,
      email: "",
      onDomain: false,
      tableData: [],
      selectedFilter: "address",
      sortDirection: "asc",
      sortField: "email",
      currentPage: 1,
      rowsPerPage: 10,
    };
  }

  componentDidMount() {
    this.fetchUnsubscribes();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.unsubscribes !== this.props.unsubscribes) {
      this.setState({ tableData: this.props.unsubscribes });
    }
  }

  handleChangeFilter = (filter) => {
    this.setState({ selectedFilter: filter }, this.fetchUnsubscribes);
  };

  handleSearch = (e) => {
    if (e.keyCode === 13) {
      this.setState({ search: e.target.value }, this.fetchUnsubscribes);
    }
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page }, this.fetchUnsubscribes);
  };

  handleRowsPerPageChange = (newPageSize) => {
    this.setState(
      { rowsPerPage: newPageSize, currentPage: 1 },
      this.fetchUnsubscribes
    );
  };

  handleSort = (column, sortDirection) => {
    const sortField =
      column.selector === "created_datetime" ? "date" : column.selector;

    this.setState(
      {
        sortDirection,
        sortField,
      },
      this.fetchUnsubscribes
    );
  };

  fetchUnsubscribes = () => {
    const {
      search,
      sortDirection,
      sortField,
      currentPage,
      rowsPerPage,
      selectedFilter,
    } = this.state;
    const sessionType = this.props.user.session_type;
    const teamAdminId = this.props.user.team_admin_id;

    this.props.getUnsubscribes(
      search,
      sessionType,
      teamAdminId,
      currentPage,
      sortDirection,
      sortField,
      rowsPerPage,
      selectedFilter
    );
  };

  unsubscribeEmail = (emailList) => {
    const user = this.props.user;
    this.props
      .addUnsubscribeEmails(emailList, user)
      .then(() => this.fetchUnsubscribes());
  };

  unsubscribeCSV = (file) => {
    this.props.addUnsubscribeCSV(file).then(() => this.fetchUnsubscribes());
  };

  deleteUnsubscribes = (deleteItem) => {
    if (!deleteItem) {
      return;
    }

    this.props
      .deleteUnsubscribeEmails([deleteItem.id])
      .then(() => this.fetchUnsubscribes());
    this.setState({
      deleteModal: false,
      deleteItem: null,
    });
  };

  openUnsubscribeModal = () => {
    const { user } = this.props;
    if (user.is_admin) this.setState({ unsubscribeModal: true });
  };

  closeUnsubscribeModal = () => {
    this.setState({ unsubscribeModal: false });
  };

  closeDownloadCSVModal = () => {
    this.setState({ downloadCSVModal: false });
  };

  showDeleteModal = (item) => {
    // Save the item to delete
    this.setState({ deleteItem: item });

    // Show delete confirmation dialog
    this.setState({ deleteModal: true });
  };

  closeDeleteModal = () => {
    this.setState({ deleteModal: false });
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  render() {
    const { tableData } = this.state;
    const { user } = this.props;

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

    const tableTitle = [
      {
        name: "Email",
        selector: "email",
        sortable: true,
      },
      {
        name: "Unsubscribe date",
        selector: "created_datetime",
        sortable: true,
      },
      {
        cell: (row) => user.is_admin && <Delete row={row} />,
        button: true,
      },
    ];

    return (
      <>
        {/* <Row>
          <Col lg="7" md="12" sm="12" style={{ margin: "10px 30px" }}>
            <Button
              className="btn-icon btn-2"
              type="button"
              onClick={() => window.location.reload()}
            >
              <span className="btn-inner--icon">
                <i className="fa fa-refresh" />
                <span className="btn-inner--text">REFRESH</span>
              </span>
            </Button>
            <Button
              className="btn-icon btn-2 ml-xs-0 mt-xs-1"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                this.setState({
                  downloadCSVModal: !this.state.downloadCSVModal,
                });
              }}
            >
              <span className="btn-inner--icon">
                <i className="fa fa-save" />
              </span>
              <span className="btn-inner--text">EXPORT</span>
            </Button>
          </Col>
        </Row> */}

        <TopLoader />

        <Row className="pl-6 pr-6 pt-4">
          <DataTable
            columns={tableTitle}
            theme="mailerrize"
            customStyles={TableStyles}
            data={tableData.results}
            pagination
            paginationServer
            paginationTotalRows={tableData.count}
            onChangeRowsPerPage={this.handleRowsPerPageChange}
            onChangePage={this.handlePageChange}
            sortServer
            onSort={this.handleSort}
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
            selectableRowsComponent={CustomCheckbox}
            actions={
              <Filter
                onSearch={this.handleSearch}
                onChangeFilter={this.handleChangeFilter}
                filterOptions={filters}
                openAction={user.is_admin && this.openUnsubscribeModal}
                user={user}
              />
            }
            persistTableHead
          />
        </Row>
        <UnsubscribesModal
          isOpen={this.state.unsubscribeModal}
          unsubscribeEmail={this.unsubscribeEmail}
          unsubscribeCSV={this.unsubscribeCSV}
          close={this.closeUnsubscribeModal}
        />
        {/* 
        <CSVDownloadModal
          data={tableData.results}
          isOpen={this.state.downloadCSVModal}
          close={this.closeDownloadCSVModal}
        /> */}
        <DeleteModal
          isOpen={this.state.deleteModal}
          close={this.closeDeleteModal}
          delete={() => this.deleteUnsubscribes(this.state.deleteItem)}
          location="unsubscribe"
        />
      </>
    );
  }
}

Unsubscribes.propTypes = {
  user: PropTypes.object,
  unsubscribes: PropTypes.object,
  getUnsubscribes: PropTypes.func,
  addUnsubscribeEmails: PropTypes.func,
  addUnsubscribeCSV: PropTypes.func,
  deleteUnsubscribeEmails: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    unsubscribes: state.unsubscribes.unsubscribes,
  };
};

export default connect(mapStateToProps, {
  getUnsubscribes,
  addUnsubscribeEmails,
  addUnsubscribeCSV,
  deleteUnsubscribeEmails,
})(Unsubscribes);
