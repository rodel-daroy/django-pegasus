import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import {
  Card,
  CardBody,
  CardHeader,
  Form,
  Input,
  Modal,
  Row,
} from "reactstrap";

import axios from "../../../../../utils/axios";
import { parseTemplate } from "../../../../../utils/Utils";
import MainPreviewPanel from "./MainPreviewPanel";
import PreviewPanelList from "./PreviewPanelList";

const initialState = {
  titleFilters: [{ label: "Emails" }],
};

const RecipientDetailModal = (props) => {
  const [titleFilters, setTitleFilters] = useState(initialState.titleFilters);
  const [data, setData] = useState([]);
  console.log(props);
  useEffect(async () => {
    console.log(props);
    if (!props.recipient_id) return;
    const data = [];
    const {
      data: { success, content },
    } = await axios.get(
      `/campaign/recipient/${props.campaign_id}/${props.recipient_id}/`
    );
    setData(content);
  }, [props.campaign_id, props.recipient_id]);

  return (
    <>
      <Modal isOpen={props.isOpen} toggle={props.close} size="lg">
        <Form>
          <Card className="no-shadow">
            <CardHeader className="pb-0">
              <h2>Sequence of {props.title} </h2>
            </CardHeader>
            <CardBody className="pt-4 pb-0">
              <Row>
                <div
                  className="padding-10-15 campaign-style"
                  style={{ width: "90%" }}
                >
                  {data.map((email, index) => (
                    <PreviewPanelList key={index}>
                      <MainPreviewPanel
                        subject={email.email_subject}
                        body={email.email_body}
                      />
                    </PreviewPanelList>
                  ))}
                </div>
              </Row>
            </CardBody>
          </Card>
        </Form>
      </Modal>
    </>
  );
};

export default RecipientDetailModal;
