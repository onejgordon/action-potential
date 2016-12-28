var React = require('react');

var mui = require('material-ui');
var IconButton = mui.IconButton;
var api = require('utils/api');
var RefreshIndicator = mui.RefreshIndicator;
var $ = require('jquery');

export default class FetchedList extends React.Component {
  static defaultProps = {
      url: null,
      params: {},
      listProp: 'items',
      labelProp: 'label',
      autofetch: false,
      renderItem: null // Function
  }
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      loading: false
    };
  }
  componentWillReceiveProps(nextProps) {
  }
  componentDidUpdate(prevProps, prevState) {
  }
  componentDidMount() {
    if (this.props.autofetch) this.fetchData();
  }
  add_item(item, _add_to) {
    var add_to = _add_to || "top";
    var new_items = this.state.items;
    if (add_to == "top") new_items.unshift(item);
    else if (add_to == "bottom") new_items.push(item);
    this.setState({items: new_items});
  }

  remove_item_by_key(key, _keyProp) {
    var keyProp = _keyProp || "key";
    var items = this.state.items;
    for (var i=0; i<items.length; i++) {
      var _item = items[i];
      if (_item) {
        var keyval = _item[keyProp];
        if (keyval == key) {
          // Match
          items.splice(i, 1);
          break;
        }
      }
    }
    this.setState({items: items});
  }

  update_item_by_key(item, _keyProp, _delete, _add_to) {
    var add_to = _add_to || "top";
    var do_delete = _delete || false;
    var keyProp = _keyProp || "key";
    // TODO: Add lookup dict?
    var success = false;
    var items = this.state.items;
    for (var i=0; i<items.length; i++) {
      var _item = items[i];
      if (_item) {
        var keyval = _item[keyProp];
        if (keyval == item[keyProp]) {
          // Match
          if (do_delete) items.splice(i, 1);
          else items[i] = item;
          success = true;
          break;
        }
      }
    }
    if (success) {
      this.setState({items: items})
    } else {
      if (!do_delete) {
        var new_items = this.state.items;
        if (add_to == "top") new_items.unshift(item);
        else if (add_to == "bottom") new_items.push(item);
        this.setState({items: new_items});
      }
    }
  }

  fetchData() {
    var that = this;
    if (this.props.url) {
      api.get(this.props.url, this.props.params, function(res) {
        if (res.success) {
          that.setState({items: res.data[that.props.listProp]})
        }
      });
    }
  }
  handleItemClick(i) {
    if (this.props.onItemClick) this.props.onItemClick(i);
  }
  refresh() {
    this.fetchData();
  }
  render() {
    var _items = this.state.items.map(function(item, i, arr) {
      if (this.props.renderItem != null) return this.props.renderItem(item);
      else {
        var name = item[this.props.labelProp] || "Unnamed";
        return <li className="list-group-item" key={i}>
          <a href="javascript:void(0)" className="title" onClick={this.handleItemClick.bind(this, item)}>{ name }</a>
          </li>
      }
    }, this);
    var ristatus = this.state.loading ? "loading" : "hide";
    var empty = this.state.items.length == 0;
    return (
      <div>
        <RefreshIndicator status={ristatus} size={50} top={50} left={50} />

        <IconButton iconClassName="material-icons" tooltip="Refresh" onClick={this.refresh.bind(this)}>refresh</IconButton>
        <ul className="list-group" hidden={empty}>
          { _items }
        </ul>
        <div hidden={!empty}>
          <div className="empty">
            <i className="fa fa-warning"></i><br/>
            <span>Nothing to show</span>
          </div>
        </div>
      </div>
    );
  }
}
