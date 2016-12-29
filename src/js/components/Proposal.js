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
var toastr = require('toastr');
import {Paper, List, RaisedButton,
    FlatButton, TextField, IconMenu, MenuItem,
    FontIcon, IconButton} from 'material-ui';
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
      this.props.onRequestEdit(AppConstants.PROPOSAL, p.id, prop, prompt, true);
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
        var uri = new_resource.uri;
        var valid = uri.length > 5 && uri.startsWith('http');
        if (valid) {
            p.resources.push({
                uri: new_resource.uri,
                title: new_resource.uri // TODO
            });
            this.update(p);
            this.cancel_resource();
        } else {
            toastr.error("Invalid URL - Make sure it starts with http");
        }
    }

    cancel_resource() {
        this.setState({new_resource: null});
    }

    delete_resource(i) {
        var p = this.props.proposal;
        p.resources.splice(i, 1);
        this.update(p);
    }

    delete() {
        // Delete proposal
        var p = this.props.proposal;
        this.props.onProposalDelete(p);
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
        var _text = p.text;
        if (new_resource) {
            _add_resource = (
                <div>
                    <TextField value={new_resource.uri} onChange={this.changeHandler.bind(this, 'new_resource', 'uri')} placeholder="Enter resource URL" />
                    <FlatButton onClick={this.add_resource.bind(this)} label="Add" primary={true} />
                    <FlatButton onClick={this.cancel_resource.bind(this)} label="Cancel" />
                </div>
            );
        } else {
            _add_resource = (
                <small><a href="javascript:void(0)" onClick={this.start_add_resource.bind(this)} className="black-transp"><i className="fa fa-plus" /> Add resource</a></small>
            );
        }
        var _cols;
        if (p) _cols = this.render_columns();
        var _resources;
        if (p.resources) _resources = (
            <ul className="resources">
            { p.resources.map((r, i) => {
                return (
                    <li>
                        <a href={ r.uri } target="_blank" className="black-transp"><i className="fa fa-globe"></i> { r.title || r.uri }</a>&nbsp;
                        <a href="javascript:void(0)" onClick={this.delete_resource.bind(this, i)} className="red show_hover"><i className="fa fa-trash"/></a>
                    </li>
                );
            }) }
            </ul>
        );
        var st = {};
        if (score != null) {
            var label_cls = top ? 'success' : 'default';
            var icon = top ? <i className="fa fa-check"/> : <i className="fa fa-star"/>;
            _score = <span className={"score label label-"+label_cls}>{icon} { score.toFixed(1) }</span>
        }
        if (sentences.length > 0) {
          var lead = sentences.splice(0, 1)[0];
          _text = (
            <div onClick={this.request_edit.bind(this, 'text', 'Edit proposal text')} className="editable">
                { _score }
                <i className="fa fa-pencil show_hover" /> <b>{lead}.</b> { sentences.join('.') }
            </div>
        );
        }
        var cls = "proposal";
        if (top) {
            cls = cls + " proposal-top";
            // st.backgroundColor = "#D8FEEB";
        }
        if (score < 0) {
            cls = cls + " proposal-negative";
        }
        var _menu = (
            <div className="show_hover" style={{position: 'absolute', top: '0px', right: '0px'}}>
                <IconMenu iconButtonElement={<IconButton iconClassName="material-icons">more_vert</IconButton>}>
                    <MenuItem leftIcon={<FontIcon className="material-icons">delete</FontIcon>} onClick={this.delete.bind(this)} primaryText="Delete" />
                </IconMenu>
            </div>
        );
        return (
            <div style={{position: 'relative'}}>
                <Paper className={cls} key={p.id} style={st}>
                    <div className="row">
                        <div className="col-sm-4">
                            { _text }
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
                { _menu }
            </div>
        );
    }
}
