import React, { Component } from "react";

class MainPreviewPanel extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { subject, body } = this.props;

    return (
      <div className="timeline-block mb-1 send_campaign">
        <span className="timeline-step badge-success">
          <i className="fa fa-envelope"></i>
        </span>
        <div className="timeline-content full-max-w">
          <h4 className="label_to">Subject</h4>
          <h5 className="mb-3 action-detail">{subject}</h5>
          <h3 className="label_to">Message</h3>
          <p
            className="text-sm mt-1 mb-0"
            dangerouslySetInnerHTML={{ __html: body }}
          ></p>
        </div>
      </div>
    );
  }
}

export default MainPreviewPanel;
