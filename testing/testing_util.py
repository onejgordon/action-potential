#!/usr/bin/python
# -*- coding: utf8 -*-

from google.appengine.api import memcache
from google.appengine.ext import db
from google.appengine.ext import testbed
from datetime import datetime, timedelta
import tools
import json
from google.appengine.ext import deferred
from base_test_case import BaseTestCase
from cloudmemory import app as tst_app

class UtilTestCase(BaseTestCase):

    def setUp(self):
        self.set_application(tst_app)
        self.setup_testbed()
        self.init_datastore_stub()
        self.init_memcache_stub()
        self.init_taskqueue_stub()
        self.register_search_api_stub()


    def testValidJson(self):
        volley=[
            {'json':"{}",'to_return':{}},
            {'json':'{"v":"1"}','to_return':{"v":"1"}},
            {'json':'{"v":"1"\r\n}','to_return':{"v":"1"}},
            {'json':'{"v":1}','to_return':{"v":1}},
            {'json':'"{}"','to_return':{}},
            {'json': "invalid", 'to_return': None},
            {'json': '[{"1":"one"}]', 'to_return': [{1:"one"}] }
        ]

        for v in volley:
            returned = tools.getJson(v['json'])
            self.assertEqual(json.dumps(returned),json.dumps(v['to_return']))

    def testSafeNum(self):
        volley=[
            ("1,000", 1000),
            ("not a number", None),
            ("2.56", 2.56),
            ("4", 4),
            ("0", 0),
            ("11.0", 11.0)
        ]

        for v in volley:
            _in, _expect = v
            out = tools.safe_number(_in)
            self.assertEqual(out, _expect)


    def testTextSanitization(self):
        # Remove non-ascii
        from decimal import Decimal
        volley = [
            ('‘Hello’', 'Hello'),
            (int(10), '10'),
            (False, 'False'),
            (long(20), '20'),
            (u'‘Hello’', 'Hello'),
            (u'‘Hello\nHi’', 'Hello\nHi'),
            (u'Kl\xfcft skr\xe4ms inf\xf6r p\xe5 f\xe9d\xe9ral \xe9lectoral gro\xdfe',
               'Kluft skrams infor pa federal electoral groe'),
            (db.Text(u'‘Hello’'), 'Hello'),
            (db.Text(u'naïve café'), 'naive cafe')
        ]

        for v in volley:
            target = v[1]
            actual = tools.normalize_to_ascii(v[0])
            self.assertEqual(actual, target)

    def testDateTimePrinting(self):
        volley = [
            ( datetime(2015,1,1,12,0), "UTC", "2015-01-01 12:00 UTC" ),
            ( datetime(2015,1,1,12,25), "Africa/Nairobi", "2015-01-01 15:25 EAT" ),
            ( datetime(2015,1,25,4,21), None, "2015-01-25 04:21 UTC" ),
        ]

        for v in volley:
            dt = v[0]
            tz = v[1]
            target = v[2]
            result = tools.sdatetime(dt, tz=tz)
            self.assertEqual(result, target)

    def testDecimals(self):
        from tools import toDecimal
        volley = [
            ( 50, "50" )
            # ( 25.2, "25.2" ),
        ]

        for v in volley:
            num, dec = v
            out = toDecimal(num)
            self.assertEqual(str(out), dec)

    def testLastMonday(self):
        volley = [
            (datetime(2016, 3, 31), "2016-03-28"),
            (datetime(2016, 3, 6, 2, 15), "2016-02-29"),
            (datetime(2015, 10, 7, 14, 0), "2015-10-05"),
            (datetime(2015, 7, 20, 14, 0), "2015-07-20")
        ]
        for v in volley:
            today, last_monday = v
            out = tools.last_monday(today)
            self.assertEqual(tools.sdate(out), last_monday)
        self.assertEqual(tools.stime(out.time()), "00:00")


    def tearDown(self):
        pass



