'use strict'

var React = require('react');
var request = require('superagent');
var Dropzone = require('react-dropzone');
var toastr = require('toastr');
var api = require('utils/api');
var mui = require('material-ui'),
  FontIcon = mui.FontIcon,
  IconButton = mui.IconButton;

import FlatButton from 'material-ui/lib/flat-button';

export default class UploadWidget extends React.Component{
  static defaultProps = {
    cta: "Upload a batch",
    tip: "",
    template: null,
    gcs_bucket: null,
    uploadHandler: null,
    getUploadUrlHandler: '/api/upload/get_url',
    action: "/uploader/abstract",
    filetypes: ['wav','mp3'],
    maxMB: 1,
    id: "uploadWidget",
    inputs: null,
    start_open: false
  };
  constructor(props, context){
    super(props, context);
    this.state = {
      files: [],
      issues: [],
      gcs_upload_url: null,
      status: "",
      open: this.props.start_open
    };
  }

  uses_gcs() {
    return this.props.gcs_bucket != null;
  }

  upload_url() {
    return this.uses_gcs() ? this.state.gcs_upload_url : this.props.uploadHandler;
  }

  getUploadURL(target, callback) {
    var params = {
      target: target,
      gcs_bucket: this.props.gcs_bucket
    }
    api.get(this.props.getUploadUrlHandler, params, function(resp) {
        if (resp.data.url && callback) callback(resp.data.url);
    });
  }

  onDrop(files){
    var that = this;
    this.setState({files: files, issues: [], status: ""}, function() {
      if (that.uses_gcs()) that.getUploadURL(that.props.uploadHandler, function(url) {
        that.setState({gcs_upload_url: url});
      });
    });
  }

  getValidFiles(){
    var that = this;
    return this.state.files.filter(function(file){
      var ext = file.name.split(".").pop();
      var isValidSize = false;
      var isValidType = false;
      if (that.props.filetypes.indexOf(ext) == -1){
        that.state.issues.push(file.name + " is of an invalid type.");
      } else {
        isValidType = true;
      }
      if (file.size > that.props.maxMB * 1e+6){
        that.state.issues.push(file.name + " file size is greater than the size limit of " + that.props.maxMB + " MB.");
      } else {
        isValidSize = true;
      }
      return isValidSize && isValidType;
    });
  }

  startUpload() {
    var url = this.upload_url();
    if (url != null) {
      this.setState({status: "loading"});
      var that = this;
      var valid_files = this.getValidFiles();
      var req = request.post(this.upload_url());
      for (var input_name in this.props.inputs){
        req.field(input_name, this.props.inputs[input_name]);
      }
      valid_files.forEach((file) => {
        req.attach("file", file);
      });
      req.end(function(err, res){
        if (err){
          that.setState({status: "error"});
        } else {
          if (res.statusCode == 200){
            that.setState({status: "ok"}, function() {
              if (that.props.onFilesUploaded) that.props.onFilesUploaded(valid_files);
            });
          } else {
            that.setState({status: "error"});
          }
        }
      });

    }
  }

  displayFiletypes(types){
    var output = [];
    for (var i = 0; i < this.props.filetypes.length; i++){
      output.push(
        <div className="form-group type">
          <div className="fa fa-file-o fa-4x"></div>
          <div className="file_extension">.{this.props.filetypes[i]}</div>
        </div>
      );
    }
    return output;
  }

  clearFiles(){
    this.setState({files: [], issues: [], status: ""});
  }

  toggle_open() {
    this.setState({open: !this.state.open});
  }

  render(){
    if (!this.state.open) {
      return <div className="vpad"><FlatButton
        label={this.props.cta}
        onClick={this.toggle_open.bind(this)}
        secondary={true}
        icon={<FontIcon className="material-icons">cloud_upload</FontIcon>} />
        </div>
    } else {
      var _status_icon;
      var status = this.state.status;
      if (status == "loading") _status_icon = <i className="fa fa-spinner fa-stack-1x"></i>
      else if (status == "ok") _status_icon = <i className="fa fa-check fa-stack-1x text-success"></i>
      else if (status == "error") _status_icon = <i className="fa fa-warning fa-stack-1x text-danger"></i>
      var valid_files = this.getValidFiles();
      return (
        <div className="row">
            {
              valid_files.length == 0?
                <div>
                  <h5>{this.props.cta} (<a href="javascript:void(0)" onClick={this.toggle_open.bind(this)}>hide</a>)</h5>
                  <Dropzone className="dropzone text-center" activeClassName="dropzone-active" ref="dropzone" multiple={false} onDrop={this.onDrop.bind(this)}>
                    <div className="acceptable_filetypes form-inline">{this.displayFiletypes()}</div>
                    <div className="instruction_text">
                      Drop a file here or click to choose file (size limit = {this.props.maxMB}MB)
                    </div>
                    <div className="text-muted">{this.props.tip}</div>
                    {this.props.children}
                    {this.state.issues.map((issue) => <h4 className="animated shake text-danger"><i className="fa fa-warning"></i> {issue}</h4>)}
                  </Dropzone>
                  {
                    this.props.template?
                    <div>
                      <a href={this.props.template} className="btn btn-link"><i className="fa fa-download"></i> Download sample template</a>
                    </div>: null
                  }
                </div> :
                <div className="dropzone text-center">
                  <h4>Ready for upload:</h4>
                  <div className="">
                    <br/>
                    {valid_files.map((file) =>
                      <p>
                        <span className="fa-stack fa-lg">
                          { _status_icon }
                          <i className="fa fa-file-o fa-stack-2x fa-3x"></i>
                        </span>
                        <br/> {file.name}
                      </p>
                    )}
                    <button className="btn btn-info" onClick={this.startUpload.bind(this)} disabled={this.state.status == "ok"? true: false}><i className="fa fa-upload"></i> Upload File</button>&nbsp;
                    <button className="btn btn-default" onClick={this.clearFiles.bind(this)}><i className="fa fa-plus"></i> Upload Another File</button>
                  </div>
                </div>
            }
        </div>
      );
    }
  }
}