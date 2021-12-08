import React, { Component } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardBody,
  CardFooter,
  Form,
  FormGroup,
  Input,
} from "reactstrap";
import PageContainer from "../../../components/Containers/PageContainer";

export class Redeem extends Component {
  render() {
    return (
      <>
        <PageContainer title="Redeem a promotion">
          <Container>
            <Row>
              <Col md="6" sm="12" className="mobile-p-0">
                <p>
                  Do you have a promo code? Apply it to your team:{" "}
                  <span className="font-weight-bold">Team Name</span>
                </p>
                <Card>
                  <Form className="needs-validation">
                    <CardBody>
                      <FormGroup>
                        <Input
                          id="promo-code"
                          placeholder="Promo code"
                          required
                          type="text"
                        />
                      </FormGroup>
                    </CardBody>
                    <CardFooter className="bg-transparent">
                      <Button color="info" type="submit">
                        APPLYPROMO
                      </Button>
                    </CardFooter>
                  </Form>
                </Card>
              </Col>
            </Row>
          </Container>
        </PageContainer>
      </>
    );
  }
}

export default Redeem;
