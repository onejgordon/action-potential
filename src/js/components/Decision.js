var React = require('react');
import { withRouter } from 'react-router'

var LoadStatus = require('components/LoadStatus');
var AppConstants = require('constants/AppConstants');
var util = require('utils/util');
var api = require('utils/api');
var bootbox = require('bootbox');
import {merge} from 'lodash';
var AppConstants = require('constants/AppConstants');
var Proposal = require('components/Proposal');
var ReactTooltip = require('react-tooltip');
import {Creatable} from 'react-select';
import {AppBar, List, MenuItem,
    RaisedButton, FontIcon, Toggle,
    FloatingActionButton, IconButton,
    Dialog, FlatButton, TextField,
    Toolbar, ToolbarGroup, ToolbarTitle,
    BottomNavigation, BottomNavigationItem } from 'material-ui';
var toastr = require('toastr');
import {changeHandler} from 'utils/component-utils';

var base = require('config/base');

@changeHandler
export default class Decision extends React.Component {
    static defaultProps = {
      user: null
    }

    constructor(props) {
      super(props);
      this.state = {
        proposals: {},
        decision: {},
        loading: true,
        editing: null,
        invite_link_showing: false,
        help_showing: false
      };
    }

    componentDidMount() {
      var {user} = this.props;
      if (user) this.init();
    }

    componentDidUpdate(prevProps, prevState) {
      var {user} = this.props;
      var got_user = prevProps.user == null && user != null;
      if (got_user) this.init();
    }

    componentWillUnmount() {
      base.removeBinding(this.ref_proposals);
      base.removeBinding(this.ref_decision);
    }

    init() {
      var {decisionId} = this.props.params;
      var {user} = this.props;
      this.setState({loading: true}, () => {
        this.ref_proposals = base.syncState(`proposals/${decisionId}`, {
          context: this,
          state: 'proposals',
          then: () => {
            this.setState({loading: false});
          }
        });
        this.ref_decision = base.syncState(`decisions/${decisionId}`, {
          context: this,
          state: 'decision'
        });
      })
    }


    begin_edit(type, id, prop, _prompt, _multiline) {
      var prompt = _prompt || "Enter new value";
      var multiline = _multiline == null ? false : _multiline;
      var value = '';
      var state = this.state;
      if (type == AppConstants.DECISION) value = state.decision[prop];
      else if (type == AppConstants.PROPOSAL) value = state.proposals[id][prop];
      this.setState({
        editing: {
          prompt: prompt,
          value: value,
          type: type, // Path to update in state, e.g. ['proposals','xlksjf21','text']
          id: id, // null for decision, otherwise id of proposal to update
          prop: prop, // Property to update
          multiline: multiline
        }
      })
    }

    finish_edit() {
      var state = this.state;
      var st = {editing: null};
      var {prop, type, value, id} = state.editing;
      if (type == AppConstants.DECISION) {
        var target = state.decision;
        target[prop] = value;
        st.decision = target;
      } else if (type == AppConstants.PROPOSAL) {
        var target = state.proposals;
        target[id][prop] = value;
        st.proposals = target;
      }
      this.setState(st);
    }

    cancel_edit() {
      this.setState({editing: false});
    }

    valid_new_option(o) {
      var {decision} = this.state;
      var under_limit = decision.custom_metrics == null || decision.custom_metrics.length < AppConstants.MAX_CUSTOM_METRICS;
      var option_ok = o && o.label && o.label.length > 1;
      return under_limit && option_ok;
    }

    create_proposal() {
      var {user} = this.props;
      var {decisionId} = this.props.params;
      var now = new Date();
      var {proposals} = this.state;
      var id = util.randomId(10);
      proposals[id] = {
        id: id,
        creator: user.uid,
        text: "New proposal. Click to add details.",
        ts_created: now.getTime(),
        decisionId: decisionId
      }
      this.setState({proposals});
    }

    update_proposal(p) {
      var {proposals} = this.state;
      proposals[p.id] = p;
      this.setState({proposals});
    }

    delete_proposal(p) {
      var {proposals} = this.state;
      proposals[p.id] = null;
      this.setState({proposals}, () => {
        toastr.success("Proposal deleted");
      });
    }

    set_decision_prop(prop, value) {
      var {decision} = this.state;
      decision[prop] = value;
      this.setState({decision: decision});
    }

    proposal_score(p) {
      var d = this.state.decision;
      if (d && p) {
        // TODO: Implement weights
        var score = 0;
        var pros_cons_weight = 1.0;
        var custom_metrics_weight = 1.0;
        if (d.pros_cons_enabled && p.pros){
          Object.keys(p.pros).forEach((pro_id) => {
            var voters = p.pros[pro_id].voters;
            if (voters) score += voters.length * pros_cons_weight;
          });
        }
        if (d.pros_cons_enabled &&p.cons){
          Object.keys(p.cons).forEach((con_id) => {
            var voters = p.cons[con_id].voters;
            if (voters) score -= voters.length * pros_cons_weight;
          });
        }
        if (d.custom_met_enabled && d.custom_metrics && p.custom_metrics) {
          p.custom_metrics.forEach((metric) => {
            var votes = [];
            Object.keys(metric).forEach((voter_id) => {
              var vote = metric[voter_id];
              votes.push(vote);
            })
            score += util.average(votes);
          });
        }
        return score;
      }
      return null;
    }

    score_analysis() {
      var score_lookup = {}; // p.id -> score
      var top_score = 0;
      var top_proposal;
      var proposals = [];
      Object.keys(this.state.proposals).forEach((pid) => {
        var p = this.state.proposals[pid];
        var score = this.proposal_score(p);
        score_lookup[p.id] = score;
        if (score > top_score) {
          top_score = score;
          top_proposal = p;
        }
        proposals.push(p);
      });
      proposals.sort((a, b) => {
        var a_score = score_lookup[a.id];
        var b_score = score_lookup[b.id];
        if (a_score == b_score) return a.toString() - b.toString();
        else {
          return b_score - a_score;
        }
      });
      return {top_score, top_proposal, score_lookup, proposals};
    }

    handle_title_click() {
      this.begin_edit(AppConstants.DECISION, null, 'title', "Edit title");
    }

    toggle_invite_link() {
      this.setState({invite_link_showing: !this.state.invite_link_showing});
    }

    toggle_help() {
      this.setState({help_showing: !this.state.help_showing});
    }

    back() {
      this.props.router.push('/app/main');
    }

    render_help() {
      return (
        <Dialog title="Help" open={this.state.help_showing} onRequestClose={this.toggle_help.bind(this)}>

          <p>
            Give your decision (problem, question, issue) a name, and add descriptive details, then invite
            others by sharing the link. All collaborators can:
          </p>

          <ul>
            <li>Add proposals</li>
            <li>Add resource URLs relevant to proposals</li>
            <li>Add and +1 pros/cons</li>
            <li>Define and provide ratings for custom metrics (if enabled)</li>
          </ul>

        </Dialog>
      )
    }
    render_column_headers() {
      var {decision} = this.state;
      var columns = [];
      if (decision.pros_cons_enabled) columns = [
        {label: AppConstants.PRO_LABEL, icon: <i className="fa fa-plus-circle"/>},
        {label: AppConstants.CON_LABEL, icon: <i className="fa fa-minus-circle"/>}
      ];
      if (decision.custom_met_enabled && decision.custom_metrics) decision.custom_metrics.forEach((metric) => {
        columns.push({label: metric, icon: <i className="fa fa-user"/>});
      });
      var col_cls = util.col_class(columns.length);
      var col_cls = col_cls + " text-center";
      return columns.map((col, i) => {
        var icon = col.icon;
        return (<div className={col_cls} key={i}>
          <b>{icon} { col.label }</b>
        </div>);
      });
    }

    render_editor() {
      var {editing} = this.state;
      var actions = [
        <FlatButton onClick={this.finish_edit.bind(this)} label="Done" primary={true} />,
        <FlatButton onClick={this.cancel_edit.bind(this)} label="Cancel" />
      ]
      if (editing) {
        return (
          <Dialog title={editing.prompt} actions={actions} open={true} onRequestClose={this.cancel_edit.bind(this)}>
            <TextField
                autoFocus
                floatingLabelText={editing.prompt}
                value={editing.value}
                multiLine={editing.multiline}
                onChange={this.changeHandler.bind(this, 'editing', 'value')} fullWidth={true} />
          </Dialog>
        )
      }
      return <Dialog actions={actions} open={false}/>;
    }

    render() {
      var _content, _top_proposal, _invite;
      var {decision, invite_link_showing, loading} = this.state;
      if (loading) return <LoadStatus loading={true} />
      var {score_lookup, top_score, top_proposal, proposals} = this.score_analysis();
      if (decision) {
        var _metrics_selector;
        if (decision.custom_met_enabled) {
          var multi_vals = [];
          try {
            if (decision.custom_metrics) multi_vals = decision.custom_metrics.map((val) => { return {value: val, label: val}});
          } catch (e) {
            console.warn(e);
          }
          var max_metrics = decision.custom_metrics != null && decision.custom_metrics.length >= AppConstants.MAX_CUSTOM_METRICS;
          var prompt = max_metrics ? "Maximum metrics" : "Enter new metrics name";
          _metrics_selector = <Creatable
                                noResultsText={prompt}
                                placeholder="Add metrics..."
                                addLabelText="Add metric {label}?"
                                multi={true} options={[]} value={multi_vals}
                                onChange={this.changeHandlerMultiVal.bind(this, 'decision', 'custom_metrics')}
                                isValidNewOption={this.valid_new_option.bind(this)} />
        }
        if (invite_link_showing) {
          var link = `${AppConstants.BASE_URL}/app/join?id=${decision.id}`;
          _invite = (
          <div style={{padding: "10px"}}>
            <div className="well">
              <label>Invite collaborators <a href="javascript:void(0" onClick={this.toggle_invite_link.bind(this)}><i className="fa fa-close"/></a></label>
              <input className="form-control" value={link} type="text" />
            </div>
          </div>
          )
        }
        _content = (
        <div>

          { _invite }

          <div className="vpad">
            <div className="row">
              <div className="col-sm-8">
                <h2 className="center-upper">Problem / Decision Details</h2>
                <p className="lead editable" style={{padding: '10px'}} onClick={this.begin_edit.bind(this, AppConstants.DECISION, null, 'text', "Edit text / details", true)}><i className="fa fa-pencil show_hover" /> { decision.text || "Not details yet." }</p>
              </div>
              <div className="col-sm-4 settings">
                <h2 className="center-upper">Settings</h2>
                <Toggle label="Pros & Cons" toggled={decision.pros_cons_enabled} onToggle={this.changeHandlerToggle.bind(this, 'decision', 'pros_cons_enabled')} />
                <Toggle label="Custom Metrics" toggled={decision.custom_met_enabled} onToggle={this.changeHandlerToggle.bind(this, 'decision', 'custom_met_enabled')}/>
                { _metrics_selector }
                <p className="gray">Max - two. Metrics should be named such that higher is better.</p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-8 col-sm-offset-4">
              <div className="row">
                { this.render_column_headers() }
              </div>
            </div>
          </div>

          { proposals.length == 0 ? <div className="empty" style={{marginTop: "15px"}}>No proposals yet. Click the plus icon to create the first.</div> : null }

          { proposals.map((p, i) => {
            var score = score_lookup[p.id];
            var top = false;
            if (top_score == score) top = true;
            return <Proposal key={i} proposal={p}
                      decision={decision} user={this.props.user}
                      score={score} top={top}
                      onProposalUpdate={this.update_proposal.bind(this)}
                      onProposalDelete={this.delete_proposal.bind(this)}
                      onRequestEdit={this.begin_edit.bind(this)} />
          }) }

          <div className="pull-right">
            <FloatingActionButton onClick={this.create_proposal.bind(this)}><FontIcon className="material-icons">add</FontIcon></FloatingActionButton>
          </div>

        </div>
        );
      }
      return (
        <div>

          <Toolbar style={{backgroundColor: "#3587FF", color: "#FFF"}}>
            <ToolbarGroup>
              <ToolbarTitle style={{color: "#FFF", cursor: 'pointer'}} text={decision ? decision.title : "Loading..."} onClick={this.handle_title_click.bind(this)} />
            </ToolbarGroup>
            <ToolbarGroup>
              <IconButton
                tooltip="Back"
                iconStyle={{color: "white"}}
                onClick={this.back.bind(this)}
                iconClassName="material-icons">keyboard_arrow_left</IconButton>

              <IconButton
                tooltip="Invite"
                iconStyle={{color: "white"}}
                onClick={this.toggle_invite_link.bind(this)}
                iconClassName="material-icons">person_add</IconButton>

              <IconButton
                tooltip="Help"
                iconStyle={{color: "white"}}
                onClick={this.toggle_help.bind(this)}
                iconClassName="material-icons">help</IconButton>

            </ToolbarGroup>
          </Toolbar>

          { _content }

          { this.render_editor() }
          { this.render_help() }

        </div>
      );
    }
}

export default withRouter(Decision)