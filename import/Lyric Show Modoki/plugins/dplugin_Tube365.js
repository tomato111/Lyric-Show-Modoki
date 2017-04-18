pl = {
    name: 'dplugin_Tube365',
    label: prop.Panel.Lang == 'ja' ? '歌詞検索: Tube365' : 'Download Lyrics: Tube365',
    author: 'tomato111',
    onStartUp: function () { // 最初に一度だけ呼び出される
    },
    onCommand: function (isAutoSearch) { // プラグインのメニューをクリックすると呼び出される

        if (!isAutoSearch && utils.IsKeyPressed(VK_CONTROL)) {
            plugins['splugin_AutoSearch'].setAutoSearchPluginName(this.name);
            return;
        }

        if (!fb.IsPlaying) {
            StatusBar.showText(prop.Panel.Lang == 'ja' ? '再生していません。' : 'Not Playing');
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

        StatusBar.showText((prop.Panel.Lang == 'ja' ? '検索中......' : 'Searching......') + label);
        getHTML(null, 'GET', createQuery(title), ASYNC, 0, onLoaded);

        //------------------------------------

        function createQuery(word, id) {
            if (id)
                return 'http://tube365.net/lang-' + (prop.Panel.Lang == 'ja' ? 'ja' : 'en') + '/' + id;
            else
                return 'http://tube365.net/index.php?keyword='
                    + encodeURIComponent(title).replaceEach("'", '%27', '\\(', '%28', '\\)', '%29', '%20', '+', 'g')
                    + '&search_type=track&lang=' + (prop.Panel.Lang == 'ja' ? 'ja' : 'en') + '&submit=%E6%A4%9C%E7%B4%A2';
        }

        function onLoaded(request, depth, file) {
            StatusBar.showText((prop.Panel.Lang == 'ja' ? '検索中......' : 'Searching......') + label);
            debug_html && fb.trace('\nOpen#' + depth + ': ' + file + '\n');

            var res = request.responseText;

            debug_html && fb.trace(res);
            var resArray = res.split('\n');
            var Page = new AnalyzePage(resArray, depth);

            if (Page.id) {
                getHTML(null, 'GET', createQuery(null, Page.id), ASYNC, ++depth, onLoaded);
            }
            else if (Page.script_id) {
                getHTML(null, 'GET', Page.script_id, ASYNC, ++depth, onLoaded);
            }
            else if (Page.lyrics) {
                var text = onLoaded.info + Page.lyrics;

                debug_html && fb.trace('\n' + text + '\n===End debug=============');
                if (isAutoSearch) {
                    plugins['splugin_AutoSearch'].results.push({ name: label, lyric: text });
                }
                else {
                    main(text);
                    StatusBar.showText(prop.Panel.Lang == 'ja' ? '検索終了。歌詞を取得しました。' : 'Search completed.');
                    var AutoSaveTo = window.GetProperty('Plugin.Search.AutoSaveTo');

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

            var SearchRE = /<li><a href=".+?(init_char.+?)">(.+?)<\/a><\/li>/ig; // $1:id, $2:曲名 / 歌手名
            var ScriptIDSearchRE = /<div id="lyrics_block"><script src="(.+?)"/i; // $1:script-id
            var FuzzyRE = /[-.'&＆～・*＊+＋/／!！。,、 　]/g;
            var LineFeedCode = prop.Save.LineFeedCode;

            if (depth === 2) { // lyric
                onLoaded.info = title + LineFeedCode + LineFeedCode;
                this.lyrics = resArray[0]
                    .replace(/^document.write\('/i, '')
                    .replace(/(?:<br ?\/>){3,}.*/gi, '')
                    .replace(/Thanks to.+for submitting.+/i, '')
                    .replace(/<br ?\/>/gi, LineFeedCode)
                    .replaceEach('&quot;', '"', '&amp;', '&', 'ig')
                    .decNumRefToString()
                    .trim();
            }
            else if (depth === 1) { // script-id-search
                for (i = 0; i < resArray.length; i++)
                    if (ScriptIDSearchRE.test(resArray[i])) {
                        this.script_id = RegExp.$1;
                        return;
                    }
            }
            else { // search
                tmpti = title.toLowerCase().replace(FuzzyRE, '');
                tmpar = artist.toLowerCase().replace(FuzzyRE, '');
                for (i = 0; i < resArray.length; i++)
                    while ((backref = SearchRE.exec(resArray[i])) !== null) {
                        if (backref[2].toLowerCase().replace(/&amp;/g, '&').replace(FuzzyRE, '') === (tmpti + tmpar)) {
                            debug_html && fb.trace('id: ' + backref[1] + ', title / artist: ' + backref[2]);
                            this.id = backref[1];
                            return;
                        }
                    }
            }
        }

    }

};
