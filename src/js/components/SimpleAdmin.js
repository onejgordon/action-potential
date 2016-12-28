var React = require('react');

var util = require('../utils/util');
import {clone} from 'lodash';
var $ = require('jquery');
var toastr = require('toastr');
var mui = require('material-ui');
var Dialog = mui.Dialog,
  RaisedButton = mui.RaisedButton,
  FlatButton = mui.FlatButton;
var bootbox = require('bootbox');
var Select = require('react-select');
var RefreshIndicator = mui.RefreshIndicator;

class EditForm extends React.Component {
  handleChange(att, event) {
    var item = clone(this.props.item) || {};
    var targ = event.target;
    var prop = $(targ).attr('name');
    var valueForDB;
    if (targ.type == 'checkbox') valueForDB = targ.checked;
    else valueForDB = att.toValue ? att.toValue(targ.value) : targ.value;
    item[prop] = valueForDB;
    this.props.onFormChange(item);
  }
  handleSelectChange(att, value) {
    var item = clone(this.props.item) || {};
    var valueForDB = value;
    if (item != null) {
      item[att.name] = valueForDB;
      this.props.onFormChange(item);
    }
  }
  render() {
    var item = this.props.item;
    var kn_disabled = !this.props.creating_new;
    var that = this;
    var editable_atts = this.props.attributes.filter(function(att) {return att.editable;});
    var inputs = editable_atts.map(function(att, i, arr) {
      var _hint;
      var _input;
      if (att.hint) _hint = <div className="help-block">{att.hint}</div>
      var fixed = att.fixed && !that.props.creating_new;
      var key = 'input_'+att.name;
      var classes = "form-control";
      if (att.datepicker) classes += ' datepicker';
      var value_out = '';
      if (item) value_out = item[att.name];
      var label = att.label || att.name.capitalize();
      if (att.dataType == 'boolean') {
        var checked = value_out;
        _input = (
          <div className="form-group" key={key}>
            <label htmlFor={key}>{ label }</label>
            { _hint }
              <input
                type="checkbox"
                className="switch"
                key={key}
                id={key}
                name={att.name}
                placeholder={label}
                ref={att.name}
                value="1"
                onChange={this.handleChange.bind(this, att)}
                disabled={fixed}
                checked={checked}/>
          </div>
          );
      } else {
        if (att.inputType == 'textarea') {
          _input = (
          <div className="form-group" key={key}>
            <label htmlFor={key}>{ label }</label>
            { _hint }

              <textarea className={classes}
                key={key}
                id={key}
                name={att.name}
                placeholder={label}
                ref={att.name}
                value={ value_out }
                onChange={this.handleChange.bind(this, att)}
                disabled={fixed}/>
          </div>
          );
        } else if (att.inputType == 'json') {
          label += " (JSON)";
          value_out = value_out ? JSON.stringify(value_out) : "";
          _input = (
          <div className="form-group" key={key}>
            <label htmlFor={key}>{ label }</label>
            { _hint }
              <textarea className={classes}
                key={key}
                id={key}
                name={att.name}
                placeholder={label}
                ref={att.name}
                value={ value_out }
                onChange={this.handleChange.bind(this, att)}
                disabled={fixed}/>
          </div>
          );
        } else if (att.inputType == 'select') {
          var opts = att.opts;
          _input = (
            <div className="form-group" key={key}>
              <label htmlFor={key}>{ label }</label>
              { _hint }
              <Select
                multi={att.multiple}
                key={key}
                id={key}
                name={att.name}
                value={value_out}
                onChange={this.handleSelectChange.bind(this,att)}
                ref={att.name}
                options={opts} />
            </div>
          );
        } else {
          _input = (
            <div className="form-group" key={key}>
              <label htmlFor={key}>{ label }</label>
              { _hint }
              <input type="text" className={classes}
                key={key}
                id={key}
                name={att.name}
                placeholder={label}
                ref={att.name}
                value={ value_out }
                onChange={this.handleChange.bind(this, att)}
                disabled={fixed}/>
            </div>
          );
        }
      }
      return <div className="col-sm-6">{ _input }</div>
    }, this);
    var itemkey = item ? item[this.props.unique_key] : "";
    var formClass= "editForm";
    return (
      <form className={formClass} ref="form" hidden={this.props.hidden}>
        { inputs }
      </form>
    );
  }
}

class Item extends React.Component {
  handleEdit() {
    this.props.onEdit();
  }
  handleGotoDetail(item) {
    if (this.props.onGotoDetail) this.props.onGotoDetail(item);
  }
  renderCell(content, key, _classes) {
    var classes = _classes || "";
    var style = this.props.style;
    if (style == 'table') return <td key={key} className={classes}>{ content }</td>;
    else if (style == 'list') return <span key={key} className={classes}>{ content }</span>;
  }
  render() {
    var item = this.props.item;
    var unique_key = this.props.unique_key;
    var tableAtts = this.props.attributes.filter(function(att) {return !att.editOnly});
    var hlItem = false;
    var data_els = tableAtts.map(function(att) {
      var key = att.name +'_'+item[unique_key];
      var value_out;
      if (typeof(att.fromValue) === "function") {
        try {
          value_out = att.fromValue(item[att.name], item);
        } catch (e) { console.info(e); }
      } else if (att.inputType == "select") {
        // Assume we should render option label
        var op = util.findItemById(att.opts, item[att.name], 'val');
        value_out = op != null ? op.lab : item[att.name];
      } else value_out = item[att.name];
      if (typeof(value_out) == 'boolean') {
        value_out = value_out ? (<i className='fa fa-check'></i>) : <i></i>;
      }
      var classes = "";
      if (att.hlValue && value_out == att.hlValue) hlItem = true;
      if (att.listClass) classes += " "+att.listClass;
      if (att.clickAction == 'edit') return this.renderCell(<a href='javascript:void(0)' onClick={this.handleEdit.bind(this, item)}>{value_out}</a>, key, classes);
      else if (att.clickAction == 'detail') return this.renderCell(<a href='javascript:void(0)' onClick={this.handleGotoDetail.bind(this, item)}>{value_out}</a>, key, classes);
      else return this.renderCell(value_out, key, classes);
    }, this);
    var classes = "item";
    var statusClass;
    if (this.props.is_selected) statusClass = "info";
    else if (hlItem) statusClass = "success";
    var additionalActions;
    if (this.props.additionalActions) {
      additionalActions = this.props.additionalActions.map(function(action, i, arr) {
        var link = action.link(item);
        return <a href={link} data-toggle="tooltip" title={action.label}><i className={"fa fa-"+action.icon}></i></a>;
      });
    }
    var _actions = this.renderCell(
        <span className="pull-right">
          <a href="javascript:void(0)" onClick={this.handleEdit.bind(this)}><i className="fa fa-pencil"></i></a>
          <span hidden={!(typeof(this.props.detail_url) === "function")}><a href="javascript:void(0)" onClick={this.handleGotoDetail.bind(this, item)}><i className="fa fa-binoculars"></i></a></span>
          { additionalActions }
        </span>, item[unique_key]);
    if (this.props.style == 'table') {
      var _statusClass = statusClass || "";
      return (
        <tr className={classes + " " + _statusClass}>
          {data_els}
          { _actions }
        </tr>
      );
    } else if (this.props.style == 'list') {
      var _statusClass = ("list-group-item-"+statusClass) || "";
      return (
        <li className={classes + " list-group-item " + _statusClass}>
        { _actions }
          {data_els}
        </li>
      );
    }
  }
}

export default class SimpleAdmin extends React.Component {
    static defaultProps = {
      entity_name: "Entity",
      attributes: [],
      unique_key: 'key',
      url: null,
      id: 'sa',
      max: 50,
      table_class: '',
      add_params: {},
      getListFromJSON: null,
      getObjectFromJSON: null,
      style: 'table',
      redirect_url: null,
      pagingEnabled: false
    }
    constructor(props) {
        super(props);
        this.state = {
          items: [],
          page: 0,
          isMore: true, // Whether there are additional items to list (not yet fetched)
          selected: null,
          status: 'closed',
          loading: false
        };
    }

  componentWillMount() {
    this.fetchItems();
  }
  componentDidMount() {
  }
  componentDidUpdate(prevProps, prevState) {
    var param_change = prevProps.url != this.props.url;
    if (param_change) this.clearAndFetch();
  }
  clearAndFetch() {
    var that = this;
    this.setState({items: [], status: 'closed', selected: null}, function() {
      that.fetchItems();
    });
  }
  fetchMore() {
    // Ajax fetch with page
    this.fetchItems();
  }
  fetchItems() {
    var that = this;
    this.setState({loading: true});
    var nextPage = this.state.page;
    var data = {max: this.props.max || 100, page: nextPage};
    util.mergeObject(data, this.props.add_params);
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      data: data,
      success: function(data) {
        var newItems = this.props.getListFromJSON(data);
        var isMore = newItems != null && newItems.length == this.props.max;
        var items = this.state.items.concat(newItems);
        this.setState({items: items, loading: false, isMore: isMore, page: nextPage+1});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(that.props.url, status, err.toString());
        this.setState({loading: false});
      }.bind(this)
    });
  }
  gotoDetail(item) {
    if (this.props.detail_url) {
      var url = this.props.detail_url(item);
      if (url) window.location = url;
    }
  }
  cancel() {
    this.setState({status: 'closed', selected: null});
  }

  form_change(item) {
    this.setState({selected: item});
  }

  begin_editing(item, creating_new, callback) {
    var form = clone(item);
    // Update props based on formFromValue adapters, if present
    this.props.attributes.forEach(function(att, i) {
      if (typeof(att.formFromValue) === "function") {
        try {
          form[att.name] = att.formFromValue(item[att.name], item);
        } catch (e) { console.info(e); }
      } else if (form[att.name] == null && att.defaultValue) {
        form[att.name] = att.defaultValue;
      }
    });
    console.log(form);
    this.setState({selected: form, status: creating_new ? 'new' : 'edit'}, function() {
      if (callback) callback();
    });
  }

  delete() {
    var that = this;
    this.setState({status: 'closed'}, function() {
      bootbox.confirm("Really delete?", function(ok) {
        if (ok) {
          var item = that.state.selected;
          if (item) {
            that.setState({selected: null, status: 'closed'});
            $.ajax({
              url: that.props.url+'/delete',
              dataType: 'json',
              type: 'POST',
              data: item,
              success: function(resp) {
                if (resp.success) {
                  var items = that.state.items.filter(function (candidate) {
                    return candidate != item;
                  });
                  that.setState({items: items });
                  toastr.success(that.props.entity_name + " deleted");
                } else toastr.error("Failed to delete " + that.props.entity_name);
              }.bind(that)
            });
          }
        }
      });
    })
  }
  save() {
    var that = this;
    var items = this.state.items;
    var creating_new = this.state.status == 'new';
    var st = {};
    var data = this.state.selected;
    util.mergeObject(data, this.props.add_params);
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: data,
      success: function(res) {
        if (res.success != false){
          var item = this.props.getObjectFromJSON(res);
          var entname = that.props.entity_name;
          if (creating_new) {
            if (this.props.redirect_url) {
              var url = this.props.redirect_url(item);
              if (url) window.location.replace(url);
            }
            if (typeof that.props.onItemCreated === 'function') that.props.onItemCreated(item);
            items.push(item);
          } else {
            var index = util.findIndexById(items, item[that.props.unique_key], that.props.unique_key);
            if (index > -1) items[index] = item;
          }
          this.setState({items: items, status: 'closed', selected: null});
          toastr.success(entname + " saved");
        } else {
          var message = res.message || "Failed. Please try again.";
          toastr.error(message);
        }
      }.bind(this)
    });
  }
  startNew() {
    this.setState({status: 'new'});
  }
  render() {
    var list, more, _empty;
    var items = this.state.items;
    var headers = this.props.attributes.filter(function(x) { return !x.editOnly; } );
    var itemHeaders = headers.map(function(att) {
      var key = 'th_'+att.name;
      var label = att.label || util.capitalize(att.name);
      var style = this.props.style;
      return <th key={key}>{label}</th>
    }, this);
    var itemNodes = items.map(function (item, i, arr) {
      var is_selected = (this.state.selected && item[this.props.unique_key] == this.state.selected[this.props.unique_key]);
      return <Item
                key={item[this.props.unique_key]}
                item={item}
                style={this.props.style}
                is_selected={is_selected}
                attributes={this.props.attributes}
                unique_key={this.props.unique_key}
                onEdit={this.begin_editing.bind(this, item, false)}
                onDelete={this.delete.bind(this, item)}
                detail_url={this.props.detail_url}
                additionalActions={this.props.additionalActions}
                onGotoDetail={this.gotoDetail.bind(this, item)} />
    }.bind(this));
    var itemList;
    if (this.props.style == 'table') {
      itemList = (<table className={this.props.table_class + ' table table-striped sa'}>
          <thead>
            <tr>
              {itemHeaders}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {itemNodes}
          </tbody>
        </table>);
    } else if (this.props.style == 'list') {
      itemList = <ul className="sa list-group">{itemNodes}</ul>;
    }
    var empty = itemNodes.length == 0;
    if (empty) _empty = <div className="empty">No items to show.</div>
      var creating_new = this.state.status == 'new';
    var open = this.state.status != 'closed';
    var save_btn_text = creating_new ? 'Create' : 'Update';
    var actions = [
      <FlatButton label={save_btn_text} onClick={this.save.bind(this)} primary={true} />,
      <FlatButton label="Cancel" onClick={this.cancel.bind(this)} />
    ];
    if (!creating_new) actions.push(<FlatButton label="Delete" onClick={this.delete.bind(this)} style={{color: 'red'}} />)
    var title = creating_new ? "Create" : "Edit";
    if (this.props.entity_name) title = title + " " + this.props.entity_name;
    var _form = (
      <Dialog title={title} open={open} onRequestClose={this.cancel.bind(this)} actions={actions} autoScrollBodyContent={true} autoDetectWindowHeight={true}>
        <EditForm
          unique_key={this.props.unique_key}
          hidden={this.state.status == 'closed'}
          item={this.state.selected}
          attributes={this.props.attributes}
          onFormChange={this.form_change.bind(this)}
          creating_new={this.state.status=='new'}/>
      </Dialog>
    );
    if (this.state.isMore && !this.state.loading) more = <button className="btn btn-default btn-sm center-block" onClick={this.fetchMore.bind(this)}><i className="fa fa-sort-down"></i> Show More</button>
      var loadStatus = this.state.loading ? "loading" : "hide";
    return (
      <div className="Activity">
        { itemList }
        { _empty }
        { more }
        <RefreshIndicator size={40} left={80} top={50} status={loadStatus} />
        <p hidden={this.state.status != 'closed'}>
          <RaisedButton primary={true} label="New" onClick={this.startNew.bind(this)} />
        </p>

        { _form }

      </div>
    );
  }
}
