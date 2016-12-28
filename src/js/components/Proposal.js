var React = require('react');

var SimpleAdmin = require('components/SimpleAdmin');
var LoadStatus = require('components/LoadStatus');
var AppConstants = require('constants/AppConstants');
var util = require('utils/util');
var FetchedList = require('components/FetchedList');
var api = require('utils/api');
var bootbox = require('bootbox');
var ProposalProCon = require('components/ProposalProCon');
var ProposalCustomMetric = require('components/ProposalCustomMetric');
import {Paper, List, MenuItem, RaisedButton,
    FlatButton, TextField} from 'material-ui';
import {changeHandler} from 'utils/component-utils';

@changeHandler
export default class Proposal extends React.Component {
    static defaultProps = {
        proposal: null,
        decision: null,
        user: null,
        columns: [],
        score: null,
        top: false
    }
    constructor(props) {
        super(props);
        this.state = {
            new_resource: null
        };
    }

    do_delete() {
    }

    confirm_delete() {
        var that = this;
        bootbox.confirm("Really delete?", function(ok) {
            if (ok) {
                that.do_delete();
            }
        });
    }

    request_edit(prop, prompt) {
      var p = this.props.proposal;
      this.props.onRequestEdit(AppConstants.PROPOSAL, p.id, prop, prompt);
    }

    update(p) {
        this.props.onProposalUpdate(p);
    }

    start_add_resource() {
        this.setState({new_resource: {
            uri: "",
            title: ""
        }});
    }

    add_resource() {
        var {new_resource} = this.state;
        var p = this.props.proposal;
        if (!p.resources) p.resources = [];
        p.resources.push({
            uri: new_resource.uri,
            title: new_resource.uri // TODO
        });
        this.update(p);
        this.cancel_resource();
    }

    cancel_resource() {
        this.setState({new_resource: null});
    }

    render_column(cls, key, content) {
        return <div className={cls} key={key}>{ content }</div>
    }

    render_columns() {
        var {decision, proposal, user, top} = this.props;
        var n_cols = 2 * (decision.pros_cons_enabled ? 1 : 0) + ((decision.custom_met_enabled && decision.custom_metrics) ? decision.custom_metrics.length : 0);
        var col_cls = util.col_class(n_cols);
        var cols = [];
        if (decision.pros_cons_enabled) {
            cols.push(this.render_column(col_cls, 'pro', <ProposalProCon type_int={AppConstants.PRO} onUpdate={this.update.bind(this)} proposal={proposal} user={user} />));
            cols.push(this.render_column(col_cls, 'con', <ProposalProCon type_int={AppConstants.CON} onUpdate={this.update.bind(this)} proposal={proposal} user={user} />));
        }
        if (decision.custom_met_enabled && decision.custom_metrics) {
            decision.custom_metrics.forEach((metric, i) => {
                cols.push(this.render_column(col_cls, metric, <ProposalCustomMetric metric_index={i} proposal={proposal} decision={decision} user={user} onUpdate={this.update.bind(this)} />));
            });
        }
        return cols;
    }

    render() {
        var _add_resource, _score;
        var p = this.props.proposal;
        var {decision, score, top} = this.props;
        var {new_resource} = this.state;
        var sentences = p.text.split('.');
        var text = p.text;
        if (sentences.length > 0) {
          var lead = sentences.splice(0, 1)[0];
          text = <div onClick={this.request_edit.bind(this, 'text', 'Edit proposal text')} className="editable"><i className="fa fa-pencil show_hover" /> <b>{lead}.</b> { sentences.join('.') }</div>
        }
        if (new_resource) {
            _add_resource = (
                <div>
                    <TextField value={new_resource.uri} onChange={this.changeHandler.bind(this, 'new_resource', 'uri')} placeholder="Enter resource URL" />
                    <FlatButton onClick={this.add_resource.bind(this)} label="Add" />
                    <FlatButton onClick={this.cancel_resource.bind(this)} label="Cancel" />
                </div>
            );
        } else {
            _add_resource = (
                <small><a href="javascript:void(0)" onClick={this.start_add_resource.bind(this)} className="gray"><i className="fa fa-plus" /> Add resource</a></small>
            );
        }
        var _cols;
        if (p) _cols = this.render_columns();
        var _resources;
        if (p.resources) _resources = (
            <ul>
            { p.resources.map((r) => {
                return <li><a href={ r.uri }><i className="fa fa-globe"></i> { r.title || r.uri }</a></li>
            }) }
            </ul>
        );
        var st = {};
        if (score != null) _score = <span className="badge badge-default">Score: { score }</span>
        if (top) st.backgroundColor = "#D8FEEB";
        return (
            <Paper className="proposal" key={p.id} style={st}>
                <div className="row">
                    <div className="col-sm-4">
                      { _score }
                      { text }
                      { _resources }
                      { _add_resource }
                    </div>
                    <div className="col-sm-8">
                        <div className="row">
                            { _cols }
                        </div>
                    </div>
                </div>

            </Paper>
        );
    }
}
