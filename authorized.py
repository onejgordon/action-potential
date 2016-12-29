"""
authorized.py

"""

import django_version
import logging
from constants import *
from datetime import datetime
import messages
import tools

def role(role=None):
    def wrapper(handler_method):
        def check_login(self, *args, **kwargs):
            d = {
                'SITENAME':SITENAME,
                'COMPANY_NAME': COMPANY_NAME,
                'YEAR':datetime.now().year,
                'CURTIME': datetime.now(),
                'GA_ID': GA_ID,
                'DEV': tools.on_dev_server(),
            }
            allow = False
            handled = False
            error_code = 0
            user = None
            session = self.session
            if session.has_key('user'):
                user = session['user']
            if not role:
                allow = True
            elif role == "user":
                if user:
                    allow = True
            elif role == "admin":
                if user and user.is_admin():
                    allow = True
            elif role == "api":
                status = None
                from models import User
                api_auth = self.request.get('auth')
                if not user:
                    if api_auth == API_AUTH:
                        uid = self.request.get_range('uid')
                        pw = self.request.get('pw')
                        token = self.request.get('token')
                        if uid:
                            _user = User.get_by_id(uid)
                            if _user and pw and _user.validatePassword(pw):
                                user = _user # Authorized client API
                            else:
                                error_code = 5 # Auth failed
                        else:
                            error_code = 4 # Malformed
                    else:
                        error_code = 1 # Unauthorized
                        status = 401
                if user:
                    self.user = d['user'] = user
                else:
                    error_code = 3 # User not found
                if not error_code:
                    kwargs['d'] = d
                    handler_method(self, *args, **kwargs)
                else:
                    message = messages.ERROR.LABELS.get(error_code)
                    logging.error(message)
                    self.json_out(success=False, error=error_code, message=message, status=status)
                handled = True
            if not handled:
                if allow:
                    self.user = d['user'] = user
                    kwargs['d'] = d
                    handler_method(self, *args, **kwargs)
                else:
                    self.redirect("/login")

        return check_login
    return wrapper
