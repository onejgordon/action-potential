import os, logging
import webapp2

from actions import actions, adminActions, cronActions, schemaActions
import tasks
from views import views
import secrets
import api

SECS_PER_WEEK = 60 * 60 * 24 * 7
# Enable ctypes -> Jinja2 tracebacks
PRODUCTION_MODE = not os.environ.get(
    'SERVER_SOFTWARE', 'Development').startswith('Development')

ROOT_DIRECTORY = os.path.dirname(__file__)

if not PRODUCTION_MODE:
      from google.appengine.tools.devappserver2.python import sandbox
      sandbox._WHITE_LIST_C_MODULES += ['_ctypes', 'gestalt']
      TEMPLATE_DIRECTORY = os.path.join(ROOT_DIRECTORY, 'src')
else:
      TEMPLATE_DIRECTORY = os.path.join(ROOT_DIRECTORY, 'dist')

curr_path = os.path.abspath(os.path.dirname(__file__))


config = {
      'webapp2_extras.sessions': {
            'secret_key': secrets.COOKIE_KEY,
            'session_max_age': SECS_PER_WEEK,
            'cookie_args': {'max_age': SECS_PER_WEEK},
            'cookie_name': 'echo_sense_session'
      },
      'webapp2_extras.jinja2': {
            'template_path': TEMPLATE_DIRECTORY
    }
}

app = webapp2.WSGIApplication(
     [

      # Admin Actions

      # API - Auth
      webapp2.Route('/api/logout', handler=api.Logout, name="apiLogout"),

      # API - Client
      webapp2.Route('/api/user', handler=api.UserAPI, handler_method="update", methods=["POST"], name="UserAPI"),
      webapp2.Route('/api/user/<uid>', handler=api.UserAPI, handler_method="detail", methods=["GET"], name="UserAPI"),
      webapp2.Route('/api/apilog', handler=api.APILogAPI, handler_method="list", methods=["GET"]),
      webapp2.Route('/api/auth/<action>', handler=api.AuthenticateAPI, handler_method="action"),

      # Misc
      webapp2.Route('/res/<bk>', handler=views.ServeBlob, name="ServeBlob"),
      webapp2.Route('/_ah/warmup', handler=actions.WarmupHandler),


      # Cron jobs (see cron.yaml)
      webapp2.Route('/cron/monthly', handler=cronActions.Monthly),
      webapp2.Route('/cron/digests/admin', handler=cronActions.AdminDigest),

      webapp2.Route(r'/<:.*>', handler=views.ActionPotentialApp, name="ActionPotentialApp"),


      ], debug=True,
    config=config)
