import React, { Component } from "react";

export default class Icon extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div
        className="delete_icon"
        onClick={this.props.onClick}
        styles={this.props.styles}
      >
        <div className="container">
          <img className="image" src={STATIC_FILES.delete_icon}></img>
        </div>
      </div>
    );
  }
}
