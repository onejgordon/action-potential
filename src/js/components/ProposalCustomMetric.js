var React = require('react');
var AppConstants = require('constants/AppConstants');
var util = require('utils/util');
var Select = require('react-select');


export default class ProposalCustomMetric extends React.Component {
    static defaultProps = {
        proposal: null,
        decision: null,
        user: null,
        metric_index: null
    }

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    get_my_metric_rating() {
        var {user, proposal, metric_index} = this.props;
        if (proposal.custom_metrics && proposal.custom_metrics[metric_index]) {
            return proposal.custom_metrics[metric_index][user.uid] || null;
        } else return null;
    }

    get_metric_average() {
        var {proposal, metric_index} = this.props;
        if (proposal.custom_metrics && proposal.custom_metrics[metric_index]) {
            var cm = proposal.custom_metrics;
            var total = 0;
            var n = 0;
            for (var uid in cm[metric_index]) {
                if (cm[metric_index].hasOwnProperty(uid)) {
                    total = total + cm[metric_index][uid];
                    n = n + 1;
                }
            }
            console.log(total);
            if (n > 0) return total / n;
            else return null;
        }
        return null;
    }

    change_rating(option) {
        var {user, proposal, metric_index} = this.props;
        if (user) {
            if (!proposal.custom_metrics) proposal.custom_metrics = {};
            if (!proposal.custom_metrics[metric_index]) proposal.custom_metrics[metric_index] = {};
            if (option == null) delete proposal.custom_metrics[metric_index][user.uid];
            else {
                var val = option.value;
                proposal.custom_metrics[metric_index][user.uid] = val;
            }
            this.props.onUpdate(proposal);
        }
    }

    render() {
        var {metric_index, proposal} = this.props;
        if (!proposal) return <div></div>;
        var my_rating = this.get_my_metric_rating();
        var team_rating = this.get_metric_average();
        return (
            <div>
                <b>Team:</b> { team_rating || "?" }<br/>
                <Select options={AppConstants.METRIC_RATINGS} value={my_rating} onChange={this.change_rating.bind(this)} />
            </div>
        );
    }
}