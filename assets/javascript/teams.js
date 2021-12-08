'use strict';
import React from "react";
import ReactDOM from "react-dom";
import {getAction} from "./api";
import {Cookies} from "./app";

const API_PREFIX = ['teams', 'api'];

function getAPIAction(action) {
    return getAction(API_PREFIX, action);
}

class TeamMemberTableRow extends React.Component {
    render() {
        return (
            <tr>
                <td>{this.props.display_name}</td>
                <td>{this.props.role}</td>
            </tr>
        );
    }
}

class TeamMemberList extends React.Component {
    render() {
        return (
            <section className="section app-card">
                <h2 className='subtitle'>Team Members</h2>
                <table className="table is-striped is-fullwidth">
                    <thead>
                    <tr>
                        <th>Member</th>
                        <th>Role</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.props.members.map((membership, index) => {
                            return <TeamMemberTableRow key={membership.id} index={index} {...membership}

                            />;
                        })
                    }
                    </tbody>
                </table>

                {}
            </section>
        );
    }
}


class InviteWidget extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            client: client,
        };
        this.emailChanged = this.emailChanged.bind(this);
        this.invite = this.invite.bind(this);
    }

    render() {
        return (
            <div>
                <h2 className="subtitle">Invite Team Members</h2>
                <div className="field has-addons">
                    <div className="control">
                        <input className="input" type="email" placeholder="michael@dundermifflin.com"
                               onChange={this.emailChanged} value={this.state.email}>
                        </input>
                    </div>
                    <div className="control">
                        <a className="button is-primary is-outlined" onClick={this.invite}>
                            <span className="icon is-small">
                              <i className="fa fa-envelope-o"></i>
                            </span>
                            <span>Invite</span>
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    emailChanged(event) {
        this.setState({email: event.target.value});
    }

    invite() {
        let action = getAPIAction(["invitations", "create"]);
        let params = {
            'team': this.props.team.id,
            'email': this.state.email,
        };
        this.state.client.action(window.schema, action, params).then((result) => {
            this.props.addInvitation(result);
            this.setState({
                email: '',
            });
        });
    }
}

class InvitationTableRow extends React.Component {
  render() {
    return (
      <tr>
        <td>{this.props.email}</td>
        <td>{this.props.role}</td>
        <td>
          <div className={"buttons"}>
            <a className={"button is-text"} onClick={() => this.props.resendInvitation(this.props.index)}>
              <span>{ this.props.sent ? "Sent!" : "Resend Invitation" }</span>
            </a>
            <a className={"button is-text"} onClick={() => this.props.delete(this.props.index)}>
              <span>Cancel Invitation</span>
            </a>
          </div>
        </td>
      </tr>
    );
  }
}


class InvitationList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      invitations: this.props.team.invitations,
      client: client,
    };
    this._addInvitation = this._addInvitation.bind(this);
    this._deleteInvitation = this._deleteInvitation.bind(this);
    this._resendInvitation = this._resendInvitation.bind(this);
  }

  render() {
    return (
      <section className="section app-card">
        <InviteWidget team={this.props.team} addInvitation={this._addInvitation}/>
        {this.renderPendingInvitations()}
      </section>
    );
  }

  renderPendingInvitations() {
    if (this.state.invitations.length === 0) {
      return (
        <p>
          <span className="tag is-white has-text-grey">
            <span className="icon is-small">
              <i className="fa fa-hand-o-up"></i>
            </span>
            <span>Invite some more teammates!</span>
          </span>
        </p>
      );
    }
    return (
      <div>
        <br/>
        <h2 className='subtitle'>Pending Invitations</h2>
        <table className="table is-striped is-fullwidth">
          <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          {
            this.props.team.invitations.map((invitation, index) => {
              return <InvitationTableRow key={invitation.id} index={index} {...invitation}
                                         delete={(index) => this._deleteInvitation(index)}
                                         resendInvitation={(index) => this._resendInvitation(index)}
              />;
            })
          }
          </tbody>
        </table>
      </div>
    );
  }

  _addInvitation(invitation) {
    this.state.invitations.push(invitation);
    this.setState({
      invitations: this.state.invitations,
    });
  }

  _deleteInvitation(index) {
    let action = getAPIAction(["invitations", "delete"]);
    let params = {id: this.state.invitations[index].id};
    this.state.client.action(window.schema, action, params).then((result) => {
      this.state.invitations.splice(index, 1);
      this.setState({
        invitations: this.state.invitations
      });
    });
  }

  _resendInvitation(index) {
    const inviteUrl = getInviteUrl(this.props.team.slug, this.state.invitations[index].id);
    fetch(inviteUrl, {
      method: "POST",
      credentials: 'same-origin',
      headers: {
        'X-CSRFToken': Cookies.get('csrftoken'),
      }
    }).then((response) => {
      if (response.ok) {
        this.state.invitations[index].sent = true;
        this.setState({
          invitations: this.state.invitations,
        });
      }
    });
  }
}


class TeamTableRow extends React.Component {
    render() {
        return (
            <tr>
                <td>{this.props.name}</td>
                <td><a href={this.props.dashboard_url}>View Dashboard</a></td>
                {/*<td>{moment(this.props.created_on).format('MMM Do YYYY, h:mm a')}</td>*/}
                <td className="has-text-right">
                    <button className="button is-text" onClick={() => this.props.edit(this.props.index)}>
                        <span>Edit</span>
                    </button>
                    <button className="button is-text" onClick={() => this.props.delete(this.props.index)}>
                        <span>Delete</span>
                    </button>
                </td>
            </tr>
        );
    }
}

class EditAddTeamWidget extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.team ? props.team.name : "",
            slug: props.team ? props.team.slug : "",
            editMode: Boolean(props.team),
        };
        this.nameChanged = this.nameChanged.bind(this);
        this.slugChanged = this.slugChanged.bind(this);
        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
    }

    render() {
        return (
            <div>
                {this.renderDetails()}
                {this.renderMembers()}
                {this.renderInvitations()}
            </div>
        )
    }

    renderDetails() {
        return (
            <section className="section app-card">
                <form>
                    <h2 className="subtitle">Team Details</h2>
                    <div className="field">
                        <label className="label">Team Name</label>
                        <div className="control">
                            <input className="input" type="text" placeholder="Dunder Mifflin"
                                   onChange={this.nameChanged} value={this.state.name}>
                            </input>
                        </div>
                        <p className="help">Your team name.</p>
                    </div>
                    {this._renderIdField()}
                    <div className="field is-grouped">
                        <div className="control">
                            <button className={`button is-primary ${this.state.editMode ? 'is-outlined' : ''}`}
                                    onClick={this.save}>
                              <span className="icon is-small">
                                  <i className={`fa ${this.state.editMode ? 'fa-check' : 'fa-plus'}`}></i>
                              </span>
                                <span>{this.state.editMode ? 'Save Team' : 'Add Team'}</span>
                            </button>
                        </div>
                        <div className="control">
                            <button className="button is-text" onClick={this.cancel}>
                                <span>Cancel</span>
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        );
    }

    _renderIdField() {
        if (this.state.editMode) {
            return (
                <div className="field">
                    <label className="label">Team ID</label>
                    <div className="control">
                        <input className="input" type="text" placeholder="dunder-mifflin"
                               onChange={this.slugChanged} value={this.state.slug}>
                        </input>
                    </div>
                    <p className="help">A unique ID for your team. No spaces are allowed!</p>
                </div>
            );
        }
    }

    renderMembers() {
        if (this.state.editMode) {
            return (
                <TeamMemberList members={this.props.team.members}/>
            );
        } else {
            return null;
        }

    }

    renderInvitations() {
        if (this.state.editMode) {
            return (
                <InvitationList team={this.props.team}/>
            );

        } else {
            return null;
        }
    }

    nameChanged(event) {
        this.setState({name: event.target.value});
    }

    slugChanged(event) {
        this.setState({slug: event.target.value});
    }

    save(event) {
        this.props.save(this.props.team, this.state.name, this.state.slug);
        event.preventDefault();
    }

    cancel(event) {
        this.props.cancel();
        event.preventDefault();
    }

}


class TeamApplication extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            client: null,
            loading: true,
            teams: null,
            activeObject: null,
        };
        this._initializeTeams = this._initializeTeams.bind(this);
        this._cancelEdit = this._cancelEdit.bind(this);
        this._editTeam = this._editTeam.bind(this);
        this._saveTeam = this._saveTeam.bind(this);
    }

    componentDidMount() {
        this.setState({
            client: client,
        });
        let action = getAPIAction(["teams", "list"]);
        client.action(window.schema, action).then((result) => {
            this._initializeTeams(result.results);
        });
    }

    _initializeTeams(teams) {
        this.setState({
            loading: false,
            teams: teams,
        });
    }

    render() {
        if (this.state.loading) {
            return 'Loading teams...';
        } else if (this.state.editMode) {
            return (
                <EditAddTeamWidget save={this._saveTeam}
                                   cancel={this._cancelEdit}
                                   team={this.state.activeObject}/>

            );
        }
        if (this.state.teams.length === 0) {
            return this.renderEmpty();
        } else {
            return this.renderTeams();
        }
    }

    renderEmpty() {
        return (
            <section className="section app-card">
                <div className="columns">
                    <div className="column is-one-third">
                        <img alt="Nothing Here" src={STATIC_FILES.undraw_team}/>
                    </div>
                    <div className="column is-two-thirds">
                        <h1 className="title is-4">No Teams Yet!</h1>
                        <h2 className="subtitle">Create your first team below to get started.</h2>

                        <p>
                            <a className="button is-primary" onClick={() => this._newTeam()}>
                                <span className="icon is-small"><i className="fa fa-plus"></i></span>
                                <span>Create Team</span>
                            </a>
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    renderTeams() {
        return (
            <section className="section app-card">
                <h1 className="subtitle">My Teams</h1>
                <table className="table is-striped is-fullwidth has-vcentered-cells">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th></th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.teams.map((team, index) => {
                            // https://stackoverflow.com/a/27009534/8207
                            return <TeamTableRow key={team.id} index={index} {...team}
                                                 edit={(index) => this._editTeam(index)}
                                                 delete={(index) => this._deleteTeam(index)}
                            />;
                        })
                    }
                    </tbody>
                </table>
                <button className="button is-primary is-outlined" onClick={() => this._newTeam()}>
                <span className="icon is-small">
                    <i className="fa fa-plus"></i>
                </span>
                    <span>Add Team</span>
                </button>
            </section>
        )
    }

    _newTeam() {
        this.setState({
            editMode: true,
        });
    }

    _editTeam(index) {
        this.setState({
            activeObject: this.state.teams[index],
            editMode: true,
        });
    }

    _deleteTeam(index) {
        let action = getAPIAction(["teams", "delete"]);
        let params = {id: this.state.teams[index].id}
        this.state.client.action(window.schema, action, params).then((result) => {
            this.state.teams.splice(index, 1);
            this.setState({
                teams: this.state.teams
            });
        });
    }

    _saveTeam(team, name, slug) {
        let params = {
            name: name,
        };
        if (Boolean(team)) {
            params['id'] = team.id;
            params['slug'] = slug;

            let action = getAPIAction(["teams", "partial_update"]);
            this.state.client.action(window.schema, action, params).then((result) => {
                // find the appropriate item in the list and update in place
                for (var i = 0; i < this.state.teams.length; i++) {
                    if (this.state.teams[i].id === result.id) {
                        this.state.teams[i] = result;
                    }
                }
                this.setState({
                    editMode: false,
                    activeObject: null,
                    teams: this.state.teams,
                });
            });
        } else {
            let action = getAPIAction(["teams", "create"]);
            this.state.client.action(window.schema, action, params).then((result) => {
                this.state.teams.push(result);
                this.setState({
                    editMode: false,
                    activeObject: null,
                    teams: this.state.teams,
                });
            });
        }
    }

    _cancelEdit(name, value) {
        this.setState({
            editMode: false,
            activeObject: null,
        });
    }

}


let auth = new coreapi.auth.SessionAuthentication({
    csrfCookieName: 'csrftoken',
    csrfHeaderName: 'X-CSRFToken'
});
let client = new coreapi.Client({auth: auth});
let domContainer = document.querySelector('#team-content');
domContainer ? ReactDOM.render(
    <TeamApplication/>
    , domContainer) : null;
