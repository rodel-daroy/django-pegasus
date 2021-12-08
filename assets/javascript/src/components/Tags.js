import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FormGroup, Input } from "reactstrap";

import axios from "../utils/axios";

export const Tags = (props) => {
  const user = useSelector((state) => state.auth.user);
  const [tags, setTags] = useState([]);
  useEffect(() => {
    getAudienceTag();
  }, []);

  const getAudienceTag = () => {
    const token = localStorage.getItem("access_token");
    axios
      .get("/campaign/audience/tags/", {
        admin_id: user.team_admin_id,
        session_type: user.session_type,
      })
      .then((response) => {
        setTags(
          response.data.map((item) => ({
            name: item.name,
            id: item.id,
          }))
        );
      })
      .catch((err) => {
        setTags([]);
      });
  };

  const handleChange = (e) => {
    props.onSelect(e.target.value, tags);
  };
  return (
    <div
      className={
        !props.recipients ? "campaign-style" : "campaign-style none-padding"
      }
    >
      <FormGroup className="form-select">
        <label className="label-custom" htmlFor="selectFromAddress">
          {props.label}
        </label>
        <Input
          id="selectedTag"
          name="tags"
          type="select"
          value={props.selectedTag ? props.selectedTag : ""}
          onChange={handleChange}
          required
          className="input-select"
        >
          <option hidden defaultValue>
            Select
          </option>
          {tags &&
            tags.map((item, index) => (
              <option value={item.id} key={index}>
                {item.name}
              </option>
            ))}
        </Input>
        <img alt="" src={STATIC_FILES.arrow_pink} className="icon-select" />
      </FormGroup>
    </div>
  );
};
