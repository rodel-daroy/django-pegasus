import { Menu, MenuButton, MenuItem, SubMenu } from "@szhsin/react-menu";
import * as _ from "lodash";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Badge,
  Card,
  CardFooter,
  Container,
  Input,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  UncontrolledTooltip,
} from "reactstrap";
import { CustomInput } from "reactstrap";
import CardBody from "reactstrap/lib/CardBody";

import { DeleteIcon, MenuOptionIcon, SettingIcon } from "../components/icons";

const actionToggleDefaultPositiveLabel = "Yes";
const actionToggleDefaultNegativeLabel = "No";
const actionToggleDefaultTheme = "default";

/**
 *
 * @param {title} param0 : Titles of table  @Required
 *      @example = [
                {
                    key: 'email',
                    value: 'Email',
                },
                {
                    key: 'name',
                    value: 'Name',
                },
              ];
        @default = []
 * @param {tablePropsData} param1 : Table data to show  @Required
 *      @example = [
            {
                email: 'ajju@gmail.com',
                name: 'Azazul',
            },
            {
                email: 'janak@gmail.com',
                name: 'Azazul',
            },
            {
                email: 'ajju@gmail.com',
                name: 'janak',
            }
        ];
        @default = []
 * @param {showAction} param2 : To sow action menues on last @Optional
        @example = true | false
        @default = false
 * @param {actionMenus} param3 : All action list that show in action menu @Required if @param {showAction} is true
        @example = [
            {
                key: 'view',
                name: 'View'
            },
            {
                key: 'edit',
                name: 'Edit'
            },
            {
                key: 'delete',
                name: 'Delete'
            }
        ]
        @default = []
 * @param {actionCallback} param4 : This is callback function to call given function on click of menu @params (type, item)
        @default = null
 * @param {showSelect} param5 : To show select check box on start in table.
 *      @example = true | false
 *      @default = false
 * @param {selectedCallback} param6 : This is callback function to call given function on selct | deseldct of checkbox @params ([item])
 *      @default = null
 * @param {showPagination} param7 : To show pagination in table.
 *      @example = true | false
 *      @default = false
 * @param {paginationCallback} param8 : This is callback function to call given function on change of page @params (page, type)
 *      @default = false
 * @param {perPageRecords} param9 : Prepage record setup
 *      @example = 10
 *      @default = 10
 * @param {activePage} param10 : Active page on pagination.
 *      @default = 1
 * @param {totalPages} param11 : Total records for pagination setting.
 *      @default = null
 * @param {filters} param12 : Show and manage filter of tables.
 *      @example = [
            {
                key: 'email',   // for which field should filter
                options: ['ajajul@gmail.com', 'mikin@gmail.com', 'ajju@gmail.com']  // values for option in filter
            },
            {
                key: 'name',
                options: ['ajajul', 'mikin']
            }
        ]
        @default = []
 * @param {searchKeys} param13 : Show and manage search in table.
        @example = ['email', 'name']   // in which fields we apply search.
        @default = []
 * @param {actions} param14 : Action fields to show. This doesn't include edit/delete actions
        @example = [{
          key: 'warm_enabled',      // data field
          type: 'toggle',           // action compoment type. i.e. 'toggle' => toggle button
          theme: 'warning',         // argon color theme values: default, success, info, danger, warning, ...
          labelPositive: 'On',
          labelNegative: 'Off',
          disabled: false
        }]
        @default = []
 * @param {onChange} param15 : Data change event handler
        @param =
          field         // changed field
          value         // new value
          record        // changed record
          recordIndex   // record index
        @default = null
 */

function Tables({
  titles = [],
  tablePropsData = [],
  showAction = false,
  showChecked = false,
  actionMenus = [],
  actionCallback = null,
  showSelect = false,
  selectedCallback = null,
  showControl = false,
  controlCallback = null,
  showPagination = false,
  paginationCallback = null,
  perPageRecords = 5,
  activePage = 1,
  totalPages = null,
  filters = [],
  searchKeys = [],
  actions = [],
  setData = () => {},
  onChange = null,
  onClick = null,
  onDetail = null,
  onEdit = null,
  onDelete = null,
  tdStyle = [],
  rowClassName = "",
  resultSearch = "",
  headerIcons = [],
  rowIcons = [],
  showDropdown = false,
  dropdownFilter = [],
  permission = null,
  mailAccount = false,
}) {
  const user = useSelector((state) => state.auth.user);
  const divReftitle = React.useRef(null);
  const divReftable = React.useRef(null);
  const [sort, setSort] = React.useState(null);
  const [sortType, setSortType] = React.useState("asc");
  const [tableData, setTableData] = React.useState(tablePropsData);
  const [noData, setNoData] = React.useState(false);
  // const [recordLimit, setRecordLimit] = React.useState(perPageRecords);    // for future use.
  const [active, setActive] = React.useState(activePage);
  const [selectAll, setSelectAll] = React.useState(false);
  const [filterParams, setfilterParams] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [tabSelected, setTabSelected] = React.useState(0);
  const [titlesDivided, setTitleDivided] = React.useState([]);
  const [paginationCnt, setPaginationCnt] = React.useState(10);
  const [widthContainerTitle, setwidthContainerTitle] = React.useState(null);
  const [widthContainerTable, setwidthContainerTable] = React.useState(null);
  const sortData = (item) => {
    let data = [];
    if (sort === item.key) {
      if (sortType === "asc") {
        data = _.orderBy(tableData, [item.key], ["desc"]);
        setSortType("desc");
      } else {
        data = _.orderBy(tableData, [item.key], ["asc"]);
        setSortType("asc");
      }
    } else {
      data = _.orderBy(tableData, [item.key], ["asc"]);
      setSortType("asc");
    }
    setTableData(data);
    setData(data);
    setSort(item.key);
  };

  const pageChange = (page, type) => {
    setActive(page);
    paginationCallback && paginationCallback(page, type);
  };

  const pagePrev = (page, type) => {
    if (page < 0) page = 0;
    setActive(page + 1);
    setCurrentPage(page);
  };

  const pageNext = (page, maxLength) => {
    if (page > maxLength) page = maxLength;
    setActive(page + 1);
    setCurrentPage(page);
  };

  const menuClicked = (type, item) => {
    actionCallback && actionCallback(type, item);
  };

  const pagination = () => {
    const total_records = totalPages ? totalPages : tableData.length;
    let pages = Array.from(
      Array(parseInt(total_records / perPageRecords)).keys()
    );
    if (
      parseInt(total_records / perPageRecords) <
      total_records / perPageRecords
    ) {
      pages = Array.from(
        Array(parseInt(total_records / perPageRecords) + 1).keys()
      );
    }
    return (
      <Pagination
        className="pagination justify-content-end mb-0"
        listClassName="justify-content-end mb-0"
      >
        <PaginationItem
          className={currentPage < paginationCnt ? "disabled" : ""}
        >
          <PaginationLink
            onClick={(e) => pagePrev(currentPage - paginationCnt)}
            tabIndex="-1"
          >
            <img src={STATIC_FILES.angle_left_dark}></img>
            <img src={STATIC_FILES.angle_left_light}></img>
            <span
              className="sr-only"
              style={{ borderRadius: "0px !important" }}
            >
              Previous
            </span>
          </PaginationLink>
        </PaginationItem>
        {pages
          .slice(currentPage, currentPage + paginationCnt)
          .map((item, index) => {
            const currentIndex = currentPage + index + 1;
            return (
              <PaginationItem
                key={"page" + currentIndex}
                className={currentIndex === active ? "active" : ""}
              >
                <PaginationLink
                  onClick={(e) => pageChange(currentIndex)}
                  className={currentIndex !== active ? "no_active" : ""}
                >
                  {currentIndex}
                </PaginationLink>
              </PaginationItem>
            );
          })}
        <PaginationItem
          className={
            currentPage + paginationCnt > pages.length ? "disabled" : ""
          }
        >
          <PaginationLink
            onClick={(e) => pageNext(currentPage + paginationCnt, pages.length)}
          >
            <img src={STATIC_FILES.angle_right_light}></img>
            <img src={STATIC_FILES.angle_right_dark}></img>
            <span className="sr-only">Next</span>
          </PaginationLink>
        </PaginationItem>
      </Pagination>
    );
  };

  const selectRecord = (e, index) => {
    let data = [...tableData];
    data[index].selected = e.target.checked;
    setTableData(data);
    setData(data);
    if (
      _.filter(data, (item) => {
        return item.selected;
      }).length === data.length
    ) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
    selectedCallback && selectedCallback([data[index]]);
  };

  const selectAllRecord = (e) => {
    let data = [...tableData];
    if (e.target.checked) {
      _.forEach(data, (item) => {
        item.selected = true;
      });
      setSelectAll(true);
    } else {
      _.forEach(data, (item) => {
        item.selected = false;
      });
      setSelectAll(false);
    }
    setTableData(data);
    setData(data);
    selectedCallback && selectedCallback(data);
  };

  const changeFilter = (key, value, index) => {
    if (selectedCallback) {
      selectedCallback(value);
    }

    let data = key
      ? tablePropsData.filter((item) =>
          item[key]?.toLowerCase?.().includes(value?.toLowerCase?.())
        )
      : [...tablePropsData];
    setTableData(data);
    setData(data);
    setTabSelected(index);
    setActive(1);
  };

  const searchFilter = (textSearch) => {
    let data = [...tablePropsData];
    let is_available = false;
    data = _.filter(data, (item) => {
      is_available = false;
      _.forEach(searchKeys, (key) => {
        if ((item[key] || "").includes(textSearch)) {
          is_available = true;
        }
      });
      return is_available;
    });
    setTableData(data);
    setData(data);
  };
  const changePaginationCnt = () => {
    if (window.innerWidth < 500) {
      setPaginationCnt(3);
    } else if (window.innerWidth > 820) {
      setPaginationCnt(10);
    } else {
      setPaginationCnt(5);
    }
  };
  const getRef = () => {
    if (divReftitle && divReftitle.current && divReftitle.current.clientWidth) {
      setwidthContainerTitle(divReftitle?.current.clientWidth);
      setwidthContainerTable(divReftable?.current.clientWidth);
    }
  };
  React.useEffect(() => {
    if (divReftitle && divReftitle.current && divReftitle.current.clientWidth)
      setwidthContainerTitle(divReftitle?.current.clientWidth);
  }, []);
  React.useEffect(() => {
    if (tableData.length == 0 && !noData) {
      if (tablePropsData.length == 0) {
        setNoData(true);
      }
      if (showSelect) {
        _.forEach(tablePropsData, (item) => {
          item.selected = false;
        });
      }
    }

    setTableData(tablePropsData);
    setData(tablePropsData);
  }, [tablePropsData, resultSearch]);

  React.useEffect(() => {
    if (resultSearch != "") {
      searchFilter(resultSearch);
    }
  }, [resultSearch]);

  React.useEffect(() => {
    window.addEventListener("resize", changePaginationCnt);
    return () => {
      window.removeEventListener("resize", changePaginationCnt);
    };
  });
  React.useEffect(() => {
    window.addEventListener("resize", getRef);
    return () => {
      window.removeEventListener("resize", getRef);
    };
  });

  React.useEffect(() => {
    setTitleDivided(
      titles.reduce((prev, actual) => {
        if (prev[prev.length - 1]?.length < 3) {
          prev[prev.length - 1].push(actual);
        } else {
          prev.push([actual]);
        }
        return prev;
      }, [])
    );
  }, [titles]);

  const render_row = (data, titles, index) => {
    return (
      <div
        className={`text_container ${index > 0 && "text-second"} ${
          !titlesDivided[1] && "one-row"
        } ${!showChecked && "pl-4"}`}
        key={index}
      >
        {data[titles[0]?.key] !== undefined && data[titles[0]?.key] !== null ? (
          <div className={`sub_title ${data[titles[0].key].className}`}>
            {data[titles[0].key]}
          </div>
        ) : null}
        {data[titles[1]?.key] !== undefined && data[titles[1]?.key] !== null ? (
          <div className={`title ${data[titles[1].key].className}`}>
            {data[titles[1].key].length > 35
              ? `${data[titles[1].key].substring(0, 35)} ...`
              : data[titles[1].key]}
          </div>
        ) : null}
        {data[titles[2]?.key] !== undefined && data[titles[2]?.key] !== null ? (
          <div className={`body ${data[titles[2].key].className}`}>
            {data[titles[2].key].length > 35
              ? `${data[titles[2].key].substring(0, 35)} ...`
              : data[titles[2].key]}
          </div>
        ) : null}
      </div>
    );
  };

  const clickEvent = (data) => {
    if (data.link) {
      location.pathname = data.link.replace("{{id}}", data[item.id]);
    }
  };
  return (
    <>
      <div className="table content_table p-0">
        <div>
          <div className="tables_rows table_header">
            {showChecked ? (
              <div className="checkbox_container ">
                <CustomInput
                  onChange={selectAllRecord}
                  className="checkbox"
                  type="checkbox"
                  id="select_all"
                  checked={selectAll}
                ></CustomInput>
              </div>
            ) : null}

            <div
              className={`header_body_container ${
                showDropdown && "resize-div"
              } ${mailAccount && "full-width"}`}
              ref={divReftitle}
            >
              <div
                className="tabs"
                style={{
                  height: widthContainerTitle ? widthContainerTitle : "50vw",
                }}
              >
                {filters?.length
                  ? filters.map((item, i) => {
                      return (
                        <div
                          key={`filter-${i}`}
                          className={
                            tabSelected == i ? "box-tabs focus" : "box-tabs"
                          }
                          onClick={(e) =>
                            changeFilter(item.key, item.filter, i)
                          }
                        >
                          <div className="text-tabs">{item.label}</div>
                        </div>
                      );
                    })
                  : null}
              </div>
            </div>
            <Row
              className={`icon_container ${showDropdown && "resize-div"} ${
                mailAccount && "none-width"
              }`}
            >
              {showDropdown && (
                <Input
                  type="select"
                  className="dropdown_header"
                  onChange={(e) =>
                    changeFilter(
                      dropdownFilter[0].key,
                      e.target.value,
                      tabSelected
                    )
                  }
                >
                  {dropdownFilter.length > 0 &&
                    dropdownFilter.map((item, i) => {
                      return (
                        <option key={`dropdown-${i}`}>{item.label}</option>
                      );
                    })}
                </Input>
              )}
              <div className={showDropdown ? "icons-dropdown" : ""}>
                {headerIcons.length > 0 &&
                  headerIcons.map((item, i) => {
                    return (
                      <div key={`icon-header-${i}`} className="center-vertical">
                        <img src={item.icon} />
                      </div>
                    );
                  })}
              </div>
            </Row>
          </div>

          {tableData &&
            tableData
              .slice((active - 1) * perPageRecords, active * perPageRecords)
              .map((data, index) => {
                let emailError =
                  data.hasOwnProperty("from_emails") &&
                  data.from_emails?.filter((x) => x.has_error);
                return (
                  <div key={index}>
                    <div
                      onClick={() => clickEvent(data)}
                      className="tables_rows"
                      key={`table-data-${index}`}
                    >
                      {showChecked ? (
                        <div className="checkbox_container">
                          <CustomInput
                            onChange={(e) => selectRecord(e, index)}
                            className="checkbox"
                            type="checkbox"
                            id={`select-${data.id}`}
                            checked={data.selected}
                          ></CustomInput>
                        </div>
                      ) : null}

                      <div
                        className="body_container"
                        onClick={() => (onClick ? onClick(data) : null)}
                        ref={divReftable}
                      >
                        <div
                          className="scroll-container"
                          style={{ height: widthContainerTable }}
                        >
                          {titlesDivided?.map((row, i) => {
                            return render_row(data, row, i);
                          })}
                        </div>
                      </div>
                      <Row className="icon_container">
                        <div
                          className={`icons  ${
                            data.hasOwnProperty("has_error") && "active-icon"
                          }`}
                        >
                          {data.hasOwnProperty("has_error") && (
                            <span className="badge badge-dot ">
                              {data.has_error ? (
                                <>
                                  <i className="bg-warning"></i>
                                </>
                              ) : (
                                <>
                                  <i className="bg-success"></i>
                                </>
                              )}
                            </span>
                          )}
                          {emailError
                            ? emailError.length > 0 && (
                                <span className="badge badge-dot mr-4 ">
                                  <i className="bg-warning"></i>
                                </span>
                              )
                            : null}
                          {rowIcons?.map((item, i) => {
                            return <div key={i}>{item.icon}</div>;
                          })}
                        </div>
                        {showControl && (
                          <div
                            style={tdStyle}
                            key="header-control"
                            style={{
                              fontSize: "17px",
                              display: "flex",
                              alignItems: "center",
                            }}
                            className="icons"
                          >
                            {data.control && user.is_admin && (
                              <>
                                <Badge
                                  id={`action${index}`}
                                  color={
                                    data.control == "play"
                                      ? "success"
                                      : "danger"
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    controlCallback(data, index);
                                  }}
                                >
                                  <i className={`fa fa-${data.control}`}></i>
                                </Badge>
                                <UncontrolledTooltip
                                  delay={0}
                                  placement="bottom"
                                  target={`action${index}`}
                                >
                                  {data.tooltip}
                                </UncontrolledTooltip>
                              </>
                            )}
                          </div>
                        )}

                        {onEdit && user.is_admin && (
                          <div className="icons">
                            <span
                              className="icons"
                              id={`edit${index}`}
                              onClick={(e) => {
                                e.preventDefault();
                                onEdit(data);
                              }}
                            >
                              <i
                                className="fas fa-edit icons"
                                style={{ color: "#717579" }}
                              />
                            </span>
                          </div>
                        )}
                        {onDetail && (
                          <div className="icons">
                            <span
                              className="table-action table-action-detail"
                              id={`detail${index}`}
                              onClick={(e) => {
                                e.preventDefault();
                                onDetail(data);
                              }}
                            >
                              <i className="fas fa-info-circle" />
                            </span>
                            <UncontrolledTooltip
                              delay={0}
                              target={`detail${index}`}
                            >
                              Detail
                            </UncontrolledTooltip>
                          </div>
                        )}

                        {user.is_admin &&
                          actions.map((item, _index) => {
                            if (item.type === "toggle") {
                              const labelPositive =
                                item.labelPositive ||
                                actionToggleDefaultPositiveLabel;
                              const labelNegative =
                                item.labelNegative ||
                                actionToggleDefaultNegativeLabel;
                              const theme = `custom-toggle-${
                                item.theme || actionToggleDefaultTheme
                              }`;
                              return (
                                <div className="setting_icon">
                                  <label
                                    key={item.type + _index}
                                    className={`custom-toggle ${theme} mr-1`}
                                  >
                                    <input
                                      checked={!!data[item.key]}
                                      disabled={!!item.disabled}
                                      type="checkbox"
                                      onChange={(e) => {
                                        !onChange ||
                                          onChange(
                                            item.key,
                                            e.target.checked,
                                            data,
                                            index
                                          );
                                      }}
                                    />
                                    <span
                                      className="custom-toggle-slider rounded-circle"
                                      data-label-off={labelNegative}
                                      data-label-on={labelPositive}
                                    />
                                  </label>
                                </div>
                              );
                            } else {
                              return null;
                            }
                          })}

                        {onDelete && user.is_admin && (
                          <div className="icons">
                            <img
                              src={STATIC_FILES.trash_icon}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onDelete(data);
                              }}
                            />
                          </div>
                        )}
                      </Row>
                    </div>
                  </div>
                );
              })}

          {tableData.length === 0 ? (
            <div className="no_data">
              <img width={30} src={STATIC_FILES.inbox}></img>
              <p>NO DATA</p>
            </div>
          ) : null}

          {tableData.length !== 0 && showPagination && (
            <CardFooter className="py-4 footer-table">
              <nav aria-label="...">{pagination()}</nav>
            </CardFooter>
          )}
        </div>
      </div>
    </>
  );
}

export default Tables;
