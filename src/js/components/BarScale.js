var React = require('react');

import { withRouter } from 'react-router'
var AppConstants = require('constants/AppConstants');
var Voter = require('components/Voter');
var util = require('utils/util');
var bootbox = require('bootbox');
var api = require('utils/api');
import {FlatButton} from 'material-ui';

export default class BarScale extends React.Component {
    static defaultProps = {
        user_value: null,
        average: null,
        onChange: null,
        bars: 7,
        min: -3,
        max: 3,
        height: 50,
        width: 80,
        gap: 4 // px
    }
    constructor(props) {
        super(props);
        this.state = {
        };
        this.QUINTILES = ["Very Low", "Low", "Neutral", "High", "Very High"];
    }

    handle_click(bar) {
        this.props.onChange(bar);
    }

    quintile(value) {
        var {max, min} = this.props;
        if (value == null) return "--";
        var decimal = (value - min) / (max-min);
        return this.QUINTILES[parseInt(decimal * 4)];
    }

    render() {
        var {min, max, bars, gap, width, height, user_value, average} = this.props;
        var _bars = [];
        var increment = (max - min + 1) / bars;
        var counter = 0;
        var seg_width = width / bars;
        var bar_width = seg_width - gap;
        for (var i = min; i <= max; i = i + increment) {
            var bar_height = height * ((counter+1) / bars);
            var in_user_range = user_value == i;
            var in_ave_range = average != null && average >= i;
            var classes = ["bar"];
            if (in_user_range) classes.push("user");
            if (in_ave_range) classes.push("average");
            var style = {
                height: bar_height + 'px',
                left: counter*(gap+bar_width) + 'px',
                width: bar_width + 'px'
            };
            _bars.push(<span key={i} className={classes.join(' ')} style={style} onClick={this.handle_click.bind(this, i)}></span>)
            counter++;
        }
        var bsStyle = {
            width: width + 'px',
            height: height + 'px'
        }
        return (
            <div className="barScale">
                <div className="bars" style={bsStyle}>
                    { _bars }
                </div>
                <div className="text">
                    <span className="user">You: { this.quintile(user_value) }</span> <span className="average">(Avg: { this.quintile(average) })</span>
                </div>
            </div>
        )
    }
}

