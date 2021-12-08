import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React, { useEffect, useState } from "react";
import { Button, Col, Container, Row, Table } from "reactstrap";

import PageContainer from "../../../components/Containers/PageContainer";
import axios from "../../../utils/axios";
import { messages, toastOnError, toggleTopLoader } from "../../../utils/Utils";
import Coupon from "./components/Coupon";
import AddCouponModal from "./components/ModalCoupon";
import SubscriptionDetails from "./components/SubscriptionDetails";
import UpgradeSubscription from "./components/UpgradeSubscription";

const Billing = (props) => {
  const [hasActiveSubscription, setHasActiveSubscription] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [showModalCoupon, setShowModalCoupon] = useState(false);

  useEffect(async () => {
    loadStripeInfo();
  }, []);

  const loadStripeInfo = async () => {
    try {
      toggleTopLoader(true);

      const { data } = await axios.get("/subscriptions/api/stripe-info/");
      const { data: dataInvoices } = await axios.get(
        "/subscriptions/api/invoices/"
      );

      setRecipients(dataInvoices);

      // setStripeApiKey(data.stripe_api_key);
      setStripePromise(loadStripe(data.stripe_api_key));

      setHasActiveSubscription(data.has_active_subscription);
    } catch (e) {
      toastOnError(messages.api_failed);
    } finally {
      toggleTopLoader(false);
    }
  };

  return (
    <PageContainer>
      <Container>
        <Row>
          {stripePromise && (
            <Elements stripe={stripePromise}>
              {hasActiveSubscription ? (
                <SubscriptionDetails />
              ) : (
                <UpgradeSubscription reloadSubscription={loadStripeInfo} />
              )}
            </Elements>
          )}
        </Row>
      </Container>
      <Container>
        <Row className="mt-3">
          <Col md={{ size: 8, offset: 2 }} sm="12" className="mobile-p-0">
            <h1 className="mt-5 mb-3">Invoices</h1>
            <p>List of invoices that you have received.</p>
            <Table className="align-items-center table-flush" responsive hover>
              <thead className="thead-light">
                <tr>
                  <th></th>
                  <th>INVOICE DATE</th>
                  <th>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {recipients.map((receipt, index) => (
                  <tr key={index}>
                    <td>
                      <Button color="secondary" outline type="button">
                        <a target="_blank" href={receipt.pdf} rel="noreferrer">
                          VIEW
                        </a>
                      </Button>
                    </td>
                    <td>{receipt.created_at}</td>
                    <td>{receipt.amount}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </PageContainer>
  );
};

export default Billing;
