import logging
from datetime import datetime
from constants import *
import handlers



class WarmupHandler(handlers.BaseRequestHandler):
    def get(self):
        logging.info("Warmup Request")


class Monthly(handlers.BaseRequestHandler):
    def get(self):
        pass


class AdminDigest(handlers.BaseRequestHandler):
    def get(self):
        pass
