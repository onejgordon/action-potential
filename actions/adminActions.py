import re, logging
from google.appengine.ext import webapp, db, deferred
from models import *
from constants import *
import services
import authorized
import handlers

class Init(handlers.BaseRequestHandler):
    '''Initialize / Install Echo Sense with first account / user

    Params:
        enterprise (int): 1 to create Enterprise
        user (int): 1 to create admin User
        email (string): If creating user
        password (string): If creating user
        phone (string): If creating user
    '''
    def get(self):
        e = None
        create_user = self.request.get_range('user') == 1
        pw = self.request.get('pw')

        if pw == INSTALL_PW:

            empty_db = Organization.query().get() is None

            if empty_db:

                if create_user:
                    email = self.request.get('email')
                    password = self.request.get('password')
                    phone = self.request.get('phone')
                    u = User.Create(email=email)
                    u.Update(password=password, level=USER.ADMIN, phone=phone)
                    u.put()

                self.response.out.write("OK")
            else:
                self.response.out.write("App already installed")



class CleanDelete(handlers.BaseRequestHandler):
    """Completely removes a single entity with given key by calling their clean_wipe method, if present"""
    @authorized.role("admin")
    def get(self, key, d):
        origin = str(self.request.get('origin', default_value="/admin"))
        if key:
            entity = db.get(key)
            if entity:
                try:
                    entity._clean_delete()
                except:
                    logging.debug("Failed to clean delete entity key(%s) kind(%s).  Perhaps method clean_wipe isn't defined?  Or perhaps we timed out." % (key, entity.kind()))
        self.redirect(origin)

class SimpleDeleteEntity(handlers.BaseRequestHandler):
    @authorized.role("admin")
    def get(self, key, d):
        origin = self.request.get('origin')
        if not origin:
            origin = "/admin"
        entity = db.get(key)
        if entity:
            entity.delete()
        self.redirect(origin)

class UpdateGoogleKeyCerts(handlers.BaseRequestHandler):
    @authorized.role()
    def get(self, d):
        cert = services.UpdateGoogleKeyCerts()
        self.json_out(cert)

class CreateUser(handlers.BaseRequestHandler):
    @authorized.role("admin")
    def get(self, key, d):
        pass

class LogoutUser(handlers.BaseRequestHandler):
    @authorized.role("admin")
    def get(self, ukey, d):
        u = User.get(ukey)
        if u:
            u.session_id_token = None
            u.put()
        self.redirect_to("vAdminUsers")
