import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Modal,
  Row,
} from "reactstrap";

import axios from "../../../../utils/axios";
import {
  toastOnError,
  toastOnSuccess,
  toggleTopLoader,
    showNotification
} from "../../../../utils/Utils";

const ModalComponent = ({ isOpen, close, user, email, updateConfig }) => {
  const [warnUpEmail, setWarnUpEmail] = useState(1);
  const [rampUpEmail, setRampUpEmail] = useState(1);
  const saveStatus = async () => {

    if (!rampUpEmail || isNaN(Number(rampUpEmail)) || (rampUpEmail && !isNaN(Number(rampUpEmail)) && (Number(rampUpEmail) > 10 ||Number(rampUpEmail) < 1 ))){
        showNotification('danger', "Invalid ramp-up increment value!","Invalid ramp-up increment value. Value can't be less then 1 and greater then 10");
        return
      }
    if (!warnUpEmail || isNaN(Number(warnUpEmail)) ||(warnUpEmail && !isNaN(Number(warnUpEmail)) && (Number(warnUpEmail) > 10 ||Number(warnUpEmail) < 1 ))){
        showNotification('danger', "Invalid warm-up email per day's value!","Invalid warm-up email per day's value. Value can't be less then 1 and greater then 10");
        return
      }
    toggleTopLoader(true);
    try {
      await updateConfig(email.id, {
        warming_enabled: email.status.length > 0 ? email.status[0].warming_enabled : email.warming_status,
        ramp_up_increment: rampUpEmail,
        email_for_day: warnUpEmail,
      });
    } catch (error) {
      toastOnError(error);
    } finally {
      toggleTopLoader(false);
    }
  };
  useEffect(() => {
    if (!email?.status?.length) return;

    setRampUpEmail(email.status[0].ramp_up_increment);
    setWarnUpEmail(email.status[0].email_for_day);
  }, [email?.status]);

  return (
    <Modal isOpen={isOpen} toggle={close} size="xl">
      <Card className="no-shadow stats-warming">
        <CardHeader className="pb-0">
          <h2 className="title">Detailed Report</h2>
        </CardHeader>
        <CardBody className="pt-4 pb-0">
          <Row>
            <Col>
              <div className="px-3 form-custom">
                <p className="sub-title">
                  Automatically send and reply emails from Mailerrize community
                  to warm up your email account.
                </p>
                <p className="text-screen-gray">
                  Note: By enabling this feature, you will automatically be
                  sending emails and replying other members
                </p>
              </div>
            </Col>

            <Col>
              <div className="px-3  form-custom">
                <p className="sub-title" style={{ color: "#707579" }}>
                  Choose how warm you want your email account to be
                </p>
                <Row>
                  <Col>
                    <label
                      className="label-custom label-warming"
                      htmlFor="warmNumberPerDay"
                    >
                      Number of warm-up email per day after ramp-up
                    </label>
                    <Input
                      id="warmNumberPerDay"
                      style={{ height: 40 }}
                      placeholder="01"
                      type="number"
                      value={warnUpEmail}
                      className="input-customized form-control"
                      onChange={(e) => {
                        const val = e.target.value
                        setWarnUpEmail((val && !isNaN(Number(val)) && (Number(val) > 10 ||Number(val) < 1 )) ? 1 : val)
                      }}
                      disabled={!user.is_admin}
                      min={1}
                      max={10}
                    />
                  </Col>
                  <Col>
                    <label
                      className="label-custom label-warming"
                      htmlFor="warmIncPerDay"
                    >
                      Ramp-up increment value per day
                    </label>
                    <Input
                      id="warmIncPerDay"
                      placeholder="01"
                      style={{ height: 40 }}
                      type="number"
                      value={rampUpEmail}
                      className="input-customized form-control"
                      onChange={(e) => {
                        const val = e.target.value
                        setRampUpEmail((val && !isNaN(Number(val)) && (Number(val) > 10 ||Number(val) < 1 )) ? 1 : val)
                      }}
                      disabled={!user.is_admin}
                      min={1}
                      max={10}
                    />
                  </Col>
                </Row>
                {user.is_admin && (
                  <Button
                    type="button"
                    block
                    className="color-button mt-2"
                    style={{ width: 150 }}
                    onClick={saveStatus}
                  >
                    <img src={STATIC_FILES.save} className="icon-delete" />{" "}
                    <p className="ml-2 ff-poppins">Save</p>
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Modal>
  );
};
ModalComponent.propTypes = {
  email: PropTypes.object,
  user: PropTypes.object,
  isOpen: PropTypes.bool,
  close: PropTypes.func,
  warnUpEmail: PropTypes.number,
  rampUpEmail: PropTypes.number,
  updateConfig: PropTypes.func,
};

export default ModalComponent;
