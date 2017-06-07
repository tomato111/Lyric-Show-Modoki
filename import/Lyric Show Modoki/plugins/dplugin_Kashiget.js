pl = {
    name: 'dplugin_Kashiget',
    label: prop.Panel.Lang == 'ja' ? '歌詞検索: 歌詞GET' : 'Download Lyrics: Kget',
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
        getHTML(null, 'GET', createQuery(title, artist), ASYNC, 0, onLoaded);

        //------------------------------------

        function createQuery(title, artist, id) {
            if (id)
                return 'http://www.kget.jp/lyric/' + id + '/';
            else
                return 'http://www.kget.jp/search/index.php?c=0&r='
                    + encodeURIComponent(artist).replaceEach("'", '%27', '\\(', '%28', '\\)', '%29', '%20', '+', 'g')
                    + '&t='
                    + encodeURIComponent(title).replaceEach("'", '%27', '\\(', '%28', '\\)', '%29', '%20', '+', 'g')
                    + '&v=&f=';
        }

        function onLoaded(request, depth, file) {
            StatusBar.showText((prop.Panel.Lang == 'ja' ? '検索中......' : 'Searching......') + label);
            debug_html && fb.trace('\nOpen#' + depth + ': ' + file + '\n');

            var res = request.responseText;

            debug_html && fb.trace(res);
            var resArray = res.split('\n');
            var Page = new AnalyzePage(resArray, depth);

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
                    StatusBar.showText(prop.Panel.Lang == 'ja' ? '検索終了。歌詞を取得しました。' : 'Search completed.');

                    plugin_auto_save();
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
            var isLyric;

            var IdSearchRE = /<a class="lyric-anchor" href="\/lyric\/(\d+)\/.+<h2/i; // $1:id
            var InfoSearchRE = /<div class="by"><p><span>.+?<\/span><em>(.+?)<\/em>.+?<span>.+?<\/span><em>(.+?)<\/em><\/p>/i; // $1:作詞, $2:作曲
            var StartLyricRE = /<div id="lyric-trunk">/i;
            var EndLyricRE = /<\/div>/i;
            var LineBreakRE = /<br \/>/ig;
            var LineFeedCode = prop.Save.LineFeedCode;

            if (depth === 1) { // lyric
                this.lyrics = '';
                for (var i = 0; i < resArray.length; i++) {
                    if (StartLyricRE.test(resArray[i])) {
                        isLyric = true; continue;
                    }
                    if (EndLyricRE.test(resArray[i]) && isLyric) {
                        break;
                    }

                    if (isLyric) {
                        this.lyrics += resArray[i];
                    }
                }

                this.lyrics = this.lyrics
                    .decNumRefToString()
                    .replace(LineBreakRE, LineFeedCode)
                    .trim();
            }
            else { // search
                for (i = 0; i < resArray.length; i++) {
                    if (IdSearchRE.test(resArray[i])) {
                        debug_html && fb.trace('id: ' + RegExp.$1);
                        this.id = RegExp.$1;
                        continue;
                    }
                    if (this.id && InfoSearchRE.test(resArray[i])) {
                        onLoaded.info = title + LineFeedCode + LineFeedCode
                                + '作詞  ' + RegExp.$1 + LineFeedCode
                                + '作曲  ' + RegExp.$2 + LineFeedCode
                                + '唄  ' + artist + LineFeedCode + LineFeedCode;
                        break;
                    }
                }
            }
        }

    }

};
