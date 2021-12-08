import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Col,
  Container,
  Input,
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
import Coupon from "./Coupon";

const UpgradeSubscription = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  const user = useSelector((state) => state.auth.user);
  const [teammateProduct, setTeammateProduct] = useState(null);
  const [emailProduct, setEmailProduct] = useState(null);
  const [paymentMetadata, setPaymentMetadata] = useState(null);
  const [subscriptionUrls, setSubscriptionUrls] = useState(null);
  const [currencyAmount, setCurrencyAmount] = useState(0);
  const [currencyEmailAmount, setCurrencyEmailAmount] = useState(0);
  const [submissionPending, setSubmissionPending] = useState(false);
  const [numberUsers, setNumberUsers] = useState(0);
  const [numberEmails, setNumberEmails] = useState(1);
  const [numberUsersValid, setNumberUsersValid] = useState(true);
  const [numberEmailsValid, setNumberEmailsValid] = useState(true);
  const [userValid, setUserValid] = useState(true);
  const [emailValid, setEmailValid] = useState(true);
  const [coupon, setCoupon] = useState(null);
  const [couponResult, setCouponResult] = useState(null);
  const handleUpgrade = async () => {
    if (!numberEmailsValid || !numberUsersValid) {
      handleError("Sorry that is a incorrect number of user or emails");
      return;
    }
    setSubmissionPending(true);

    const result = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    console.log("createPaymentMethod: ", result);

    const { error, paymentMethod } = result;

    try {
      await handlePaymentMethodCreated(error, paymentMethod);
    } catch (e) {
      handleError(
        "Sorry, there was an unexpected error processing your payment. Please contact us for support."
      );

      setSubmissionPending(false);
    }
  };

  const handlePaymentMethodCreated = async (error, paymentMethod) => {
    if (error) {
      handleError(error.message);
      setSubmissionPending(false);
    } else {
      const paymentParams = { ...paymentMetadata };

      paymentParams.plans = [
        { plan: teammateProduct.monthly_plan.id, quantity: numberUsers },
        {
          plan: emailProduct.monthly_plan.id,
          quantity: numberEmails,
        },
      ];

      paymentParams.payment_method = paymentMethod ? paymentMethod.id : null;
      paymentParams.coupon = coupon;
      paymentParams.couponID = couponResult ? couponResult.id : null;

      const { data: result } = await axios.post(
        subscriptionUrls.create_customer,
        paymentParams
      );
      console.log("create_customer result: ", result);

      if (result.error) {
        handleError(result.error.message);
        setSubmissionPending(false);
      } else {
        const subscription = result.subscription;
        const { latest_invoice } = subscription;
        const { payment_intent } = latest_invoice;
        if (payment_intent) {
          const { client_secret, status } = payment_intent;
          if (status === "requires_action") {
            // trigger 3D-secure workflow
            stripe.confirmCardPayment(client_secret).then(function (result) {
              if (result.error) {
                // The card was declined (i.e. insufficient funds, card has expired, etc)
                handleError(result.error.message);
                setSubmissionPending(false);
              } else {
                handleSubscriptionSuccess();
              }
            });
          } else {
            // No additional information was needed
            handleSubscriptionSuccess();
          }
        } else if (subscription.pending_setup_intent) {
          const { client_secret, status } = subscription.pending_setup_intent;
          if (status === "requires_action") {
            stripe.confirmCardSetup(client_secret).then(function (result) {
              if (result.error) {
                handleError(result.error.message);
                setSubmissionPending(false);
              } else {
                handleSubscriptionSuccess();
              }
            });
          }
        } else {
          handleSubscriptionSuccess();
        }
      }
    }
  };

  const handleError = async (errorMessage) => {
    console.log(errorMessage);

    toastOnError(errorMessage);
  };

  const handleSubscriptionSuccess = async () => {
    setSubmissionPending(false);
    // location.href = subscriptionSuccessUrl;

    props.reloadSubscription();
    toastOnSuccess("Subscribed successfully!");
  };

  useEffect(async () => {
    try {
      toggleTopLoader(true);

      const { data } = await axios.get(
        "/subscriptions/api/upgrade-subscription/"
      );
      console.log("upgrade-subscription: ", data);

      setTeammateProduct(data.teammate_product);
      setEmailProduct(data.email_product);
      setPaymentMetadata(data.payment_metadata);
      setSubscriptionUrls(data.subscription_urls);
    } catch (e) {
      toastOnError(messages.api_failed);
    } finally {
      toggleTopLoader(false);
    }
  }, []);

  useEffect(() => {
    if (teammateProduct) {
      setCurrencyAmount(
        Number(teammateProduct.monthly_plan.currency_amount.replace("$", ""))
      );
    }
    if (emailProduct) {
      setCurrencyEmailAmount(
        Number(emailProduct.monthly_plan.currency_amount.replace("$", ""))
      );
    }
    if (typeof currencyAmount === "number" && typeof numberUsers === "number") {
      setUserValid(true);
    } else {
      setUserValid(false);
      setCurrencyAmount(Number(currencyAmount));
      setNumberUsers(Number(numberUsers));
    }
    if (
      typeof currencyEmailAmount === "number" &&
      typeof numberEmails === "number"
    ) {
      setEmailValid(true);
    } else {
      setEmailValid(false);
      setCurrencyAmount(Number(currencyAmount));
      setNumberEmails(Number(numberEmails));
    }
  }, [
    teammateProduct,
    emailProduct,
    currencyAmount,
    numberUsers,
    currencyEmailAmount,
    numberEmails,
  ]);
  return (
    <Container>
      <Row>
        <Col md={{ size: 8, offset: 2 }} sm="12" className="mobile-p-0">
          <Card>
            <CardBody>
              <Row>
                {user.team && (
                  <Col>
                    <Row className="mt-3">
                      <Col>
                        <span className="h5 surtitle">
                          Plan {teammateProduct?.metadata?.name}
                        </span>
                        <span className="d-block h2 ml-4">
                          $
                          {userValid
                            ? (currencyAmount * numberUsers).toFixed(2)
                            : 0.0}{" "}
                          / month
                        </span>
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col>
                        <span className="h5 surtitle">Number of users</span>
                        <Input
                          min={0}
                          type="number"
                          value={numberUsers}
                          invalid={!numberUsersValid}
                          onChange={(event) => {
                            if (!event.target.value || isNaN(Number(event.target.value)) || Number(event.target.value) < 0 ) {
                              setNumberUsers(0);
                              setNumberUsersValid(true);
                              return;
                            }
                            setNumberUsersValid(
                              Number(event.target.value) > -1
                            );
                            setNumberUsers(Number(event.target.value));
                          }}
                        />
                      </Col>
                    </Row>
                  </Col>
                )}

                <Col>
                  <Row className="mt-3">
                    <Col>
                      <span className="h5 surtitle">
                        Plan {emailProduct?.metadata?.name}
                      </span>
                      <span className="d-block h2 ml-4">
                        $
                        {emailValid
                          ? (currencyEmailAmount * numberEmails).toFixed(2)
                          : 0.0}{" "}
                        / month
                      </span>
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col>
                      <span className="h5 surtitle">Number of emails</span>
                      <Input
                        min={1}
                        type="number"
                        value={numberEmails}
                        invalid={!numberEmailsValid}
                        onChange={(event) => {
                          if (!event.target.value || isNaN(Number(event.target.value)) || Number(event.target.value) < 1 ) {
                            setNumberEmails(1);
                            setNumberEmailsValid(true);
                            return;
                          }
                          setNumberEmailsValid(Number(event.target.value) > 0);
                          setNumberEmails(Number(event.target.value));
                        }}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="mt-5">
                <Col>
                  <CardElement className="w-100" />
                </Col>
              </Row>
              <Row className="mt-5">
                <Coupon
                  subscriptions={[]}
                  coupon={null}
                  updateCoupon={setCoupon}
                  updateCouponResult={setCouponResult}
                  subscriptionsPrice={
                    currencyEmailAmount * numberEmails +
                    currencyAmount * numberUsers
                  }
                ></Coupon>
              </Row>
            </CardBody>
            <CardFooter className="bg-transparent">
              <Button
                color="primary"
                className="text-uppercase"
                onClick={handleUpgrade}
                disabled={!stripe && !submissionPending}
              >
                {submissionPending ? <Spinner color="light" /> : "Upgrade"}
              </Button>
              <span className="text-sm d-block mt-3">
                Your card will be charged{" "}
                {userValid && emailValid
                  ? !couponResult
                    ? (
                        currencyEmailAmount * numberEmails +
                        currencyAmount * numberUsers
                      ).toFixed(2)
                    : couponResult.amount_off
                    ? (
                        currencyEmailAmount * numberEmails +
                        currencyAmount * numberUsers -
                        couponResult.amount_off * 0.01
                      ).toFixed(2)
                    : (
                        currencyEmailAmount * numberEmails +
                        currencyAmount * numberUsers -
                        ((currencyEmailAmount * numberEmails +
                          currencyAmount * numberUsers) *
                          couponResult.percent_off) /
                          100
                      ).toFixed(2)
                  : 0}{" "}
                for your first month.
              </span>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UpgradeSubscription;
