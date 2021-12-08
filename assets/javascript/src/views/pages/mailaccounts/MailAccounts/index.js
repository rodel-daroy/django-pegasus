import PropTypes from "prop-types";
import React from "react";
import DataTable from "react-data-table-component";
import { connect, useSelector } from "react-redux";
import { Row } from "reactstrap";

import PageContainer from "../../../../components/Containers/PageContainer";
import DeleteModal from "../../../../components/DeleteModal/DeleteModal";
import ChangeSubscriptionModal from "../../../../components/Modals/ChangeSubscriptionModal";
import { Filter } from "../../../../components/Table/TableComponents";
import {
  CustomCheckbox,
  TableStyles,
} from "../../../../components/Table/TableStyles";
import {
  addMailAccount,
  deleteMailAccount,
  getMailAccounts,
  updateMailAccount,
} from "../../../../redux/action/MailAccountsActions";
import axios from "../../../../utils/axios";
import {
  messages,
  toastOnError,
  toggleTopLoader,
} from "../../../../utils/Utils";
import DetailModal from "./components/DetailModal";

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

class MailAccountList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      detailModal: false,
      deleteModal: false,
      editItem: null,
      deleteItem: null,
      mailAccounts: [],
      textSearch: "",
      search: undefined,
      tableData: [],
      selectedFilter: "all",
      sortDirection: "asc",
      sortField: "email",
      currentPage: 1,
      rowsPerPage: 10,
      noPage: null,
    };
  }

  async componentDidMount() {
    this.fetchMailAccounts();
    try {
      const { data } = await axios.get(
        "/subscriptions/api/approve_creation_of_asset/?type=email"
      );
    } catch (e) {
      console.log(e);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.mailAccounts !== this.props.mailAccounts) {
      this.setState({ tableData: this.props.mailAccounts });
    }
  }

  fetchMailAccounts = () => {
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

    this.props.getMailAccounts(
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

  showDetailModal = async (item) => {
    if (!item) {
      const subscriptionData = await this.userCanAddOtherUser();
      if (!subscriptionData.status) {
        this.setState({ subscriptionData, showModalChangeSubscription: true });
        return;
      }
      item = {};
    }
    this.setState({ editItem: item });

    // Show edit
    this.setState({ detailModal: true });
  };

  createMailAccount = async (item) => {
    this.closeDetailModal();

    await this.props.addMailAccount(item);
    this.fetchMailAccounts();
  };

  updateMailAccount = async (item) => {
    this.closeDetailModal();

    await this.props.updateMailAccount(item.id, item);
    this.fetchMailAccounts();
  };

  closeDetailModal = () => {
    this.setState({ detailModal: false });

    this.setState({ editItem: null });
  };

  showDeleteModal = (item) => {
    // Save the item to delete
    this.setState({ deleteItem: item });

    // Show delete confirmation dialog
    this.setState({ deleteModal: true });
  };

  deleteMailAccount = async () => {
    this.closeDeleteModal();
    await this.props.deleteMailAccount(this.state.deleteItem.id);
    this.fetchMailAccounts();
  };

  closeDeleteModal = () => {
    this.setState({ deleteModal: false });
    this.setState({ deleteItem: null });
  };

  searchFilter = (e) => {
    this.setState({ textSearch: e.target.value });
  };

  userCanAddOtherUser = async () => {
    try {
      toggleTopLoader(true);
      const { data } = await axios.get(
        "/subscriptions/api/approve_creation_of_asset/?type=email"
      );
      return data;
    } catch (e) {
      toastOnError(messages.api_failed);
    } finally {
      toggleTopLoader(false);
    }
    return false;
  };

  render() {
    const { detailModal, deleteModal, tableData } = this.state;
    const { user } = this.props;

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

    const Edit = ({ row }) => {
      return (
        <div className="icons" style={{ marginRight: 35 }}>
          <span
            className="icons"
            id={`edit${row.id}`}
            onClick={(e) => {
              e.preventDefault();
              this.showDetailModal(row);
            }}
          >
            <i className="fas fa-edit icons" style={{ color: "#717579" }} />
          </span>
        </div>
      );
    };

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
        cell: (row) =>
          user.is_admin && (
            <Row>
              <Edit row={row} />
              <Delete row={row} />
            </Row>
          ),
        button: true,
      },
    ];

    return (
      <PageContainer>
        <TopLoader />
        <label className="ff-poppins pt-3 mb-0">
          Learn how to connect a mail account by watching
          <a
            href="http://www.mailerrize.com/support-post/how-to-add-email-accounts"
            target="_blank"
            className="text_blue text-bold"
          >
            {" "}
            <strong>this video</strong>
          </a>
        </label>
        <Row className="pr-6 pt-3">
          <DataTable
            columns={tableTitle}
            theme="mailerrize"
            data={tableData.results}
            pagination
            paginationServer
            paginationTotalRows={tableData.count}
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
                openAction={this.showDetailModal}
                // openAction={user.is_admin && this.showDetailModal}
                user={user}
              />
            }
            persistTableHead
            customStyles={TableStyles}
            selectableRowsComponent={CustomCheckbox}
          />
        </Row>

        <DetailModal
          isOpen={detailModal}
          data={this.state.editItem}
          close={this.closeDetailModal}
          create={this.createMailAccount}
          update={this.updateMailAccount}
        />

        <DeleteModal
          isOpen={deleteModal}
          close={this.closeDeleteModal}
          delete={this.deleteMailAccount}
          location="email account"
        />
        <ChangeSubscriptionModal
          isOpen={this.state.showModalChangeSubscription}
          close={() => this.setState({ showModalChangeSubscription: false })}
          subscription={this.state.subscriptionData?.subscription}
          amount={Number(this.state.subscriptionData?.plan?.amount)}
          number={1}
          entity={"email"}
          next={() => this.showDetailModal()}
        />
      </PageContainer>
    );
  }
}

MailAccountList.propTypes = {
  user: PropTypes.object,
  mailAccounts: PropTypes.object,
  getMailAccounts: PropTypes.func,
  addMailAccount: PropTypes.func,
  updateMailAccount: PropTypes.func,
  deleteMailAccount: PropTypes.func,
};

const mapStateToProps = (state) => ({
  mailAccounts: state.mailAccounts.mailAccounts,
  user: state.auth.user,
});

export default connect(mapStateToProps, {
  getMailAccounts,
  addMailAccount,
  updateMailAccount,
  deleteMailAccount,
})(MailAccountList);
