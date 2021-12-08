import React, { Component } from 'react'

export default class Icon extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="setting_icon" onClick={this.props.onClick}>
        <div className="container">
          <img className="image_1" src={STATIC_FILES.menu_options}></img>
          <img className="image_2" src={STATIC_FILES.menu_options}></img>
          <img className="image_3" src={STATIC_FILES.menu_options}></img>
        </div>
      </div>
    )
  }
}
