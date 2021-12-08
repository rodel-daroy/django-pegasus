import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Col,
  Container,
  Row,
  Spinner,
} from "reactstrap";

import axios from "../../../../utils/axios";
import {
  messages,
  toastOnError,
  toastOnSuccess,
  toggleTopLoader,
} from "../../../../utils/Utils";
import ChangeSubscriptionModal from "./ChangeSubscriptonModal";
import Coupon from "./Coupon";

const SubscriptionDetails = () => {
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionToChange, setSubscriptionToChange] = useState(null);
  const [errorChangeSubscription, setErrorChangeSubscription] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const handleUpgrade = async (quantity, idToDelete) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        "/subscriptions/api/change_subscription/",
        {
          quantity,
          subscription_id: subscriptionToChange.id,
          ids_to_delete: idToDelete,
          couponID: coupon ? coupon.id : null,
        }
      );
      if (!data.status) {
        setErrorChangeSubscription(data);
        toastOnError(data.message);
      } else {
        toastOnSuccess("Successfully updated subscription");
        getSubscriptions();
        setSubscriptionToChange(null);
      }

      setLoading(false);
    } catch (e) {
      setLoading(false);
      handleError(e.message);
    }
  };

  const handleError = async (errorMessage) => {
    toastOnError(errorMessage);
  };

  const getCalculatedPrice = (subscription) => {
    /**
     * Method return the calculated price after applying the discount
     * @type {subscription: subscription_object}
     * @return type number: Calculated price after discount
     */
    let discountAmmount = 0;
    const paymentAmount = Number(
      subscription.friendly_payment_amount.replace("$", "")
    );
    if (subscription.discount) {
      if (subscription.discount.coupon.percent_off) {
        discountAmmount =
          (Number(paymentAmount) *
            Number(subscription.discount.coupon.percent_off)) /
          100;
      } else {
        discountAmmount = Number(
          subscription.discount.coupon.amount_off * 0.01
        );
      }
      return paymentAmount <= discountAmmount
        ? 0
        : paymentAmount - discountAmmount;
    }
    return paymentAmount;
  };

  const getSubscriptions = async () => {
    try {
      toggleTopLoader(true);

      const { data } = await axios.get(
        "/subscriptions/api/subscription-details/"
      );
      setSubscriptions(data.response);
      setCoupon(data.response[0].discount?.coupon);
    } catch (e) {
      toastOnError(messages.api_failed);
    } finally {
      toggleTopLoader(false);
    }
  };
  useEffect(() => {
    getSubscriptions();
  }, []);
  return (
    <Container>
      <ChangeSubscriptionModal
        isOpen={subscriptionToChange}
        close={() => {
          setSubscriptionToChange(null);
          setErrorChangeSubscription(null);
        }}
        handleChangeSubscription={handleUpgrade}
        subscription={subscriptionToChange}
        loading={loading}
        i={subscriptionToChange?.i}
        errorChangingSubscription={errorChangeSubscription}
      />

      <Row className="mt-3">
        <Col md={{ size: 8, offset: 2 }} sm="12" className="mobile-p-0">
          <Card>
            <CardBody>
              <Row>
                <Col>
                  <h3 className="mx-auto text-center">
                    You're subscribed to a plan. Thanks for the support!
                  </h3>
                </Col>
              </Row>
              <Row className="mt-3">
                {subscriptions.map((subscription, i) =>
                  !user.team && subscription.product?.name === "User" ? null : (
                    <Col
                      key={i}
                      className={
                        !user.team && subscription.product?.name === "User"
                          ? null
                          : `d-flex align-items-center flex-column ${
                              subscription.product?.name === "User"
                                ? "order-1"
                                : "order-2"
                            }`
                      }
                    >
                      <div>
                        <span className="h5 surtitle mt-5">
                          Current Subscription
                        </span>
                        <span className="d-block h2 ml-4">
                          ${getCalculatedPrice(subscription).toFixed(2)}
                          {/*{subscription.discount && (*/}
                          {/*  <small>*/}
                          {/*    {" "}*/}
                          {/*    (-$*/}
                          {/*    {`${*/}
                          {/*      subscription.discount.coupon.amount_off / 100*/}
                          {/*    }`}*/}
                          {/*    )*/}
                          {/*  </small>*/}
                          {/*)}{" "}*/}/ month
                        </span>
                      </div>
                      <div>
                        <span className="h5 surtitle mt-5">Quantity</span>
                        <span className="d-block ml-4 text">
                          {subscription.quantity}{" "}
                          {subscription.product?.name === "User"
                            ? "Users"
                            : "Emails"}
                        </span>
                      </div>
                      <div>
                        <span className="h5 surtitle mt-5">Auto-Renew</span>
                        <span className="d-block ml-4 text">Every month</span>
                      </div>
                      <div>
                        <span className="h5 surtitle mt-5">Since</span>
                        <span className="d-block ml-4 text">
                          {subscription.start_date}
                        </span>
                      </div>
                      <div>
                        <span className="h5 surtitle mt-5">Next payment</span>
                        <span className="d-block ml-4 text">
                          {subscription.friendly_payment_amount} on{" "}
                          {subscription.current_period_end}
                        </span>
                      </div>
                      <Button
                        color="primary"
                        className="text-uppercase"
                        onClick={() =>
                          setSubscriptionToChange({ ...subscription, i })
                        }
                        outline
                      >
                        {loading ? <Spinner /> : "Change Subscription"}
                      </Button>
                    </Col>
                  )
                )}
              </Row>
            </CardBody>
            <CardFooter>
              <Coupon
                saveCallback={getSubscriptions}
                subscriptions={subscriptions}
                coupon={coupon}
              ></Coupon>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SubscriptionDetails;
