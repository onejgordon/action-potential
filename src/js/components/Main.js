var React = require('react');

var LoadStatus = require('components/LoadStatus');
var AppConstants = require('constants/AppConstants');
var util = require('utils/util');
var LoadStatus = require('components/LoadStatus');
var bootbox = require('bootbox');
import {merge} from 'lodash';
var DecisionLI = require('components/DecisionLI');
var ReactTooltip = require('react-tooltip');
var Select = require('react-select');
var mui = require('material-ui'),
  List = mui.List,
  ListItem = mui.ListItem,
  FontIcon = mui.FontIcon,
  IconButton = mui.IconButton,
  IconMenu = mui.IconMenu,
  MenuItem = mui.MenuItem,
  RaisedButton = mui.RaisedButton;
import {changeHandler} from 'utils/component-utils';
import connectToStores from 'alt-utils/lib/connectToStores';

var base = require('config/base');

@changeHandler
export default class Main extends React.Component {
    static defaultProps = {
      user: null
    }

    constructor(props) {
        super(props);
        this.state = {
          decisions: {},
          loading: true
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

    componentWillUnmount() {
      base.removeBinding(this.ref_decisions);
    }

    init() {
      var {user} = this.props;
      this.ref_decisions = base.syncState(`decisions`, {
        context: this,
        state: 'decisions',
        queries: {
          orderByChild: 'creator',
          equalTo: user.uid
        },
        then: () => {
          this.setState({loading: false});
        }
      });
    }

    create_decision() {
      var {user} = this.props;
      var now = new Date();
      var {decisions} = this.state;
      var id = user.uid + ":" + util.randomId(10);
      var contributors = {};
      contributors[user.uid] = true; // User index
      decisions[id] = {
        id: id,
        creator: user.uid,
        title: "Unnamed",
        ts_created: now.getTime(),
        contributors: contributors,
        pros_cons_enabled: true
      };
      this.setState({decisions});
    }

    render() {
      var loading = this.state.loading;
      return (
        <div>

          <RaisedButton label="New Decision" onClick={this.create_decision.bind(this)} primary={true} />

          <LoadStatus loading={loading} empty={false} />

          <List>
            { util.flattenDict(this.state.decisions).map((d) => {
              return <DecisionLI decision={d} />
            }) }
          </List>

        </div>
      );
    }
}
