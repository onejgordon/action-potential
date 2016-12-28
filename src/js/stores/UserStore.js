var alt = require('config/alt');
var UserActions = require('actions/UserActions');
import {findItemById, findIndexById} from 'utils/store-utils';
var toastr = require('toastr');
import { browserHistory } from 'react-router';
import {defer} from 'lodash';
var AppConstants = require('constants/AppConstants');

class UserStore {
    constructor() {
        this.bindActions(UserActions);
        this.user = null;
        this.error = null;

        this.exportPublicMethods({
            get_user: this.get_user,
            has_scopes: this.has_scopes
        });
    }

    storeUser(user) {
        this.user = user;
        this.error = null;
        console.log("Stored user "+user.email);
        // api.updateToken(user.token);
        localStorage.setItem(AppConstants.USER_STORAGE_KEY, JSON.stringify(user));
    }

    loadLocalUser() {
        var user;
        try {

            switch (AppConstants.PERSISTENCE) {
                case "bootstrap":
                alt.bootstrap(JSON.stringify(alt_bootstrap));
                break;

                case "localstorage":
                user = JSON.parse(localStorage.getItem(AppConstants.USER_STORAGE_KEY));
                if (user) {
                    console.log("Successfully loaded user " + user.email);
                    this.storeUser(user);
                }
                break;
            }

        } finally {
            if (this.user) {
                console.log("Successfully loaded user " + this.user.email);
            }
        }
    }

    clearUser() {
        this.user = null;
        localStorage.removeItem(AppConstants.USER_STORAGE_KEY);
    }

    onLogin(data) {
        if (data.ok) {
            // this.storeUser(data.user);
            // defer(browserHistory.push.bind(this, `/app/main`));
            window.location = data.redirect;
        } else {
            this.clearUser();
            this.error = data.error;
        }
    }

    onLogout(data) {
        if (data.success) {
            this.clearUser();
            this.error = null;
            toastr.success("You're logged out!");
            browserHistory.push('/app/public');
        }
    }

    onUpdate(data) {
        this.storeUser(data.user);
        if (data.oauth_uri != null) {
            window.location = data.oauth_uri;
        }
    }

    has_scopes(svc) {
        var u = this.getState().user;
        if (u.scopes == null || u.scopes.length == 0) return false;
        if (svc.scopes != null) {
            var ok = true;
            svc.scopes.forEach((scope) => {
                if (u.scopes.indexOf(scope) == -1) ok = false;
            })
            return ok;
        } else return true;
    }

    // Automatic

    get_user(uid) {
        var u = this.getState().users[uid];
        return u;
    }

}

module.exports = alt.createStore(UserStore, 'UserStore');