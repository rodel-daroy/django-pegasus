import React, { Component, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Row,
  Spinner,
} from "reactstrap";

import PageContainer from "../../../components/Containers/PageContainer";
import axios from "../../../utils/axios";

const AppsandCrm = (props) => {
  const user = useSelector((state) => state.auth.user);
  const [integration, setIntegration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interval, SetInterval] = useState(null);

  const loadIntegration = async () => {
    if (integration?.status !== "CREATED" && integration) return null;
    try {
      const { data } = await axios.get(`/integrations/${user.id}/`);
      setIntegration(data);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegration();
  }, []);

  useEffect(() => {
    if (!integration) return;

    if (integration.status === "CREATED") {
      SetInterval(setInterval(() => loadIntegration(), 2000));
    } else if (interval) {
      clearInterval(interval);
      setInterval(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [integration?.status]);
  const renderButtonContent = () => {
    if (loading) return <Spinner></Spinner>;
    if (integration.status !== "CREATED") return "Connected";
    return (
      <a href={integration.url_to_connect} target="_blank" rel="noreferrer">
        ADD
      </a>
    );
  };
  return (
    <PageContainer title="Apps & CRMs">
      <span className="display-4">INSTALLED APPS</span>
      <hr className="mt-2 mb-2" />
      <Container fluid>
        <Row className="mt-5 mb-5">
          <Col lg={3} md={4} sm={12}>
            <Card>
              <CardBody>
                <img
                  alt="..."
                  className="img-center img-fluid rounded-center-img"
                  src={STATIC_FILES.zapier}
                />
                <div className="pt-4 text-center">
                  <h5 className="h3 title">
                    <span className="d-block mb-1">ZAPIER</span>
                    <small className="h4 font-weight-light text-muted">
                      Track activities and update lead statuses when actions are
                      taken in Mailerrize.
                    </small>
                  </h5>
                  <div className="mt-3">
                    <Button>{renderButtonContent()}</Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </PageContainer>
  );
};
export default AppsandCrm;
