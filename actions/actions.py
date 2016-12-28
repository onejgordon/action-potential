import django_version
import re, logging, string

from google.appengine.ext import webapp, db, deferred
from google.appengine.api import users, images, memcache, taskqueue
from google.appengine.ext.webapp import template

from models import *
import tools
import authorized
import handlers
import json
import logging
import handlers

class WarmupHandler(handlers.BaseRequestHandler):
    def get(self):
        logging.info("Warmup Request")


