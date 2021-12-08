import { makeStyles } from "@material-ui/core/styles";
import { withStyles } from '@material-ui/core/styles';

import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { Component } from "react";
import DataTable from "react-data-table-component";
import { CSVReader } from "react-papaparse";
import { connect } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormGroup,
  Modal,
  Row,
  UncontrolledAlert,
} from "reactstrap";

import { SaveIcon } from "../../../../../components/icons";
import { TableStyles } from "../../../../../components/Table/TableStyles";
import { filterRecipients } from "../../../../../redux/action/ProspectsAction";
import axios from "../../../../../utils/axios";
import { formatHeader, showNotification } from "../../../../../utils/Utils";

const initialState = {
  show: false,
  csvFile: null,
  first_row: null,
  csvFields: null,
  csvMappingContent: {
    title: [],
    data: [],
  },
  selectedTag: "",
  token: localStorage.getItem("access_token"),
  tags: null,
  titleFilters: [{ label: "Emails" }],
  loading: false,
};

const useStyles = {
  root: {
    backgroundColor: "#fff",
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#fff",
    },
    "& .MuiOutlinedInput-root .MuiOutlinedInput-input": {
      color: "#333",
      backgroundColor: "#fff",
    },
  },
};

export class ImportContactsModal extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  resetData = () => {
    this.setState({
      csvFile: null,
      first_row: null,
      csvFields: null,
      show: false,
      selectedTag: "",
      tags: null,
      csvMappingContent: {
        title: [],
        data: [],
      },
    });
  };

  handleChange = (e) => {
    this.getDataFromAPI(e.target.value);
    this.setState({ selectedTag: e.target.value, error: false });
  };

  getDataFromAPI = (e) => {
    axios
      .get(
        "/campaign/audience/tags/",
        {
          admin_id: this.props.user.team_admin_id,
          session_type: this.props.user.session_type,
          name: e,
        },
        { headers: { Authorization: this.state.token } }
      )
      .then((res) => {
        if (res?.data) {
          this.setState({ tags: [...res?.data.map((item) => item.name)] });
        }
      })
      .catch((err) => {});
  };

  handleSubmit = (event) => {
    event.preventDefault();

    if (!this.state.csvFile || this.state.csvFields === "") {
      showNotification("danger", "Complete all the data", "");
      return;
    }
    if (this.state.selectedTag == "") {
      showNotification("danger", "Complete all the data", "");
      return;
    }
    this.setState({ loading: true, error: false });

    const formData = new FormData();
    formData.append("csvfile", this.state.csvFile);
    formData.append("tag", this.state.selectedTag);
    formData.append("admin_id", this.props.user.team_admin_id);
    formData.append("session_type", this.props.user.session_type);
    axios
      .post("/campaign/audience/create/", formData, {
        headers: { Authorization: this.state.token },
      })
      .then((res) => {
        if (res?.data.success) {
          this.props.audienceCreated();
          showNotification("success", "Success", res.data.message);
          this.props.filterRecipients(
            "",
            this.props.user.session_type,
            this.props.user.team_admin_id
          );
        }
      })
      .catch((err) => {
        showNotification("danger", "Something Went Wrong", "");
      })
      .finally(() => {
        this.setState({ loading: false });
        this.props.close();
      });
  };

  handleOnDrop = (data, file) => {
    if (!data || data.length == 0) {
      this.setState({
        csvFile: null,
        show: true,
        first_row: null,
      });
      return;
    }

    const firstRow = data[0].data;
    const tableHeaders = [];
    const tableBody = [];
    const fields = Object.keys(firstRow || {})
      .filter((key) => !!key)
      .map((key) => {
        tableHeaders.push({
          key: key,
          name: formatHeader(key),
          selector: key,
          sortable: false,
        });
        return key;
      });

    if (fields.indexOf("email") == -1 && fields.indexOf("Email") == -1) {
      showNotification(
        "warning",
        "Invalid CSV uploading",
        "CSV file should contain 'email' column."
      );
      return;
    }

    if (tableHeaders.length > 0) {
      data.forEach((row, index) => {
        if (index >= 10) return;
        let obj = {};
        const rowData = row.data;
        let invalidRow = false
        tableHeaders.forEach((header) => {
          obj[header.key] = rowData[header.key];
          if (["email", "Email"].indexOf(header.name)  > -1) {
            invalidRow = !(obj[header.key] && obj[header.key].match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g))
          }
        });
        if (invalidRow===false) {
          tableBody.push(obj);
        }
      });
    }

    this.setState({
      csvFile: file,
      csvMappingContent: {
        title: tableHeaders,
        data: tableBody,
      },
      first_row: firstRow,
      show: true,
      csvFields: fields.join(","),
      error: false,
    });
  };

  handleOnError = (err, file, inputElem, reason) => {
    console.log(err);
    this.setState({
      csvFile: null,
      show: true,
      csvMappingContent: {
        title: [],
        data: [],
      },
    });
  };

  handleOnRemoveFile = (data) => {
    this.setState({
      csvFile: null,
      show: false,
      csvMappingContent: {
        title: [],
        data: [],
      },
    });
  };
  paginationCallback = (value) => {
    console.log("value : ", value);
  };

  selectedCallback = (value) => {
    console.log("return=" + value);
  };

  handleRowsPerPageChange = (newPageSize) => {
    this.setState({ rowsPerPage: newPageSize, currentPage: 1 });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  render() {
    const { show, csvMappingContent, tags, error } = this.state;
    const { classes } = this.props;
    return (
      <>
        <Modal
          isOpen={this.props.isOpen}
          toggle={this.props.close}
          size="lg"
          className="modal-audience"
          onClosed={this.resetData}
        >
          <Form>
            <Card className="no-shadow">
              <CardHeader className="pb-0 ml-0 mr-0 row">
                <div onClick={this.props.close} className="arrow-back">
                  <img src={STATIC_FILES.arrow_back} />
                </div>
                <p className="title-modal">Add New Audience</p>
              </CardHeader>
              <CardBody className="pt-0 pb-0">
                {error && (
                  <UncontrolledAlert color="danger" fade={false}>
                    <span className="alert-inner--icon">
                      <i className="ni ni-bell-55" />
                    </span>{" "}
                    <span className="alert-inner--text">
                      <strong>Error!</strong> Complete all the information
                    </span>
                  </UncontrolledAlert>
                )}
                <Row className="mt-3">
                  <Col>
                    <FormGroup className="mb-2">
                      <p className="sub-title">General Info</p>
                      <Autocomplete
                        style={{ width: "60%" }}
                        className={classes.root}
                        freeSolo
                        autoComplete
                        autoHighlight
                        options={tags ? tags : []}
                        renderInput={(params) => (
                          <>
                            <label className="label-modal">AUDIENCE NAME</label>
                            <TextField
                              {...params}
                              onChange={this.handleChange}
                              variant="outlined"
                            />
                          </>
                        )}
                      />
                      <br />
                      <p><span style={{fontWeight: "bold"}}>Note:</span> The CSV can have as many columns as you want,
                        at least one column should have the name <span style={{fontWeight: "bold"}}>email</span>.</p>
                      <CSVReader
                        onDrop={this.handleOnDrop}
                        onError={this.handleOnError}
                        addRemoveButton
                        onRemoveFile={this.handleOnRemoveFile}
                        config={{
                          header: true,
                        }}
                        style={{
                          dropArea: {
                            padding: 0,
                            borderWidth: 0,
                          },
                          dropFile: {
                            width: "100%",
                            height: 190,
                            background: "#ffeeef",
                            borderColor: "rgba(255,57,188,1.0)",
                            borderWidth: 3,
                            borderStyle: "dashed",
                          },
                          removeButton: {
                            color: "rgba(255,57,188,1.0)",
                          },
                        }}
                      >
                        <span className="text-csv">DROP TO UPLOAD</span>
                      </CSVReader>
                    </FormGroup>
                  </Col>
                </Row>
                {show && (
                  <>
                    <Row>
                      <Col>
                        <h3 className="text-left my-2">
                          Map CSV Special Columns
                        </h3>
                        <span>(top 10 rows and special columns)</span>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        {csvMappingContent.title.length > 0 &&
                        csvMappingContent.data.length > 0 ? (
                          <DataTable
                            columns={csvMappingContent.title}
                            theme="mailerrize"
                            customStyles={TableStyles}
                            data={csvMappingContent.data}
                            persistTableHead
                          />
                        ) : (
                          <h4 className="text-center text-warning">
                            Invalid CSV File!
                          </h4>
                        )}
                      </Col>
                    </Row>
                  </>
                )}
                {this.state.loading && (
                  <div className="auth-loading-wrapper">
                    <i className="ml-2 fas fa-spinner fa-spin"></i>
                  </div>
                )}
                <Row className="mt-4">
                  <Button
                    type="button"
                    className="color-button"
                    onClick={this.handleSubmit}
                  >
                    <SaveIcon /> <p>SAVE CONTACTS</p>
                  </Button>
                </Row>
              </CardBody>
            </Card>
          </Form>
        </Modal>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps, { filterRecipients })(withStyles(useStyles)
  (ImportContactsModal)
);
