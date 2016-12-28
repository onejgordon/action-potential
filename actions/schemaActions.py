import logging
from google.appengine.ext import db
from models import *
from constants import *

import tools
import authorized
import handlers

class DoSchema(handlers.BaseRequestHandler):
    @authorized.role('admin')
    def get(self, d):
        BATCH_SIZE = 100
        cursor = self.request.get('cursor')
        q = Question.all()
        if cursor:
            q.with_cursor(cursor)
        logging.debug("Query count: %d" % q.count())
        batch = q.fetch(BATCH_SIZE)
        identifiers = []
        if batch:
            new_cursor = q.cursor()
            next_url = '/admin/schema/do_schema?cursor=%s' % (new_cursor)

            changed = []
            for item in batch:
                edited = False
                try:
                    if item.correct_response:
                        item.correct_responses=[item.correct_response]
                        item.correct_response = None
                        edited = True
                    if edited:
                        changed.append(item)
                except Exception, e:
                    logging.error("Error: %s" % e)
                identifiers.append("Question: %s, Changed: %s" % (item.correct_responses, edited))
            db.put(changed)

            context = {
                'identifiers': identifiers,
                'next_url': next_url,
                }
            self.render_template("schema_update.html", **context)
        else:
            self.redirect("/admin")
