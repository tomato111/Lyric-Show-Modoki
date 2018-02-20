pl = {
    name: 'dplugin_ViewLyrics',
    label: prop.Panel.Lang === 'ja' ? '歌詞検索: ViewLyrics' : 'Download Lyrics: ViewLyrics',
    author: 'tomato111',
    resultType: 'List', // 独自のresultsリストを保持することを示す。resultsプロパティとshowResultsメソッドが必要
    highPriority: window.GetProperty('Plugin.ViewLyrics.HighPriority', false), // resultsリストの優先度
    onStartUp: function () { // 最初に一度だけ呼び出される
        //md5.min.js by blueimp
        !function (n) { 'use strict'; function t(n, t) { var r = (65535 & n) + (65535 & t), e = (n >> 16) + (t >> 16) + (r >> 16); return e << 16 | 65535 & r } function r(n, t) { return n << t | n >>> 32 - t } function e(n, e, o, u, c, f) { return t(r(t(t(e, n), t(u, f)), c), o) } function o(n, t, r, o, u, c, f) { return e(t & r | ~t & o, n, t, u, c, f) } function u(n, t, r, o, u, c, f) { return e(t & o | r & ~o, n, t, u, c, f) } function c(n, t, r, o, u, c, f) { return e(t ^ r ^ o, n, t, u, c, f) } function f(n, t, r, o, u, c, f) { return e(r ^ (t | ~o), n, t, u, c, f) } function i(n, r) { n[r >> 5] |= 128 << r % 32, n[(r + 64 >>> 9 << 4) + 14] = r; var e, i, a, h, d, l = 1732584193, g = -271733879, v = -1732584194, m = 271733878; for (e = 0; e < n.length; e += 16) i = l, a = g, h = v, d = m, l = o(l, g, v, m, n[e], 7, -680876936), m = o(m, l, g, v, n[e + 1], 12, -389564586), v = o(v, m, l, g, n[e + 2], 17, 606105819), g = o(g, v, m, l, n[e + 3], 22, -1044525330), l = o(l, g, v, m, n[e + 4], 7, -176418897), m = o(m, l, g, v, n[e + 5], 12, 1200080426), v = o(v, m, l, g, n[e + 6], 17, -1473231341), g = o(g, v, m, l, n[e + 7], 22, -45705983), l = o(l, g, v, m, n[e + 8], 7, 1770035416), m = o(m, l, g, v, n[e + 9], 12, -1958414417), v = o(v, m, l, g, n[e + 10], 17, -42063), g = o(g, v, m, l, n[e + 11], 22, -1990404162), l = o(l, g, v, m, n[e + 12], 7, 1804603682), m = o(m, l, g, v, n[e + 13], 12, -40341101), v = o(v, m, l, g, n[e + 14], 17, -1502002290), g = o(g, v, m, l, n[e + 15], 22, 1236535329), l = u(l, g, v, m, n[e + 1], 5, -165796510), m = u(m, l, g, v, n[e + 6], 9, -1069501632), v = u(v, m, l, g, n[e + 11], 14, 643717713), g = u(g, v, m, l, n[e], 20, -373897302), l = u(l, g, v, m, n[e + 5], 5, -701558691), m = u(m, l, g, v, n[e + 10], 9, 38016083), v = u(v, m, l, g, n[e + 15], 14, -660478335), g = u(g, v, m, l, n[e + 4], 20, -405537848), l = u(l, g, v, m, n[e + 9], 5, 568446438), m = u(m, l, g, v, n[e + 14], 9, -1019803690), v = u(v, m, l, g, n[e + 3], 14, -187363961), g = u(g, v, m, l, n[e + 8], 20, 1163531501), l = u(l, g, v, m, n[e + 13], 5, -1444681467), m = u(m, l, g, v, n[e + 2], 9, -51403784), v = u(v, m, l, g, n[e + 7], 14, 1735328473), g = u(g, v, m, l, n[e + 12], 20, -1926607734), l = c(l, g, v, m, n[e + 5], 4, -378558), m = c(m, l, g, v, n[e + 8], 11, -2022574463), v = c(v, m, l, g, n[e + 11], 16, 1839030562), g = c(g, v, m, l, n[e + 14], 23, -35309556), l = c(l, g, v, m, n[e + 1], 4, -1530992060), m = c(m, l, g, v, n[e + 4], 11, 1272893353), v = c(v, m, l, g, n[e + 7], 16, -155497632), g = c(g, v, m, l, n[e + 10], 23, -1094730640), l = c(l, g, v, m, n[e + 13], 4, 681279174), m = c(m, l, g, v, n[e], 11, -358537222), v = c(v, m, l, g, n[e + 3], 16, -722521979), g = c(g, v, m, l, n[e + 6], 23, 76029189), l = c(l, g, v, m, n[e + 9], 4, -640364487), m = c(m, l, g, v, n[e + 12], 11, -421815835), v = c(v, m, l, g, n[e + 15], 16, 530742520), g = c(g, v, m, l, n[e + 2], 23, -995338651), l = f(l, g, v, m, n[e], 6, -198630844), m = f(m, l, g, v, n[e + 7], 10, 1126891415), v = f(v, m, l, g, n[e + 14], 15, -1416354905), g = f(g, v, m, l, n[e + 5], 21, -57434055), l = f(l, g, v, m, n[e + 12], 6, 1700485571), m = f(m, l, g, v, n[e + 3], 10, -1894986606), v = f(v, m, l, g, n[e + 10], 15, -1051523), g = f(g, v, m, l, n[e + 1], 21, -2054922799), l = f(l, g, v, m, n[e + 8], 6, 1873313359), m = f(m, l, g, v, n[e + 15], 10, -30611744), v = f(v, m, l, g, n[e + 6], 15, -1560198380), g = f(g, v, m, l, n[e + 13], 21, 1309151649), l = f(l, g, v, m, n[e + 4], 6, -145523070), m = f(m, l, g, v, n[e + 11], 10, -1120210379), v = f(v, m, l, g, n[e + 2], 15, 718787259), g = f(g, v, m, l, n[e + 9], 21, -343485551), l = t(l, i), g = t(g, a), v = t(v, h), m = t(m, d); return [l, g, v, m] } function a(n) { var t, r = "", e = 32 * n.length; for (t = 0; t < e; t += 8) r += String.fromCharCode(n[t >> 5] >>> t % 32 & 255); return r } function h(n) { var t, r = []; for (r[(n.length >> 2) - 1] = void 0, t = 0; t < r.length; t += 1) r[t] = 0; var e = 8 * n.length; for (t = 0; t < e; t += 8) r[t >> 5] |= (255 & n.charCodeAt(t / 8)) << t % 32; return r } function d(n) { return a(i(h(n), 8 * n.length)) } function l(n, t) { var r, e, o = h(n), u = [], c = []; for (u[15] = c[15] = void 0, o.length > 16 && (o = i(o, 8 * n.length)), r = 0; r < 16; r += 1) u[r] = 909522486 ^ o[r], c[r] = 1549556828 ^ o[r]; return e = i(u.concat(h(t)), 512 + 8 * t.length), a(i(c.concat(e), 640)) } function g(n) { var t, r, e = "0123456789abcdef", o = ""; for (r = 0; r < n.length; r += 1) t = n.charCodeAt(r), o += e.charAt(t >>> 4 & 15) + e.charAt(15 & t); return o } function v(n) { return unescape(encodeURIComponent(n)) } function m(n) { return d(v(n)) } function p(n) { return g(m(n)) } function s(n, t) { return l(v(n), v(t)) } function C(n, t) { return g(s(n, t)) } function A(n, t, r) { return t ? r ? s(t, n) : C(t, n) : r ? m(n) : p(n) } "function" == typeof define && define.amd ? define(function () { return A }) : "object" == typeof module && module.exports ? module.exports = A : n.md5 = A }(this); // eslint-disable-line

        var _this = this;
        this.results = [];
        this.showResults = function () {
            var status, key_s = [];
            var results = _this.results;
            if (!results.length) {
                return;
            }

            if (!results[0].lyric) {
                getHTML(null, 'GET', results[0].link, !ASYNC, 0, function (request) { results[0].lyric = request.responseText; });
            }
            main(results[0].lyric);
            status = 'src: ViewLyrics';
            if (results.length !== 1) {
                key_s.push("'Enter'");
                status += ' (' + ++_this.i + '/' + results.length + ')';
                results.push(results.shift());
                if (_this.i === results.length) _this.i = 0;
            }
            if (plugins['splugin_AutoSearch'].checkOtherList()) {
                key_s.push("']'");
            }
            if (key_s.length) {
                status += "  <key: " + key_s.join(" or ") + ">";
            }
            StatusBar.showText(status);

            plugin_auto_save(status + '\n');
        };

    },
    onPlay: function () { // 新たに曲が再生された時に呼び出される
        this.results.length = 0;
    },
    onCommand: function (isAutoSearch) { // プラグインのメニューをクリックすると呼び出される

        if (!isAutoSearch && utils.IsKeyPressed(VK_CONTROL)) {
            plugins['splugin_AutoSearch'].setAutoSearchPluginName(this.name);
            return;
        }

        if (!fb.IsPlaying) {
            StatusBar.showText(prop.Panel.Lang === 'ja' ? '再生していません。' : 'Not Playing');
            return;
        }

        this.i = 0;
        this.results.length = 0;

        var debug_html = false; // for debug
        var label = this.label.replace(/^.+?: ?/, '');

        // title, artist for search
        var title = fb.TitleFormat('%title%').Eval();
        var artist = fb.TitleFormat('%artist%').Eval();

        if (!isAutoSearch) {
            title = prompt('Please input TITLE', label, title);
            if (!title) return;
            artist = prompt('Please input ARTIST', label, artist);
            if (!artist) return;
        }

        StatusBar.showText((prop.Panel.Lang === 'ja' ? '検索中......' : 'Searching......') + label);


        /*
         * --reference-- ViewLyrics Open Searcher by PedroHLC. Converted to JScript by tomato111.
         */
        var search_url = "http://search.crintsoft.com/searchlyrics.htm";
        var search_query = "<?xml version='1.0' encoding='utf-8' standalone='yes' ?><searchV1 client=\"ViewLyricsOpenSearcher\" artist=\"" + artist + "\" title=\"" + title + "\" OnlyMatched=\"1\" />";
        var md5watermark = 'Mlv1clt4.0';
        var useragent = 'MiniLyrics';
        var _this = this;

        function vl_enc(data, md5_extra) {
            var md5_hex = _this.md5(data + md5_extra);
            var sum = 0;
            var arr, magickey, result;

            var bs = new BinaryStream();
            bs.open();
            bs.writeFromString_UTF8(data);
            bs.position = 0;
            arr = bs.readToIntArray();

            for (var i = 0; i < arr.length; i++) {
                sum += arr[i];
            }
            magickey = Math.round(sum / arr.length);

            for (i = 0; i < arr.length; i++) {
                arr[i] = arr[i] ^ magickey;
            }

            bs.clear();
            bs.writeFromIntArray([0x02, magickey, 0x04, 0x00, 0x00, 0x00]);
            bs.writeFromHexString(md5_hex);
            bs.writeFromIntArray(arr);
            bs.position = 0;
            result = bs.readToBinary();
            //bs.saveToFile(ws.SpecialFolders.item('Desktop') + '\\bin');
            bs.close();

            return result;
        }

        var search_encquery = vl_enc(search_query, md5watermark);

        getHTML(search_encquery, 'POST', search_url, ASYNC, 0, onLoaded,
            {
                'User-Agent': useragent,
                'Connection': 'Keep-Alive',
                'Expect': '100-continue',
                'content-type': 'application/x-www-form-urlencoded'
            }
        );

        //------------------------------------

        function onLoaded(request, depth, file) {
            StatusBar.showText((prop.Panel.Lang === 'ja' ? '検索中......' : 'Searching......') + label);
            debug_html && fb.trace('\nOpen#' + depth + ': ' + file + '\n');

            var res = request.responseBody;
            var xml = vl_dec(res);
            debug_html && fb.trace(xml);
            //responseBodyToFile(res, ws.SpecialFolders.item('Desktop') + '\\bin2');

            if (request.status === 200) {
                var fileinfo = parseXML(xml);
                _this.results.push.apply(_this.results, fileinfo);
            }

            if (isAutoSearch) {
                plugins['splugin_AutoSearch'].results.push({ name: label, lyric: null });
            }
            else {
                if (fileinfo && fileinfo.length) {
                    _this.showResults();
                    Keybind.LyricShow_keyup[13] = _this.showResults;
                }
                else
                    if (request.status === 200)
                        StatusBar.showText(prop.Panel.Lang === 'ja' ? 'ページが見つかりませんでした。' : 'Page not found.');
                    else
                        StatusBar.showText(request.status + ' ' + request.statusText);
            }
        }

        function vl_dec(data) {
            var arr, magickey, result;

            var bs = new BinaryStream();
            bs.open();
            bs.writeFromBinary(data);
            bs.position = 0;
            arr = bs.readToIntArray();

            magickey = arr[1];
            arr = arr.slice(22);
            for (var i = 0; i < arr.length; i++) {
                arr[i] = arr[i] ^ magickey;
            }

            bs.clear();
            bs.writeFromIntArray(arr);
            bs.position = 0;
            result = bs.readToString_UTF8();
            //bs.saveToFile(ws.SpecialFolders.item('Desktop') + '\\searchV1.xml');
            bs.close();

            return result;
        }

        function parseXML(xml) {
            try {
                var dom = new ActiveXObject('Msxml2.DOMDocument.6.0');
            } catch (e) {
                try {
                    dom = new ActiveXObject('Msxml2.DOMDocument.3.0');
                } catch (e) {
                    fb.ShowPopupMessage('Error: Failed to create DOMDocument object');
                    return;
                }
            }

            dom.loadXML(xml);
            if (dom.parseError.errorCode === 0) {
                var rootNode = dom.documentElement;
                var server_url = rootNode.getAttribute('server_url');
                var nodeList = rootNode.selectNodes('//fileinfo');

                var item, result = [];
                for (var i = 0; i < nodeList.length; i++) {
                    item = nodeList[i];

                    result.push(
                        {
                            link: server_url + item.getAttribute('link'),
                            artist: item.getAttribute('artist'),
                            title: item.getAttribute('title'),
                            album: item.getAttribute('album'),
                            timelength: item.getAttribute('timelength'),
                            rate: item.getAttribute('rate'),
                            ratecount: item.getAttribute('ratecount'),
                            downloads: item.getAttribute('downloads'),
                            uploader: item.getAttribute('uploader')
                        }
                    );
                }
            }
            else {
                fb.ShowPopupMessage('parseXML Error:' + dom.parseError.reason, label);
            }

            return result || [];
        }

    }

};
