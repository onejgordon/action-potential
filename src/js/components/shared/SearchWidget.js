'use strict';

var React = require('react');
var util = require('utils/util');
var LoadStatus = require('components/LoadStatus');

var toastr = require('toastr');
var api = require('utils/api');
var mui = require('material-ui'),
  Dialog = mui.Dialog,
  List = mui.List,
  ListItem = mui.ListItem,
  FontIcon = mui.FontIcon,
  IconButton = mui.IconButton,
  TextField = mui.TextField,
  RadioButtonGroup = mui.RadioButtonGroup;
var history = require('config/history');
import {changeHandler} from 'utils/component-utils';

@changeHandler
export default class SearchWidget extends React.Component {
  static defaultProps = {
    open: false
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      results: [],
      form: {
        term: ""
      }
    };
  }

  componentWillReceiveProps(nextProps) {
  }

  componentDidUpdate(prevProps, prevState) {
    var opened = !prevProps.open && this.props.open;
    // if (opened) {
    //   this.refs.input.focus();
    // }
  }

  handleSearchKeydown(e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode == 13) { // enter
      this.search();
      return false;
    }
  }


  search() {
    var that = this;
    var form = this.state.form;
    this.setState({results: []}, function() {
      var params = {
        term: form.term
      };
      var type = form.type;
      api.get("/api/search", params, function(res) {
        if (res.success && res.data.results.length > 0) {
          var form = that.state.form;
          form.term = "";
          that.setState({results: res.data.results, form: form});
        } else if (res.data.results.length == 0) toastr.info("No results...");
      });
    });
  }

  goto_result(r) {
    // Redirect depending on r type
    var type = r.type;
    if (type == 'group') history.pushState(null, `/app/groups/${r.id}`);
    else if (type == 'target') history.pushState(null, `/app/targets/${r.id}`);
    else if (type == 'sensor') history.pushState(null, `/app/sensors/${r.id}`);
    this.props.onRequestClose();
  }

  get_icon(type) {
    if (type == 'group') return <FontIcon className="material-icons">folder</FontIcon>
    else if (type == 'target') return <FontIcon className="material-icons">view_agenda</FontIcon>
    else if (type == 'sensor') return <FontIcon className="material-icons">wifi</FontIcon>
    else return <FontIcon className="material-icons">play_arrow</FontIcon>
  }

  render() {
    var content;
    var form = this.state.form;
    var list = this.state.results.map(function(r) {
      return <ListItem onClick={this.goto_result.bind(this, r)} primaryText={r.label} secondaryText={r.type.toUpperCase()} leftIcon={this.get_icon(r.type)} />
    }, this);
    var placeholder = "Search for sensors, targets, or groups...";
    return (
      <Dialog title="Search" open={this.props.open} onRequestClose={this.props.onRequestClose.bind(this)} autoDetectWindowHeight={true} autoScrollBodyContent={true}>

        <div className="row">
          <div className="col-sm-10">
            <TextField
              value={form.term}
              onChange={this.changeHandler.bind(this, 'form', 'term')}
              fullWidth={true}
              onKeyDown={this.handleSearchKeydown.bind(this)}
              floatingLabelText="Search"
              hintText={placeholder} />
          </div>
          <div className="col-sm-2">
            <IconButton onClick={this.search.bind(this)} tooltip="Search" iconClassName="material-icons" style={{marginTop: "15px"}}>search</IconButton>
          </div>
        </div>

        <div hidden={list.length == 0}>
          <h4>Results</h4>
          <List>
            { list }
          </List>
        </div>

      </Dialog>
    );
  }
}
