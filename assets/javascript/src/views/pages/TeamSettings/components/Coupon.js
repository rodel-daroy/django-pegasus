import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Button, Container, Row, Spinner } from "reactstrap";

import axios from "../../../../utils/axios";
import {
  messages,
  toastOnError,
  toastOnSuccess,
  toggleTopLoader,
} from "../../../../utils/Utils";
import AddCouponModal from "./ModalCoupon";

const Coupon = ({
  subscriptions,
  updateCoupon,
  updateCouponResult,
  saveCallback,
  subscriptionsPrice,
}) => {
  const [showModalCoupon, setShowModalCoupon] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [previousCoupon, setPreviousCoupon] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [couponResult, setCouponResult] = useState(null);
  const saveCoupon = async () => {
    try {
      toggleTopLoader(true);
      setLoading(true);
      const { data } = await axios.post("/subscriptions/api/coupon/", {
        coupon,
      });

      toastOnSuccess("Coupon Redeemed Successfully");
      saveCallback?.();
    } catch (e) {
      toastOnError(messages.api_failed);
    } finally {
      toggleTopLoader(false);
      setShowModalCoupon(false);
      setLoading(false);
    }
  };

  const calculateDiscount = () => {
    const totalDiscount = subscriptions.reduce((acc, subscription, index) => {
      const coupon = subscription.discount?.coupon;
      if (!coupon) return acc;
      if (coupon.percent_off)
        acc +=
            (!user.team && subscription.product?.name === "User")
            ? 0
            : (Number(subscription.friendly_payment_amount.replace("$", "")) *
                Number(coupon.percent_off)) /
              100;
      if (coupon.amount_off)
        acc += !user.team && subscription.product?.name === "User" ? 0 : Number(coupon.amount_off * 0.01);
      return acc;
    }, 0);
    if (!totalDiscount) {
      return null;
    } else {
      return (
        <span>
          You had redeemed a coupon and received the discount of $
          {totalDiscount?.toFixed(2)}
        </span>
      );
    }
  };

  const calculatePreviousDiscount = () => {
    const coupon = previousCoupon;
    if (!coupon || !subscriptionsPrice) return null;
    if (coupon.percent_off) {
      return (
        <span>
          You had redeemed a coupon and received the discount of $
          {(Number(subscriptionsPrice) * Number(coupon.percent_off)) / 100}
        </span>
      );
    }
    if (coupon.amount_off) {
      return (
        <span>
          You had redeemed a coupon and received the discount of $
          {Number(coupon.amount_off * 0.01)}
        </span>
      );
    }
  };

  const validateCoupon = async (coupon) => {
    try {
      const { data } = await axios.post("/subscriptions/api/coupon/validate/", {
        coupon,
      });

      return data;
    } catch (e) {
      return false;
    }
  };

  const renderButtonContent = () => {
    if (loading) return <Spinner />;

    if (previousCoupon || calculateDiscount()) return "Change Coupon";

    return "Add Coupon";
  };
  return (
    <Container>
      <AddCouponModal
        isOpen={showModalCoupon}
        saveCoupon={
          updateCoupon
            ? () => {
                updateCoupon(coupon);
                updateCouponResult(couponResult);
                setShowModalCoupon(false);
              }
            : saveCoupon
        }
        close={() => setShowModalCoupon(false)}
        validateCoupon={validateCoupon}
        setPreviousCoupon={setPreviousCoupon}
        previousCoupon={previousCoupon}
        coupon={coupon}
        setCouponResult={setCouponResult}
        setCoupon={setCoupon}
      />
      <Row>{calculateDiscount()}</Row>
      <Row>{calculatePreviousDiscount()}</Row>
      <Row>
        <Button
          color="primary"
          className="text-uppercase"
          onClick={() => setShowModalCoupon(true)}
          outline
        >
          {renderButtonContent()}
        </Button>
      </Row>
    </Container>
  );
};

export default Coupon;
