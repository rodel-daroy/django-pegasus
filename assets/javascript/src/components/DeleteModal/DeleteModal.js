import React from 'react'
// reactstrap components
import { Button, CardHeader, Modal, Row, Col } from 'reactstrap'

export default class DeleteModal extends React.Component {
  render() {
    return (
      <>
        <Modal
          className="modal-dialog-centered modal-customized"
          isOpen={this.props.isOpen}
          toggle={this.props.close}
        >
          <CardHeader className="pb-0 ml-0 mr-0 row">
            <div onClick={this.props.close} className="arrow-back">
              <img src={STATIC_FILES.arrow_back} />
            </div>
            <p className="title-modal">Confirmation</p>
          </CardHeader>
          <div className="text-delete">
            Are you sure to delete this {this.props.location}?
          </div>
          <Row className="my-4">
            <Col className="col-7" />
            <Col className="col-4 ">
              <Button
                type="button"
                block
                className="color-button"
                onClick={this.props.delete}
              >
                <img src={STATIC_FILES.delete_icon2} className="icon-delete" />{' '}
                <p className="font-weight-bold">Delete</p>
              </Button>
            </Col>
          </Row>
        </Modal>
      </>
    )
  }
}
