import logging
from datetime import datetime, timedelta
from google.appengine.ext import ndb, deferred
from google.appengine.api import memcache, mail
import json
from constants import *
import tools
from oauth2client import client
import httplib2

class User(ndb.Model):
    """
    Users can record audio messages, as well as upvote and translate audio
    Key - ID
    """
    pw_sha = ndb.StringProperty(indexed=False)
    pw_salt = ndb.StringProperty(indexed=False)
    name = ndb.StringProperty(indexed=False)
    email = ndb.StringProperty()
    phone = ndb.StringProperty()  # Standard international
    dt_created = ndb.DateTimeProperty(auto_now_add=True)
    dt_last_login = ndb.DateTimeProperty(auto_now_add=True)
    level = ndb.IntegerProperty(default=USER.USER)
    location_text = ndb.StringProperty(indexed=False)
    currency = ndb.TextProperty(default="USD") # 3-letter e.g. USD
    credentials = ndb.TextProperty() # JSON credentials from oauth2client.client.Credentials
    # Service setup
    services_enabled = ndb.StringProperty(repeated=True, indexed=False)
    service_settings = ndb.TextProperty() # JSON ( service_key -> settings object )

    def __str__(self):
        return self.name if self.name else "User"

    def json(self):
        data = {
            'id': self.key.id(),
            'level':self.level,
            'level_name':self.print_level(),
            'name': self.name,
            'email':self.email,
            'phone': self.phone,
            'location_text': self.location_text,
            'ts_created': tools.unixtime(self.dt_created),
            'services_enabled': self.services_enabled,
            'service_settings': tools.getJson(self.service_settings)
        }
        credentials = tools.getJson(self.credentials)
        if credentials:
            data['scopes'] = credentials.get('scopes')
        return data

    @staticmethod
    def FuzzyGet(login):
        is_email = tools.is_valid_email(login)
        if is_email:
            return User.GetByEmail(login)
        else:
            phone = tools.standardize_phone(login)
            if phone:
                return User.GetByPhone(phone)
        return None


    @staticmethod
    def GetByEmail(email):
        u = User.query().filter(User.email == email.lower()).get()
        return u

    @staticmethod
    def Create(email=None, phone=None, name=None, level=None, notify=True, credentials=None):
        if (email or phone):
            u = User(email=email.lower() if email else None, phone=tools.standardize_phone(phone), name=name)
            if credentials:
                u.credentials = json.dumps(credentials)
            if email and email.lower() == ADMIN_EMAIL:
                u.level = USER.ADMIN
            elif notify:
                label = email if email else phone
                deferred.defer(mail.send_mail, SENDER_EMAIL, NOTIF_EMAILS, EMAIL_PREFIX + " New User: %s" % label, "That is all")
            u.services_enabled = SERVICE.DEFAULT
            return u
        return None

    def Update(self, **params):
        if 'name' in params:
            self.name = params['name']
        if 'email' in params:
            self.email = params['email']
        if 'phone' in params:
            self.phone = params['phone']
        if 'level' in params:
            self.level = params['level']
        if 'location_text' in params:
            self.location_text = params['location_text']
        if 'password' in params:
            if params['password']:
                self.setPass(params['password'])
        if 'services_enabled' in params:
            self.services_enabled = params['services_enabled']
        if 'service_settings' in params:
            self.service_settings = json.dumps(params['service_settings'])

    def get_svc_settings(self, svc_key):
        svc_settings = tools.getJson(self.service_settings)
        return svc_settings.get(svc_key, {})

    def save_credentials(self, credentials_object):
        logging.debug('save_credentials')
        logging.debug(credentials_object.to_json())
        self.credentials = json.dumps(credentials_object.to_json())

    @classmethod
    def get_auth_flow(cls, scope, user=None):
        import os
        CLIENT_SECRET_FILE = os.path.join(os.path.dirname(__file__), 'client_secrets.json')
        base = 'http://localhost:8080' if tools.on_dev_server() else BASE
        flow = client.flow_from_clientsecrets(
            CLIENT_SECRET_FILE,
            scope=scope,
            cache=memcache,
            login_hint=user.email if user else None,
            message="Woops! client_secrets.json missing or invalid",
            redirect_uri='%s/api/auth/oauth2callback' % base)
        flow.params['include_granted_scopes'] = 'true'
        flow.params['access_type'] = 'offline'
        return flow

    def get_credentials(self):
        if self.credentials:
            cr = client.Credentials.new_from_json(json.loads(self.credentials))
            expires_in = cr.token_expiry - datetime.utcnow()
            logging.debug("expires_in: %s" % expires_in)
            if expires_in < timedelta(minutes=15):
                cr.refresh(httplib2.Http())
                self.save_credentials(cr)
                self.put()
            return cr
        return None

    def get_auth_uri(self, scope, state=None):
        base = 'http://localhost:8080' if tools.on_dev_server() else BASE
        flow = User.get_auth_flow(scope=scope, user=self)
        auth_uri = flow.step1_get_authorize_url(state=state)
        return auth_uri

    def get_http_auth(self):
        cr = self.get_credentials()
        if cr:
            http_auth = cr.authorize(httplib2.Http())
            return http_auth
        return None

    def check_available_scopes(self):
        cr = self.get_credentials()
        scopes = cr.retrieve_scopes(httplib2.Http())
        missing_scopes = []
        for scope in self.needed_scopes():
            if scope not in scopes:
                missing_scopes.append(scope)
        if missing_scopes:
            logging.debug("Missing scopes: %s" % missing_scopes)
        return missing_scopes

    def needed_scopes(self):
        '''
        Return space separated string of scopes needed for enabled services.
        '''
        scopes = []
        for svc in self.services_enabled:
            svc_scopes = SERVICE.SCOPES.get(svc)
            if svc_scopes:
                scopes.extend(svc_scopes.split(' '))
        return scopes

    def print_level(self):
        return USER.LABELS.get(self.level)

    def is_admin(self):
        return self.level == USER.ADMIN

    def is_account_admin(self):
        return self.level == USER.ACCOUNT_ADMIN

    def clean_delete(self):
        self.key.delete()

    def getTimezone(self):
        if self.timezone:
            return pytz.timezone(self.timezone)
        return self.enterprise.get_timezone()

    def validatePassword(self, user_password):
        salt, pw_sha = tools.getSHA(user_password, self.pw_salt)
        pw_valid = self.pw_sha == pw_sha
        return pw_valid

    def setPass(self, pw=None):
        if not pw:
            pw = tools.GenPasswd(length=6)
        self.pw_salt, self.pw_sha = tools.getSHA(pw)
        return pw


class APILog(ndb.Model):
    """
    Key - ID
    """
    user = ndb.KeyProperty(User)
    # Request
    host = ndb.TextProperty()
    path = ndb.TextProperty()
    status = ndb.IntegerProperty(indexed=False)
    request = ndb.TextProperty() # With authentication params stripped
    method = ndb.TextProperty()
    date = ndb.DateTimeProperty(auto_now_add=True)
    # Response
    success = ndb.BooleanProperty(indexed=False)
    message = ndb.TextProperty()

    def json(self):
        return {
            'id': self.key.id(),
            'ts': tools.unixtime(self.date),
            'host': self.host,
            'path': self.path,
            'method': self.method,
            'status': self.status,
            'request': self.request,
            'success': self.success,
            'message': self.message
        }

    @staticmethod
    def Create(request, user=None, enterprise=None, status=200, success=None, message=None):
        try:
            path = request.path
            host = request.host
            method = request.method
            AUTH_PARAMS = ['auth', 'password']  # To not be included in log
            req = {}
            for arg in request.arguments():
                if arg not in AUTH_PARAMS:
                    try:
                        req[arg] = request.get(arg)
                    except Exception, ex:
                        logging.warning("Unable to log arg: %s (%s)" % (arg, ex))
            if path and (user or enterprise):
                if not enterprise:
                    enterprise = user.enterprise
                al = APILog(path=path, user=user, enterprise=enterprise, parent=enterprise, status=status, method=method, host=host, request=json.dumps(req), message=message)
                if success is not None:
                    al.success = success
                if al:
                    al.put()
                return al
            return None
        except Exception, e:
            logging.error("Error creating APILog: %s" % e)
            return None

    @staticmethod
    def Recent(_max=20):
        q = APILog.query().order(-APILog.date)
        return q.fetch(_max)
