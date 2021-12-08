import React, { useState } from "react";
import { Button, Col, Form, FormGroup, Input, Row } from "reactstrap";

import { SaveIcon } from "../../../../../components/icons";
import WeekdayPicker from "./WeekdayPicker";

export default function ({
  currentCalendar,
  availableTimezones,
  saveEditing,
  cancelEditing,
}) {
  const [editCurrentCalendar, setEditCurrentCalendar] =
    useState(currentCalendar);
  if (!currentCalendar) {
    return <h5>Loading...</h5>;
  } else {
    return (
      <>
        <FormGroup className="mt-4 mb-2">
          <div>
            <label className="label-custom">Blocked out days</label>
          </div>
          <WeekdayPicker
            block_days={editCurrentCalendar.block_days}
            setBlock_days={(value) =>
              setEditCurrentCalendar({
                ...editCurrentCalendar,
                block_days: value,
              })
            }
            readonly={false}
          />
        </FormGroup>
        <Row>
          <Col>
            <FormGroup className="mb-2">
              <label className="label-custom" htmlFor="start_time">
                START TIME
              </label>
              <Input
                id="start_time"
                className="form-control-sm"
                type="time"
                value={editCurrentCalendar.start_time}
                onChange={(e) =>
                  setEditCurrentCalendar({
                    ...editCurrentCalendar,
                    start_time: e.target.value,
                  })
                }
              />
            </FormGroup>
          </Col>
          <Col>
            <FormGroup className="mb-2">
              <label className="label-custom" htmlFor="end_time">
                END TIME
              </label>
              <Input
                id="end_time"
                className="form-control-sm"
                type="time"
                value={editCurrentCalendar.end_time}
                onChange={(e) =>
                  setEditCurrentCalendar({
                    ...editCurrentCalendar,
                    end_time: e.target.value,
                  })
                }
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormGroup className="mb-2 form-select">
              <label className="label-custom" htmlFor="time_zone">
                TIMEZONE
              </label>
              <Input
                id="time_zone"
                className="input-select"
                type="select"
                value={editCurrentCalendar.time_zone}
                onChange={(e) =>
                  setEditCurrentCalendar({
                    ...editCurrentCalendar,
                    time_zone: e.target.value,
                  })
                }
              >
                {availableTimezones.map((item, index) => (
                  <option value={item} key={index} className="option-select">
                    {item}
                  </option>
                ))}
              </Input>
              <img
                alt=""
                src={STATIC_FILES.arrow_pink}
                className="icon-select icon-select2"
              />
            </FormGroup>
          </Col>
        </Row>

        <Row>
          <Col>
            <FormGroup className="mb-2">
              <label className="label-custom" htmlFor="max_emails_per_day">
                MAX EMAILS PER DAY
              </label>
              <Input
                id="max_emails_per_day"
                className="form-control-sm"
                type="number"
                value={editCurrentCalendar.max_emails_per_day}
                onChange={(e) =>
                  setEditCurrentCalendar({
                    ...editCurrentCalendar,
                    max_emails_per_day: e.target.value,
                  })
                }
              />
            </FormGroup>
          </Col>
          <Col>
            <FormGroup className="mb-2">
              <label className="label-custom" htmlFor="minutes_between_sends">
                MINUTES BETWEEN SENDS
              </label>
              <Input
                id="minutes_between_sends"
                className="form-control-sm"
                type="number"
                value={editCurrentCalendar.minutes_between_sends}
                onChange={(e) =>
                  setEditCurrentCalendar({
                    ...editCurrentCalendar,
                    minutes_between_sends: e.target.value,
                  })
                }
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormGroup className="mb-2">
              <label className="label-custom" htmlFor="min_emails_to_send">
                MINIMUM EMAILS TO SEND AT A TIME
              </label>
              <Input
                id="min_emails_to_send"
                className="form-control-sm"
                type="number"
                value={editCurrentCalendar.min_emails_to_send}
                onChange={(e) =>
                  setEditCurrentCalendar({
                    ...editCurrentCalendar,
                    min_emails_to_send: e.target.value,
                  })
                }
              />
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <label className="label-custom" htmlFor="max_emails_to_send">
                MAXIMUM EMAILS TO SEND AT A TIME
              </label>
              <Input
                id="max_emails_to_send"
                className="form-control-sm"
                type="number"
                value={editCurrentCalendar.max_emails_to_send}
                onChange={(e) =>
                  setEditCurrentCalendar({
                    ...editCurrentCalendar,
                    max_emails_to_send: e.target.value,
                  })
                }
              />
            </FormGroup>
          </Col>
        </Row>
        <Row className="mt-2">
          <Button
            type="button"
            className="px-4"
            onClick={() => saveEditing(editCurrentCalendar)}
            className="color-button"
          >
            <SaveIcon /> <p>SAVE</p>
          </Button>
          <Button
            color="secondary"
            type="button"
            className="px-3"
            onClick={cancelEditing}
            className="outline-button"
          >
            CANCEL
          </Button>
        </Row>
      </>
    );
  }
}
