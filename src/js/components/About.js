var React = require('react');

var SimpleAdmin = require('components/SimpleAdmin');
var LoadStatus = require('components/LoadStatus');
var AppConstants = require('constants/AppConstants');
var util = require('utils/util');
var FetchedList = require('components/FetchedList');
var ServiceConfigurer = require('components/shared/ServiceConfigurer');
var api = require('utils/api');
var bootbox = require('bootbox');
var UserActions = require('actions/UserActions');
var UserStore = require('stores/UserStore');
import {clone, merge} from 'lodash';
var mui = require('material-ui'),
  List = mui.List,
  ListItem = mui.ListItem,
  TextField = mui.TextField,
  FontIcon = mui.FontIcon,
  Tabs = mui.Tabs,
  Tab = mui.Tab,
  Toggle = mui.Toggle,
  Dialog = mui.Dialog,
  DatePicker = mui.DatePicker,
  IconButton = mui.IconButton,
  RaisedButton = mui.RaisedButton;
import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
export default class About extends React.Component {
    static defaultProps = {}
    constructor(props) {
        super(props);
        this.state = {
            form: {
                services_enabled: []
            },
            unsaved: false
        };
    }

    static getStores() {
        return [UserStore];
    }

    static getPropsFromStores() {
        var st = UserStore.getState();
        return st;
    }


    componentDidMount() {
        var user = this.props.user;
        if (user) {
          this.setState({form: {
            id: user.id,
            services_enabled: user.services_enabled,
            service_settings: user.service_settings
          }});
        } else console.error("User not available during mount");
    }

    toggle_service(service_alias) {
        var form = this.state.form;
        util.toggleInList(form.services_enabled, service_alias);
        this.setState({form: form, unsaved: true});
    }

    save() {
        var form = clone(this.state.form);
        var data = {
            id: form.id,
            services_enabled: form.services_enabled.join(','),
            service_settings: form.service_settings != null ? JSON.stringify(form.service_settings) : null
        }
        this.setState({unsaved: false});
        UserActions.update(data);
    }

    handle_service_setting_change(svc_key, data) {
        var form = this.state.form;
        if (form.service_settings == null) form.service_settings = {};
        if (form.service_settings[svc_key] == null) form.service_settings[svc_key] = {};
        merge(form.service_settings[svc_key], data);
        form.service_settings = JSON.stringify(form.service_settings);
        this.setState({form: form, unsaved: true});
    }

    show_configuration(svc_key) {
        this.setState({config_svc_key: svc_key});
    }

    render_data_toggles(type) {
        var {form} = this.state;
        var services = AppConstants.SERVICES.filter((svc) => {
            return (type == 'personal' && svc.personal)
                || (type == 'public' && !svc.personal);
        });
        return services.map((svc) => {
            var enabled = form.services_enabled.indexOf(svc.value) > -1;
            var config_icon;
            if (svc.configurable) config_icon = <a href="javascript:void(0)" disabled={!enabled} onClick={this.show_configuration.bind(this, svc.value)}><i className="fa fa-cog"/></a>
            return (
                <div className="row">
                    <div className="col-sm-1">
                        <div className="text-center">
                            { config_icon }
                        </div>
                    </div>
                    <div className="col-sm-11">
                        <Toggle labelPosition="right" label={svc.label} onToggle={this.toggle_service.bind(this, svc.value)} toggled={enabled} />
                    </div>
                </div>
            );
        });
    }

    render() {
        var u = this.props.user;
        if (!u) return <LoadStatus loading={true} />
        var {unsaved, config_svc_key} = this.state;
        var personal_service_toggles = this.render_data_toggles('personal');
        var public_service_toggles = this.render_data_toggles('public');
        var _config;
        if (config_svc_key != null) _config = (<ServiceConfigurer svc_key={config_svc_key} onSettingChange={this.handle_service_setting_change.bind(this)} />)
        var save_label = unsaved ? "Save" : "Saved";
        return (
            <div>

                <h1>About</h1>

                <p className="lead">{ AppConstants.DESCRIPTION }</p>

                <p className="lead">An experiment in liberating personal data.</p>                

            </div>
        );
    }
}
