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

const modal = ({
  isOpen,
  close,
  saveCoupon,
  validateCoupon,
  previousCoupon,
  setPreviousCoupon,
  coupon,
  setCoupon,
  setCouponResult,
}) => {
  const [validCoupon, setValidCoupon] = useState(true);
  const [timeOut, setTimeOut] = useState(null);
  const [loading, setLoading] = useState(false);
  const updateCoupon = (e) => {
    setCoupon(e.target.value);
    if (timeOut) clearTimeout(timeOut);
    setTimeOut(
      setTimeout(async () => {
        setLoading(true);
        const _coupon = await validateCoupon(e.target.value);
        if (_coupon) {
          setValidCoupon(true);
          setCouponResult(_coupon.coupon);
          setPreviousCoupon(_coupon.coupon);
        } else {
          setValidCoupon(false);
          setPreviousCoupon(null);
        }
        setLoading(false);
      }, 300)
    );
  };

  const formatCoupon = () => {
    if (!previousCoupon) return null;
    if (previousCoupon.percent_off) {
      return (
        <span>{`This coupon will give you ${previousCoupon.percent_off}% of discount`}</span>
      );
    }
    if (previousCoupon.amount_off) {
      return (
        <span>{`This coupon will give you ${
          previousCoupon.amount_off * 0.01
        }$ of discount`}</span>
      );
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      toggle={() => {
        close();
      }}
      size="xs"
    >
      <Card className="no-shadow stats-warming">
        <CardHeader className="pb-0">
          <h2 className="title">New coupon</h2>
        </CardHeader>
        <CardBody className="pt-4 pb-0">
          <Input
            invalid={!validCoupon}
            onChange={updateCoupon}
            value={coupon}
          />
          {!validCoupon && <span>Invalid Coupon</span>}
          {formatCoupon()}
        </CardBody>
        <CardFooter>
          <Button
            color="primary"
            className="text-uppercase"
            onClick={() => saveCoupon()}
            outline
            style={{ float: "right" }}
            disabled={!coupon.length || !validCoupon || loading}
          >
            Redeem
          </Button>
        </CardFooter>
      </Card>
    </Modal>
  );
};
export default modal;
