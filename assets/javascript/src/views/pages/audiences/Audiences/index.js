import PropTypes from "prop-types";
import React, { Component } from "react";
import DataTable from "react-data-table-component";
import { connect, useSelector } from "react-redux";
import { Row, Button } from "reactstrap";

import PageContainer from "../../../../components/Containers/PageContainer";
import { Filter } from "../../../../components/Table/TableComponents";
import {
  CustomCheckbox,
  TableStyles,
} from "../../../../components/Table/TableStyles";
import { filterRecipients } from "../../../../redux/action/ProspectsAction";
import axios from "../../../../utils/axios";
import { permission } from "../../../../utils/Enums";
import { toggleTopLoader } from "../../../../utils/Utils";
import DetailModal from "./components/DetailModal";
import ImportContactsModal from "./components/ImportContactsModal";
import Api from "../../../../redux/api/api";

function TopLoader() {
  const { topLoader } = useSelector((state) => state.notification);
  if (topLoader) {
    return <div className="loader loader-audiences"></div>;
  } else {
    return null;
  }
}
class Prospects extends Component {
  constructor(props) {
    super(props);
    this.headerRef = React.createRef();
    this.rowRef = React.createRef();
    this.state = {
      filters: [
        {
          filter: "All",
          label: "All Audiences",
        },
      ],
      headerContainerWitdh: null,
      rowContainerWidth: null,
      selected: "total",
      detailItem: null,
      detailLoading: false,
      importContactsModal: false,
      detailModal: false,
      token: localStorage.getItem("access_token"),
      tableData: [],
      selectedTagId: "",
      selectedTag: {},
      searchText: "",
      sortDirection: "asc",
      sortField: "email",
      currentPage: 1,
      rowsPerPage: 10,
      toggledClearRows: false,
      audiences: [],
      disableBtn: false
    };
  }

  componentDidMount = async () => {
    this.fillTagOptions();
  };

  handleChangeFilter = (selectedTagId) => {
    this.setState({ selectedTagId, currentPage: 1 }, this.fillTagOptions);
  };

  /* handleSearch = (e) => {
    if (e.keyCode === 13) {
      this.setState({ searchText: e.target.value }, this.fillTagOptions);
    }
  }; */

  handleSearch = (e) => {
    this.setState({ searchText: e.target.value }, this.searchFilter);
  };

  searchFilter = () => {
    let data = [...this.state.audiences];

    if (this.state.searchText !== "") {
      data = _.filter(data, (item) =>
        item.name.toUpperCase().includes(this.state.searchText.toUpperCase())
      );
      this.setState({ tableData: data });
    } else {
      this.setState({ tableData: this.state.audiences });
    }
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page }, this.fillTagOptions);
  };

  handleRowsPerPageChange = (newPageSize) => {
    this.setState(
      { rowsPerPage: newPageSize, currentPage: 1 },
      this.fillTagOptions
    );
  };

  handleSort = (column, sortDirection) => {
    this.setState(
      { sortDirection, sortField: column.selector },
      this.fillTagOptions
    );
  };

  fillTagOptions = () => {
    axios
      .get("/campaign/audience/tags/", {
        admin_id: this.props.user.team_admin_id,
        session_type: this.props.user.session_type,
      })
      .then((response) => {
        this.setState({ audiences: response.data, tableData: response.data });
      })
      .catch((err) => {
        console.log(err, "TagAPIError/campaign/audience/tags/");
      });
  };

  showImportContactsModal = () => {
    this.setState({ importContactsModal: true });
  };

  closeImportContactsModal = () => {
    this.setState({ importContactsModal: false });
  };

  closeDetailModal = () => {
    this.setState({ detailModal: false });
  };

  audienceCreated = () => {
    this.fillTagOptions();
  };

  showDetails = (row) => {
    this.setState({
      detailItem: null,
      detailModal: true,
      selectedTag: row,
    });

    toggleTopLoader(true);
  };

  deleteAudience = async (row) => {
    toggleTopLoader(true);
    this.setState({disableBtn: true});
    let res = await Api.deleteAudience(this.state.token, row.id);

    // If server was successful deleting the audience, it will return http status code
    // 204, unless you specify a different code. If it fails to delete the audience,
    // the server will return '404 Not Found'
    if (res.status === 204) {
      let audiences = this.state.audiences;
      let row_idx = audiences.indexOf(row);
      if (row_idx != -1) {
        audiences.splice(row_idx, 1);
      }
      this.setState({
        audiences
      });
    }
    toggleTopLoader(false);
    this.setState({disableBtn: false});
  }

  render() {
    const { importContactsModal, detailModal, selectedTag, tableData, disableBtn } =
      this.state;
    const { user } = this.props;

    return (
      <PageContainer classNameComponent="prospect-main-container">
        <TopLoader />
        <Row className="pt-4">
          <DataTable
            columns={[
              {
                name: "Name",
                selector: "name",
                sortable: false,
              },
              {
                name: "Actions",
                selector: "actions",
                sortable: false,
                cell: (row) => {
                  return (
                    <div>
                      <Button
                        type="button"
                        block
                        className="color-button"
                        disabled={disableBtn}
                        onClick={() => this.deleteAudience(row)}
                      >
                        <img src={STATIC_FILES.delete_icon2} className="icon-delete" />{' '}
                        <p className="font-weight-bold">Delete</p>
                      </Button>
                    </div>
                  )
                }
              }
            ]}
            theme="mailerrize"
            customStyles={TableStyles}
            data={tableData}
            pagination
            paginationServer
            paginationTotalRows={tableData.length}
            /* onChangeRowsPerPage={this.handleRowsPerPageChange} */
            onChangePage={this.handlePageChange}
            sortServer
            /* onSort={this.handleSort} */
            selectableRows
            clearSelectedRows={this.state.toggledClearRows}
            selectableRowsComponent={CustomCheckbox}
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
                openAction={
                  user.user_permission !== permission.READ &&
                  this.showImportContactsModal
                }
                user={user}
              />
            }
            onRowClicked={this.showDetails}
            persistTableHead
          />
        </Row>

        <ImportContactsModal
          isOpen={importContactsModal}
          // data={this.state.editItem}
          close={this.closeImportContactsModal}
          audienceCreated={this.audienceCreated}
          // create={this.createMailAccount}
          // update={this.updateMailAccount}
        />

        <DetailModal
          isOpen={detailModal}
          close={this.closeDetailModal}
          selectedTag={selectedTag}
          toggleTopLoader={toggleTopLoader}
        />
      </PageContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  recipients: state.prospects.recipients,
  counts: state.prospects.counts,
  user: state.auth.user,
});

Prospects.propTypes = {
  filterRecipients: PropTypes.func,
  user: PropTypes.object,
  recipients: PropTypes.object,
};

export default connect(mapStateToProps, {
  filterRecipients,
})(Prospects);
