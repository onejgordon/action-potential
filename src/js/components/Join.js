var React = require('react');

var LoadStatus = require('components/LoadStatus');
var AppConstants = require('constants/AppConstants');
import { withRouter } from 'react-router'
var util = require('utils/util');
var bootbox = require('bootbox');
import {merge} from 'lodash';
import {changeHandler} from 'utils/component-utils';
var base = require('config/base');
var toastr = require('toastr');

class Join extends React.Component {
    static defaultProps = {
      user: null
    }

    constructor(props) {
        super(props);
        this.state = {
          loading: false,
          contributor: null
        };
    }

    componentDidMount() {
      var {user} = this.props;
      if (user) this.init();
    }

    componentDidUpdate(prevProps, prevState) {
      var {user} = this.props;
      var got_user = prevProps.user == null && user != null;
      if (got_user) {
        this.init();
      }
    }

    init() {
      var {user} = this.props;
      var {id} = this.props.location.query;
      var data = {};
      data[user.uid] = true;
      base.update(`decisions/${id}/contributors`, {
        data: data,
        then: () => {
          toastr.success("Joined!");
          this.props.router.push(`/app/decision/${id}`);
        }
      });
    }

    render() {
      return (
        <div>

          <h1>Joining...</h1>

        </div>
      );
    }
}

export default withRouter(Join)