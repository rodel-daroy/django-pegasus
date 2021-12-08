import React from "react";
import * as _ from "lodash";
import {
  Card,
  CardHeader,
  CardFooter,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  UncontrolledDropdown,
  Pagination,
  PaginationItem,
  PaginationLink,
  Table,
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
} from "reactstrap";
import CardBody from "reactstrap/lib/CardBody";

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
 * @param {actionCallback} param4 : This is callback function to call given funtion on click of menu @params (type, item)
        @default = null
 * @param {showSelect} param5 : To show select check box on start in table.
 *      @example = true | false
 *      @default = false
 * @param {selectedCallback} param6 : This is callback funciton to call given funciton on selct | deseldct of checkbox @params ([item])
 *      @default = null
 * @param {showPagination} param7 : To show pagination in table.
 *      @example = true | false
 *      @default = false
 * @param {paginationCallback} param8 : This is callback funciton to call given funciton on change of page @params (page, type)
 *      @default = false
 * @param {perpageRecords} param9 : Prepage record setup
 *      @example = 10 
 *      @default = 10
 * @param {acitvePage} param10 : Active page on pagination.
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
 */
function Tables({
  titles = [],
  tablePropsData = [],
  showAction = false,
  actionMenus = [],
  actionCallback = null,
  showSelect = false,
  selectedCallback = null,
  showPagination = false,
  paginationCallback = null,
  perpageRecords = 10,
  acitvePage = 1,
  totalPages = null,
  filters = [],
  searchKeys = [],
}) {
  const [sort, setSort] = React.useState(null);
  const [sortType, setSortType] = React.useState("asc");
  const [tableData, setTableData] = React.useState(tablePropsData);
  const [noData, setNoData] = React.useState(false);
  // const [recordLimit, setRecordLimit] = React.useState(perpageRecords);    // for future use.
  const [acitve, setActive] = React.useState(acitvePage);
  const [selectAll, setSelectAll] = React.useState(false);
  const [filterParams, setfilterParams] = React.useState([]);

  console.log("tableData : ", tableData);

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
    setSort(item.key);
  };

  const pageChange = (page, type) => {
    paginationCallback && paginationCallback(page, type);
  };

  const menuClicked = (type, item) => {
    actionCallback && actionCallback(type, item);
  };

  const pagination = () => {
    const total_records = totalPages ? totalPages : tableData.length;
    let pages = Array.from(
      Array(parseInt(total_records / perpageRecords)).keys()
    );
    if (
      parseInt(total_records / perpageRecords) <
      total_records / perpageRecords
    ) {
      pages = Array.from(
        Array(parseInt(total_records / perpageRecords) + 1).keys()
      );
    }
    return (
      <Pagination
        className="pagination justify-content-end mb-0"
        listClassName="justify-content-end mb-0"
      >
        <PaginationItem className="disabled">
          <PaginationLink onClick={(e) => pageChange(1)} tabIndex="-1">
            <i className="fas fa-angle-left" />
            <span className="sr-only">Previous</span>
          </PaginationLink>
        </PaginationItem>
        {pages.map((item, index) => {
          return (
            <PaginationItem
              key={"page" + (index + 1)}
              className={index + 1 === acitve ? "active" : ""}
            >
              <PaginationLink onClick={(e) => pageChange(index + 1)}>
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem>
          <PaginationLink onClick={(e) => pageChange(pages.length)}>
            <i className="fas fa-angle-right" />
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
    selectedCallback && selectedCallback(data);
  };

  const changeFilter = (e, type) => {
    let data = [...tablePropsData];
    const filterkeys = { ...filterParams };
    filterkeys[type] = e.target.value;

    setfilterParams(filterkeys);
    _.forEach(filterkeys, (value, key) => {
      data = _.filter(data, (item) => {
        return item[key].includes(value);
      });
    });
    setTableData(data);
  };

  const searchFilter = (e) => {
    let data = [...tablePropsData];
    let is_available = false;
    data = _.filter(data, (item) => {
      is_available = false;
      _.forEach(searchKeys, (key) => {
        if (item[key].includes(e.target.value)) {
          is_available = true;
        }
      });
      return is_available;
    });
    setTableData(data);
  };

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
  }, [tablePropsData]);

  return (
    <>
      <Container fluid>
        <Row>
          <div className="col">
            <Card>
              {searchKeys.length > 0 && filters.length > 0 && (
                <CardHeader>
                  <Form>
                    <Row>
                      {searchKeys.length > 0 && (
                        <Col md="3" sm="12" key="seaarch">
                          <FormGroup>
                            <label
                              className="form-control-label text-capitalize"
                              htmlFor="exampleFormControlInput1"
                            >
                              Search
                            </label>
                            <Row>
                              <Col>
                                <Input
                                  name="smtpHost"
                                  type="text"
                                  className="form-control-sm"
                                  onChange={searchFilter}
                                  placeholder="search"
                                ></Input>
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                      )}
                      {filters.length > 0 &&
                        filters.map((item) => {
                          return (
                            <Col md="3" sm="12" key={"filter-" + item.key}>
                              <FormGroup>
                                <label
                                  className="form-control-label text-capitalize"
                                  htmlFor="exampleFormControlInput1"
                                >
                                  {item.key}
                                </label>
                                <Row>
                                  <Col>
                                    <Input
                                      name="smtpPort"
                                      className="form-control-sm"
                                      type="select"
                                      key={"filter-" + item.key}
                                      onChange={(e) =>
                                        changeFilter(e, item.key)
                                      }
                                      defaultValue=""
                                    >
                                      <option value="">All</option>
                                      {item.options.map((option) => {
                                        return (
                                          <option value={option}>
                                            {option}
                                          </option>
                                        );
                                      })}
                                    </Input>
                                  </Col>
                                </Row>
                              </FormGroup>
                            </Col>
                          );
                        })}
                    </Row>
                  </Form>
                </CardHeader>
              )}
              <CardBody className="p-0">
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      {showSelect && (
                        <th key="header-select">
                          <div className="custom-control custom-checkbox">
                            <input
                              className="custom-control-input"
                              id="table-check-all"
                              type="checkbox"
                              checked={selectAll}
                              onClick={(e) => {
                                selectAllRecord(e);
                              }}
                            />
                            <label
                              className="custom-control-label"
                              htmlFor="table-check-all"
                            />
                          </div>
                        </th>
                      )}
                      {titles.map((item, index) => {
                        return (
                          <th
                            className="sort"
                            onClick={() => sortData(item)}
                            key={"header-" + item.key}
                            data-sort="name"
                            scope="col"
                          >
                            {item.value}
                          </th>
                        );
                      })}
                      {showAction && <th scope="col" key="header-actions" />}
                    </tr>
                  </thead>
                  <tbody className="list">
                    {tableData.map((data, index) => {
                      return (
                        <tr key={"table-items" + index}>
                          {showSelect && (
                            <td key={"header-select-" + index}>
                              <div className="custom-control custom-checkbox">
                                <input
                                  className="custom-control-input"
                                  id={"table-check-all" + index}
                                  type="checkbox"
                                  checked={data.selected}
                                  onChange={(e) => selectRecord(e, index)}
                                />
                                <label
                                  className="custom-control-label"
                                  htmlFor={"table-check-all" + index}
                                />
                              </div>
                            </td>
                          )}
                          {titles.map((item) => {
                            return (
                              <td
                                className="sort"
                                key={"header-" + item.key + index}
                                scope="col"
                              >
                                {data[item.key]}
                              </td>
                            );
                          })}
                          {showAction && (
                            <td
                              className="text-right"
                              key={"header-actions" + index}
                            >
                              <UncontrolledDropdown>
                                <DropdownToggle
                                  className="btn-icon-only text-light"
                                  color=""
                                  role="button"
                                  size="sm"
                                >
                                  <i className="fas fa-ellipsis-v" />
                                </DropdownToggle>
                                <DropdownMenu
                                  className="dropdown-menu-arrow"
                                  right
                                >
                                  {actionMenus.map((item) => {
                                    return (
                                      <DropdownItem
                                        key={"dropdown-menu-" + item.key}
                                        onClick={(e) =>
                                          menuClicked(item.key, data)
                                        }
                                      >
                                        {item.name}
                                      </DropdownItem>
                                    );
                                  })}
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </CardBody>

              {showPagination && (
                <CardFooter className="py-4">
                  <nav aria-label="...">{pagination()}</nav>
                </CardFooter>
              )}
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
}

export default Tables;
