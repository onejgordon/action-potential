var React = require('react');
var Router = require('react-router');

var $ = require('jquery');
var util = require('utils/util');
var api = require('utils/api');
var RouteHandler = Router.RouteHandler;
var FetchedList = require('components/FetchedList');
var api = require('utils/api');
var toastr = require('toastr');
var mui = require('material-ui'),
  FlatButton = mui.FlatButton;
  IconMenu = mui.IconMenu,
  MenuItem = mui.MenuItem;

var Link = Router.Link;

var Reports = React.createClass({displayName: 'Reports',
  mixins: [ Router.State ],
  getDefaultProps: function() {
    return {
      user: null
    };
  },
  getInitialState: function() {
    return {
      reports: [],
      loading: false
    };
  },
  componentDidMount: function() {
    this.fetchReports();
  },
  componentDidUpdate: function(prevProps, prevState) {
    var detailOpenClose = (prevProps.params.sensorKn == null) != (this.props.params.sensorKn == null);
    if (detailOpenClose) this.refs.map.resize();
  },
  fetchReports: function() {
    var that = this;
    this.setState({loading: true});
    var data = {
    };
    api.get("/api/report", data, function(res) {
      if (res.success) {
        var reports = res.data.reports;
        that.setState({reports: reports, loading: false });
      } else that.setState({loading: false});
    });
  },
  generate_report: function(type_int) {
    var data = {
      type: type_int
    };
    api.post("/api/report/generate", data, function(res) {
      toastr.info("Generating...");
    })
  },
  download: function(r) {
    if (r.serve_url) window.open(r.serve_url,'_blank');
  },
  renderReport: function(r) {
    return (
      <li className="list-group-item">
        <span className="title">{ r.title }</span>
        <a href="javascript:void(0)" onClick={this.download.bind(this, r)}>Download</a>
        <span className="sub right" data-ts={r.ts_created}></span>
      </li>
      )
  },
  render: function() {
    var detail;
    var _other_reports = [<MenuItem primaryText="Alarm Report" onClick={this.generate_report.bind(this, 2)} />];
    return (
      <div>
        <h1>Reports</h1>
        <FetchedList url="/api/report" listProp="reports" renderItem={this.renderReport} autofetch={true}/>

        <IconMenu iconButtonElement={ <FlatButton label="Other Reports" /> } openDirection="bottom-right">
          { _other_reports }
        </IconMenu>
      </div>
    );
  }
});


module.exports = Reports;