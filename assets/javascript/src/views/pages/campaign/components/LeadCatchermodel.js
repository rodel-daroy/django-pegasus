import React, { Component } from 'react'
import {Row, Col} from 'reactstrap'


export class LeadCatchermodel extends Component {

    render() {
        return (
            <div>
                <div className="lower_headerdiv">
                <div>
                    <span className="lead_Action">Lead actions</span>
                    <span className="info_icon"><i className="fa fa-question-circle-o" aria-hidden="true"></i></span>
                </div>
                <div>
                    <span className="link_icon"><i className="fa fa-link" aria-hidden="true"></i></span>
                    <span className="user_name"> Ashu JANUARY 18 OUTREACH</span>
                </div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <Row>
                        <Col >
                            <span className="reply">REPLY</span  >
                        </Col>
                        <Col  >
                            <select className="selectbox_1" defaultValue=''>
                                <option value="" selected disabled hidden className="status">Status</option>
                                <option value="ignore" className="ignore">ignore</option>
                                <option value='won' className="won">won3</option>
                                <option value='lost' className="lost">lost</option>
                            </select></Col >
                        <Col  >
                            <select className="selectbox_2" defaultValue=''>
                                <option value="" selected disabled hidden className="Assign">Assign</option>
                                <option value="unassigned" className="UnAssign">Unassigned</option>
                                <option value="me" className="me">Me</option>
                            </select>
                        </Col>
                        <Col  >
                            <span className="next">
                                Next
                        </span>
                        </Col>
                    </Row>
                </div>
            </div>
                <div>
                    <Row style={{ display: "flex" }}>
                        <div>
                            <span className="leadinfo_icon"><i className="fa fa-info-circle"></i></span>
                            <span className="leadstatus_opened">Lead opened</span>
                            <span className="leadopened_date"> Jan 24,2020</span>
                            <span className="saparator"><i className="fa fa-circle"></i></span>
                            <span className="leadopened_time">12:09 pm</span>
                        </div>
                    </Row>
                    <Row className="saparator_row" >
                        <i className="fa fa-circle"></i>
                    </Row>
                </div>
                <div>
                    <Row style={{ display: "flex", marginTop: "5px" }}>
                        <div>
                            <span className="leadwon_icon"><i className="fa fa-thumbs-up"></i></span>
                            <span className="leadstatus_won"> Lead won</span>

                            <span className="leadwon_date">jan 24,2020</span>
                            <span className="saparator"><i className="fa fa-circle"></i></span>
                            <span className="leadwon_time">12:19pm</span>
                        </div>
                    </Row>
                    <Row className="saparator_row" >
                        <i className="fa fa-circle"></i>
                    </Row>
                </div>

                <div>
                <Row style={{ display: "flex" ,marginTop: "5px" }}>
                        <div>
                        <span className="repliy_icon"><i className="fa fa-reply"></i></span>
                        <span className="repliy_status"> replied</span>
                        <span className="repliy_date"> jan 24,2020</span>
                        <span className="repliy_time">12:19pm</span>
                        </div>
                    </Row>
                    <Row className="saparator_row" >
                            <i className="fa fa-circle"></i>
                            <div className="verticle_line"></div>
                            {/* <Row  >   */}
                            <div className="replied_mail_box" style={{ borderBottom: "1px solid #ddd" }}> 
                             <div >
                                <span className="from">From:</span>
                                <span className="from_mailid"> prakhargupta@externlabs.com</span>
                               </div>
                               <div   style={{ borderBottom: "1px solid #ddd",width:"100%" }}>
                                <span  className="mail_subject">subject:</span>
                                <span  className="mail_subject_body">Re: Ashu campain msg</span>
                            </div>
                            <div>
                                <span className="reply_mag_body"> hi team lead </span>
                                
                            </div>
                              </div>
                    </Row>
                </div>
                <div>
                    <Row style={{ display: "flex", marginTop: "5px" }}>
                        <div>
                            <span className="leadwon_icon">  <i className="fa fa-thumbs-up"></i></span>
                            <span className="leadstatus_rewon"> Lead won</span>
                            <span className="leadwon_redate">jan 24,2020</span>
                            <span className="leadwon_retime">12:19pm</span>
                        </div>
                    </Row>
                    <Row className="saparator_row" >
                        <i className="fa fa-circle"></i>
                    </Row>
                </div>
                <div>
                    <Row style={{ display: "flex", marginTop: "5px" }}>
                        <div>
                            <span className="leadinfo_icon"><i className="fa fa-info-circle"></i></span>
                            <span className="leadstatus_opened"> Lead opened</span>
                            <span className="leadopened_date">jan 24,2020</span>
                            <span className="saparator"><i className="fa fa-circle"></i></span>
                            <span className="leadopened_time"> 3:28pm</span>
                        </div>
                    </Row>
                    <Row className="saparator_row" >
                        <i className="fa fa-circle"></i>
                    </Row>
                </div>
                <div>
                    <Row style={{ display: "flex", marginTop: "5px" }}>
                        <div>
                            <span className="leadopened_icon"> <i className="fa fa-eye"></i></span>
                            <span className="leadstatus_opened"> opened</span>
                            <span className="initial_email">installemail</span>
                            <span className="leadopened_date"> jan 24,2020</span>
                            <span className="saparator"><i className="fa fa-circle"></i></span>
                            <span className="leadopened_time">3:28pm</span>
                        </div>
                    </Row>
                    <Row className="saparator_row" >
                        <i className="fa fa-circle"></i>
                    </Row>
                </div>
                <div>
                    <Row style={{ display: "flex", marginTop: "5px" }}>
                        <div>
                            <span className="sent_icon">  <i className="fa fa-paper-plane"></i></span>
                            <span className="sent_status"> sent</span>
                            <span className="sent_date"> jan 18,2020</span>
                            <span className="saparator"><i className="fa fa-circle"></i></span>
                            <span className="sent_time">7:43pm</span>
                        </div>
                    </Row>
                    <Row className="saparator_row" >
                            <div className="replied_mail_box" style={{ borderBottom: "1px solid #ddd" }}> 
                             <div >
                                <span className="from">From:</span>
                                <span className="from_mailid"> prakhargupta@externlabs.com</span>
                               </div>
                               <div   style={{ borderBottom: "1px solid #ddd",width:"100%" }}>
                                <span  className="mail_subject">subject:</span>
                                <span  className="mail_subject_body">Re: Ashu campain msg</span>
                            </div>
                            <div>
                                <span className="reply_mag_body"> Prakhar campaign msg<br/> </span>
                                <span className="sent_body_status"> Testing </span>
                                
                            </div>
                              </div>
                    </Row>
                </div>
            </div>
        )
    }
}

export default LeadCatchermodel
