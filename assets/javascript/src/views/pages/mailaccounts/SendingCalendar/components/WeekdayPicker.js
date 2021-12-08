import classnames from "classnames";
import React, { useState } from "react";
import { Button, ButtonGroup } from "reactstrap";

export default function WeekdayPicker({ block_days, setBlock_days, readonly }) {
  const WEEKDAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const isChecked = (index) => {
    index = (index + 6) % 7;
    return block_days & (1 << index);
  };

  const toggleChecked = (index) => {
    index = (index + 6) % 7;
    setBlock_days(block_days ^ (1 << index));
  };

  // console.log("block days: ", block_days);

  return (
    <>
      <ButtonGroup className="mb-3 w-100">
        {WEEKDAYS_SHORT.map((item, index) => (
          <Button
            aria-pressed={isChecked(index)}
            autoComplete="off"
            className={classnames("border shadow-none", {
              active: isChecked(index),
              disabled: !isChecked(index),
              sendingSchedulerBlocked: !isChecked(index),
            })}
            style={{
              padding: "8px 0px",
              backgroundColor: "rgba(255,57,188,1.0)",
              marginRight: 2,
              borderRadius: 10,
              color: "white",
              fontSize: 18,
              fontWeight: 700,
            }}
            onClick={() => {
              if (!readonly) toggleChecked(index);
            }}
            key={index}
          >
            {item}
          </Button>
        ))}
      </ButtonGroup>
    </>
  );
}
