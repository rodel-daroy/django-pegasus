import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import { CampaignCreateLeadAction } from "../../../../../redux/action/CampaignAction"

class LeadClick extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        const {id ,email,full_name,time} = this.props;
        return (
            <div>
                <Container >
                    <Row>{email}</Row>
                    <Row>{full_name}</Row>
                    <Row>{time}</Row>
                </Container>
            </div>
        )
    }
}
const mapStateToProps = (state) => {
    console.log("state",state.CampaignPeopleReducer &&state.CampaignPeopleReducer.campaignPeopleData)
    return {
        peopleData: state.CampaignPeopleReducer &&state.CampaignPeopleReducer.campaignPeopleData && state.CampaignPeopleReducer.campaignPeopleData.id

    };
};
const mapDispatchToProps = dispatch => ({
    // CampaignCreateLeadAction: (id) => dispatch(CampaignCreateLeadAction(id))

});
export default connect(mapStateToProps, mapDispatchToProps)(LeadClick)
