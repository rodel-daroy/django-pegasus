import {} from "reactstrap";

import PropTypes from "prop-types";
import React, { Component } from "react";

class FunnelCard extends Component {
  render() {
    return (
      <>
        <div
          className={
            this.props.totals ? "card-detail details-totals" : "card-detail"
          }
          onClick={() => this.props.onClick()}
        >
          <div className="number-detail action-detail">
            {this.props.count || 0}
          </div>
          <div className="action-detail">{this.props.text || ""}</div>
        </div>
      </>
    );
  }
}

FunnelCard.propTypes = {
  totals: PropTypes.bool,
  onClick: PropTypes.func,
  count: PropTypes.number,
  text: PropTypes.string,
};

export default FunnelCard;
