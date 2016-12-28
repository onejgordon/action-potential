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
    Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui';
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
        editing: null
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

    handle_title_click() {
      this.begin_edit(AppConstants.DECISION, null, 'title', "Edit title");
    }

    render_column_headers() {
      var {decision} = this.state;
      var columns = [];
      if (decision.pros_cons_enabled) columns = [AppConstants.PRO_LABEL, AppConstants.CON_LABEL];
      if (decision.custom_met_enabled && decision.custom_metrics) columns = columns.concat(decision.custom_metrics);
      var col_cls = util.col_class(columns.length);
      var col_cls = col_cls + " text-center";
      return columns.map((col, i) => {
        return (<div className={col_cls} key={i}>
          <b>{ col }</b>
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
      var _content;
      var {decision} = this.state;
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
        _content = (
        <div>

          <div className="row settings">
            <div className="col-sm-4 col-sm-offset-8">
              <Toggle label="Pros & Cons" toggled={decision.pros_cons_enabled} onToggle={this.changeHandlerToggle.bind(this, 'decision', 'pros_cons_enabled')} />
              <Toggle label="Custom Metrics" toggled={decision.custom_met_enabled} onToggle={this.changeHandlerToggle.bind(this, 'decision', 'custom_met_enabled')}/>
              { _metrics_selector }
            </div>
          </div>

          <div className="row">
            <div className="col-sm-4 col-sm-offset-8">
              <div className="row">
                { this.render_column_headers() }
              </div>
            </div>
          </div>

          { util.flattenDict(this.state.proposals).map((p) => {
            return <Proposal proposal={p} decision={decision} user={this.props.user}
                      onProposalUpdate={this.update_proposal.bind(this)}
                      onRequestEdit={this.begin_edit.bind(this)} />
          }) }

          <div className="pull-right">
            <FloatingActionButton onClick={this.create_proposal.bind(this)}><FontIcon className="material-icons">add</FontIcon></FloatingActionButton>
          </div>

          <ReactTooltip place="top" effect="solid" />
        </div>
        );
      }
      return (
        <div>

          <Toolbar style={{backgroundColor: "#3587FF", color: "#FFF"}}>
            <ToolbarGroup>
              <ToolbarTitle style={{color: "#FFF"}} text={decision ? decision.title : "Loading..."} onClick={this.handle_title_click.bind(this)} />
            </ToolbarGroup>
          </Toolbar>

          { _content }

          {this.render_editor()}

        </div>
      );
    }
}
