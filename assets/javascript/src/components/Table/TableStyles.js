import React from "react";
import { createTheme } from "react-data-table-component";

export const TableStyles = {
  rows: {
    style: {
      fontFamily: "Poppins",
      fontSize: 14,
      "&:nth-child(odd)": {
        background: "#fcfaff",
      },
      "&:nth-child(even)": {
        background: "#fff",
      },
      "&:hover": {
        cursor: "pointer",
        color: "rgba(0, 0, 0, 0.87)",
        backgroundColor: "#FFEEFC",
        transitionDuration: "0.15s",
        transitionProperty: "background-color",
        borderBottomColor: "rgb(255, 255, 255)",
        outline: "rgb(255, 255, 255) solid 1px",
      },
    },
    highlightOnHoverStyle: {
      color: "#FFEEFC",
      backgroundColor: "eee",
      transitionDuration: "0.15s",
      transitionProperty: "background-color",
      borderBottomColor: "white",
      outlineStyle: "solid",
      outlineWidth: "1px",
      outlineColor: "#000",
    },
  },
  cols: {
    style: {
      width: "auto",
      minWidth: "130px",
    },
  },
  header: {
    style: {
      backgroundColor: "#F8F9FE",
      width: "100%",
      paddingLeft: "0px",
      paddingRight: "0px",
      div: {
        width: "100%",
      },
    },
  },

  headCells: {
    style: {
      fontFamily: "Poppins",
      fontSize: 16,
      color: "#000041",
      fontWeight: 400,
      lineHeight: 30,
      background: "#fff",
      borderBottom: "1px solid #eee ",
      width: "auto",
      minWidth: "130px",
    },
    activeSortStyle: {
      color: "rgba(255, 57, 188, 1)",
      "&:focus": {
        outline: "none",
      },
      "&:hover:not(:focus)": {
        color: "rgba(255, 57, 188, 1)",
      },
    },
    inactiveSortStyle: {
      "&:focus": {
        outline: "none",
        color: "#D7D7D7",
      },
      "&:hover": {
        color: "#D7D7D7",
      },
    },
  },
  contextMenu: {
    style: {
      backgroundColor: "#FFEEFC",
      fontFamily: "Poppins",
      color: "#000041",
    },
  },
  pagination: {
    style: {
      fontFamily: "Poppins",
      fontSize: 14,
      background: "#fff",
      justifyContent: "space-between",
      backgroundColor: "#fff",
    },
    pageButtonsStyle: {
      fill: "#ff60c6",
      borderRadius: "2px",
      heigh: 50,
      width: 50,
      "&:disabled": {
        color: "#D7D7D7",
        fill: "#D7D7D7",
      },
    },
  },
  noData: {
    style: {
      justifyContent: "center",
      backgroundColor: "#fff",
      fontFamily: "Poppins",
    },
  },
  sortIcon: {
    style: {
      color: "rgba(255, 57, 188, 1)",
    },
  },
  checkbox: {
    style: {
      border: "2px solid rgba(214, 214, 214, 1)",
      width: "24px",
      height: "24px",
      "::before": {
        backgroundColor: "rgba(255, 57, 188, 1)",
        borderColor: "rgba(255, 57, 188, 1)",
      },
    },
  },
  expanderRow: {
    style: {
      fontFamily: "Poppins",
      color: "#d7d7d7",
      backgroundColor: "#fff",
    },
  },
  expanderCell: {
    style: {
      flex: "0 0 48px",
    },
  },
};

export const CustomCheckbox = React.forwardRef(({ onClick, ...rest }, ref) => (
  <div className="custom-control custom-checkbox">
    <input
      type="checkbox"
      className="custom-control-input"
      ref={ref}
      {...rest}
    />
    <label className="custom-control-label" onClick={onClick} />
  </div>
));

createTheme("mailerrize", {
  background: {
    default: "#fff",
  },
  divider: {
    default: "#fff",
  },
  text: {
    primary: "#717579",
  },
  action: {
    button: "rgba(255, 57, 188, 1)",
    hover: "rgba(0,0,0,.08)",
  },
});
