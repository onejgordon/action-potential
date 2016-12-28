import functools
import os
import webapp2
import logging
from functools import wraps
from google.appengine.ext import deferred
from google.appengine.api import mail
from google.appengine.api import memcache
from constants import SENDER_EMAIL, ERROR_EMAIL, EMAIL_PREFIX
import tools

#A llowed number of retries
NOTIFY_RETRY_COUNT = 5

def deferred_task_decorator(method):
    @functools.wraps(method)
    def defer_method (*args, **kwargs):
        # Collecting defered task header information
        headers = {}
        headers["queue_name"] = os.environ.get('HTTP_X_APPENGINE_QUEUENAME', '')
        headers["retry_count"] = os.environ.get('HTTP_X_APPENGINE_TASKRETRYCOUNT', 0)
        headers["task_name"] =  os.environ.get('HTTP_X_APPENGINE_TASKNAME', '')

        if not tools.on_dev_server():
            logging.info("deferred_task_decorator : {}".format(headers))
        # Running for the first time ignore
        _retry_count = headers.get("retry_count", 0)
        retry_count = int(_retry_count) if tools.safeIsDigit(_retry_count) else 0
        if retry_count < 1:
            return method(*args, **kwargs)

        # We are retying
        if retry_count  == NOTIFY_RETRY_COUNT:
            if not tools.on_dev_server():
                logging.warn("Found task retry count overboard ..{}:{}"\
                    .format(headers.get("queue_name"), headers.get("task_name")))
            subject = "Task retried too many times"
            text = "{}:{} Task retried too many times - ({})".format(
                headers.get("queue_name"), headers.get("task_name"), retry_count)
            deferred.defer(mail.send_mail, SENDER_EMAIL, ERROR_EMAIL,
                    EMAIL_PREFIX + subject, text)
        else:
            if not tools.on_dev_server():
                logging.info("Found task retry count ok ..{}:{} - ({})"\
                .format(headers.get("queue_name"), headers.get("task_name"), retry_count))

        return method(*args, **kwargs)

    return defer_method


def auto_cache(expiration=60*60, key=None):
    """
    A decorator to memorize the results of a function call in memcache. Use this
    in preference to doing your own memcaching, as this function avoids version
    collisions etc...
    Note that if you are not providing a key (or a function to create one) then your
    arguments need to provide consistent str representations of themselves. Without an
    implementation you could get the memory address as part of the result - "<... object at 0x1aeff0>"
    which is going to vary per request and thus defeat the caching.

    Usage:
    @auto_cache
    get_by_type(type):
        return MyModel.query().filter("type =", type)

    :param expiration: Number of seconds before the value is forced to re-cache, 0
    for indefinite caching

    :param key: Option manual key, use in combination with expiration=0 to have
    memcaching with manual updating (eg by cron job). Key can be a func(*args, **kwargs)
    :rtype: Memoized return value of function
    """

    def wrapper(fn):
        @wraps(fn)
        def cache_decorator(*args, **kwargs):
            mc_key = None
            force_refresh = kwargs.get('refresh')
            if kwargs.has_key('refresh'):
                del kwargs['refresh'] # Otherwise this will change auto-generated cache key
            if key:
                if callable(key):
                    mc_key = key(*args, **kwargs)
                else:
                    mc_key = key
            else:
                alpha_kwargs = sorted(kwargs.items(), key=lambda x : x[0])
                mc_key = '%s:%s' % ("auto_cache", tools.make_function_signature(fn.func_name, *args, **kwargs))

            # if ENABLE_VERSIONED_AUTO_CACHE:
            #     mc_key += "-" + common.CURRENT_VERSION_ID

            if force_refresh:
                # Force refresh, dont get from memcache
                logging.debug("Auto cache forcing refresh of key: %s" % mc_key)
                result = None
            else:
                result = memcache.get(mc_key)
            if result:
                pass
                #logging.debug("Got key %s from cache: %s" % (mc_key, result))
            else:
                result = fn(*args, **kwargs)
                try:
                    memcache.set(mc_key, result, time=expiration)
                except ValueError, e:
                    logging.critical("Recevied error from memcache", exc_info=e)

            return result
        return cache_decorator
    return wrapper

