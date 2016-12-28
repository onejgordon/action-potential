var React = require('react');
var UserActions = require('actions/UserActions');
var UserStore = require('stores/UserStore');
var AppConstants = require('constants/AppConstants');
var api = require('utils/api');
var util = require('utils/util');
import {clone, merge} from 'lodash';
import connectToStores from 'alt-utils/lib/connectToStores';
var Select = require('react-select');
var mui = require('material-ui'),
  List = mui.List,
  ListItem = mui.ListItem,
  TextField = mui.TextField,
  FontIcon = mui.FontIcon,
  Tabs = mui.Tabs,
  Tab = mui.Tab,
  Paper = mui.Paper,
  FontIcon = mui.FontIcon,
  DatePicker = mui.DatePicker,
  FlatButton = mui.FlatButton,
  RaisedButton = mui.RaisedButton;

import {changeHandler} from 'utils/component-utils';

@connectToStores
@changeHandler
export default class SimpleChoiceConfigurerer extends React.Component {
  static defaultProps = {
    svc_key: null,
    cta: "Configure",
  };

  constructor(props) {
    super(props);
    this.state = {
      input: null,
      multi: false,
      prop: null,

      options: [],
      form: {
      }
    };
  }
  static getStores() {
    return [UserStore];
  }
  static getPropsFromStores() {
    var st = UserStore.getState();
    return st;
  }

  config_call() {
    var svc_key = this.props.svc_key;
    api.get(`/api/configure/${svc_key}`, {}, (res) => {
      this.setState({
        input: res.data.input,
        multi: res.data.multi,
        prop: res.data.prop,
        instructions: res.data.instructions,
        options: res.data.options
      });
    });
  }

  formChange(prop, value) {
    var form = this.state.form;
    form[prop] = value;
    this.setState({form: form}, () => {
      this.props.onSettingChange(this.props.svc_key, form);
    });
  }

  render() {
    var _input, _instructions;
    var form = this.state.form;
    var svc = util.findItemById(AppConstants.SERVICES, this.props.svc_key, 'value');
    var prop = this.state.prop;
    if (svc == null) return <div></div>
    var ready = false;
    if (this.state.input == 'select') {
      _input = (
        <Select options={this.state.options} value={form[prop]} onChange={this.formChange.bind(this, prop)} />
      );
      ready = form[prop] != null;
    }
    if (this.state.instructions) {
      _instructions = <p className="lead">{ this.state.instructions }</p>
    }
    return (
      <div style={{minHeight: "300px"}}>
        <h2><FontIcon className="material-icons">settings</FontIcon> { svc.label }</h2>

        <div hidden={ready}>
          <FlatButton primary={true} label={ this.props.cta } onClick={this.config_call.bind(this)} />
        </div>

        { _instructions }

        <div className="row">
          <div className="col-sm-6">
            { _input }
          </div>
        </div>
      </div>
      )
  }
}
