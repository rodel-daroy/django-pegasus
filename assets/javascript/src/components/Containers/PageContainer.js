import React, { useEffect, useRef } from "react";
import NotificationAlert from "react-notification-alert";
import { connect, useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Nav,
  Row,
} from "reactstrap";

import { hideNotification } from "../../utils/Utils";

function PageContainer(props) {
  const {
    children,
    title,
    showHelper,
    cardBodyClassNames,
    notification,
    newButton,
    newAction,
    buttonColor,
    classNameTitle,
    classNameComponent,
    searchFilter,
    style,
  } = props;
  const notificationRef = useRef(null);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (notification.showNotification) {
      const options = {
        place: "tr",
        message: (
          <div className="alert-text">
            <span className="alert-title" data-notify="title">
              {notification.title}
            </span>
            <span data-notify="message">{notification.message}</span>
          </div>
        ),
        type: notification.type,
        icon: "ni ni-bell-55",
        autoDismiss: 5,
      };
      notificationRef.current.notificationAlert(options);

      hideNotification();
    }
  }, [notification.showNotification]);

  return (
    <>
      <div className="rna-wrapper">
        <NotificationAlert ref={notificationRef} />
      </div>
      <Container
        fluid
        className={"page-container " + classNameComponent}
        style={style}
      >
        <Row className="ml-0 mr-0">
          <Col className="m-0">{children}</Col>
        </Row>
      </Container>
    </>
  );
}

const mapStateToProps = (state) => ({
  notification: state.notification,
});

export default connect(mapStateToProps, {})(PageContainer);
