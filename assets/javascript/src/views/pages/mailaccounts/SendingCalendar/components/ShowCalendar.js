import React, { Component } from "react";
import { Button, FormGroup, Form, Input, Row, Col } from "reactstrap";
import WeekdayPicker from "./WeekdayPicker";

export default function ShowCalendar({ calendar, startEditing, userIsAdmin }) {
  if (!calendar) {
    return <h5>Loading...</h5>;
  } else {
    return (
      <>
        <FormGroup className="mt-4 mb-1">
          <WeekdayPicker block_days={calendar.block_days} readonly={true} />
        </FormGroup>
        <FormGroup>
          <p className="my-2 text-custom">
            <span className="font-weight-bold">{calendar.start_time}</span> to{" "}
            <span className="font-weight-bold">{calendar.end_time}</span> (
            {calendar.time_zone})
          </p>
          <p className="my-2 text-custom">
            Send no more than{" "}
            <span className="font-weight-bold">
              {calendar.max_emails_per_day}
            </span>{" "}
            emails per day
          </p>
          <p className="my-2 text-custom">
            Pause{" "}
            <span className="font-weight-bold">
              {calendar.minutes_between_sends}
            </span>{" "}
            minutes between sends
          </p>
          <p className="my-2 text-custom">
            Send at least{" "}
            <span className="font-weight-bold">
              {calendar.min_emails_to_send}
            </span>{" "}
            email at a time
          </p>
          <p className="my-2 text-custom ">
            Send at most{" "}
            <span className="font-weight-bold">
              {calendar.max_emails_to_send}
            </span>{" "}
            email at a time
          </p>
        </FormGroup>
        {userIsAdmin && (
          <Button
            className="outline-button"
            type="button"
            onClick={startEditing}
          >
            EDIT RULES
          </Button>
        )}
      </>
    );
  }
}
