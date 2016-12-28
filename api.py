import os, logging
from datetime import datetime
from google.appengine.ext import db, blobstore, deferred
from google.appengine.api import mail
from models import *
import tools
import authorized
import json
import handlers
from oauth2client import client

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

class PublicAPI(handlers.JsonRequestHandler):

    @authorized.role()
    def forgot_password(self, email_or_phone, d):
        success = False
        override_sitename = self.request.get('override_sitename')
        if email_or_phone:
            user = User.FuzzyGet(email_or_phone)
            if user:
                if user.email:
                    new_password = user.setPass()
                    user.put()
                    success = True
                    if tools.on_dev_server():
                        logging.debug(new_password)
                    message = "Password reset successful - check your email"
                    prefix = EMAIL_PREFIX if not override_sitename else "[ %s ] " % override_sitename
                    deferred.defer(mail.send_mail, SENDER_EMAIL, user.email, prefix + "Password Reset", "Your password has been reset: %s. You can change this upon signing in." % new_password)
                else:
                    message = "No email address on file for that user. Please contact support."
            else:
                message = "User not found..."
        else:
            message = "Email or phone required"
        self.json_out(success=success, message=message)


class UserAPI(handlers.JsonRequestHandler):
    """
    """
    @authorized.role('api')
    def list(self, d):
        message = None
        users = User.query().fetch(100)
        success = True
        data = {
            'users': [user.json() for user in users]
            }
        self.json_out(data, success=success, message=message)


    @authorized.role('api')
    def update(self, d):
        success = False
        message = None
        missing_scopes = []
        id = self.request.get_range('id')
        params = tools.gets(self, strings=['name','password','phone','email','location_text','currency'],
            integers=['level'], lists=['services_enabled'], json=['service_settings'], ignoreMissing=True)
        user = None
        isSelf = False
        if id:
            user = User.get_by_id(id)
        else:
            user = User.Create(email=params.get('email'), phone=params.get('phone'))
        if user:
            isSelf = user.key == self.user.key
            user.Update(**params)
            missing_scopes = user.check_available_scopes()
            user.put()
            success = True
        if user:
            if isSelf:
                self.session['user'] = user
                message = "Profile saved"
            else:
                message = "User saved"
        else:
            message = "Problem creating user"
        data = {
            'user': user.json() if user else None,
        }
        if user and missing_scopes:
            data['oauth_uri'] = user.get_auth_uri(scope=' '.join(missing_scopes))
        self.json_out(data, success=success, message=message)

    @authorized.role('api')
    def delete(self, d):
        id = self.request.get_range('id')
        success = False
        if id:
            u = User.get_by_id(id)
            if u and self.user.is_admin():
                u.clean_delete()
                success = True
        self.json_out(success=success)


class APILogAPI(handlers.JsonRequestHandler):
    @authorized.role('api')
    def list(self, d):
        success = False
        message = None

        _max = self.request.get_range('max', max_value=500, default=100)

        apilogs = APILog.Recent(_max=_max)
        success = True

        data = {
            'logs': [r.json() for r in apilogs]
            }
        self.json_out(data, success=success, message=message)


class UploadMedia(handlers.BaseUploadHandler):
    def post(self):
        try:
            tid = self.request.get_range('tid')
            prop = self.request.get('prop')
            file_infos = self.get_file_infos()
            user = self.session.get('user')
            dbp = []
            urls = []
            if tid and user:
                t = Topic.get_by_id(tid)
                if t:
                    if len(file_infos):
                        for fi in file_infos:
                            if fi and fi.gs_object_name:
                                params = {};
                                params[prop] = fi.gs_object_name;
                                t.Update(**params)
                                dbp.append(t)
                            else: raise Exception("Malformed 2")
                    else: raise Exception("No file data found")
                else: raise Exception("Topic not found with ID %s. User: %s" % (tid, user))
                if dbp:
                    ndb.put_multi(dbp)
            else: raise Exception("Malformed")
        except Exception, e:
            logging.error(e)
            self.response.out.write("Error: %s" % e)
            self.response.set_status(500)
        else:
            if dbp:
                self.response.out.write(json.dumps({'media': [p.json() for p in dbp]}))
            else:
                self.response.out.write("OK")


class Logout(handlers.JsonRequestHandler):
    def post(self):
        if self.session.has_key('user'):
            for key in self.session.keys():
                del self.session[key]
        self.json_out({'success': True})


class AuthenticateAPI(handlers.BaseRequestHandler):
    @authorized.role()
    def action(self, action, d):
        base = "http://localhost:8080" if tools.on_dev_server() else BASE
        if action == 'login':
            scope = "email profile"
            flow = User.get_auth_flow(scope=scope)
            flow.params['access_type'] = 'offline'
            flow.params['include_granted_scopes'] = 'true'
            auth_uri = flow.step1_get_authorize_url(state=scope)
            self.json_out({'auth_uri': auth_uri}, success=True, debug=True)

        elif action == 'oauth2callback':

            error = self.request.get('error')
            code = self.request.get('code')
            scope = self.request.get('scope')
            state_scopes = self.request.get('state')

            if code:
                CLIENT_SECRET_FILE = os.path.join(os.path.dirname(__file__), 'client_secrets.json')

                credentials = client.credentials_from_clientsecrets_and_code(
                    CLIENT_SECRET_FILE,
                    scope.split(' '),
                    code,
                    redirect_uri=base + "/api/auth/oauth2callback")
                user = self.user
                if not user:
                    email = credentials.id_token['email']
                    user = User.GetByEmail(email)
                    if not user:
                        # Create account
                        user = User.Create(email=email)

                if user:
                    user.save_credentials(credentials)
                    user.put()
                    self.session['user'] = user
            elif error:
                logging.error(error)


            self.redirect("/app/settings")

