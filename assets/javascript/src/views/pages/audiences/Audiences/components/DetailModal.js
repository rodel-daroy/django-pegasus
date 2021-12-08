import PropTypes from "prop-types";
import React, { Component } from "react";
import DataTable from "react-data-table-component";
import { connect, useSelector } from "react-redux";
import { CardHeader, Modal, Row, Spinner } from "reactstrap";

import {
  CustomCheckbox,
  TableStyles,
} from "../../../../../components/Table/TableStyles";
import { filterRecipients } from "../../../../../redux/action/ProspectsAction";
import { formatHeader } from "../../../../../utils/Utils";

export class DetailModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: [],
      csvMappingContent: {
        title: [],
        data: [],
      },
      sortDirection: "asc",
      sortField: "email",
      currentPage: 1,
      rowsPerPage: 10,
      selectedTagId: this.props.selectedTag.id,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedTag.id !== this.props.selectedTag.id) {
      this.setState(
        {
          selectedTagId: this.props.selectedTag.id,
        },
        this.fetchRecipients
      );
    }
    if (
      prevProps.recipients !== this.props.recipients &&
      this.props.recipients?.results
    ) {
      const titles = this.props.recipients && this.props.recipients?.results && this.props.recipients?.results?.[0]?.replacement ? JSON.parse(
        this.props.recipients?.results?.[0]?.replacement
      ) : null ;
      const keys = titles ? Object.keys(titles) : [];
      const tableBody = [];

      this.props.recipients.results.forEach((rowData, index) => {
        rowData = JSON.parse(
          this.props.recipients?.results?.[index]?.replacement
        );
        const obj = {};
        keys.forEach((header) => {
          obj[header] = rowData[header];
        });
        tableBody.push(obj);
      });

      this.setState({
        tableData: this.props.recipients,
        csvMappingContent: {
          title: keys,
          data: tableBody,
        },
      });
      this.props.toggleTopLoader(false);
    }
  }

  fetchRecipients = () => {
    const {
      selectedTagId,
      searchText,
      sortDirection,
      sortField,
      currentPage,
      rowsPerPage,
    } = this.state;

    const sessionType = this.props.user.session_type;
    const teamAdminId = this.props.user.team_admin_id;

    this.props.filterRecipients(
      selectedTagId,
      sessionType,
      teamAdminId,
      searchText,
      sortDirection,
      sortField,
      currentPage,
      rowsPerPage
    );
  };

  handleRowsPerPageChange = (newPageSize) => {
    this.setState(
      { rowsPerPage: newPageSize, currentPage: 1 },
      this.fetchRecipients
    );
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page }, this.fetchRecipients);
  };

  render() {
    const { selectedTag } = this.props;

    const { csvMappingContent, tableData } = this.state;

    const tableTitles = csvMappingContent.title.map((item) => {
      return {
        name: formatHeader(item),
        selector: item,
        sortable: false,
      };
    });

    return (
      <Modal
        isOpen={this.props.isOpen}
        toggle={this.props.close}
        size="xl"
        style={{ background: "white" }}
      >
        <CardHeader className="ml-0 mr-0 row">
          <div onClick={this.props.close} className="arrow-back">
            <img src={STATIC_FILES.arrow_back} />
          </div>
          <span
            className="title text-bold ff-poppins "
            style={{ marginLeft: 15 }}
          >
            <strong>{selectedTag.name}</strong>: Recipients
          </span>
        </CardHeader>

        <Row className="pl-6 pr-6 pt-4">
          <DataTable
            columns={tableTitles}
            theme="mailerrize"
            customStyles={TableStyles}
            data={csvMappingContent.data}
            pagination
            paginationServer
            paginationTotalRows={tableData.count}
            onChangeRowsPerPage={this.handleRowsPerPageChange}
            onChangePage={this.handlePageChange}
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
            persistTableHead
          />
        </Row>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  recipients: state.prospects.recipients,
  counts: state.prospects.counts,
  user: state.auth.user,
});

DetailModal.propTypes = {
  filterRecipients: PropTypes.func,
  user: PropTypes.object,
  recipients: PropTypes.object,
};

export default connect(mapStateToProps, {
  filterRecipients,
})(DetailModal);
