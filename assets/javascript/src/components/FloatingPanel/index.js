import React from 'react';

function FloatingPanel({visible, title, onClose, children}) {
  return (
    <div className={`float-panel panel-right ${visible && 'show'}`}>
    <div className="panel-header">
      <h2 className="header-title">{title}</h2>
      <i className="fas fa-times btn-close" onClick={onClose}></i>
    </div>
    <div className="panel-body">
      {
        children
      }
    </div>
  </div>
  )
}

export default FloatingPanel;