import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { Button, Col, FormGroup, Input, Row } from "reactstrap";

import PageContainer from "../../../../components/Containers/PageContainer";
import { getMailAccounts } from "../../../../redux/action/MailAccountsActions";
import {
  addSendingCalendar,
  getAvailableTimezones,
  getSendingCalendars,
  sendTestEmail,
  updateSendingCalendar,
} from "../../../../redux/action/SendingCalendarActions";
import EditCalendar from "./components/EditCalendar";
import ShowCalendar from "./components/ShowCalendar";

const initialCalendar = {
  block_days: 96,
  start_time: "09:00:00",
  end_time: "17:00:00",
  time_zone: "US/Eastern",
  max_emails_per_day: 20,
  minutes_between_sends: 12,
  min_emails_to_send: 1,
  max_emails_to_send: 1,
};

function SendingCalendar({
  mailAccounts,
  sendingCalendars,
  availableTimezones,
  getMailAccounts,
  getSendingCalendars,
  addSendingCalendar,
  updateSendingCalendar,
  getAvailableTimezones,
  sendTestEmail,
}) {
  const user = useSelector((state) => state.auth.user);
  const [currentCalendar, setCurrentCalendar] = useState(null);
  const [currentMailAccount, setCurrentMailAccount] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLocal, setIsLocal] = useState(
    window.location.href.indexOf("localhost") > -1 ||
      window.location.href.indexOf("127.0.0.1") > -1
  );

  useEffect(() => {
    getMailAccounts(user.session_type, user.team_admin_id);
    getSendingCalendars(user.session_type, user.team_admin_id);
    getAvailableTimezones();
  }, []);

  useEffect(() => {
    if (mailAccounts.length > 0) {
      setCurrentMailAccount(mailAccounts[0].id);
    }
  }, [mailAccounts]);

  useEffect(() => {
    if (currentMailAccount) {
      let calendar = sendingCalendars.find(
        (item) => item.mail_account && (item.mail_account).toString() === (currentMailAccount).toString()
      );
      if (!calendar) {
        calendar = initialCalendar;
        calendar.mail_account = currentMailAccount;
      }

      setCurrentCalendar(calendar);
    }
  }, [currentMailAccount, sendingCalendars]);

  const saveCalendar = (editData) => {
    const data = {
      ...editData,
      mail_account: currentMailAccount,
    };

    if (editData.id) {
      updateSendingCalendar(editData.id, data);
    } else {
      addSendingCalendar(data);
    }

    setIsEditing(false);
  };

  const onSendTestEmail = () => {
    // 0 : Call celery > email_sender()
    // 1 : Call celery > email_receiver()
    sendTestEmail(0);
  };

  const onReceiveTestEmail = () => {
    // 0 : Call celery > email_sender()
    // 1 : Call celery > email_receiver()
    sendTestEmail(1);
  };

  return (
    <>
      <PageContainer showHelper={false}>
        <Row>
          <Col md={5} className="mx-auto form-custom">
            <FormGroup className="mb-2 form-select">
              <label className="sub-title" htmlFor="mail_account_id">
                Mail account
              </label>
              <Input
                type="select"
                style={{ color: "#707579" }}
                onChange={(e) => setCurrentMailAccount(e.target.value)}
                className="input-select"
                disabled={isEditing}
              >
                {mailAccounts.map((item, index) => (
                  <option value={item.id} key={index} className="option-select">
                    {item.email}
                  </option>
                ))}
              </Input>
              <img
                alt=""
                src={STATIC_FILES.arrow_pink}
                className="icon-select"
              />
            </FormGroup>

            {!isEditing && (
              <ShowCalendar
                calendar={currentCalendar}
                startEditing={() => setIsEditing(true)}
                userIsAdmin={user.is_admin}
              />
            )}
            {isEditing && (
              <EditCalendar
                currentCalendar={currentCalendar}
                setCurrentCalendar={(value) => setCurrentCalendar(value)}
                availableTimezones={availableTimezones}
                saveEditing={saveCalendar}
                cancelEditing={() => setIsEditing(false)}
              />
            )}
            {isLocal && (
              <Row className="mt-3 ml-1 justify-content-end">
                <Button
                  type="button"
                  onClick={onSendTestEmail}
                  className="outline-button"
                >
                  Test sender
                </Button>

                <Button
                  type="button"
                  onClick={onReceiveTestEmail}
                  className="outline-button"
                >
                  Test receiver
                </Button>
              </Row>
            )}
          </Col>
        </Row>
      </PageContainer>
    </>
  );
}

SendingCalendar.propTypes = {
  mailAccounts: PropTypes.object,
  sendingCalendars: PropTypes.object,
  availableTimezones: PropTypes.object,
  getMailAccounts: PropTypes.func,
  getSendingCalendars: PropTypes.func,
  addSendingCalendar: PropTypes.func,
  updateSendingCalendar: PropTypes.func,
  getAvailableTimezones: PropTypes.func,
  sendTestEmail: PropTypes.func,
};

const mapStateToProps = (state) => ({
  mailAccounts: state.mailAccounts.mailAccounts,
  sendingCalendars: state.sendingCalendars.sendingCalendars,
  availableTimezones: state.sendingCalendars.availableTimezones,
});

export default connect(mapStateToProps, {
  getMailAccounts,

  getSendingCalendars,
  addSendingCalendar,
  updateSendingCalendar,

  getAvailableTimezones,
  sendTestEmail,
})(SendingCalendar);
