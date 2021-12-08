import React, { Component } from "react";
import { CSVDownload, CSVLink } from "react-csv";
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

const headers = [
  {
    key: "email",
    label: "EMAIL",
  },
  {
    key: "full_name",
    label: "NAME",
  },
  {
    key: "created",
    label: "ADDED ON",
  },
  {
    key: "updated",
    label: "SEND ON",
  },
];

class CSVDownloadModal extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const data = this.props.data;

    return (
      <Modal isOpen={this.props.isOpen} size="lg">
        <Container className="p-3">
          <ModalBody>
            <h1 className="mb-4">Download</h1>
            <Row>
              <Col className="d-flex flex-row justify-content-center">
                <CSVLink
                  className="w-50"
                  data={data}
                  headers={headers}
                  filename={"mailerrize-export.csv"}
                  onClick={() => {
                    this.props.close();
                  }}
                >
                  <Button className="btn btn-warning w-100">
                    Download CSV
                  </Button>
                </CSVLink>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button
              className="btn"
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
export default CSVDownloadModal;
