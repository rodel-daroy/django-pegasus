import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Input,
  Modal,
  Row,
  Spinner,
} from "reactstrap";

import { toastOnError } from "../../../../utils/Utils";

const Subscription = ({
  name,
  quantity,
  quantityWillChange,
  monthPrice,
  i = 0,
  currentPeriodEnd,
  friendlyPaymentAmount,
  startDate,
  numberValid,
  setNumberValid,
}) => {
  return (
    <Col>
      <div>
        <span className="h5 surtitle mt-5">
          {quantityWillChange ? "New" : "Current"} Subscription
        </span>
        <span className="d-block h2 ml-4">
          ${monthPrice * quantity} / month
        </span>
      </div>
      <div>
        {quantityWillChange ? (
          <span className="ml-4 text" style={{ display: "flex" }}>
            <Input
              min={i % 2 === 0 ? 0 : 1}
              type="number"
              value={quantity}
              invalid={!numberValid}
              style={{ width: 120, height: 25 }}
              onChange={(event) => {
                if (!event.target.value || isNaN(Number(event.target.value)) || Number(event.target.value) < 1 ) {
                  quantityWillChange(1);
                  setNumberValid(true);
                  return;
                }
                quantityWillChange(Number(event.target.value));
                setNumberValid(event.target.value > 0 ? true : false);
              }}
            />
            <span style={{ marginLeft: 5 }}>
              {i % 2 === 0 ? "Users" : "Emails"}
            </span>
          </span>
        ) : (
          <span className="">
            {quantity} {i % 2 === 0 ? "Users" : "Emails"}
          </span>
        )}{" "}
      </div>
      <div>
        <span className="h5 surtitle mt-5">Auto-Renew</span>
        <span className="d-block ml-4 text">Every month</span>
      </div>
      <div>
        <span className="h5 surtitle mt-5">Since</span>
        <span className="d-block ml-4 text">{startDate}</span>
      </div>
      <div>
        <span className="h5 surtitle mt-5">Next payment</span>
        <span className="d-block ml-4 text">
          {quantityWillChange
            ? `$${Number(monthPrice * quantity)?.toFixed(2)}`
            : friendlyPaymentAmount}{" "}
          on {currentPeriodEnd}
        </span>
      </div>
    </Col>
  );
};

const modal = ({
  isOpen,
  close,
  subscription,
  handleChangeSubscription,
  loading,
  i,
  errorChangingSubscription,
  defaultQuantity = subscription?.quantity,
}) => {
  const [newQuantity, setNewQuantity] = useState(defaultQuantity);
  const [idToDelete, setIdToDelete] = useState([]);
  const [numberValid, setNumberValid] = useState(true);
  const tableTitle = [
    {
      cell: (row) => (
        <Input type="checkbox" onChange={() => addToDelete(row.id)} />
      ),
      button: true,
    },
    {
      name: "Email",
      selector: "email",
      sortable: true,
    },
  ];
  const addToDelete = (id) => {
    const index = idToDelete.indexOf(id);
    if (index === -1) setIdToDelete([...idToDelete, id]);
    else {
      setIdToDelete(idToDelete.filter((_, i) => i !== index));
    }
  };
  useEffect(() => {
    setNewQuantity(defaultQuantity);

    console.log("number", numberValid);
  }, [defaultQuantity, numberValid]);
  return (
    <Modal isOpen={isOpen} toggle={close} size="md">
      <Card className="no-shadow stats-warming">
        <CardHeader className="pb-0">
          <h2 className="title">Change subscription</h2>
        </CardHeader>
        <CardBody className="pt-4 pb-0">
          {!errorChangingSubscription ? (
            <Row className="mt-3">
              <Subscription
                startDate={subscription?.start_date}
                friendlyPaymentAmount={subscription?.friendly_payment_amount}
                currentPeriodEnd={subscription?.current_period_end}
                monthPrice={subscription?.product.price}
                name="actual"
                quantity={subscription?.quantity}
                i={i}
                numberValid={numberValid}
                setNumberValid={setNumberValid}
              />
              <Subscription
                startDate={subscription?.start_date}
                friendlyPaymentAmount={subscription?.friendly_payment_amount}
                currentPeriodEnd={subscription?.current_period_end}
                monthPrice={subscription?.product.price}
                name="New"
                quantity={newQuantity}
                quantityWillChange={setNewQuantity}
                i={i}
                numberValid={numberValid}
                setNumberValid={setNumberValid}
              />
            </Row>
          ) : (
            <DataTable
              columns={tableTitle}
              theme="mailerrize"
              data={errorChangingSubscription.elements}
            />
          )}
        </CardBody>
        <CardFooter>
          {!errorChangingSubscription ? (
            <Button
              color="primary"
              className="text-uppercase"
              onClick={() => {
                numberValid
                  ? handleChangeSubscription(newQuantity, idToDelete)
                  : toastOnError("Sorry that is a incorrect number");
              }}
              outline
              style={{ float: "right" }}
            >
              {loading ? <Spinner /> : "Change Subscription"}
            </Button>
          ) : (
            <Button
              color="primary"
              className="text-uppercase"
              onClick={() => {
                numberValid
                  ? handleChangeSubscription(newQuantity, idToDelete)
                  : toastOnError("Sorry that is a incorrect number");
              }}
              outline
              style={{ float: "right" }}
              disabled={
                errorChangingSubscription.toEliminate !== idToDelete.length
              }
            >
              {loading ? (
                <Spinner />
              ) : errorChangingSubscription.toEliminate !==
                idToDelete.length ? (
                `You have to eliminate ${
                  errorChangingSubscription.toEliminate - idToDelete.length
                }`
              ) : (
                "Delete and complete the subscription"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </Modal>
  );
};
export default modal;
