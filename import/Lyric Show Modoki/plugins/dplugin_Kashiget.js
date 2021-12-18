pl = {
    name: 'dplugin_Kashiget',
    label: prop.Panel.Lang === 'ja' ? '歌詞検索: 歌詞GET' : 'Download Lyrics: Kget',
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
                return 'http://www.kget.jp/lyric/' + id + '/';
            else
                return 'http://www.kget.jp/search/index.php?c=0&r='
                    + encodeURIComponent(artist.replace(/cv[.:： ]/ig, '')).replaceEach("'", '%27', '\\(', '%28', '\\)', '%29', '%20', '+', 'g') // CV:の表記は削った方が結果が良くなるので削る
                    + '&t='
                    + encodeURIComponent(title).replaceEach("'", '%27', '\\(', '%28', '\\)', '%29', '%20', '+', 'g')
                    + '&v=&f=';
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

            var CutoutRE = new RegExp('<div class="title-wrap cf"><a class="lyric-anchor".+?作曲：</span><em>.+?</em></p>', 'i'); // SearchREで.+を多用するため正規表現の処理がハングアップする。なので先に目的のものを切り出す
            var SearchRE = new RegExp('<a class="lyric-anchor" href="/lyric/(\\d+)/.+?<p class="artist"><a.+?>(.+?)</a></p>.+?' // $1:id, $2:歌手
                + '<div class="by"><p><span>作詞：</span><em>(.+?)</em>.+?<span>作曲：</span><em>(.+?)</em></p>', 'i'); // $3:作詞, $4:作曲

            var StartLyricRE = /<div id="lyric-trunk"><script>.+?<\/script>(.+?)<script>/i;
            var LineBreakRE = /<br ?\/?>/ig;
            var LineFeedCode = prop.Save.LineFeedCode;

            res = res.replace(/[\t ]*(?:\r\n|\r|\n)[\t ]*/g, '');
            if (depth === 1) { // lyric
                if (StartLyricRE.test(res)) {
                    this.lyrics = RegExp.$1
                        .replace(LineBreakRE, LineFeedCode)
                        .decodeHTMLEntities()
                        .trim();
                }
            }
            else { // search
                if (CutoutRE.test(res) && SearchRE.test(RegExp.lastMatch)) {
                    debug_html && fb.trace('id: ' + RegExp.$1);
                    this.id = RegExp.$1;

                    onLoaded.info = (title + LineFeedCode + LineFeedCode
                        + '作詞  ' + RegExp.$3 + LineFeedCode
                        + '作曲  ' + RegExp.$4 + LineFeedCode
                        + '唄  ' + RegExp.$2 + LineFeedCode + LineFeedCode)
                        .decodeHTMLEntities();
                }
            }
        }

    }

};
