import urllib, time, re
from datetime import datetime, timedelta
from google.appengine.ext import webapp
import jinja2
import json
from models import *
import tools

# register = webapp.template.create_template_register()

def printjson(d):
    return jinja2.Markup(json.dumps(d))

