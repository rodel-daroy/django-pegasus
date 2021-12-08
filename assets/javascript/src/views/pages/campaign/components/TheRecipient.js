import Dropzone from "dropzone";
import PropTypes from "prop-types";
import React, { Component } from "react";
import DataTable from "react-data-table-component";
import { CSVReader } from "react-papaparse";
import { connect } from "react-redux";
import {
  Button,
  Card,
  CardHeader,
  Col,
  Modal,
  ModalBody,
  Row,
  Spinner,
} from "reactstrap";

import { TableStyles } from "../../../../components/Table/TableStyles";
import { Tags } from "../../../../components/Tags";
import { campaignRecipient } from "../../../../redux/action/CampaignActions";
import axios from "../../../../utils/axios";
import {
  formatHeader,
  showNotification,
  toastOnError,
  toggleTopLoader,
} from "../../../../utils/Utils";

Dropzone.autoDiscover = false;

class TheRecipient extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      show: false,
      csvFile: null,
      tmpFile: null,
      firstRow: null,
      csvFields: null,
      csvMappingContent: {
        title: [],
        data: [],
      },
      duplicates: {
        title: [],
        data: [],
      },
      isOpen: false,
      checkLoading: false,
      selectedTag: null,
      audienceOptions: [],
      tagName: "",
      tagHeaders: [],
      titleFilters: [{ label: "Emails" }],
      content: [],
    };
  }

  handleSubmit = (e) => {
    const recipientData = this.formatData();

    this.props.campaignRecipient(recipientData);
    this.props.onNext();
  };

  getTableHeaders(row) {
    const tableHeaders = [];

    const fields = Object.keys(row || {})
      .filter((key) => !!key)
      .map((key) => {
        if (key) {
          tableHeaders.push({
            key: key,
            name: formatHeader(key),
            selector: key,
          });
        } else if (key.toLowerCase().indexOf("email") > -1) {
          tableHeaders.unshift({
            key: key,
            name: key,
            selector: key,
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

  handleOnDrop = async (data, file) => {
    this.setState({ selectedTag: null });
    if (!data || data.length === 0) {
      this.setState({
        csvFile: null,
        show: true,
        firstRow: null,
      });
      return;
    }

    const { fields, tableHeaders, tableBody } = this.extractFieldData(
      data.map((row) => row.data)
    );

    const uniqueContent = Array.from(new Set(tableBody.map((a) => a.email)))
      .map((email) => {
        return tableBody.find((a) => a.email === email);
      })
      .filter((a) => a.email);

    this.setState({ content: uniqueContent });

    const firstRow = data[0].data;

    if (fields.indexOf("email") === -1 && fields.indexOf("Email") === -1) {
      showNotification(
        "warning",
        "Invalid CSV uploading",
        "CSV file should contain 'email' column."
      );
      return;
    }

    const duplication = await this.checkDuplication(file);
    if (duplication && duplication.length > 0) {
      this.setState({ isOpen: true });
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
        isOpen: false,
      });
    }

    this.setState(
      {
        csvMappingContent: {
          title: tableHeaders,
          data: tableBody,
        },
        firstRow,
        show: true,
        csvFields: fields.join(","),
      },
      () => this.props.campaignRecipient(this.formatData())
    );
  };

  handleOnError = (err, file, inputElem, reason) => {
    console.log(err);
    this.setState(
      {
        csvFile: null,
        show: true,
        csvMappingContent: {
          title: [],
          data: [],
        },
        duplicates: {
          title: [],
          data: [],
        },
      },
      () => this.props.campaignRecipient(this.formatData())
    );
  };

  handleOnRemoveFile = (data) => {
    this.setState(
      {
        csvFile: null,
        show: false,
        firstRow: "",
        csvMappingContent: {
          title: [],
          data: [],
        },
        isOpen: false,
      },
      () => this.props.campaignRecipient(this.formatData())
    );
  };

  setCSVFile = () => {
    const f = this.state.tmpFile;
    this.setState(
      {
        csvFile: f,
        isOpen: false,
      },
      () => this.props.campaignRecipient(this.formatData())
    );
  };

  onPrev = () => {
    // call parent method
    this.props.onPrev();
  };

  checkDuplication = (csvfile) => {
    const formData = new FormData();
    formData.append("csvfile", csvfile);

    this.setState({
      checkLoading: true,
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

  onSelectHandler = (value, tagData) => {
    this.setState({ selectedTag: value }, () =>
      this.props.campaignRecipient(this.formatData())
    );
    this.getAudienceTag(value);
    if (value) {
      this.tagGetValue(value, tagData);
    }
    this.handleOnRemoveFile();
  };

  tagGetValue = (value, tagData) => {
    const selectedTag = tagData.find((item) => item.id === JSON.parse(value));
    this.setState(
      {
        tagName: selectedTag.name,
      },
      () => this.props.campaignRecipient(this.formatData())
    );
  };

  formatData = () => {
    const { csvFile, firstRow, csvFields, selectedTag, tagName, content } =
      this.state;

    const data = {
      csvfile: csvFile,
      first_row: firstRow,
      csv_fields: csvFields,
      tag: selectedTag,
      tagName,
      recipients: content,
    };

    return data;
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

        const content = response.data.results.map((row) =>
          JSON.parse(row.replacement)
        );

        const { fields, tableHeaders } = this.getTableHeaders(firstRow);
        this.setState(
          {
            content,
            tagHeaders: tableHeaders,
            firstRow,
            loading: false,
            audienceOptions: response.data.results.map((item) => {
              return JSON.parse(item.replacement);
            }, this.props.campaignRecipient(this.formatData())),
          },
          () => this.props.campaignRecipient(this.formatData())
        );
      })
      .catch((err) => {
        console.log(err);
        this.setState({ loading: false });
      });
  };

  paginationCallback = (value) => {
    console.log("value : ", value);
  };

  selectedCallback = (value) => {
    console.log("return=" + value);
  };

  render() {
    const { onPrev, onNext } = this.props;
    const { show, csvMappingContent, duplicates, isOpen, checkLoading } =
      this.state;
    return (
      <>
        <Card className="campaign-style">
          <Row>
            <Col>
              <h2 className="text-center sub-title my-4">
                Drop in your csv or select a tag
              </h2>
            </Col>
          </Row>
          <Row>
            <Col md="12" key="Tag">
              <Tags
                onSelect={this.onSelectHandler}
                label="Custom Audience"
                selectedTag={this.state.selectedTag}
              />
            </Col>
          </Row>
          {this.state.loading ? (
            <div className="loader"></div>
          ) : (
            this.state.selectedTag && (
              <>
                <Row className="campaign-style">
                  <Col>
                    <DataTable
                      columns={this.state.tagHeaders}
                      theme="mailerrize"
                      customStyles={TableStyles}
                      data={this.state.audienceOptions}
                      persistTableHead
                    />
                  </Col>
                </Row>
              </>
            )
          )}
          <h2 className="text-center sub-title mt-2 mb-4">OR</h2>
          <Row className="campaign-style">
            <Col>
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
                  Drop CSV file here or click to upload.
                </span>
              </CSVReader>
            </Col>
          </Row>
          {show && (
            <div className="campaign-style">
              <Row>
                <Col>
                  <h3 className="label-custom">Map CSV Special Columns</h3>
                  <p className="text-custom">
                    (top 10 rows and special columns)
                  </p>
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
                      data={csvMappingContent.data.splice(0, 10)}
                      persistTableHead
                    />
                  ) : (
                    <h4 className="text-center text-warning">
                      Invalid CSV File!
                    </h4>
                  )}
                </Col>
              </Row>
            </div>
          )}
          {/* Buttons */}
          <Row className="mt-4 mb-3 justify-content-between campaign-style">
            {onPrev && (
              <Button
                type="button"
                onClick={this.onPrev}
                className="color-button outline-button"
                disabled={this.state.loading}
              >
                <img src={STATIC_FILES.arrow_left} />
                {"  "}
                <p>PREV</p>
              </Button>
            )}
            {onNext && (
              <Button
                type="button"
                onClick={this.handleSubmit}
                className="outline-button margin-text"
                disabled={this.state.loading}
              >
                <p>NEXT</p> {"  "} <img src={STATIC_FILES.arrow_right} />
              </Button>
            )}
          </Row>
          <Modal
            className="modal-dialog-centered scroll-modal modal-customized "
            isOpen={isOpen}
            size="lg"
          >
            <CardHeader className="pb-0 ml-0 mr-0 row">
              <div
                onClick={this.handleOnRemoveFile}
                className="arrow-back"
                data-dismiss="modal"
              >
                <img src={STATIC_FILES.arrow_back} />
              </div>
              <p className="title-modal">Duplicated Recipients</p>
            </CardHeader>
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
                  />
                </>
              )}
            </ModalBody>
            <Row className="my-4 campaign-style justify-content-end">
              <Button
                type="button"
                className="outline-button  margin-text mr-5"
                onClick={this.setCSVFile}
              >
                <p>Continue</p> {"  "} <img src={STATIC_FILES.arrow_right} />
              </Button>
            </Row>
          </Modal>
        </Card>
      </>
    );
  }
}

TheRecipient.propTypes = {
  campaignRecipient: PropTypes.func,
  onNext: PropTypes.func,
  onPrev: PropTypes.func,
  user: PropTypes.object,
};

const mapStateToProps = (state) => ({
  campaign: state.campaign,
  user: state.auth.user,
});

export default connect(mapStateToProps, { campaignRecipient })(TheRecipient);
