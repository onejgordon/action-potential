
var React = require('react');

var GChart = React.createClass({displayName: 'GChart',
  getDefaultProps: function() {
    return {
      id: "_chart",
      visible: true,
      columns: [], // Array of 2-3-item arrays [type, label, id(optional)]
      divClass: "_gchart",
      type: 'LineChart',
      title: 'Chart Title',
      width: null, // Use container's width
      height: null, // Use container's height
      options: null,
      series: {},
      pointSize: 13,
      data: [],
      dataSourceUrl: null,
      toolbar: false,
      allow_download: false
    };
  },
  getInitialState: function() {
    return {
      open: this.props.defaultOpen, // Unused?
      dataTable: this.props.dataSourceUrl ? null : new google.visualization.DataTable(),
      wrapper: null
    }
  },
  componentDidMount: function() {
    this.fullInitialize();
  },
  fullInitialize: function() {
    var that = this;
    this.initializeDataTable(function() {
      that.initializeWrapper(that.draw);
    });
  },
  initializeDataTable: function(callback) {
    console.log("initializing data table");
    var dt = new google.visualization.DataTable();
    if (dt) {
      // Add columns and data from props
      for (var i in this.props.columns) {
        var c = this.props.columns[i];
        if (typeof c === 'object') dt.addColumn(c);
        else dt.addColumn(c[0], c[1]); // Assume list
      }
      if (this.props.data.length > 0) {
        console.log("Adding "+this.props.data.length+" rows.");
        dt.addRows(this.props.data);
      }
      this.setState({dataTable: dt}, function() {
        if (callback) callback();
      });
    } else {
      if (callback) callback();
    }
  },
  setTable: function(dt, opts, chartType) {
    // For passing data from parent
    if (this.state.wrapper) {
      var cw = this.state.wrapper;
      cw.setDataTable(dt);
      if (opts) {
        cw = this.setOptions(cw, opts, false);
      }
      if (chartType) cw.setChartType(chartType);
      this.setState({dataTable: dt, wrapper: cw}, function() {
        this.draw();
      });
    }
  },
  setOptions: function(cw, opts, _do_draw) {
    var do_draw = _do_draw == null ? true : _do_draw;
    if (!cw) cw = this.state.wrapper;
    if (cw) {
      for (var key in opts) {
        if (opts.hasOwnProperty(key)) {
          cw.setOption(key, opts[key]);
        }
      }
      if (do_draw) this.draw();
    }
    return cw;
  },
  getOptions: function() {
    var opts = {
        'title': this.props.title,
        'pointSize': this.props.pointSize,
        'series': this.props.series,
        'animation': {duration: 1000, easing: 'out'}
      };
    if (this.props.width) opts.width = this.props.width;
    if (this.props.height) opts.height = this.props.height;
    if (this.props.options) {
      for (var key in this.props.options) {
        if (this.props.options.hasOwnProperty(key)) {
          opts[key] = this.props.options[key];
        }
      }
    }
    return opts;
  },
  initializeWrapper: function(callback) {
    var opts = this.getOptions();
    var wrapper = this.state.wrapper;
    if (wrapper == null) wrapper = new google.visualization.ChartWrapper({
      chartType: this.props.type,
      options: opts,
      containerId: this.props.id
    });
    if (this.state.dataTable) wrapper.setDataTable(this.state.dataTable);
    if (this.props.dataSourceUrl) wrapper.setDataSourceUrl(this.props.dataSourceUrl);
    if (opts) wrapper.setOptions(opts);
    this.setState({wrapper: wrapper}, function() {
      if (callback) callback();
    });
  },
  draw: function() {
    console.log("Trying to draw");
    if (this.state.wrapper && ((this.state.dataTable && this.state.dataTable.getNumberOfColumns() > 0) || this.props.dataSourceUrl)) {
      this.state.wrapper.draw();
      if (this.props.allow_download){
        google.visualization.events.addListener(this.state.wrapper, 'ready', this.addDownloadLink);
      }
    } else console.log("No data to draw");
  },

  addDownloadLink: function() {
      var chart = this.state.wrapper.getChart();
      $("#"+this.props.id).append('<a id="chart_download" class="btn btn-info btn-sm" title="Right Click -> Save Link As" download="Echo Mobile Chart" target="_blank" href="'+chart.getImageURI()+'">Download image</a>');
  },

  render: function() {
    return (
      <div id={this.props.id} hidden={!this.props.visible} className={this.props.divClass}>
      </div>
      );
  }
});

module.exports = GChart;