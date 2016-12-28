import django_version
import os
from google.appengine.api import users, images
from datetime import datetime, timedelta
from google.appengine.ext.webapp import blobstore_handlers
from models import *
from constants import *
import webapp2
import urllib
import tools
import authorized
import actions
import handlers
import logging
import jinja2

class CloudmemoryApp(handlers.BaseRequestHandler):
    @authorized.role()
    def get(self, *args, **kwargs):
        gmods = {
          "modules" : [
            # {
            #     "name": "maps",
            #     "version": "3",
            #     "language": "en"
            # }
          ]
        }
        d = kwargs.get('d')
        d['constants'] = {
            "ga_id": GA_ID
        }
        d['alt_bootstrap'] = {
            "UserStore": {
                'user': self.user.json() if self.user else None
            }
        }
        d['gautoload'] = urllib.quote_plus(json.dumps(gmods).replace(' ',''))
        self.render_template("index.html", **d)


def serveResource(self, bk, size=0):
    USE_SERVING_URL = True
    try:
        # Fix?
        if USE_SERVING_URL and not tools.on_dev_server():
            url = images.get_serving_url(bk)
            url += "=s%d" % size
            self.redirect(url)
        else:
            blob_info = blobstore.BlobInfo.get(bk)
            self.send_blob(blob_info, content_type="image/jpeg")
    except Exception, e:
        logging.error("Error in serveResource: %s" % e)
        self.error(404)

class ServeBlob(blobstore_handlers.BlobstoreDownloadHandler):
    def get(self, bk, ext=None):
        """
        Size: 0 = full, 100 = 100px wide
        """
        size = self.request.get_range('size', default=0)
        serveResource(self, bk, size=size)
