var React = require('react');

import { withRouter } from 'react-router'
var AppConstants = require('constants/AppConstants');
var Voter = require('components/Voter');
var util = require('utils/util');
var bootbox = require('bootbox');
var api = require('utils/api');
import {FlatButton} from 'material-ui';

export default class ProposalProCon extends React.Component {
    static defaultProps = {
        proposal: null
    }
    constructor(props) {
        super(props);
        this.state = {

        };
        this.ADD_STYLE = {
            fontSize: "9px"
        }
    }

    add_pro_con(type_int) {
        var prompt = "Add New " + AppConstants.PRO_CON_LABELS[type_int-1];
        var pro = type_int == AppConstants.PRO;
        bootbox.prompt({
            title: prompt,
            callback: (result) => {
                if (result === null || result.length == 0) {
                } else {
                    var p = this.props.proposal;
                    var factor = pro ? 'pros' : 'cons';
                    if (!p[factor]) p[factor] = {};
                    var id = util.randomId(10);
                    p[factor][id] = {
                        id: id,
                        text: result
                    };
                    this.props.onUpdate(p);
                }
            }
        });
    }

    handleVote(type_int, factor, voters) {
        var pro = type_int == AppConstants.PRO;
        var p = this.props.proposal;
        console.log("Voted " + type_int + " factor " + factor);
        var factors = pro ? p.pros : p.cons;
        factor.voters = voters;
        factors[factor.id] = factor;
        this.props.onUpdate(p);
    }

    delete_factor(pro, f) {
        var p = this.props.proposal;
        var factor = pro ? 'pros' : 'cons';
        console.log(p[factor][f.id]);
        p[factor][f.id] = null;
        this.props.onUpdate(p);
    }

    render() {
        var {type_int, user} = this.props;
        var p = this.props.proposal;
        if (!p) return null;
        var pro = type_int == AppConstants.PRO;
        var label = AppConstants.PRO_CON_LABELS[type_int-1];
        var factors = pro ? p.pros : p.cons;
        var _factors;
        if (!factors) _factors = <div className="empty" style={{textAlign: 'left'}}><small>None yet</small></div>
        else _factors = (
            <ul className="factors">
                { util.flattenDict(factors).map((f, i) => {
                return <li key={f.id}>
                            { util.capitalize(f.text) }&nbsp;
                            <Voter user={user}
                                voters={f.voters || []}
                                color={pro ? "#40B67B" : "#F7116A"}
                                onVote={this.handleVote.bind(this, type_int, f)} />&nbsp;
                            <a href="javascript:void(0)" onClick={this.delete_factor.bind(this, pro, f)} className="red show_hover"><i className="fa fa-trash"/></a>
                        </li>
                }) }
            </ul>
        );
        return (
            <div>
                { _factors }
                <FlatButton labelStyle={this.ADD_STYLE} onClick={this.add_pro_con.bind(this, type_int)} label={"Add " + label} />
            </div>
        )
    }
}

