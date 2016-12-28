var React = require('react');

var SimpleAdmin = require('components/SimpleAdmin');
var LoadStatus = require('components/LoadStatus');
var AppConstants = require('constants/AppConstants');
var util = require('utils/util');
var FetchedList = require('components/FetchedList');
var api = require('utils/api');
var bootbox = require('bootbox');
var mui = require('material-ui'),
  List = mui.List,
  ListItem = mui.ListItem,
  TextField = mui.TextField,
  FontIcon = mui.FontIcon,
  Tabs = mui.Tabs,
  Tab = mui.Tab,
  RaisedButton = mui.RaisedButton;

export default class AdminUser extends React.Component {
    static defaultProps = {}
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render_ml(ml) {
        return (<li className="list-group-item">
            <span className="title">{ ml.id }</span>
        </li>)
    }

    render_message(m) {
        return (<li className="list-group-item">
            <span className="title">{ m.id }</span>
            <span hidden={!m.audio_uri}><a href={m.audio_uri} target="_blank" className="right"><i className="fa fa-play"/> Play</a></span>
        </li>)
    }

    render_transcription(tx) {
        return (<li className="list-group-item">
            <span className="title" title={tx.text}>{ util.truncate(tx.text, 30) }</span>
            <span className="sub">{ tx.message_id }</span>
        </li>)
    }

    do_delete() {
        var that = this;
        var user_id = this.props.params.userId;
        var data = {
            id: user_id,
            user_data_only: 1
        }
        api.post("/api/user/delete", data, function(res) {

        });
    }

    confirm_delete() {
        var that = this;
        bootbox.confirm("Really delete all user data (besides user itself)?", function(ok) {
            if (ok) {
                that.do_delete();
            }
        });
    }

    render() {
        var user_id = this.props.params.userId;
        var params = {
            user_id: user_id
        }
        var log_type = this.state.log_type;
        return (
            <div>

                <h1><i className="fa fa-users"></i> Admin User - { user_id }</h1>

                <Tabs>
                    <Tab label="Messages">

                        <FetchedList url="/api/message" ref="messages" params={{author_id: user_id}} listProp="messages" renderItem={this.render_message.bind(this)} />

                    </Tab>

                    <Tab label="Transcriptions">

                        <FetchedList url="/api/transcription" ref="transcriptions" params={{author_id: user_id}} listProp="transcriptions" renderItem={this.render_transcription.bind(this)} />

                    </Tab>

                    <Tab label="Message Logs">

                        <FetchedList url="/api/msglog" ref="mls" listProp="msglogs" params={params} renderItem={this.render_ml.bind(this)} />
                    </Tab>

                </Tabs>

                <RaisedButton labelColor="white" backgroundColor="red" label="Delete All Messages and Transcriptions" onClick={this.confirm_delete.bind(this)} />
            </div>
        );
    }
}
