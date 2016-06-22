pl = {
    name: 'dplugin_Kashinavi',
    label: prop.Panel.Lang == 'ja' ? '歌詞検索: 歌詞ナビ' : 'Download Lyrics: Kashi Navi',
    author: 'tomato111',
    onStartUp: function () { // 最初に一度だけ呼び出される関数
    },
    onCommand: function (isAutoSearch) { // プラグインのメニューをクリックすると呼び出される関数

        if (!isAutoSearch && utils.IsKeyPressed(0x11)) { // VK_CONTROL
            plugins['splugin_AutoSearch'].setAutoSearchPluginName(this.name);
            return;
        }

        if (!fb.IsPlaying) {
            StatusBar.setText(prop.Panel.Lang == 'ja' ? '再生していません。' : 'Not Playing');
            StatusBar.show();
            return;
        }

        var debug_html = false; // for debug
        var async = true;
        var depth = 0;
        var LineFeedCode = prop.Save.LineFeedCode;
        var AutoSaveTo = window.GetProperty('Plugin.Search.AutoSaveTo');
        var label = this.label.replace(/^.+?: /, '');

        // title, artist for search
        var title = fb.TitleFormat('%title%').Eval();
        var artist = fb.TitleFormat('%artist%').Eval();

        if (!isAutoSearch) {
            title = prompt('Please input TITLE', label, title);
            if (!title) return;
            artist = prompt('Please input ARTIST', label, artist);
            if (!artist) return;
        }

        StatusBar.setText((prop.Panel.Lang == 'ja' ? '検索中......' : 'Searching......') + label);
        StatusBar.show();
        getHTML(null, 'GET', createQuery(title), async, depth, onLoaded);

        //------------------------------------

        function createQuery(word, info, id) {
            if (id)
                return 'http://kashinavi.com/s/kashi.php?no=' + id;
            else if (info)
                return 'http://kashinavi.com/song_view.html?' + info;
            else
                return 'http://kashinavi.com/search.php?r=kyoku&search=' + EscapeSJIS(word).replace(/\+/g, '%2B').replace(/%20/g, '+') + '&start=1&m=front';
        }

        function onLoaded(request, depth, file) {
            StatusBar.setText((prop.Panel.Lang == 'ja' ? '検索中......' : 'Searching......') + label);
            StatusBar.show();
            debug_html && fb.trace('\nOpen#' + depth + ': ' + file + '\n');

            var res = request.responseBody;
            res = responseBodyToCharset(res, 'Shift_JIS');

            debug_html && fb.trace(res);
            var resArray = res.split('\n');
            var Page = new AnalyzePage(resArray, depth);

            if (Page.id) {
                getHTML(null, 'GET', createQuery(null, Page.id), !async, false, onLoaded);
                getHTML(null, 'GET', createQuery(null, null, Page.id), async, true, onLoaded);
            }
            else if (Page.lyrics) {
                var text = onLoaded.info + Page.lyrics;

                debug_html && fb.trace('\n' + text + '\n===End debug=============');
                if (isAutoSearch) {
                    plugins['splugin_AutoSearch'].results.push({ name: label, lyric: text });
                }
                else {
                    main(text);
                    StatusBar.setText(prop.Panel.Lang == 'ja' ? '検索終了。歌詞を取得しました。' : 'Search completed.');
                    StatusBar.show();
                    if (AutoSaveTo)
                        if (/^Tag$/i.test(AutoSaveTo))
                            saveToTag(getFieldName());
                        else if (/^File$/i.test(AutoSaveTo))
                            saveToFile(parse_path + (filetype === 'lrc' ? '.lrc' : '.txt'));
                }
            }
            else if (onLoaded.info) { return; }
            else {
                if (isAutoSearch) {
                    plugins['splugin_AutoSearch'].results.push({ name: label, lyric: null });
                    return;
                }
                StatusBar.hide();
                var intButton = ws.Popup(prop.Panel.Lang == 'ja' ? 'ページが見つかりませんでした。\nブラウザで開きますか？' : 'Page not found.\nOpen the URL in browser?', 0, 'Confirm', 36);
                if (intButton === 6)
                    FuncCommand('"' + file + '"');
            }

        }

        function AnalyzePage(resArray, depth) {
            var tmpti, tmpar, backref;

            var SearchRE = new RegExp('<tr><td rowspan=2><a href="song_view\\.html\\?(\\d+)">' // $1:id 
                + '<img src=.+\\1">(.+?)</a>' // $2:曲名
                + '</td><td><a href=.+?>(.+?)</a>', 'i'); // $3:歌手名
            var InfoRE = /<tr><td>作詞　：　(.+?)<br>作曲　：　(.+?)<\/td>/i; // $1:作詞, $2:作曲
            var FuzzyRE = /[-.'&＆～・*＊+＋/／!！。,、 　]/g;

            if (depth === false) { // info
                onLoaded.info = title + LineFeedCode + LineFeedCode;
                for (var i = 0, j = 0; i < resArray.length; i++)
                    if (InfoRE.test(resArray[i])) {
                        onLoaded.info += '作詞  ' + RegExp.$1 + LineFeedCode
                            + '作曲  ' + RegExp.$2 + LineFeedCode
                            + '唄  ' + artist + LineFeedCode
                    }
                onLoaded.info += LineFeedCode;
            }
            else if (depth === true) { // lyric
                this.lyrics = resArray[1]
                    .replace(/^document\.write\("<p oncopy='return false;' unselectable='on;'>/i, '')
                    .replace(/<p>"\)$/i, '')
                    .replace(/<br>/gi, LineFeedCode)
                    .replaceEach('&quot;', '"', '&amp;', '&', 'ig')
                    .decNumRefToString()
                    .trim();
            }
            else { // search
                tmpti = title.toLowerCase().replace(FuzzyRE, '');
                tmpar = artist.toLowerCase().replace(FuzzyRE, '');
                for (i = 0; i < resArray.length; i++)
                    if (backref = resArray[i].match(SearchRE)) {
                        if (backref[2].toLowerCase().replace(FuzzyRE, '') === tmpti && backref[3].toLowerCase().replace(FuzzyRE, '') === tmpar) {
                            debug_html && fb.trace('id: ' + backref[1] + ', title: ' + backref[2] + ', artist: ' + backref[3]);
                            this.id = backref[1];
                            break;
                        }
                    }
            }
        }

    }

};
