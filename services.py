from google.appengine.ext import db, deferred, blobstore
from google.appengine.api import mail, images, urlfetch, memcache
from datetime import datetime, timedelta
import urllib
import logging
from models import Item
from constants import *
import json
from apiclient import discovery
from oauth2client import client

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


class ServiceError(Exception):

    def __init__(self, message, errors=None):
        super(ServiceError, self).__init__(message)

# Config functions


def config_g_tasks(user, http_auth):
    service = discovery.build('tasks', 'v1', http=http_auth)
    options = []
    results = service.tasklists().list(
        maxResults=10).execute()
    logging.debug(results)
    if results:
        options = [{"value": r.get('id'), "label": r.get('title')}
                   for r in results.get('items', [])]
    return {
        "input": "select",
        "multi": False,
        "prop": "taskList",
        "instructions": "Choose a task list",
        "options": options
    }


# Fetch classes

class ServiceFetcher(object):

    def __init__(self, user=None, date_dt=None,
                 next_date_dt=None, http_auth=None, limit=30):
        self.user = user
        self.date_dt = date_dt
        self.next_date_dt = next_date_dt
        self.http_auth = http_auth
        self.limit = limit
        self.service = None

    def build_service(self, api, version):
        logging.debug("Building service for %s (%s)" % (api, version))
        self.service = discovery.build(api, version, http=self.http_auth)

    def fetch(self):
        '''Override'''
        pass


class ServiceFetcher_g_calendar(ServiceFetcher):

    def __init__(self, **kwargs):
        super(ServiceFetcher_g_calendar, self).__init__(**kwargs)

    def fetch(self):
        logging.debug("Fetching google calendar data")
        self.build_service('calendar', 'v3')
        timeMin = self.date_dt.isoformat() + 'Z'
        timeMax = self.next_date_dt.isoformat() + 'Z'
        results = self.service.events().list(calendarId='primary',
                                             maxResults=self.limit,
                                             timeMin=timeMin,
                                             timeMax=timeMax).execute()
        if results:
            items = [
                Item(
                    svc=SERVICE.GCAL,
                    title=r.get('summary'),
                    details=r.get('description'),
                    id=r.get('id'),
                    type=SERVICE.EVENT).json() for r in results.get(
                    'items',
                    [])]
            return items
        return []


class ServiceFetcher_g_tasks(ServiceFetcher):

    def __init__(self, **kwargs):
        super(ServiceFetcher_g_tasks, self).__init__(**kwargs)

    def fetch(self):
        self.build_service('tasks', 'v1')
        timeMin = self.date_dt.isoformat() + 'Z'
        timeMax = self.next_date_dt.isoformat() + 'Z'
        gt_settings = self.user.get_svc_settings('g_tasks')
        tasklist = gt_settings.get('taskList', {}).get("value")
        if tasklist:
            results = self.service.tasks().list(
                tasklist=tasklist,
                maxResults=self.limit,
                completedMin=timeMin,
                completedMax=timeMax).execute()
            if results:
                logging.debug(results)
                items = [
                    Item(
                        svc=SERVICE.GTASKS,
                        title=r.get('title'),
                        id=r.get('id'),
                        type=SERVICE.TASK).json() for r in results.get(
                        'items',
                        [])]
                return items
        else:
            raise ServiceError("No tasklist configured")
        return []


class ServiceFetcher_g_mail(ServiceFetcher):

    def __init__(self, **kwargs):
        super(ServiceFetcher_g_mail, self).__init__(**kwargs)
        self.items = []

    def _handle_gmail_message(self, request_id, response, exception):
        if exception is not None:
            logging.error(str(exception))
        else:
            if response:
                headers = response.get('payload').get('headers')
                subject = _from = _to = _date = None
                for h in headers:
                    if h.get('name') == 'Subject':
                        subject = h.get('value')
                    if h.get('name') == 'From':
                        _from = h.get('value')
                    if h.get('name') == 'To':
                        _to = h.get('value')
                    if h.get('name') == 'Date':
                        _date = h.get('value')
                if subject and _from:
                    self.items.append(
                        Item(
                            svc=SERVICE.GMAIL,
                            title=subject,
                            subhead=_from,
                            id=response.get('id'),
                            type=SERVICE.EMAIL).json())

    def fetch(self):
        BATCH_MESSAGES = True
        before_gdate = datetime.strftime(self.next_date_dt, "%Y/%m/%d")
        after_gdate = datetime.strftime(self.date_dt, "%Y/%m/%d")
        self.build_service('gmail', 'v1')
        query = 'before:%s after:%s' % (before_gdate, after_gdate)
        logging.debug(query)
        if BATCH_MESSAGES:
            # Fetch message IDs
            results = self.service.users().messages().list(
                userId='me', maxResults=self.limit, q=query).execute()
            if results:
                ids = [r.get('id') for r in results.get('messages', [])]
                if ids:
                    batch = self.service.new_batch_http_request(
                        callback=self._handle_gmail_message)
                    for id in ids:
                        batch.add(
                            self.service.users().messages().get(
                                id=id, userId="me"), request_id=id)
                    # Blocks, populates self.items
                    batch.execute(http=self.http_auth)
        else:
            # Only threads show snippets in Gmail API?
            results = self.service.users().threads().list(
                userId='me', maxResults=self.limit, fields='threads', q=query).execute()
            if results:
                self.items = [
                    Item(
                        svc=SERVICE.GMAIL,
                        title=r.get('snippet'),
                        id=r.get('id'),
                        type=SERVICE.EMAIL).json() for r in results.get(
                        'threads',
                        [])]
        return self.items


class ServiceFetcher_g_drive(ServiceFetcher):

    def __init__(self, **kwargs):
        super(ServiceFetcher_g_drive, self).__init__(**kwargs)

    def fetch(self):
        self.build_service('drive', 'v3')
        timeMin = self.date_dt.isoformat()
        timeMax = self.next_date_dt.isoformat()
        query = "(viewedByMeTime > '%s' and viewedByMeTime < '%s') OR (createdTime > '%s' and createdTime < '%s' and '%s' in owners)" % (
            timeMin, timeMax, timeMin, timeMax, self.user.email)
        items = []
        results = self.service.files().list(
            orderBy='modifiedTime',
            pageSize=self.limit,
            spaces='drive,photos',
            fields='files(createdTime,description,id,kind,viewedByMeTime,modifiedTime,name,spaces,webViewLink,thumbnailLink),kind',
            q=query).execute()
        for f in results.get('files', []):
            spaces = f.get('spaces')
            is_image = 'photos' in spaces
            type = SERVICE.DOCUMENT if not is_image else SERVICE.PHOTO
            webViewLink = f.get('webViewLink')
            thumbnailLink = f.get('thumbnailLink')
            item = Item(svc=SERVICE.GDRIVE,
                        title=f.get('name'),
                        id=f.get('id'),
                        image=thumbnailLink,
                        details=f.get('description'),
                        type=type)
            if is_image:
                logging.debug(f)
            items.append(item.json())
        return items


class ServiceFetcher_nyt_news(ServiceFetcher):

    def __init__(self, **kwargs):
        super(ServiceFetcher_nyt_news, self).__init__(**kwargs)

    def fetch(self):
        from secrets import NYT_API_KEY
        params = urllib.urlencode({
            'api-key': NYT_API_KEY,
            'fq': "section_name:(\"World\" \"U.S.\")",
            'begin_date': datetime.strftime(self.date_dt, "%Y%m%d"),
            'end_date': datetime.strftime(self.next_date_dt, "%Y%m%d")
        })
        url = "https://api.nytimes.com/svc/search/v2/articlesearch.json?" + params
        logging.debug(url)
        response = urlfetch.fetch(url, method=urlfetch.GET)
        items = []
        IMAGE_BASE = "http://www.nytimes.com/"
        MIN_WIDTH = 300
        if response.status_code == 200:
            j_response = json.loads(response.content)
            results = j_response.get('response', {}).get('docs', [])
            for news in results:
                cat = news.get('news_desk')
                multimedia = news.get('multimedia')
                image = None
                for mm in multimedia:
                    w = mm.get('width')
                    if w > MIN_WIDTH:
                        image = IMAGE_BASE + mm.get('url')
                item = Item(
                    svc=SERVICE.NYT_NEWS,
                    title=news.get(
                        'headline',
                        {}).get('main'),
                    image=image,
                    details=news.get('snippet'),
                    link=news.get('web_url'),
                    id=news.get('_id'),
                    type=SERVICE.NEWS)
                items.append(item.json())
        return items
