var React = require('react');

import { withRouter } from 'react-router'
var AppConstants = require('constants/AppConstants');
var util = require('utils/util');
var bootbox = require('bootbox');
var api = require('utils/api');
import {FlatButton} from 'material-ui';

export default class Voter extends React.Component {
    static defaultProps = {
        voters: [],
        user: null,
        color: null
    }
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    toggle_vote() {
        var {voters, user} = this.props;
        if (this.not_voted()) {
            voters.push(user.uid);
        } else {
            var index = voters.indexOf(user.uid);
            voters.pop(index);
        }
        this.props.onVote(voters);
    }

    not_voted() {
        var {voters, user} = this.props;
        return voters.indexOf(user.uid) == -1;
    }

    render() {
        var {voters, color} = this.props;
        var btn_cls = this.not_voted() ? 'btn-default' : 'btn-primary';
        var votes = voters.length;
        var any_votes = votes > 0;
        var st = {};
        if (any_votes && color) st.backgroundColor = color;
        var _plus_one = <button className={"btn btn-xs " + btn_cls} style={st} onClick={this.toggle_vote.bind(this)}>+{votes}</button>;
        return (
            <span>
                { _plus_one }
            </span>
        )
    }
}

