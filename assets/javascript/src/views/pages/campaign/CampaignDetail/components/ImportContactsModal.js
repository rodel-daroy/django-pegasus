import React, { Component } from "react";
import { CSVReader } from "react-papaparse";
import { connect } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  CustomInput,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
} from "reactstrap";

import { SaveIcon } from "../../../../../components/icons";
import Tables from "../../../../../components/Tables";
import { Tags } from "../../../../../components/Tags";
import { importContacts } from "../../../../../redux/action/CampaignDetailsActions";
import axios from "../../../../../utils/axios";
import { showNotification, toggleTopLoader } from "../../../../../utils/Utils";

const initialState = {
  loading: false,
  ignoreDuplicates: true,
  show: false,
  csvFile: null,
  first_row: null,
  csvFields: null,
  csvMappingContent: {
    title: [],
    data: [],
  },
  duplicates: {
    title: [],
    data: [],
  },
  tmpFile: null,
  isDupModalOpen: false,
  checkLoading: false,
  selectedTag: null,
  audienceOptions: [],
  tagName: "",
  tagHeaders: [],
  titleFilters: [{ label: "Emails" }],
};

export class ImportContactsModal extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (!(this.state.selectedTag || this.state.csvFile)) {
      showNotification(
        "danger",
        "Please, upload a CSV file or select an audience",
        ""
      );
      return false;
    }

    const { id } = this.props;
    const { csvFile, ignoreDuplicates, selectedTag } = this.state;

    this.props.importContacts(id, csvFile, ignoreDuplicates, selectedTag);
    this.close();
  };

  handleOnDrop = async (data, file) => {
    this.setState({ selectedTag: null });
    if (!data || data.length == 0) {
      this.setState({
        csvFile: null,
        show: true,
        first_row: null,
      });
      return;
    }

    const { fields, tableHeaders, tableBody } = this.extractFieldData(
      data.map((row) => row.data)
    );

    const firstRow = data[0].data;

    if (fields.indexOf("email") == -1 && fields.indexOf("Email") == -1) {
      showNotification(
        "warning",
        "Invalid CSV uploading",
        "CSV file should contain 'email' column."
      );
      return;
    }

    const duplication = await this.checkDuplication(file);
    if (duplication && duplication.length > 0) {
      const { tableHeaders: dupHeaders, tableBody: dupBody } =
        this.extractFieldData(duplication);
      this.setState({
        duplicates: {
          title: dupHeaders,
          data: dupBody,
        },
        tmpFile: file,
        csvFile: null,
      });
    } else {
      this.setState({
        tmpFile: file,
        csvFile: file,
        isDupModalOpen: false,
      });
    }

    this.setState({
      csvMappingContent: {
        title: tableHeaders,
        data: tableBody,
      },
      first_row: firstRow,
      show: true,
      csvFields: fields.join(","),
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
      isDupModalOpen: false,
      csvMappingContent: {
        title: [],
        data: [],
      },
    });
  };

  close = () => {
    this.setState(initialState);
    this.props.close();
  };

  handleSelect = () => {
    this.setState({ ignoreDuplicates: !this.state.ignoreDuplicates });
  };

  getTableHeaders(row) {
    const tableHeaders = [];

    const fields = Object.keys(row || {})
      .filter((key) => !!key)
      .map((key) => {
        if (key) {
          tableHeaders.push({
            key: key,
            value: key,
          });
        } else if (key.toLowerCase().indexOf("email") > -1) {
          tableHeaders.unshift({
            key: key,
            value: key,
          });
        }
        return key;
      });

    return {
      fields,
      tableHeaders,
    };
  }

  extractFieldData(data) {
    const firstRow = data[0];
    const tableBody = [];
    const { fields, tableHeaders } = this.getTableHeaders(firstRow);

    if (tableHeaders.length > 0) {
      data.forEach((rowData, index) => {
        if (index > 10) return;
        const obj = {};
        tableHeaders.forEach((header) => {
          obj[header.key] = rowData[header.key];
        });
        tableBody.push(obj);
      });
    }

    return {
      fields,
      tableHeaders,
      tableBody,
    };
  }

  checkDuplication = (csvfile) => {
    const formData = new FormData();
    formData.append("csvfile", csvfile);
    this.setState({
      checkLoading: true,
      isDupModalOpen: true,
    });

    toggleTopLoader(true);
    return axios
      .post("/campaign/check-recipients", formData)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          return data.result;
        } else {
          return false;
        }
      })
      .catch((error) => {
        toastOnError({ error: error });
      })
      .finally(() => {
        toggleTopLoader(false);
        this.setState({ checkLoading: false });
      });
  };

  setCSVFile = () => {
    const f = this.state.tmpFile;
    this.setState({
      csvFile: f,
      isDupModalOpen: false,
    });
  };

  onSelectHandler = (value, tagData) => {
    this.setState({ selectedTag: value });
    this.getAudienceTag(value);
    if (value) {
      this.tagGetValue(value, tagData);
    }
    this.handleOnRemoveFile();
  };

  getAudienceTag = (tagId) => {
    this.setState({ loading: true, audienceOptions: [] });

    let firstRow = null;
    axios
      .get("/campaign/audience/list/", {
        session_type: this.props.user.session_type,
        admin_id: this.props.user.team_admin_id,
        tag_id: tagId,
        search_term: "",
        sort_field: "email",
      })
      .then((response) => {
        firstRow = JSON.parse(response.data.results[0].replacement);
        const { fields, tableHeaders } = this.getTableHeaders(firstRow);
        this.setState({
          tagHeaders: tableHeaders,
          audienceOptions: response.data.results.map((item) => {
            return JSON.parse(item.replacement);
          }),
        });
        this.setState({ first_row: firstRow, loading: false });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ loading: false });
      });
  };

  tagGetValue = (value, tagData) => {
    const selectedTag = tagData.find((item) => item.id === JSON.parse(value));
    this.setState({
      tagName: selectedTag.name,
    });
  };

  paginationCallback = (value) => {
    console.log("value : ", value);
  };

  selectedCallback = (value) => {
    console.log("return=" + value);
  };

  render() {
    const {
      show,
      csvMappingContent,
      isDupModalOpen,
      checkLoading,
      duplicates,
      ignoreDuplicates,
    } = this.state;

    return (
      <>
        <Modal isOpen={this.props.isOpen} toggle={this.close} size="lg">
          <Card className="no-shadow modal-audience">
            <CardHeader className="pb-0 ml-0 mr-0 row">
              <div onClick={this.close} className="arrow-back">
                <img src={STATIC_FILES.arrow_back} />
              </div>
              <p className="title-modal">Import Contacts</p>
            </CardHeader>
            <CardBody className="pt-0 pb-0">
              <Row>
                <Col>
                  <h2 className="text-center my-4">
                    Drop in your csv or select a tag
                  </h2>
                </Col>
              </Row>
              <Row>
                <Col md="12" key="Tag">
                  <Tags
                    onSelect={this.onSelectHandler}
                    label="Tag"
                    selectedTag={this.state.selectedTag}
                    recipients
                  />
                </Col>
              </Row>
              {this.state.loading ? (
                <div className="loader"></div>
              ) : (
                this.state.selectedTag && (
                  <>
                    <Row>
                      <Tables
                        titles={this.state.tagHeaders} // required
                        tablePropsData={this.state.audienceOptions} // required
                        showPagination={true}
                        showPagination={true} // optional
                        selectedCallback={this.selectedCallback} // get call back for select object.
                        paginationCallback={this.paginationCallback}
                      />
                    </Row>
                  </>
                )
              )}
              <h2 className="text-center mb-4">OR</h2>
              <Row className="mt-3">
                <Col>
                  <FormGroup className="mb-2">
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
                      <span className="text-csv">
                        DROP CSV FILE HERE OR CLICK TO UPLOAD.
                      </span>
                    </CSVReader>
                  </FormGroup>
                </Col>
              </Row>
              {show && (
                <>
                  <Row>
                    <Col>
                      <h3 className="text-left my-4">
                        Map CSV Special Columns
                      </h3>
                      <span>(top 10 rows and special columns)</span>
                    </Col>
                  </Row>
                  <Row>
                    {csvMappingContent.title.length > 0 &&
                    csvMappingContent.data.length > 0 ? (
                      <Tables
                        titles={csvMappingContent.title} // required
                        tablePropsData={csvMappingContent.data} // required
                        filters={this.state.titleFilters} // optional
                      />
                    ) : (
                      <Col>
                        <h4 className="text-center text-warning">
                          Invalid CSV File!
                        </h4>
                      </Col>
                    )}
                  </Row>
                </>
              )}
              <Row className="mt-4">
                <Button
                  type="button"
                  onClick={this.handleSubmit}
                  className="color-button"
                >
                  <SaveIcon /> <p>SAVE CONTACTS</p>
                </Button>

                <Col md={8} className="ignore-duplicates-container">
                  <CustomInput
                    id="ignore-duplicates"
                    onChange={() => this.handleSelect()}
                    type="checkbox"
                    checked={ignoreDuplicates}
                  >
                    Ignore duplicates
                  </CustomInput>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Modal>
        <Modal
          className="modal-dialog-centered scroll-modal"
          isOpen={isDupModalOpen}
          size="lg"
        >
          <ModalHeader>Duplicated Recipients</ModalHeader>
          <ModalBody className="pt-0">
            <p className="text-muted text-center mb-10">
              The following recipients were found duplicated in your CSV file
              and will be cleared from the list.
            </p>
            {checkLoading && (
              <div className="d-flex">
                <Spinner color="primary" className="m-auto" />
              </div>
            )}
            {!checkLoading && duplicates.data.length === 0 && (
              <p className="text-muted text-center mb-0">
                There is no duplicated recipient.
              </p>
            )}
            {!checkLoading && duplicates.data.length > 0 && (
              <>
                <Tables
                  titles={duplicates.title} // required
                  tablePropsData={duplicates.data} // required
                  filters={this.state.titleFilters} // optional
                />
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              data-dismiss="modal"
              type="button"
              onClick={this.handleOnRemoveFile}
            >
              Cancel
            </Button>
            <Button color="danger" type="button" onClick={this.setCSVFile}>
              Continue
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    id: state.campaignDetails.id,
    user: state.auth.user,
  };
};

export default connect(mapStateToProps, {
  importContacts,
})(ImportContactsModal);
