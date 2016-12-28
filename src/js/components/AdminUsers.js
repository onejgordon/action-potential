var React = require('react');

var SimpleAdmin = require('components/SimpleAdmin');
var LoadStatus = require('components/LoadStatus');
var AppConstants = require('constants/AppConstants');
var util = require('utils/util');
import connectToStores from 'alt-utils/lib/connectToStores';
import history from 'config/history'

// @connectToStores
export default class AdminManage extends React.Component {
    static defaultProps = {}
    constructor(props) {
        super(props);
        this.state = {
            tab: "users"
        };
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

                <h1><i className="fa fa-wrench"></i> Admin Manage</h1>

                <ul className="nav nav-pills">
                    { _tabs }
                </ul>

                <SimpleAdmin {...props} />

            </div>
        );
    }
}

module.exports = AdminManage;