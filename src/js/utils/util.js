var $ = require('jquery');
var moment = require('moment-timezone');

var util = {

    ListPop: function(keyval, list, _key) {
        var key = _key || "id";
        for (var i=0; i<list.length; i++) {
            var li_el = list[i];
            if (li_el[key] == keyval) {
                list.pop(i);
            }
        }
    },

    getByKey: function(key, list, _keyattr) {
        var keyattr = _keyattr || "id";
        for (var i=0; i<list.length; i++) {
            var li_el = list[i];
            if (li_el[keyattr] == key) {
                return li_el;
            }
        }
    },

    objectIndexOf: function(key, list, _keyattr) {
        var keyattr = _keyattr || "id";
        for (var i=0; i<list.length; i++) {
            var li_el = list[i];
            if (li_el[keyattr] == key) {
                return i;
            }
        }
        return -1;
    },

    _render: function(html, directive, data) {
        compiled = $(html).compile(directive);
        var el = $(html).render(data, compiled);
        return el;
    },

    pureCompileAndRender: function(html, directive, data, target) {
        compiled = $(html).compile(directive);
        var el = $(html).render(data, compiled);
        if (target) el.prependTo(target);
        return el;
    },

    pureCompileAndRenderEl: function(el, directive, data) {
        compiled = el.compile(directive);
        var el = el.render(data, compiled);
        return el;
    },

    pureTemplate: function(path, directive, data, target, template_html, callback) {
        var target = target || wv.els.dContent;
        if (template_html) {
            util.pureCompileAndRender(template_html, directive, data, target);
        } else {
            $.ajax({
                url: path
            }).done(function(template_html) {
                util.pureCompileAndRender(template_html, directive, data, target);
                if (callback) callback();
            });
        }
    },

    pollUntilSuccess: function(url, data, success, secs, infinite, partialFn, continueAtt, callCount) {
        var secs = secs || 5;
        var infinite = infinite || false;
        var intId = window.setInterval(function() {
            if (callCount != null) {
                data.callCount = callCount;
                callCount++;
            }
            $.ajax({
                type: 'POST',
                url: url,
                dataType: 'json',
                data: data,
                cache: false,
                async: true,
                success: function(res) {
                    if (continueAtt && !res[continueAtt]) window.clearTimeout(intId);
                    if (res && res.success && success) {
                        success(res);
                        if (!infinite) window.clearTimeout(intId);
                    } else if (partialFn) {
                        partialFn(res);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log("Ajax error in pollUntilSuccess:" + textStatus + "," + errorThrown)
                }
            });
        }, secs*1000);

    },

    contains: function(list, val) {
        for (k = 0; k < list.length; k++) {
            if (val == list[k]) {
                return 1;
            }
        }
        return 0;
    },

    baseUrl: function() {
        var base_url = location.protocol + '//' + location.host + location.pathname;
        return base_url;
    },

    validPhoneNumber: function(number) {
        numberlen = number.length;
        if (numberlen > 9) {
            return true;
        } else {
            return false;
        }
    },

    fillSelect: function(sel, data) {
        for (var val in data) {
            if (data.hasOwnProperty(val)) {
                sel.append("<option value='"+val+"'>"+data[val]+"</option>");
            }
        }
    },

    nowTimestamp: function() {
        // Millis
        return Date.now();
    },

    printDateObj: function(date, _timezone, opts) {
        if (_timezone && moment) {
            // Using moment.js to print local date/times
            var dt = moment.tz(date.getTime(), _timezone);
            if(opts && opts['_with_time']){
                return dt.format("YYYY-MM-DD HH:mm");
            } else{
                return dt.format("YYYY-MM-DD");
            }
        } else {
            if (date != null) {
                var d = date.getDate();
                var month = date.getMonth() + 1;
                var day = d<10? '0'+d:''+d;
                if (month < 10) month = '0'+month;
                return date.getFullYear()+"-"+month+"-"+day;
            } else return "--";
        }
    },

    printISODate: function(ts) {
        var newDate = new Date();
        newDate.setTime(ts*1000);
        var year = newDate.getFullYear();
        var day = newDate.getDate();
        var month = newDate.getMonth();
        var dt = year+'-'+(month+1)+'-'+day;
        return dt;
    },

    printDate: function(ts, _with_time, _numeric, _timezone) {
        // Takes ts in ms
        var numeric = _numeric == null ? false : _numeric;
        var with_time = _with_time == null ? true : _with_time;
        var timezone = _timezone || "UTC";
        if (ts == null) return "";
        // Using moment.js to print local date/times
        var dt = moment.tz(parseInt(ts), timezone);
        if (with_time) return dt.format("YYYY-MM-DD H:mm:ss z");
        else return dt.format("YYYY-MM-DD");
    },

    timestamp: function() {
        // Seconds
        return parseInt(new Date().getTime() / 1000);
    },

    printDateOnly: function(ts, numeric) {
        return util.printDate(ts, false, numeric);
    },

    printDateNumeric: function(ts) {
        return util.printDate(ts, false, true);
    },

    printMonthDay: function(ts) {
        var newDate = new Date();
        newDate.setTime(ts*1000);
        var month = newDate.getMonth()+1;
        var day = newDate.getDate();
        return day+'/'+month;
    },

    startAutomaticTimestamps: function(_tz, _interval) {
        var tz = _tz || "UTC";
        var interval = _interval || 20; // Secs
        util.printTimestampsNow(null, null, null, tz);
        var interval_id = setInterval(function() {
            util.printTimestampsNow(null, null, null, tz);
        }, 1000*interval);
        return interval_id;
    },

    printTimestampsNow: function(_smart, _row_sel, _recent_class, _timezone) {
        var LEVELS = [
            { label: "second", cutoff: 60, recent: true, seconds: 1 },
            { label: "minute", cutoff: 60, seconds: 60 },
            { label: "hour", cutoff: 24, seconds: 60*60 },
            { label: "day", cutoff: 30, seconds: 60*60*24 }
        ];
        var row_sel = _row_sel || 'li';
        var recent_class = _recent_class || 'list-group-item-info';
        var smart = smart == null ? true : _smart;
        $('[data-ts]').each(function() {
            var ts = $(this).attr('data-ts');
            var full_date = util.printDate(ts, null, null, _timezone);
            if (smart) {
                var text;
                var now = new Date().getTime();
                var secs_since = Math.round((now - ts)/1000);
                var handled = false;
                for (var i=0; i<LEVELS.length; i++) {
                    var level = LEVELS[i];
                    var units_since = secs_since / level.seconds;
                    if (units_since < level.cutoff) {
                        if (level.recent) $(this).closest(row_sel).addClass(recent_class);
                        text = parseInt(units_since) + " " + level.label + "(s) ago";
                        handled = true;
                        break;
                    }
                }
                if (!handled) {
                    text = full_date;
                    // Remove _ts since this is too old for relative time
                    $(this).removeAttr('data-ts');
                }
            } else text = full_date;
            $(this).text(text).attr('title', full_date);
        });
    },

    printPercent: function(dec) {
        return parseInt(dec*100) + "%";
    },

    uppercaseSlug: function(str) {
        return str.replace(/[^A-Z0-9]+/ig, "_").toUpperCase();
    },

    truncate: function(s, _chars) {
        var chars = _chars || 30;
        if (s.length > chars) return s.substring(0, _chars) + '...';
        else return s;
    },

    getParameterByName: function(name, _default) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? _default || "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },

    getHash: function() {
        return window.location.hash.substr(1);
    },

    randomId: function(length) {
        var text = "";
        var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < length; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    },

    doOnKeypress: function(keycodes, fn) {
        if (!(keycodes instanceof Array)) keycodes = [keycodes];
        $(document).keyup(function(e) {
            if (keycodes.indexOf(e.keyCode) > -1 && fn) { fn(); }
        });
    },

    mergeObject: function(obj1, obj2) {
        // Merge obj2 into obj1
        for (var key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                obj1[key] = obj2[key];
            }
        }
    },

    objToArray: function(obj) {
        var arr = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                arr.push(obj[key]);
            }
        }
        return arr;
    },

    arrToObj: function(arr, keyname) {
        var obj = {};
        arr.forEach(function(item, i, arr) {
            obj[item[keyname]] = item;
        });
        return obj;
    },

    printFilesize: function(bytes) {
        var MB = 1000000, KB = 1000;
        if (bytes != null) {
            if (bytes > MB) return (bytes/MB).toFixed(1) + ' MiB';
            else if (bytes > KB) return (bytes/KB).toFixed(1) + ' KiB';
            else return (bytes).toFixed(1) + ' bytes';
        } else return "--";
    },

    dateToTimestamp: function(date_string) {
        var dc = date_string.split('/');
        var date = new Date(dc[2], dc[0], dc[1]);
        console.log(date.getTime());
        return date.getTime();
    },

    addEvent: function(element, eventName, callback) {
        if (element.addEventListener) {
            element.addEventListener(eventName, callback, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + eventName, callback);
        } else {
            element["on" + eventName] = callback;
        }
    },

    basicCompare: function(o1, o2) {
        for (var val in o1) {
            if (o1.hasOwnProperty(val)) {
                if (o2[val] === undefined || o1[val] != o2[val]) return false;
            }
        }
        for (var val in o2) {
            if (o2.hasOwnProperty(val)) {
                if (o1[val] === undefined || o1[val] != o2[val]) return false;
            }
        }
        return true;
    },

    applySentenceCase: function(str) {
        return str.replace(/.+?[\.\?\!](\s|$)/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    },

    float2rat: function(x) {
        var tolerance = 1.0E-6;
        var h1=1; var h2=0;
        var k1=0; var k2=1;
        var b = x;
        do {
            var a = Math.floor(b);
            var aux = h1; h1 = a*h1+h2; h2 = aux;
            aux = k1; k1 = a*k1+k2; k2 = aux;
            b = 1/(b-a);
        } while (Math.abs(x-h1/k1) > x*tolerance);

        return h1+":"+k1;
    },

    logicPasses: function(val, pass_list, q_type) {
        for (var i=0; i<pass_list.length; i++) {
            var pass_value = pass_list[i];
            if (q_type == "OE") {
                if (val.toUpperCase().indexOf(pass_value.toUpperCase()) > -1) return true;
            } else if (q_type == "MC") {
                var letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[val-1];
                if (letter && letter == pass_value) return true;
            } else if (q_type == "MS") {
                // val e.g. "1,2,4"
                var valArr = val.split(',');
                var valLetters = valArr.map(function(i, j, arr) {
                    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[i-1];
                });
                if (valLetters.indexOf(pass_value)>-1) return true;
            } else if (q_type == "RANK") {
                // val e.g. "1,0,2" -> A ranked 1, B unranked, C ranked 2
                // Pass if any pass value was ranked at all
                var valArr = val.split(',');
                var rankedLetters = valArr.map(function(i, j, arr) {
                    if (parseInt(i) > 0) return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[j];
                    else return "";
                });
                if (rankedLetters.indexOf(pass_value)>-1) return true;
            } else if (q_type == "NUMBER") {
                pass_value = pass_value.replace(' ', '');
                if (pass_value.indexOf('>') > -1) {
                    pass_value = parseFloat(pass_value.replace('>', ''));
                    if (val > pass_value) return true;
                } else if (pass_value.indexOf('<') > -1) {
                    pass_value = parseFloat(pass_value.replace('<', ''));
                    if (val < pass_value) return true;
                } else if (pass_value.indexOf('-') > -1) {
                    pass_value = pass_value.split('-');
                    if (pass_value.length > 1) {
                        low = parseFloat(pass_value[0]);
                        high = parseFloat(pass_value[1]);
                        if (val >= low && val <= high) return true;
                    }
                } else {
                    if (parseFloat(pass_value) == val) return true;
                }
            }
        }
        return false;
    },

    stripNonNumbers: function(text) {
        return text.replace(/[^0-9]*/g, '');
    },

    stripSpaces: function(text) {
        return text.replace(/ /g,'');
    },

    strip: function(text) {
        return String(text).replace(/^\s+|\s+$/g, '');
    },

    replaceAt: function(index, s, character) {
        return s.substr(0, index) + character + s.substr(index+character.length);
    },

    countChars: function(s, character) {
        return s.split(character).length - 1;
    },

    findDuplicates: function(_arr) {
        var arr = _arr.slice();
        var sorted_arr = arr.sort(); // You can define the comparing function here.
        var results = [];
        for (var i = 0; i < arr.length - 1; i++) {
            if (sorted_arr[i + 1] == sorted_arr[i]) {
                results.push(sorted_arr[i]);
            }
        }
        return results;
    },
    initAppCache: function() {
        appCache = window.applicationCache;
        appCache.addEventListener('updateready', function(e) {
            if (appCache.status == appCache.UPDATEREADY) {
                // Browser downloaded a new app cache.
                // Swap it in and reload the page to get the new hotness.
                appCache.swapCache();
                var r = confirm('A new version of this site is available... Please reload now');
                if (r) location.reload(true);
            }
        }, false);
        var status;
        switch (appCache.status) {
            case appCache.UNCACHED: // UNCACHED == 0
                status = 'UNCACHED';
                break;
            case appCache.IDLE: // IDLE == 1
                status = 'IDLE';
                break;
            case appCache.CHECKING: // CHECKING == 2
                status = 'CHECKING';
                break;
            case appCache.DOWNLOADING: // DOWNLOADING == 3
                status = 'DOWNLOADING';
                break;
            case appCache.UPDATEREADY: // UPDATEREADY == 4
                status = 'UPDATEREADY';
                break;
            case appCache.OBSOLETE: // OBSOLETE == 5
                status = 'OBSOLETE';
                break;
            default:
                status = 'UKNOWN CACHE STATUS';
                break;
        };
        console.log("[ AppCache ] Status: " + status);
    },

    countWithCeiling: function(count, ceiling) {
        if (count == ceiling) return count + "+";
        else return count;
    },

    arrEquals: function(array, array2) {
        // if the other array is a falsy value, return
        if (!array)
            return false;

        // compare lengths - can save a lot of time
        if (array2.length != array.length)
            return false;

        for (var i = 0, l=array2.length; i < l; i++) {
            // Check if we have nested arrays
            if (array2[i] instanceof Array && array[i] instanceof Array) {
                // recurse into the nested arrays
                if (!array2[i].equals(array[i]))
                    return false;
            }
            else if (array2[i] != array[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    },

    stripSymbols: function(text) {
        return text.replace(/[^A-Za-z 0-9]*/g, '');
    },

    randomInt: function(min, max) {
        return Math.floor((Math.random() * max) + min);
    },

    listMessageVariables: function(s) {
        if (s != null) {
            var re = /\[[A-Z_-]*?\]/g;
            return s.match(re);
        } else return null;
    },

    emptyArray: function(len, item) {
        var item = item === undefined ? null : item;
        var arr = [];
        for (var i=0; i<len; i++) {
            arr.push(item);
        }
        return arr;
    },

    clone: function(obj) {
        var o2 = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                o2[key] = obj[key];
            }
        }
        return o2;
    },

    getRandomColor: function() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },

    anonymizePhone: function(phone) {
        if (phone != null && phone.length > 7) {
            var len = phone.length;
            return phone.substring(0,3) + "*****" + phone.substring(len-3, len);
        } else {
            return "****";
        }
    },

    stripPointZero: function(s) {
        var pz = '.0';
        var hasPointZero = s.indexOf(pz, s.length - pz.length) !== -1;
        if (hasPointZero) return s.replace(pz, '');
        else return s;
    },

    average: function(arr) {
        if (arr.length > 0) {
            var sum = 0;
            for(var i = 0; i < arr.length; i++){
                sum += arr[i];
            }
            return sum / arr.length;
        } else return 0;
    },

    capitalize: function(s) {
        if (s==null) return null;
        else {
            s = s.toLowerCase();
            return s.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
        }
    },

    dayDiff: function(firstDate, secondDate) {
        var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
        var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
        return diffDays;
    },

    dateOffset: function(oldDate, _days, _months, _years) {
        var days = _days || 0;
        var months = _months || 0;
        var years = _years || 0;
        return new Date(oldDate.getFullYear()+years,oldDate.getMonth()+months,oldDate.getDate()+days);
    },

    updateBsProgress: function(el, options) {
        console.log(options);
        var pb = el.find('.progress-bar');
        if (pb) {
            var max = options.max || pb.attr('aria-valuemax');
            var val = options.value || pb.attr('aria-valuenow');
            var pct = val / max* 100;
            if (options.value) pb.css('width', pct+'%').attr('aria-valuenow', options.value);
            if (options.max) pb.attr('aria-valuemax', options.max);
        }
    },

    simpleAjaxGet: function(url, target_id) {
        $.getJSON(url, {}, function(data) {
            var res = "<pre>"+JSON.stringify(data, undefined, 2)+"</pre>";
            $("#"+target_id).html(res).fadeIn();
        });
    },

    stdSN: function(raw) {
        return util.stripSymbols(raw).toUpperCase().replace(' ','');
    },

    catchJSErrors: function() {
        window.onerror = function(msg, url, line, col, error) {
           // Note that col & error are new to the HTML 5 spec and may not be
           // supported in every browser.  It worked for me in Chrome.
           var extra = !col ? '' : '\ncolumn: ' + col;
           extra += !error ? '' : '\nerror: ' + error;

           // You can view the information in an alert to see things working like this:
           alert("An error has occurred. Share this with the Echo Development team for assistance: " + msg + "\nurl: " + url + "\nline: " + line + extra);

           // TODO: Report this error via ajax so you can keep track
           //       of what pages have JS issues

           var suppressErrorAlert = true;
           // If you return true, then error alerts (like in older versions of
           // Internet Explorer) will be suppressed.
           return suppressErrorAlert;
        };
    },

    toggleInList: function(list, item) {
        var i = list.indexOf(item);
        if (i > -1) list.splice(i, 1);
        else list.push(item);
        return list;
    },

    col_class(n) {
        var col_width = 12 / n;
        return "col-sm-" + col_width;
    },

    stringToColor: function(str) {
        // str to hash
        for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
        // int/hash to hex
        for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));
        return colour;
    },

    lookupDict: function(itemlist, _keyprop) {
        var keyprop = _keyprop || 'id';
        var lookup = {}
        itemlist.forEach(function(item, i, arr) {
            lookup[item[keyprop]] = item;
        });
        return lookup;
    },

    flattenDict: function(dict) {
        var list = [];
        for (var key in dict) {
            if (dict.hasOwnProperty(key)) {
                list.push(dict[key]);
            }
        }
        return list;
    },

    printAmount: function(cents, opts) {
        // Opts props example
        // {
        //     fromUSD: true,
        //     currency: "KES",
        //     forexTable: { "KES": 'rate': 85.2, 'update': 1929101010 },
        //     debit: false,
        //     showCurrency: false
        // }
        var currencyDecimals = {
            KES: 0,
            USD: 2
        };
        var debit = opts.debit == null ? false : opts.debit;
        var fromUSD = opts.fromUSD == null ? true : opts.fromUSD;
        if (fromUSD) cents = util.fromUSD(cents, opts.currency, opts.forexTable);
        var units = util.fromCents(cents);
        var decimals;
        if (opts.currency) {
            var decimals = currencyDecimals[opts.currency];
        }
        var res = util.fixedNumber(units, decimals);
        res = util.numberWithCommas(res);
        if (opts.currency && opts.showCurrency) res = opts.currency + " " + res;
        if (debit) {
            res = "("+res+")";
        }
        return res;
    },

    fromCents: function(cents) {
        return cents / 100.0;
    },

    toCents: function(units) {
        units = units.replace(',','');
        return parseFloat(units) * 100.0;
    },

    fixedNumber: function(num, _decimals) {
        var decimals = _decimals == null ? 2 : _decimals;
        return parseFloat(Math.round(num * 100) / 100).toFixed(decimals);
    },

    numberWithCommas: function(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    },

    serializeObject: function(jqel) {
        var o = {};
        var a = jqel.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    },

    type_check(value, type) {
        // Type is a string matching google visualization types
        // Returns value standardized to given type
        if (type == "number") value = parseFloat(value);
        return value;
    },

    removeItemsById(collection, id_list, _id_prop) {
        var id_prop = _id_prop || "id";
        return collection.filter(function(x) { return id_list.indexOf(x[id_prop]) == -1; } )
    },

    findItemById(collection, id, _id_prop) {
        var id_prop = _id_prop || "id";
        return collection.find(x => x && x[id_prop] === id);
    },

    findIndexById(collection, id, _id_prop) {
        var id_prop = _id_prop || "id";
        var ids = collection.map(function(x) {return (x != null) ? x[id_prop] : null; });
        return ids.indexOf(id);
    },

    set_title(title) {
        if (title != null) title = title + " | Cloudy Memory";
        else title = "Cloudy Memory";
        document.title = title;
    }

}

module.exports = util;