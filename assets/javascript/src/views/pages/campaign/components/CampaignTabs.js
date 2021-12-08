import classnames from "classnames";
import React, { useState } from "react";
import { Button, ButtonGroup } from "reactstrap";

export default function CampaignTabs(props) {
  const { tabs, activeTab, data, errorTab } = props;

  return (
    <>
      <div className="d-flex align-items-center justify-content-center">
        <ButtonGroup role="group">
          {tabs.map((item, index) => {
            return (
              <Button
                type="button"
                className={classnames({
                  active: activeTab == index,
                })}
                key={index}
                onClick={(e) => props.onClick(index, item)}
                style={{
                  cursor: "normal",
                  padding: "8px 8px",
                  backgroundColor:
                    activeTab == index
                      ? "rgba(255,57,188,1.0)"
                      : errorTab.find((element) => element === item)
                      ? "#f75676"
                      : "#EEEEEE",
                  marginRight: 5,
                  borderRadius: 10,
                  color: activeTab == index ? "white" : "#000041",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {item}
              </Button>
            );
          })}
        </ButtonGroup>
      </div>
    </>
  );
}
