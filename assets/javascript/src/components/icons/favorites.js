import React from 'react'

export default class Icon extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="favorites_icon" onClick={this.props.onClick}>
        <div>
          <img
            className="image"
            src={STATIC_FILES.favorites}
          ></img>
        </div>
      </div>
    )
  }
}
