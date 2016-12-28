/*
Author: Jeremy Gordon
Version: 0.1
Created: May 20, 2014
Updated: May 20, 2014
*/

var React = require('react');

var Dropzone = require('dropzone');
var $ = require('jquery');

Dropzone.autoDiscover = false;

var ResourceDropzone = React.createClass({displayName: 'ResourceDropzone',
  propTypes: {
    gcs_bucket: React.PropTypes.any.isRequired,
    uploadHandler: React.PropTypes.any.isRequired
  },
  previewTemplate: "<li class='list-group-item'>"+
      "<span data-dz-name></span>"+
      "<span class='sub right' data-dz-size></span>"+
      "<span class='right error text-danger' data-dz-errormessage></span>"+
      "<span class='right dz-progress'><span class='dz-upload' data-dz-uploadprogress></span></span>"+
    "</li>",
  getDefaultProps: function() {
    return {
      visible: true,
      gcs_bucket: null,
      uploadHandler: null,
      getUploadUrlHandler: '/api/upload/get_url',
      cta: "Drop images here or click to upload."
    };
  },
  getInitialState: function() {
    return {
      dz: null,
      updating: false
    };
  },
  componentDidMount: function() {
    this.init();
  },
  componentDidUpdate: function() {
    this.init();
  },
  getUploadURL: function(target, callback) {
    var params = {
      target: target,
      gcs_bucket: this.props.gcs_bucket
    }
    $.getJSON(this.props.getUploadUrlHandler, params, function(resp) {
        if (resp.data.url && callback) callback(resp.data.url);
    });
  },
  runUploads: function(_dz) {
    console.log("Getting url for dropped items...");
    this.getUploadURL(this.props.uploadHandler, function(url) {
      _dz.options.url = url;
      _dz.processQueue();
      // Todo: next batch on complete?
    });
  },
  filesUploaded: function(files, result) {
    var _result = JSON.parse(result);
    if (this.props.onFilesUploaded) this.props.onFilesUploaded(_result);
  },
  init: function() {
    var that = this;
    var shouldInitialize = this.state.dz == null && this.props.visible;
    if (shouldInitialize) {
      var dz = new Dropzone("#dz", {
        url: "/",
        uploadMultiple: true,
        autoProcessQueue: false, // Process called once we have URL
        parallelUploads: 5,
        maxFiles: 10,
        maxFileSize: 10, // 10 mb
        previewsContainer: "#previews",
        previewTemplate: this.previewTemplate,
        acceptFiles: "image/*" // Is this working?
      });
      dz.on("addedfile", function(file) {
        that.runUploads(this);
      });
      dz.on("processingmultiple", function(files) {
        console.log("Processing " + files.length + " files.");
      });
      dz.on("successmultiple", function(files, result) {
        console.log("Completed " + files.length + " files!");
        that.runUploads(this);
        that.filesUploaded(files, result);
      });
      dz.on("dragenter", function() {
      });
      this.setState({dz: dz});
    }
  },
  render: function() {
    var classes = this.props.visible ? 'dropzone' : 'hidden dropzone';
    var btnClasses = "btn btn-primary";
    if (this.state.updating) btnClasses += " disabled";
    var pbStyle = {
      width: "0%"
    };
    return (
      <div className='resourceDropzone'>

        <ul className="list-group" id="previews">
        </ul>

        <div id="dz" className={classes}>
          <div className="dz-message">
            <span className="center-block">
              <i className="fa fa-cloud-upload fa-2x"></i>
            </span>
            { this.props.cta }
          </div>
        </div>

      </div>
      );
  }
});

module.exports = ResourceDropzone;
