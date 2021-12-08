import React, { Component } from "react";
import { CSVReader } from "react-papaparse";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  Row,
} from "reactstrap";
import regeneratorRuntime from "regenerator-runtime";

class UnsubscribesModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emails: undefined,
      csvFile: null,
    };
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
    // this.setState({show:!this.state.show})
  };

  handleOnDrop = (data, file) => {
    if (!data || data.length == 0) {
      this.setState({
        csvFile: null,
      });
      return;
    }

    this.setState({
      csvFile: file,
    });
  };

  handleOnError = (err, file, inputElem, reason) => {
    console.log(err);
    this.setState({
      csvFile: null,
    });
  };

  handleOnRemoveFile = (data) => {
    this.setState({
      csvFile: null,
    });
  };

  onSubmit = (e) => {
    const emails = this.state.emails;
    if (emails) {
      const emailList = emails.split(",");
      this.props.unsubscribeEmail(emailList);
      this.props.close();
    }
  };

  onUpload = async (e) => {
    e.preventDefault();
    const file = this.state.csvFile;
    if (file) {
      this.props.unsubscribeCSV(file);
      this.props.close();
      this.setState({ csvFile: null });
    }
  };

  render() {
    const { loading } = this.props;

    return (
      <Modal isOpen={this.props.isOpen} toggle={this.props.close} size="lg">
        <Container className="p-3">
          <ModalBody>
            <h1>Unsubscribe email addresses</h1>
            <Alert className="mb-5 mt-3" color="default">
              <strong>TIP:</strong> Block a whole domain like this:{" "}
              <code>*@example.com</code>
            </Alert>
            <Form>
              <Row>
                <Col
                  md="5"
                  sm="12"
                  className="d-flex flex-column justify-content-between"
                >
                  <Input
                    type="textarea"
                    name="emails"
                    onChange={this.handleChange}
                    placeholder="Email addresses"
                    required
                    rows={3}
                  />
                  <Button
                    type="button"
                    color="info"
                    className="align-self-end mt-2"
                    onClick={this.onSubmit}
                  >
                    Submit
                  </Button>
                </Col>
                <Col md="2" sm="12" className="text-center align-self-center">
                  <strong>or</strong>
                </Col>
                <Col
                  md="5"
                  sm="12"
                  className="d-flex flex-column justify-content-between"
                >
                  <CSVReader
                    onDrop={this.handleOnDrop}
                    onError={this.handleOnError}
                    addRemoveButton
                    onRemoveFile={this.handleOnRemoveFile}
                    config={{
                      header: true,
                    }}
                    style={{
                      dropFile: {
                        width: 240,
                        height: 120,
                        background: "#eeeeee",
                      },
                    }}
                  >
                    <p>Upload a CSV file up to 1MB.</p>
                  </CSVReader>
                  <Button
                    type="button"
                    color="info"
                    className="align-self-end mt-3"
                    onClick={this.onUpload}
                  >
                    Upload
                  </Button>
                </Col>
              </Row>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={(e) => {
                e.preventDefault();
                this.props.close();
              }}
            >
              CANCEL
            </Button>
          </ModalFooter>
        </Container>
      </Modal>
    );
  }
}
export default UnsubscribesModal;
