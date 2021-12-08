import React, { Component } from 'react'

export default class Icon extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="save_icon" onClick={this.props.onClick}>
        <div className="container">
          <img className="image_1" src={STATIC_FILES.save_icon_1}></img>
          <img className="image_2" src={STATIC_FILES.save_icon_2}></img>
          <img className="image_3" src={STATIC_FILES.save_icon_3}></img>
        </div>
      </div>
    )
  }
}
