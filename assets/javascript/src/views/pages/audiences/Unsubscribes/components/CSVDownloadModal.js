import React, { Component } from "react";
import { CSVDownload, CSVLink } from "react-csv";
import {
  Button,
  Col,
  Container,
  Modal,
  ModalBody,
  ModalFooter,
  Row,
} from "reactstrap";

const headers = [
  { label: "Email", key: "email" },
  { label: "Name", key: "name" },
  { label: "Unsubscribe date", key: "date" },
];

class CSVDownloadModal extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const data = this.props.data;
    data.map((e) => ({ ...e, date: new Date(e["date"]).toLocaleString() }));

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
