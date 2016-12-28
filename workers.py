import tools
from constants import *
from models import *
from datetime import datetime
import gc
import logging
import random
from expressionParser import ExpressionParser
from google.appengine.api import logservice
from google.appengine.api import memcache
from google.appengine.api import search
from google.appengine.api import taskqueue
from google.appengine.ext import blobstore
from google.appengine.ext import db
from google.appengine.ext import deferred
from google.appengine.runtime import DeadlineExceededError
import traceback
from decorators import deferred_task_decorator

MAX_REQUEST_SECONDS = 40 # TODO: Should this be 5 mins?

USE_DEFERRED = True

class TooLongError(Exception):
    def __init__(self):
        pass



