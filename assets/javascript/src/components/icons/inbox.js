import React from 'react'

export default class Icon extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="settings_icon" onClick={this.props.onClick}>
        <div className="container">
          <img className="image" src={STATIC_FILES.inbox}></img>
        </div>
      </div>
    )
  }
}
