import os, time, sys, random, urllib, string, logging, math, re, uuid
from datetime import datetime, timedelta, date
from datetime import time as _time
from google.appengine.ext import db, deferred
from google.appengine.api import mail, taskqueue, images, urlfetch
import cgi
import hashlib
import pytz
import json
from decimal import Decimal

def GenPasswd(length=8, chars=string.letters.upper()):
    return ''.join([random.choice(chars) for i in range(length)])

html_escape_table = {
    "&": "&amp;",
    '"': "&quot;",
    "'": "&apos;",
    ">": "&gt;",
    "<": "&lt;",
    }

def html_escape(text):
    """Produce entities within text."""
    if text:
        return "".join(html_escape_table.get(c, c) for c in text)
    else:
        return ""

def standardize_phone(phone):
    """
    First strips punctuation
    """
    ccode=0
    pattern=None
    if type(phone) is float:
        phone = str(int(phone))
    else:
        phone = str(phone)
    tomatch=""
    phone = phone.replace("-", "").replace("(", "").replace(")", "").replace("+", "").replace(" ", "").replace("\"", "").replace(".", "").replace("'", "")
    if not phone.isdigit():
        return None
    return phone


def on_dev_server():
    if 'Development' == os.environ['SERVER_SOFTWARE'][:11]:
        return True
    else:
        return False

def iconify(imageobj, width=250, height=None):
    image = images.Image(imageobj)
    if not height:
        height = width
    image.resize(width=width, height=height)
    return image.execute_transforms(output_encoding=images.JPEG)

def simple_select(vals, labels=None):
    """Returns an object for use in the dropdown filter.  Selected is the initial value to highlight"""
    if labels is None:
        labels = vals
    obj = [vals, labels]
    return obj

def truncate(value, chars=40):
    if value:
        if len(value) < chars:
            return value
        else:
            return value[:chars] + '...'
    else:
        return ""

def clone_entity(e, **extra_args):
    """Clones an entity, adding or overriding constructor attributes.

    The cloned entity will have exactly the same property values as the original
    entity, except where overridden. By default it will have no parent entity or
    key name, unless supplied.

    Args:
        e: The entity to clone
        extra_args: Keyword arguments to override from the cloned entity and pass
          to the constructor.
    Returns:
        A cloned, possibly modified, copy of entity e.
    """
    klass = e.__class__
    props = dict((k, v.__get__(e, klass)) for k, v in klass.properties().iteritems())
    props.update(extra_args)
    return klass(**props)

def str_to_tuple(s):
    return tuple(float(x) for x in s[1:-1].split(','))

def create_paging_specs(self, items_query, items_per_page=25):
    pg = self.request.get_range('pg', default=1)
    n_items = items_query.count()
    items = items_query.fetch(items_per_page, offset=(pg-1)*items_per_page)
    if n_items < items_per_page:
        n_pages = 1
    else:
        n_pages = n_items / items_per_page
        if n_items % items_per_page > 0:
            n_pages += 1
    specs = [n_pages, pg]
    return [items, specs]

def unixtime(dt=None, ms=True):
    if not dt:
        dt = datetime.now()
    unix = time.mktime(dt.timetuple())*1e3 + dt.microsecond/1e3
    if ms:
        return int(unix)
    else:
        return int(unix)/1000.

def stime(t):
    if t is not None:
        dt = datetime.combine(datetime.today().date(), t)
        return datetime.strftime(dt, "%H:%M")
    else:
        return "--"


def sdatetime(date, fmt="%Y-%m-%d %H:%M %Z", tz=None):
    if date:
        if isinstance(tz, basestring):
            _tz = pytz.timezone(tz)
        else:
            _tz = pytz.UTC
        date = pytz.utc.localize(date).astimezone(_tz)
        return datetime.strftime(date, fmt)
    else:
        return "N/A"

def sdate(date):
    return datetime.strftime(date, "%Y-%m-%d")

def total_seconds(td):
    return (td.microseconds + (td.seconds + td.days * 24 * 3600) * 10**6) / 10**6

def is_valid_email(email):
    email_re = r"[^@]+@[^@]+\.[^@]+"
    return True if re.match(email_re, email) else False

def validate_newval(propname, newval):
    if propname == "email":
        valid = is_valid_email(newval)
        return valid
    else:
        return True

def prefetch_reference_properties(entities, *prop_names, **kwargs):
    """
    Preloads the reference properties of multiple entities in the same get call.
    It modifies the given entities, but also returns them for convenience.

    Example:
    posts = Post.query().order("-timestamp").fetch(20)
    prefetch_reference_properties(posts, 'author', 'blog')
    """
    # Get a list of (entity,property) of each entity
    fields = [(entity, getattr(entity.__class__, prop_name)) for entity in entities for prop_name in prop_names]
    # Pull out an equally sized list of the referenced key for each field (possibly None)
    ref_keys_with_none = [prop.get_value_for_datastore(x) for x, prop in fields]
    # Make a dict of keys:fetched entities, removing those that were None
    ref_keys = filter(None, ref_keys_with_none)

    ents = db.get(set(ref_keys))
    ref_entities = dict((x.key(), x) for x in ents if x)

    #set the fetched entity on the non-None reference properties
    for (entity, prop), ref_key in zip(fields, ref_keys_with_none):
        if ref_key is not None:
            if ref_entities.has_key(ref_key):
                prop.__set__(entity, ref_entities.get(ref_key))
            elif kwargs.get('missingRefNone'):
                prop.__set__(entity, None)
    return entities

def on_dev_server():
    if 'Development' == os.environ['SERVER_SOFTWARE'][:11]:
        return True
    else:
        return False

def int_ceiling(num, ceiling):
   try:
        num = int(num)
        if num > ceiling:
            num = ceiling
        return num
   except:
        return None

def get_first_day(dt, d_years=0, d_months=0):
    # d_years, d_months are "deltas" to apply to dt
    y, m = dt.year + d_years, dt.month + d_months
    a, m = divmod(m-1, 12)
    return date(y+a, m+1, 1)

def get_last_day(dt):
    return get_first_day(dt, 0, 1) + timedelta(-1)

def last_monday(dt):
    '''Returns datetime of UTC midnight of most recent monday
    '''
    today = dt.date()
    return datetime.combine(today - timedelta(days=today.weekday()), _time(0,0))

def lookupDict(model, itemlist, keyprop="key_string", valueTransform=None):
    """
    keyprop can be 'key_string', 'key_id', or a property name
    if valueProp is None, value at each key is full item from list
    otherwise, run specified function to get value to store in dict
    """
    if keyprop not in ['key_string', 'key_id']:
        prop = model.properties().get(keyprop)
    else:
        prop = None
    lookup = {}
    for item in itemlist:
        if not item:
            continue
        keyval = None
        if keyprop == 'key_string':
            keyval = str(item.key())
        elif keyprop == 'key_id':
            keyval = item.key().id()
        elif prop:
            keyval = prop.get_value_for_datastore(item)
        if keyval:
            if valueTransform:
                val = valueTransform(item)
            else:
                val = item
            lookup[keyval] = val
    logging.debug("Produced lookup dict for type %s with %d keys" % (model, len(lookup.keys())))
    return lookup

def reverse_geocode(lat, lon, service="osm"):
    logging.debug("Performing reverse geocode on %s and %s with %s" % (lat, lon, service))
    if service == "google":
        url = "https://maps.googleapis.com/maps/api/geocode/json?"
        enc = urllib.urlencode([('latlng',"%s,%s" % (lat, lon)), ('sensor','true')])
        data_path_priority = [['results',0,'formatted_address']]
        country_code_path = []
    elif service == "yahoo":
        url = "http://where.yahooapis.com/geocode?"
        enc = urllib.urlencode([
            ('location',"%s,%s" % (lat, lon)),
            ('appid',YAHOO_APP_ID),
            ('flags','J') # JSON
            ])
        data_path_priority = []
        country_code_path = []
    elif service == "osm": # Open Streetmap
        url = "http://nominatim.openstreetmap.org/reverse?"
        enc = urllib.urlencode([
            ('lat',lat),
            ('lon',lon),
            ('format','json')
            ])
        data_path_priority = [
            ['address','suburb'],
            ['address','commercial'],
            ['address','road'],
            ['display_name']
            ]
        country_code_path = ['address','country_code']
    loc = country_code = None
    try:
        result = urlfetch.fetch(url+enc, deadline=3)
        if result.status_code == 200:
            response = json.loads(result.content)
            # Pull Region
            for data_path in data_path_priority:
                node = response
                for key in data_path:
                    if node.has_key(key):
                        node = node[key]
                    else:
                        break
                if isinstance(node, (str, unicode)):
                    loc = node
                    break
            # Pull Country Code
            node = response
            for key in country_code_path:
                if node.has_key(key):
                    node = node[key]
                else:
                    break
            if isinstance(node, (str, unicode)) and len(node) == 2:
                country_code = node
        else:
            logging.debug("Failed to retrieve from geocode API")
    except Exception, e:
        logging.error("Error in reverse geocode: %s" % e)
    return [loc, country_code]


def escapejs(value):
    _js_escapes = (
        ('\\', '\\\\'),
        ('"', '\\"'),
        ("'", "\\'"),
        ('\n', '\\n'),
        ('\r', '\\r'),
        ('\b', '\\b'),
        ('\f', '\\f'),
        ('\t', '\\t'),
        ('\v', '\\v'),
        ('</', '<\\/'),
        )
    for bad, good in _js_escapes:
        value = value.replace(bad, good)
    return value

def dt_from_ts(ms):
    if ms == 0:
        return None
    else:
        return datetime.fromtimestamp(float(ms)/1000.)

def fromISODate(s, timestamp=False):
    try:
        if s:
            dt = datetime.strptime(s, "%Y-%m-%d")
            return unixtime(dt, local=False) if timestamp else dt
    except Exception, e:
        pass
    return None

def parseTimeString(raw):
    """
    Takes time string like "14:25"
    """
    try:
        dt = datetime.strptime(raw, "%H:%M")
        return dt.time()
    except Exception, e:
        return None

def icon(group, id, size=15, label=None):
    label = escapejs(label) if label else ""
    return "<img src='/images/icons/%s_%s_%s.png' class='icon' title=\"%s\">" % (group, id, size, label)

def minutes_in(dt=None):
    "# of minutes into the current day"
    if dt is None:
        dt = datetime.now()
    return 60*dt.hour + dt.minute


def commaseparate(value):
    """
    Converts an integer to a string containing commas every three digits.
    Converts an number to a string containing commas every three digits.
    For example, 3000 becomes '3,000' and 45000 becomes '45,000'.
    """
    orig = str(value)
    new = re.sub("^(-?\d+)(\d{3})((?:\.\d+)?)", r'\1,\2\3', str(value))
    if orig == new:
        return new
    else:
        return commaseparate(new)

def removeNonAscii(s): return "".join(filter(lambda x: ord(x)<128, s))

def total_minutes(td):
    "Convert timedelta to # of total minutes"
    return int(60*24*td.days + td.seconds/60)

def strip_symbols(s):
    s = re.sub(r'[^\w ]', '', s)
    return s

def numbers_only(s):
    s = re.sub(r'[^\d]', '', s)
    return s


# Some mobile browsers which look like desktop browsers.
RE_MOBILE = re.compile(r"(iphone|ipod|blackberry|android|palm|windows\s+ce)", re.I)
RE_DESKTOP = re.compile(r"(windows|linux|os\s+[x9]|solaris|bsd)", re.I)
RE_BOT = re.compile(r"(spider|crawl|slurp|bot)", re.I)

def is_desktop(user_agent):
    """
    Anything that looks like a phone isn't a desktop.
    Anything that looks like a desktop probably is.
    Anything that looks like a bot should default to desktop.

    """
    return not bool(RE_MOBILE.search(user_agent)) and \
      bool(RE_DESKTOP.search(user_agent)) or \
      bool(RE_BOT.search(user_agent))

def getStateToken():
    i = random.randint(0,1000000)
    md = hashlib.md5()
    md.update(str(i))
    return md.hexdigest()

def gets(self, strings=[], lists=[], floats=[], integers=[], booleans=[], dates=[], times=[], json=[], multi=False, addMultiBrackets=False, getDefault=None, ignoreMissing=True, supportTextBooleans=False):
    '''
    Use ignoreMissing if resulting dictionary should not contain params that were not passed via request
    '''
    vals = {}

    if ignoreMissing:
        # Strip [] for multi params
        all_args = [arg.replace('[]','') for arg in self.request.arguments()]
        # Filter params to only return params that are in the arguments list
        for param_list in [strings, lists, integers, booleans, dates, json]:
            param_list[:] = [x for x in param_list if x in all_args]

    for arg in strings:
        val = self.request.get(arg, default_value=getDefault)
        if val != getDefault or not ignoreMissing:
            vals[arg] = val
    for arg in lists:
        if multi:
            _arg = arg + '[]' if addMultiBrackets else arg
            vals[arg] = self.request.get_all(_arg)
        else:
            raw = self.request.get(arg, default_value=getDefault)
            if raw:
                vals[arg] = raw.replace(', ',',').split(',')
            else:
                vals[arg] = []
    for arg in booleans:
        if supportTextBooleans:
            val = self.request.get(arg, default_value=getDefault)
            if val != getDefault:
                if val.isdigit():
                    vals[arg] = bool(int(val))
                else:
                    vals[arg] = val.lower() in ['true']
        else:
            vals[arg] = self.request.get_range(arg) == 1
    for arg in integers:
        vals[arg] = self.request.get_range(arg, default=getDefault)
    for arg in floats:
        val = self.request.get(arg, default_value=getDefault)
        if val is not None:
          try:
            vals[arg] = float(val)
          except ValueError:
            pass
    for arg in json:
        raw = self.request.get(arg)
        vals[arg] = getJson(raw)
    for arg in dates:
        raw = self.request.get(arg, default_value=getDefault)
        if raw:
            vals[arg] = datetime.strptime(raw, '%m/%d/%Y')
        else:
            vals[arg] = None
    for arg in times:
        raw = self.request.get(arg, default_value=getDefault)
        if raw:
            vals[arg] = parseTimeString(raw)
        else:
            vals[arg] = None
    return vals

def getSHA(pw, salt=None):
    pw = cgi.escape(pw)
    if not salt:
        POOL = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
        chars=[]
        for i in range(32):
            chars.append(random.choice(POOL))
        salt = ''.join(chars)
    sha = hashlib.sha256()
    sha.update(pw)
    sha.update(salt)
    pw_sha = sha.hexdigest()
    return [salt, pw_sha]

def validJson(raw, default=None):
    try:
        json_dict = json.loads(raw)
        if json_dict is not None:
            return json.dumps(json_dict)
    except Exception, e:
        logging.error("Error validating json: %s" % e)
    return default

def getJson(raw):
    '''
    Returns either a list or dictionary, or None
    '''
    j = None
    if raw:
        try:
            j = json.loads(raw)
            if isinstance(j,str) or isinstance(j,unicode):
                # Handle double-encoded JSON
                j = json.loads(j)
        except Exception, e:
            pass
    if type(j) in [list, dict]:
        return j
    else:
        return None

def getKey(cls, prop, entity, asID=True, keyObj=False, asKeyName=False):
    props = cls.properties() if cls else entity.properties()
    prop = props.get(prop)
    if prop:
        key = prop.get_value_for_datastore(entity)
        if key:
            if asID:
                return key.id()
            elif asKeyName:
                return key.name()
            elif keyObj:
                return key
            else:
                return str(key)
    return None

def normalize_to_ascii(text):
    if text is None:
        return None
    import unicodedata
    if not isinstance(text, basestring):
        text = str(text).decode('utf-8')
    elif not isinstance(text, unicode):
        text = text.decode('utf-8')

    normalized_text = unicodedata.normalize('NFKD', text).encode('ascii','ignore')
    return normalized_text

def safe_geopoint(geo_str):
    '''
    geo_str as lat,lon
    returns a db.GeoPt if possible and if not None
    '''
    gp = None
    if geo_str is None:
        return None
    try:
        gp = db.GeoPt(geo_str)
    except Exception, e:
        pass
        logging.error(str(e))
    if gp and gp.lat == 0.0 and gp.lon == 0.0:
        gp = None
    return gp

def safeIsDigit(val):
    if type(val) in [str, unicode]:
        return val.isdigit()
    else:
        return type(val) in [int, long]

def safe_number(str_or_num):
    try:
        if isinstance(str_or_num, basestring) and ',' in str_or_num:
            str_or_num = str_or_num.replace(',','')
        return float(str_or_num)
    except Exception, e:
        logging.error("Failed to convert %s to number - %s" % (str_or_num, e))
        return None

def safe_add_task(callable, *args, **kwargs):
    """This function guarantees addition of a task to a queue.
            It retriesafe_add_tasks adding task if any error occurs during task creation.

    There are 3 ways to use this function

    1. Adding a single task
        tools.safe_add_task("/admin/sms", params={'recipient':'254731501591', queue_name='admin-queue'})
    2. Adding a list of tasks
        tools.safe_add_task([{url="/admin/sms", params={'recipient':'254731501591'}, {url="/admin/sms", params={'recipient':'254731501592'}], queue_name='admin-queue')
    3. Adding a deffered task
        tools.safe_add_task(myworker.run, params={'targetGroup':'TESTG', queue_name='worker-queue'})

    """
    task_add_retries = kwargs.pop("task_add_retries", 0)
    TASK_BATCH_SIZE = 100

    success = True

    try:
        if isinstance(callable, basestring):#a url string
            task_dict = dict(kwargs)
            task_dict['url'] = callable
            kwargs = {
              "queue_name": task_dict.pop("queue_name", "default"),
            }
            task_dict['eta'] = task_dict.pop("eta", None)
            callable = [task_dict]

        if isinstance(callable, list):#a list of tasks
            #create a list of taskqueue.Task Objects from the list of dicts
            task_list = []
            for task_dict in callable:
                if not task_dict.get("name"):
                    task_dict["name"] = uuid.uuid4().hex
                task = taskqueue.Task(**task_dict)
                task_list.append(task)

            #if no queue_name is provided, default is used.
            queue_name = kwargs.get('queue_name', 'default')
            queue = taskqueue.Queue(queue_name)
            while len(task_list) > 0:
                tasks_to_add = task_list[:TASK_BATCH_SIZE]
                queue.add(tasks_to_add)
                logging.info("Queued up %d tasks" % len(tasks_to_add))
                task_list = task_list[TASK_BATCH_SIZE:]
        else:
            # Simple callable passed in
            if not kwargs.get("_name"):
                kwargs["_name"] = uuid.uuid4().hex
            # if "queue_name" in kwargs:
            #     qn = kwargs.pop('queue_name')
            #     kwargs['_queue'] = qn
            deferred.defer(callable, *args, **kwargs)
        return success
    except (taskqueue.TombstonedTaskError, taskqueue.TaskAlreadyExistsError):
        return success
    except Exception, e:
        exception_name = sys.exc_info()[0].__name__
        exception_details = str(sys.exc_info()[1])
        if task_add_retries >= 10:
            logging.error("TASK CREATION ABORTED AFTER %d RETRIES!: %s %s %s" % (task_add_retries, kwargs, exception_name, exception_details))
            return False
        else:
            logging.warning("TASK CREATION FAILED RETRYING!: %s %s %s %s" % (callable, kwargs, exception_name, exception_details))
            kwargs["task_add_retries"] = task_add_retries+1
            return safe_add_task(callable, *args, **kwargs)

def first_non_none(list, default=None):
    return next((item for item in list if item is not None), default)

def variable_replacement(text, replacements=None, var_parens="{}"):
    if replacements:
        for key, val in replacements.items():
            paren_open = var_parens[0]
            paren_close = var_parens[1]
            key = paren_open + key + paren_close

            if key in text:
                if callable(val):
                    set_val = val()
                    if set_val is None:
                        set_val = "--"
                else:
                    set_val = val
                text = text.replace(key, str(set_val))

    return text

def make_function_signature(func_name, *args, **kwargs):
    alpha_kwargs = sorted(kwargs.items(), key=lambda x : x[0])
    return "-".join([func_name, str(args), str(alpha_kwargs)])

def lower_no_spaces(s):
    if s:
        return strip_symbols(s.lower()).replace(' ','')
    return ""

def toDecimal(amount):
    amount = amount if amount else 0
    value = None
    if type(amount) in [str, unicode] and ',' in amount:
        amount = amount.replace(',','')
    try:
        value = Decimal(amount)
    except Exception, e:
        logging.error("Error in toDecimal: %s" % e)
        pass
    return value

def in_same_period(ms1, ms2, period_type=4):
    '''Check whether or not two timestamps (ms) are in the same
      period (as defined by period_type).

    Args:
        ms1: First timestamp (ms)
        ms2: Second timestamp (ms)
        period_type (int): defaults to RULE.DAY

    Returns:
        boolean
    '''
    from constants import RULE, MS_PER_SECOND, MS_PER_MINUTE, MS_PER_HOUR, MS_PER_DAY
    if period_type == RULE.SECOND:
        p1, p2 = ms1 / MS_PER_SECOND, ms2 / MS_PER_SECOND
        return p1 == p2
    elif period_type == RULE.MINUTE:
        p1, p2 = ms1 / MS_PER_MINUTE, ms2 / MS_PER_MINUTE
        return p1 == p2
    elif period_type == RULE.HOUR:
        p1, p2 = ms1 / MS_PER_HOUR, ms2 / MS_PER_HOUR
        return p1 == p2
    elif period_type == RULE.DAY:
        p1, p2 = ms1 / MS_PER_DAY, ms2 / MS_PER_DAY
        return p1 == p2
    elif period_type == RULE.WEEK:
        # TODO
        ms1_last_monday = last_monday(dt_from_ts(ms1))
        ms2_last_monday = last_monday(dt_from_ts(ms2))
        return ms1_last_monday == ms2_last_monday
    elif period_type == RULE.MONTH:
        ms1_mo_begin = get_first_day(dt_from_ts(ms1))
        ms2_mo_begin = get_first_day(dt_from_ts(ms2))
        return ms1_mo_begin == ms2_mo_begin

def add_batched_task(callable, name_prefix, interval_mins=5, warnOnDuplicate=True, *args, **kwargs):
    """
    Callable must be a deferred task
    Adds a task batched and scheduled for the next even (synchronized) X minutes
    Tasks with same name already scheduled for this time will not be re-added
    Useful for processing work that should be run exactly once within a certain interval, and do not need
    to be run immediately.

    For example, if run at 12:43 with a 5 minute interval, schedule will be for 12:45
    """
    now = datetime.now()
    runAt = now - timedelta(minutes=(now.minute % interval_mins) - interval_mins,
                             seconds=now.second,
                             microseconds=now.microsecond)
    taskName = "bt_%s_%s_%s" % (name_prefix, callable.__name__, unixtime(runAt))
    # logging.debug("Scheduling task for %s - %s" % (runAt, taskName))
    safe_add_task(callable, _name=taskName, _eta=runAt, *args, **kwargs)


def generate_nonce(length=8):
    """Generate pseudorandom number."""
    return ''.join([str(random.randint(0, 9)) for i in range(length)])