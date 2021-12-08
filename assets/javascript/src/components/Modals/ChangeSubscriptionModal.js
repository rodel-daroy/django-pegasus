import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Modal,
} from "reactstrap";

import axios from "../../utils/axios";
import { toastOnError, toastOnSuccess } from "../../utils/Utils";
import SubscriptionChanger from "../../views/pages/TeamSettings/components/ChangeSubscriptonModal";

const modal = ({
  isOpen,
  close,
  user = {},
  amount = 0,
  number = 0,
  action = () => {},
  entity = "user",
  subscription,
  next,
}) => {
  const [changeSubscriptionModal, setChangeSubscription] = useState(false);
  const [errorChangeSubscription, setErrorChangeSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  const changeSubscription = async () => {
    if (!subscription) {
      location.pathname = "app/admin/billing";
      return;
    }
    setChangeSubscription(true);
  };

  const handleUpgrade = async (quantity, idToDelete) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        "/subscriptions/api/change_subscription/",
        {
          quantity,
          subscription_id: subscription.id,
          ids_to_delete: idToDelete,
        }
      );
      if (!data.status) {
        setErrorChangeSubscription(data);
        toastOnError(data.message);
      } else {
        toastOnSuccess("Successfully updated subscription");
        setChangeSubscription(false);
        close();
        setLoading(false);
        next?.();
      }
    } catch (e) {
      setLoading(false);
      handleError(e.message);
    }
  };

  const handleError = async (errorMessage) => {
    console.log(errorMessage);

    toastOnError(errorMessage);
  };

  return !changeSubscriptionModal ? (
    <Modal
      isOpen={isOpen}
      toggle={() => {
        close();
        setChangeSubscription(false);
      }}
      size="xl"
    >
      <Card className="no-shadow">
        <CardHeader className="pb-0">
          <h2>Add 1 user</h2>
        </CardHeader>
        <CardBody className="pt-4 pb-0">
          <h2>Hi {user.name}</h2>
          <p>
            To take this action we need to upgrade your account. Continue and
            your team's plan will increases by ${amount?.toFixed?.(2)} / month
            (minus any discount you may have) to new {number} {entity} plan.
          </p>
        </CardBody>
        <CardFooter>
          <Button
            color="primary"
            className="text-uppercase"
            outline
            onClick={changeSubscription}
          >
            {!subscription ? "Create subscription" : "Change subscription"}
          </Button>
        </CardFooter>
      </Card>
    </Modal>
  ) : (
    <SubscriptionChanger
      isOpen={isOpen}
      close={close}
      subscription={subscription}
      handleChangeSubscription={handleUpgrade}
      loading={loading}
      i={0}
      errorChangingSubscription={errorChangeSubscription}
      defaultQuantity={subscription?.quantity + 1}
    />
  );
};
export default modal;
