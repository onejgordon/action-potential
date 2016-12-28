var alt = require('config/alt');
var api = require('utils/api');
import {clone} from 'lodash';
var $ = require('jquery');
import {post} from 'utils/action-utils';

class UserActions {

	constructor() {
		// Automatic action
		this.generateActions('loadLocalUser');
	}

	// Manual actions

	logout() {
		return function(dispatch) {
			try {
				var response = $.post('/api/logout', {}, (res) => {
					dispatch({ success: response.success });
				}, 'json');
			} catch (err) {
				console.error(err);
				dispatch({ok: false, error: err.data});
			}
		}
	}

	login() {
		return function(dispatch) {
			try {
				$.post('/api/auth/login', {}, (res) => {
					dispatch({ok: res.success, redirect: res.data.auth_uri});
				}, 'json');
			} catch (err) {
				console.error(err);
				dispatch({ok: false, error: err.data});
			}
		}
	}


	update(data) {
		return (dispatch) => {
		    api.post("/api/user", data, (res) => {
				dispatch(res.data);
		    })
		}
	}
}

module.exports = alt.createActions(UserActions);