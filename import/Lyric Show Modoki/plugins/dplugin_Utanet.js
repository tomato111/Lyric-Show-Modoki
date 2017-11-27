pl = {
    name: 'dplugin_Utanet',
    label: prop.Panel.Lang === 'ja' ? '歌詞検索: 歌ネット' : 'Download Lyrics: Uta-net',
    author: 'tomato111',
    onStartUp: function () { // 最初に一度だけ呼び出される
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
        getHTML(null, 'GET', createQuery(title, ''), ASYNC, 0, onLoaded);

        //------------------------------------

        function createQuery(title, artist, id) {
            if (id)
                return 'https://www.uta-net.com/user/phplib/svg/showkasi.php?ID=' + id + '&WIDTH=560&HEIGHT=1092&FONTSIZE=15&t=' + Math.floor(new Date() / 1000);
            else
                return 'https://www.uta-net.com/search/?Aselect=2&Keyword='
                    + encodeURIComponent(title).replaceEach("'", '%27', '\\(', '%28', '\\)', '%29', '!', '%21', '%20', '+', 'g')
                    + '&Bselect=1&x=' + Math.floor((Math.random() * 45 + 1)) + '&y=' + Math.floor((Math.random() * 23 + 1));
        }

        function onLoaded(request, depth, file) {
            StatusBar.showText((prop.Panel.Lang === 'ja' ? '検索中......' : 'Searching......') + label);
            debug_html && fb.trace('\nOpen#' + depth + ': ' + file + '\n');

            var res = request.responseBody;
            res = responseBodyToCharset(res, 'UTF-8'); // fix character corruption

            debug_html && fb.trace(res);
            var Page = new AnalyzePage(res, depth);

            if (Page.id) {
                getHTML(null, 'GET', createQuery(null, null, Page.id), ASYNC, ++depth, onLoaded);
            }
            else if (Page.lyrics) {
                var text = onLoaded.info + Page.lyrics;

                debug_html && fb.trace('\n' + text + '\n===End debug=============');
                if (isAutoSearch) {
                    plugins['splugin_AutoSearch'].results.push({ name: label, lyric: text });
                }
                else {
                    main(text);
                    StatusBar.showText(prop.Panel.Lang === 'ja' ? '検索終了。歌詞を取得しました。' : 'Search completed.');

                    plugin_auto_save();
                }
            }
            else {
                if (isAutoSearch) {
                    plugins['splugin_AutoSearch'].results.push({ name: label, lyric: null });
                    return;
                }
                StatusBar.hide();
                var intButton = ws.Popup(prop.Panel.Lang === 'ja' ? 'ページが見つかりませんでした。\nブラウザで開きますか？' : 'Page not found.\nOpen the URL in browser?', 0, label, 36);
                if (intButton === 6)
                    FuncCommand('"' + file + '"');
            }

        }

        function AnalyzePage(res, depth) {
            var tmpti, tmpar, backref;

            var SearchRE = new RegExp('<tr><td class="side td1"><a href="/song/(\\d+)/">(.+?)</a>.*?</td>' // $1:id, $2:曲名
                + '<td class="td2"><a href=".*?">(.*?)</a></td>' // $3:歌手
                + '<td class="td3">(.*?)</td>' // $4:作詞
                + '<td class="td4">(.*?)</td>', 'ig'); // $5:作曲
            var FuzzyRE = /[-.'’&＆%％@＠～・×*＊+＋/／!！?？（）(),，、 　]/g;

            var IgnoreRE = /^.+?font-size="\d+">|<rect.+svg>$|<text.+?>/ig;
            var LineBreakRE = /<\/text>/ig;
            var LineFeedCode = prop.Save.LineFeedCode;

            if (depth === 1) { // lyric
                this.lyrics = res
                    .replace(IgnoreRE, '')
                    .replace(LineBreakRE, LineFeedCode)
                    .decodeHTMLEntities()
                    .trim();
            }
            else { // search
                tmpti = title.toLowerCase().replace(FuzzyRE, '');
                tmpar = artist.toLowerCase().replace(/[(（].+/, '').replace(FuzzyRE, '');
                while ((backref = SearchRE.exec(res)) !== null) {
                    debug_html && fb.trace('id: ' + backref[1] + ', title: ' + backref[2] + ', artist: ' + backref[3]);

                    for (var i = 2; i < 6; i++) {
                        backref[i] = backref[i].decodeHTMLEntities();
                    }

                    if (backref[2].toLowerCase().replace(FuzzyRE, '') === tmpti && backref[3].toLowerCase().replace(FuzzyRE, '').indexOf(tmpar) !== -1) {
                        this.id = backref[1];

                        onLoaded.info = title + LineFeedCode + LineFeedCode
                            + '作詞  ' + backref[4] + LineFeedCode
                            + '作曲  ' + backref[5] + LineFeedCode
                            + '唄  ' + backref[3] + LineFeedCode + LineFeedCode;
                        break;
                    }
                }
            }
        }

    }

};
