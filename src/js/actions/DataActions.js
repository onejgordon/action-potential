var alt = require('config/alt');
import api from 'utils/api';
var util = require('utils/util');
import {clone} from 'lodash';
import {get} from 'utils/action-utils';

class DataActions {

	constructor() {
		// Automatic action
		this.generateActions('get_day_data', 'get_recent_stars');
	}

	// Manual actions

	fetchDayData(mckeys, date, limit) {
		return function(dispatch) {
			api.post("/api/fetch", {mckeys: mckeys.join(','), date: date, limit: limit}, (res) => {
				dispatch(res.data);
		    });
		}
	}

	starDate(date_string, do_star) {
		return function(dispatch) {
			api.post("/api/searches/star", {date: date_string, star: do_star}, (res) => {
				dispatch(res.data);
		    });
		}
	}

	fetchRecentStars() {
		return function(dispatch) {
			api.get("/api/searches/starred", {}, (res) => {
				dispatch(res.data);
		    });
		}
	}

}

module.exports = alt.createActions(DataActions);