pl = {
    name: 'dplugin_Utanet',
    label: prop.Panel.Lang == 'ja' ? '歌詞検索: 歌ネット' : 'Download Lyrics: Uta-net',
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

        function createQuery(word, id) {
            if (id)
                return 'http://www.uta-net.com/user/phplib/svg/showkasi.php?ID=' + id + '&WIDTH=560&HEIGHT=1092&FONTSIZE=15&t=1437802371';
            else
                return 'http://www.uta-net.com/search/?Keyword=' + EscapeSJIS(word).replace(/\+/g, '%2B').replace(/%20/g, '+') + '&x=' + Math.floor((Math.random() * 45 + 1)) + '&y=' + Math.floor((Math.random() * 23 + 1)) + '&Aselect=2&Bselect=1';
        }

        function onLoaded(request, depth, file) {
            StatusBar.setText((prop.Panel.Lang == 'ja' ? '検索中......' : 'Searching......') + label);
            StatusBar.show();
            debug_html && fb.trace('\nOpen#' + depth + ': ' + file + '\n');

            if (depth === 0) {
                var res = request.responseBody;
                res = responseBodyToCharset(res, 'Shift_JIS'); // fix character corruption
            }
            else {
                res = request.responseBody;
                res = responseBodyToCharset(res, 'UTF-8'); // fix character corruption
            }

            debug_html && fb.trace(res);
            var resArray = res.split('\n');
            var Page = new AnalyzePage(resArray, depth);

            if (Page.id) {
                getHTML(null, 'GET', createQuery(null, Page.id), async, ++depth, onLoaded);
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

            var SearchRE = new RegExp('<tr><td class="side td1"><a href="/song/(\\d+)/">(.+?)</a>.*?</td>' // $1:id, $2:曲名
                + '<td class="td2"><a href=".*?">(.*?)</a></td>' // $3:歌手名
                + '<td class="td3">(.*?)</td>' // $4:作詞者
                + '<td class="td4">(.*?)</td>', 'i'); // $5:作曲者
            var FuzzyRE = /[-.'&＆～・*＊+＋/／!！。,、 　]/g;

            if (depth === 1) { // lyric
                this.lyrics = resArray[0]
                    .replace(/^.+?font-size="\d+">/i, '')
                    .replace(/<rect.+svg>$/i, '')
                    .replace(/<text.+?>/gi, '')
                    .replace(/<\/text>/gi, LineFeedCode)
                    .replaceEach('&quot;', '"', '&amp;', '&', 'ig')
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

                            onLoaded.info = title + LineFeedCode + LineFeedCode
                                + '作詞  ' + backref[4] + LineFeedCode
                                + '作曲  ' + backref[5] + LineFeedCode
                                + '唄  ' + artist + LineFeedCode + LineFeedCode;
                            break;
                        }
                    }
            }
        }

    }

};
