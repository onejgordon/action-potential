from google.appengine.api import users, images
from datetime import datetime
from google.appengine.ext.webapp import blobstore_handlers
from models import *
from constants import *
import urllib
import tools
import authorized
import handlers
import logging

class ActionPotentialApp(handlers.BaseRequestHandler):
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

