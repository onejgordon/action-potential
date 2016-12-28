var React = require('react');

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
import {changeHandler} from 'utils/component-utils';

var Rebase = require('re-base');
var base = Rebase.createClass({
      apiKey: "AIzaSyASFn2mDGbmRYbgk36SNJNME5qe8HLLf4w",
      authDomain: "action-potential.firebaseapp.com",
      databaseURL: "https://action-potential.firebaseio.com",
      storageBucket: "action-potential.appspot.com",
}, 'action-potential-app');

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
        loading: false,
        editing: null,
        invite_link_showing: false
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
      this.ref_proposals = base.syncState(`proposals/${decisionId}`, {
        context: this,
        state: 'proposals'
      });
      this.ref_decision = base.syncState(`decisions/${decisionId}`, {
        context: this,
        state: 'decision'
      });
    }


    begin_edit(type, id, prop, _prompt) {
      var prompt = _prompt || "Enter new value";
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
          prop: prop // Property to update
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
        text: "New proposal",
        ts_created: now.getTime()
      }
      this.setState({proposals});
    }

    update_proposal(p) {
      var {proposals} = this.state;
      proposals[p.id] = p;
      this.setState({proposals});
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

    score_analysis(proposals) {
      var score_lookup = {}; // p.id -> score
      var top_score = 0;
      var top_proposal;
      proposals.forEach((p) => {
        var score = this.proposal_score(p);
        score_lookup[p.id] = score;
        if (score > top_score) {
          top_score = score;
          top_proposal = p;
        }
      });
      return {top_score, top_proposal, score_lookup};
    }

    handle_title_click() {
      this.begin_edit(AppConstants.DECISION, null, 'title', "Edit title");
    }

    toggle_invite_link() {
      this.setState({invite_link_showing: !this.state.invite_link_showing});
    }

    back() {
      this.props.router.push('/app/main');
    }

    render_column_headers() {
      var {decision} = this.state;
      var columns = [];
      if (decision.pros_cons_enabled) columns = [
        {label: AppConstants.PRO_LABEL},
        {label: AppConstants.CON_LABEL}
      ];
      if (decision.custom_met_enabled && decision.custom_metrics) decision.custom_metrics.forEach((metric) => {
        columns.push({label: metric, custom: true});
      });
      var col_cls = util.col_class(columns.length);
      var col_cls = col_cls + " text-center";
      return columns.map((col, i) => {
        var icon = col.custom ? <i className="fa fa-user"/> : null;
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
          <Dialog title={editing.prompt} actions={actions} open={true}>
            <TextField floatingLabelText={editing.prompt} value={editing.value} onChange={this.changeHandler.bind(this, 'editing', 'value')} fullWidth={true} />
          </Dialog>
        )
      }
      return <Dialog actions={actions} open={false}/>;
    }

    render() {
      var _content, _top_proposal, _invite;
      var {decision, invite_link_showing} = this.state;
      var proposals = util.flattenDict(this.state.proposals);
      var {score_lookup, top_score, top_proposal} = this.score_analysis(proposals);
      if (top_proposal) {
        _top_proposal = (
          <div className="top_proposal">
            <small style={{textTransform: 'uppercase'}}>Top proposal</small>
            <h2><i className="fa fa-chevron-right"/> { top_proposal.text }</h2>
            <span className="badge badge-success">{ top_score } pts</span>
          </div>
          )
      }
      if (decision) {
        var _metrics_selector;
        if (decision.custom_met_enabled) {
          var multi_vals = [];
          try {
            if (decision.custom_metrics) multi_vals = decision.custom_metrics.map((val) => { return {value: val, label: val}});
          } catch (e) {
            console.warn(e);
          }
          _metrics_selector = <Creatable
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

          <div className="row ">
            <div className="col-sm-8">
              <p className="lead editable" style={{padding: '10px'}} onClick={this.begin_edit.bind(this, AppConstants.DECISION, null, 'text', "Edit text / details")}><i className="fa fa-pencil show_hover" /> { decision.text || "Not details yet." }</p>
            </div>
            <div className="col-sm-4">
              <div className="settings">
                <h2 className="center-upper">Settings</h2>
                <Toggle label="Pros & Cons" toggled={decision.pros_cons_enabled} onToggle={this.changeHandlerToggle.bind(this, 'decision', 'pros_cons_enabled')} />
                <Toggle label="Custom Metrics" toggled={decision.custom_met_enabled} onToggle={this.changeHandlerToggle.bind(this, 'decision', 'custom_met_enabled')}/>
                { _metrics_selector }
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

          { proposals.map((p) => {
            var score = score_lookup[p.id];
            var top = false;
            if (top_score == score) top = true;
            return <Proposal proposal={p}
                      decision={decision} user={this.props.user}
                      score={score} top={top}
                      onProposalUpdate={this.update_proposal.bind(this)}
                      onRequestEdit={this.begin_edit.bind(this)} />
          }) }

          <div className="pull-right">
            <FloatingActionButton onClick={this.create_proposal.bind(this)}><FontIcon className="material-icons">add</FontIcon></FloatingActionButton>
          </div>

          { _top_proposal }

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
                color="white"
                onClick={this.back.bind(this)}
                iconClassName="material-icons">keyboard_arrow_left</IconButton>

              <IconButton
                tooltip="Invite"
                color="white"
                onClick={this.toggle_invite_link.bind(this)}
                iconClassName="material-icons">person_add</IconButton>

            </ToolbarGroup>
          </Toolbar>

          { _content }

          {this.render_editor()}

        </div>
      );
    }
}
