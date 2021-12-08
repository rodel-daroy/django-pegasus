import React from "react";
import PropTypes from "prop-types";
import { CustomInput } from "reactstrap";
import {
  SettingIcon,
  DeleteIcon,
  MenuOptionIcon,
} from "../../components/icons";
import { Menu, MenuItem, MenuButton, SubMenu } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import { permission } from "../../utils/Enums";

export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: {},
      selected_all: false,
      filter_selected: 0,
      data_to_show: props.data,
    };
  }
  componentDidMount() {
    if (this.props.filters?.length) {
      const filter = this.props.filters[this.state.filter_selected];

      this.filterData(filter.key, filter.filter, this.state.filter_selected);
    }
  }

  selectItem = (item) => {
    if (this.state.selected[item.id]) {
      this.setState({
        selected: { ...this.state.selected, [item.id]: undefined },
      });
      return;
    }
    this.setState({ selected: { ...this.state.selected, [item.id]: item } });
  };

  selectAll = () => {
    if (this.state.selected_all) {
      this.setState({ selected: {}, selected_all: false });
    } else {
      this.setState({
        selected: this.props.data.reduce((result, item) => {
          console.log(item, result);
          result[item.id] = item;
          return result;
        }, {}),
        selected_all: true,
      });
    }
  };
  filterData = (key, value, index) => {
    const new_data_to_show = key
      ? this.props.data.filter((item) => item[key] === value)
      : this.props.data;
    this.setState({ filter_selected: index, data_to_show: new_data_to_show });
  };

  render() {
    return (
      <div className="container table">
        <div className="tables_rows">
          {this.props.userIsAdmin && (
            <div className="checkbox_container">
              <CustomInput
                onClick={() => this.selectAll()}
                className="checkbox"
                id="select_all"
                type="checkbox"
              ></CustomInput>
            </div>
          )}
          <div className="header_body_container">
            <div className="tabs">
              {this.props.filters
                ? this.props.filters.map((filter, i) => {
                    console.log(this.props.filters);
                    return (
                      <span
                        key={i}
                        className={
                          "filter " +
                          (this.state.filter_selected === i ? "focus" : "")
                        }
                        onClick={() =>
                          this.filterData(filter.key, filter.filter, i)
                        }
                      >
                        {filter.label}
                      </span>
                    );
                  })
                : null}
            </div>
            {this.props.userIsAdmin && (
              <div className="actions">
                <DeleteIcon></DeleteIcon>
              </div>
            )}
          </div>
          <div className="setting_container">
            {this.props.generalSetting?.length && this.props.userIsAdmin ? (
              <Menu menuButton={<SettingIcon></SettingIcon>}>
                {this.props.generalSetting.map((item, i) => (
                  <MenuItem key={i}>{item.label}</MenuItem>
                ))}
              </Menu>
            ) : null}
          </div>
        </div>
        {this.state.data_to_show.map((item, i) => (
          <div key={i} className="tables_rows">
            {this.props.userIsAdmin && (
              <div className="checkbox_container">
                <CustomInput
                  id={i}
                  checked={this.state.selected[item.id]}
                  className="checkbox"
                  type="checkbox"
                ></CustomInput>
              </div>
            )}
            <div className="icon_container">
              <img
                className="icon"
                src={item.icon ? item.icon : STATIC_FILES.default_avatar}
              ></img>
            </div>
            <div className="body_container">
              <div className="text_container">
                <p className="sub_title">{item.subtitle}</p>
                <p className="title">{item.title}</p>
                <p className="body">{item.body}</p>
              </div>
            </div>
            {item.settings?.length && this.props.userIsAdmin ? (
              <div className="setting_container">
                <Menu menuButton={<MenuOptionIcon></MenuOptionIcon>}>
                  {item.settings.map((item, i) => (
                    <MenuItem key={i}>{item.label}</MenuItem>
                  ))}
                </Menu>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  }
}
List.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      title: PropTypes.string,
      subtitle: PropTypes.string,
      body: PropTypes.string,
      icon: PropTypes.string,
      settings: PropTypes.oneOf([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
      ]),
    })
  ),
  generalSetting: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      key: PropTypes.string,
      filter: PropTypes.string,
    })
  ),
};
