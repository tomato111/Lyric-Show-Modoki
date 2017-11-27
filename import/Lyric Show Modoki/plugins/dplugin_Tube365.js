pl = {
    name: 'dplugin_Tube365',
    label: prop.Panel.Lang === 'ja' ? '歌詞検索: Tube365' : 'Download Lyrics: Tube365',
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
        getHTML(null, 'GET', createQuery(title, artist), ASYNC, 0, onLoaded);

        //------------------------------------

        function createQuery(title, artist, id) {
            if (id)
                return 'http://tube365.net/lang-' + (prop.Panel.Lang === 'ja' ? 'ja' : 'en') + '/' + id;
            else
                return 'http://tube365.net/index.php?keyword='
                    + encodeURIComponent(title + ' ' + artist.replace(/^the /i, '')).replaceEach("'", '%27', '\\(', '%28', '\\)', '%29', '%20', '+', 'g')
                    + '&search_type=both&lang=' + (prop.Panel.Lang === 'ja' ? 'ja' : 'en') + '&submit=%E6%A4%9C%E7%B4%A2';
        }

        function onLoaded(request, depth, file) {
            StatusBar.showText((prop.Panel.Lang === 'ja' ? '検索中......' : 'Searching......') + label);
            debug_html && fb.trace('\nOpen#' + depth + ': ' + file + '\n');

            var res = request.responseText;

            debug_html && fb.trace(res);
            var Page = new AnalyzePage(res, depth);

            if (Page.id) {
                getHTML(null, 'GET', createQuery(null, null, Page.id), ASYNC, ++depth, onLoaded);
            }
            else if (Page.script_url) {
                getHTML(null, 'GET', Page.script_url, ASYNC, ++depth, onLoaded);
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

            var SearchRE = /<li><a href=".+?(init_char.+?)">(.+?) \/ (.+?)<\/a><\/li>/ig; // $1:id, $2:曲名, $3:歌手
            var FuzzyRE = /[-.'’&＆%％@＠～・×*＊+＋/／!！?？（）(),，、 　]/g;

            var ScriptURLSearchRE = /<div id="lyrics_block"><script src="(.+?)"/i; // $1:script-url
            var IgnoreRE = /^document.write\('sponsored links<br ?\/?><br ?\/?><br ?\/?>|This Lyrics was downloaded.+/ig;
            var LineBreakRE = /<br ?\/?>/ig;
            var LineFeedCode = prop.Save.LineFeedCode;

            if (depth === 2) { // lyric
                onLoaded.info = title + LineFeedCode + LineFeedCode;
                this.lyrics = res
                    .replace(IgnoreRE, '')
                    .replace(LineBreakRE, LineFeedCode)
                    .decodeHTMLEntities()
                    .trim();
            }
            else if (depth === 1) { // script-url-search
                if (ScriptURLSearchRE.test(res))
                    this.script_url = RegExp.$1;
            }
            else { // search
                tmpti = title.toLowerCase().replace(FuzzyRE, '');
                tmpar = artist.toLowerCase().replace(/^the /, '').replace(FuzzyRE, '');
                while ((backref = SearchRE.exec(res)) !== null) {
                    if (backref[2].decodeHTMLEntities().toLowerCase().replace(FuzzyRE, '') === tmpti && backref[3].decodeHTMLEntities().toLowerCase().replace(FuzzyRE, '').indexOf(tmpar) !== -1) {
                        debug_html && fb.trace('id: ' + backref[1] + ', title: ' + backref[2] + 'artist: ' + backref[3]);
                        this.id = backref[1];
                        return;
                    }
                }
            }
        }

    }

};
