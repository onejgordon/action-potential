var React = require('react');

var SimpleAdmin = require('components/SimpleAdmin');
import { withRouter } from 'react-router'
var LoadStatus = require('components/LoadStatus');
var AppConstants = require('constants/AppConstants');
var util = require('utils/util');
var FetchedList = require('components/FetchedList');
var api = require('utils/api');
var bootbox = require('bootbox');
import {FontIcon, List, ListItem} from 'material-ui';

class DecisionLI extends React.Component {
    static defaultProps = {}
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    do_delete() {

    }

    confirm_delete() {
        var that = this;
        bootbox.confirm("Really delete?", function(ok) {
            if (ok) {
                that.do_delete();
            }
        });
    }

    goto_decision(d) {
        this.props.router.push(`/app/decision/${d.id}`);
    }

    render() {
        var d = this.props.decision;
        return (
            <ListItem
              key={d.id}
              leftIcon={<FontIcon className="material-icons">lightbulb_outline</FontIcon>}
              primaryText={ d.title }
              secondaryText={ "Created " + util.printDate(d.ts_created)}
              onClick={this.goto_decision.bind(this, d)} />
        );
    }
}

export default withRouter(DecisionLI)