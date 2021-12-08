import React from 'react'
import { Button, ButtonGroup, Navbar, Nav, NavItem, NavLink } from 'reactstrap'
import { withRouter } from 'react-router-dom'
import classnames from 'classnames'

const items = [
  {
    name: 'OVERVIEW',
    link: '/details-overview',
  },
  {
    name: 'SEQUENCE',
    link: '/details-sequence',
  },
  {
    name: 'RECIPIENTS',
    link: '/details-recipients',
  },
  {
    name: 'SETTINGS',
    link: '/details-settings',
  },
]

function DetailHeader(props) {
  const { color, activeItem, id } = props
  return (
    <>
      <div className="d-flex align-items-center justify-content-center float-right">
        <ButtonGroup>
          {items.map((item, index) => {
            return (
              <Button
                color={color}
                type="button"
                key={'header' + index}
                style={{
                  cursor: 'normal',
                  padding: '8px 8px',
                  backgroundColor:
                    activeItem == item.name
                      ? 'rgba(255,57,188,1.0)'
                      : '#EEEEEE',
                  marginRight: 5,
                  borderRadius: 10,
                  color: activeItem == item.name ? 'white' : '#000041',
                  fontSize: 18,
                  fontWeight: 700,
                }}
                onClick={() => {
                  props.history.push({
                    pathname: `/app/admin/campaign/${id}${item.link}`,
                  })
                }}
              >
                {item.name}
              </Button>
            )
          })}
        </ButtonGroup>
      </div>
    </>
  )
}

export default withRouter(DetailHeader)
