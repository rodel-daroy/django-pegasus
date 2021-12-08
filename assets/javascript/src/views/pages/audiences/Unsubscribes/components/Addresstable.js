import React from "react";
import { Table } from "reactstrap";

function Addresstable(props) {
  return (
    <>
      {!props.data || !props.data.length ? (
        <p className="mt-4">
          Search returned 0 unsubscribed address.
        </p>
      ) : (
        <Table hover responsive>
          <thead className="thead-light">
            <tr>
              <th>
                <input
                  id="check-all"
                  type="checkbox"
                  checked={props.data.length === props.selectedId.length}
                  ref={props.textInput}
                  onChange={props.selectAll}
                />
              </th>
              <th>Email</th>
              <th>UNSUBSCRIBE DATE</th>
            </tr>
          </thead>
          <tbody>
            {props.data.map((row, index) => (
              <tr key={index} className="">
                <td>
                  <input
                    id={"row_" + row.id}
                    type="checkbox"
                    checked={
                      props.selectedId &&
                      props.selectedId.filter((id) => id === row.id).length
                    }
                    onChange={(event) => {
                      props.selectRow(row.id, event);
                    }}
                  />
                </td>
                <td>{row.email}</td>
                <td>{new Date(row.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}

export default Addresstable;
