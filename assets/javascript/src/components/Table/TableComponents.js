import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Button, Col, Input, Row } from "reactstrap";

export const Filter = ({
  onSearch,
  onChangeFilter,
  filterOptions,
  onChangeSecondFilter,
  secondFilterOptions,
  openAction,
}) => {
  const [inputSearch, setInputSearch] = useState(false);

  return (
    <Row
      style={{ paddingBottom: 25, width: "100%" }}
      className="ml-0 mr-0 table-input"
    >
      {onSearch && (
        <Col xl={3} lg={3} md={3} xs={6} style={{ paddingLeft: 0 }}>
          <div className="row">
            <span
              className={
                inputSearch ? "search-span borderColor" : "search-span"
              }
              id="search-span"
              onClick={() => setInputSearch(true)}
              onBlur={() => setInputSearch(false)}
            >
              <Input
                placeholder="Search here"
                style={{ border: "none" }}
                className="input-search-table"
                name="search"
                type="search"
                onKeyUp={(e) => onSearch(e)}
              />
              <span className="span-inside">
                <span className="search-span-inside">
                  <i className="fas fa-search" />
                </span>
              </span>
            </span>
          </div>
        </Col>
      )}
      <Col xl={3} lg={3} md={3} xs={6} className="align-right">
        {filterOptions && (
          <select
            className="dropdown_header"
            onChange={(e) => onChangeFilter(e.target.value)}
          >
            {filterOptions.length > 0 &&
              filterOptions.map((item, i) => {
                return (
                  <option key={`dropdown-${i}`} value={item.value}>
                    {item.label}
                  </option>
                );
              })}
          </select>
        )}
      </Col>

      <Col xl={3} lg={3} md={3} xs={6}>
        {secondFilterOptions && (
          <select
            className="dropdown_header"
            onChange={(e) => onChangeSecondFilter(e.target.value)}
          >
            {secondFilterOptions?.length > 0 &&
              secondFilterOptions.map((item, i) => {
                return (
                  <option
                    key={`dropdown-${i}`}
                    value={item.value}
                    style={{ backgroundColor: "red" }}
                    className="option-select"
                  >
                    {item.label}
                  </option>
                );
              })}
          </select>
        )}
      </Col>

      <Col xl={3} lg={3} md={3} xs={6} className="align-right">
        
        {/* {openAction && ( */}
          <Button
            type="button"
            className="button-fucsia-table"
            onClick={() => openAction()}
          >
            + New
          </Button>
        {/* )} */}

      </Col>
    </Row>
  );
};

Filter.propTypes = {
  onSearch: PropTypes.func,
  onChangeFilter: PropTypes.func,
  filterOptions: PropTypes.array,
  openAction: PropTypes.func,
  onChangeSecondFilter: PropTypes.func,
  secondFilterOptions: PropTypes.array,
};
