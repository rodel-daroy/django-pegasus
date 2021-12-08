import React, { Component } from "react";

class PreviewPanelList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div
        className="timeline timeline-one-side"
        data-timeline-axis-style="dashed"
        data-timeline-content="axis"
        {...this.props}
      >
      </div>
    )
  }
}

export default PreviewPanelList;