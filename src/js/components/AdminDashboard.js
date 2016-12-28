var React = require('react');

var SimpleAdmin = require('components/SimpleAdmin');
var LoadStatus = require('components/LoadStatus');
var AppConstants = require('constants/AppConstants');
var util = require('utils/util');
var FetchedList = require('components/FetchedList');
var api = require('utils/api');
var mui = require('material-ui'),
  List = mui.List,
  ListItem = mui.ListItem,
  TextField = mui.TextField,
  FontIcon = mui.FontIcon,
  Tabs = mui.Tabs,
  Tab = mui.Tab,
  RaisedButton = mui.RaisedButton;

export default class AdminDashboard extends React.Component {
    static defaultProps = {}
    constructor(props) {
        super(props);
        this.state = {
            tab: "users"
        };
        this.REVIEW_STATUS = 2;
    }

    review_message(m, action) {
        var that = this;
        api.post(`/api/message/${m.id}/action/${action}`, {}, function(res) {
            that.refs.messages.remove_item_by_key(m.id, 'id');
        });
    }

    review_transcription(tx, action) {
        var that = this;
        api.post(`/api/transcription/${tx.id}/action/${action}`, {}, function(res) {
            that.refs.transcriptions.remove_item_by_key(tx.id, 'id');
        });
    }

    render_ml(ml) {
        return (<li className="list-group-item">
            <span className="title">{ ml.id }</span>
        </li>)
    }

    render_review_message(m) {
        return (<li className="list-group-item">
            <span className="title">{ m.id }</span>
            <span hidden={!m.audio_uri}><a href={m.audio_uri} target="_blank" className="right"><i className="fa fa-play"/> Play</a></span>
            <a href="javascript:void(0)" className="right" onClick={this.review_message.bind(this, m, 'approve')}><i className="fa fa-check"/> Approve</a>
            <a href="javascript:void(0)" className="right" onClick={this.review_message.bind(this, m, 'hide')}><i className="fa fa-close"/> Hide</a>
        </li>)
    }

    render_review_transcription(tx) {
        return (<li className="list-group-item">
            <span className="title" title={tx.text}>{ util.truncate(tx.text, 30) }</span>
            <span className="sub">{ tx.message_id }</span>
            <a href="javascript:void(0)" className="right" onClick={this.review_transcription.bind(this, tx, 'approve')}><i className="fa fa-check"/> Approve</a>
            <a href="javascript:void(0)" className="right" onClick={this.review_transcription.bind(this, tx, 'hide')}><i className="fa fa-close"/> Hide</a>
        </li>)
    }

    gotoTab(tab) {
        this.setState({tab: tab});
    }

    render() {
        var props;
        var that = this;
        var tab = this.state.tab;
        var tabs = [
            {id: 'users', label: "Users"},
            {id: 'organizations', label: "Organizations"}
        ];
        if (tab == "users") {
            var level_opts = AppConstants.USER_LABELS.map(function(label, i) {
                return { lab: label, val: i + 1};
            })
            props = {
                'url': "/api/user",
                'id': 'sa',
                'entity_name': "Users",
                'attributes': [
                    { name: 'id', label: "ID", clickAction: 'detail' },
                    { name: 'name', label: "Name", editable: true },
                    { name: 'phone', label: "Phone", editable: true },
                    { name: 'email', label: "Email", editable: true },
                    { name: 'level', label: "Level", editable: true, editOnly: true, inputType: "select", opts: level_opts },
                    { name: 'password', label: "Password", editable: true, editOnly: true }
                ],
                'add_params': {},
                'unique_key': 'id',
                'max': 50,
                detail_url: function(u) { return `/app/admin/user/${u.id}`; },
                getListFromJSON: function(data) { return data.data.users; },
                getObjectFromJSON: function(data) { return data.data.user; }
            }
        } else if (tab == "organizations") {
            props = {
                'url': "/api/organization",
                'id': 'sa',
                'entity_name': "Organizations",
                'attributes': [
                    { name: 'id', label: "ID" },
                    { name: 'name', label: "Name", editable: true }
                ],
                'add_params': {},
                'unique_key': 'id',
                'max': 50,
                getListFromJSON: function(data) { return data.data.organizations; },
                getObjectFromJSON: function(data) { return data.data.organization; }
            }
        }
        var _tabs = tabs.map(function(t, i, arr) {
            var here = this.state.tab == t.id;
            var cn = here ? "active" : "";
            return <li role="presentation" data-t={t.id} className={cn}><a href="javascript:void(0)" onClick={this.gotoTab.bind(this, t.id)}>{t.label}</a></li>
        }, this);
        return (
            <div>

                <h1><i className="fa fa-dashboard"></i> Admin Dashboard</h1>

                <ul className="nav nav-pills">
                    { _tabs }
                </ul>

                <SimpleAdmin {...props} />

                <Tabs>
                    <Tab label="Review Messages">

                        <FetchedList url="/api/message" ref="messages" params={{status: this.REVIEW_STATUS}} listProp="messages" renderItem={this.render_review_message.bind(this)} autofetch={true} />

                    </Tab>

                    <Tab label="Review Transcriptions">

                        <FetchedList url="/api/transcription" ref="transcriptions" params={{status: this.REVIEW_STATUS}} listProp="transcriptions" renderItem={this.render_review_transcription.bind(this)} autofetch={true} />

                    </Tab>

                    <Tab label="Message Logs">

                        <FetchedList url="/api/msglog" ref="mls" listProp="msglogs" renderItem={this.render_ml.bind(this)} />
                    </Tab>

                </Tabs>

            </div>
        );
    }
}
