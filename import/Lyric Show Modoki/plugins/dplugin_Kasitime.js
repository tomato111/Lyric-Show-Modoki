pl = {
    name: 'dplugin_Kasitime',
    label: prop.Panel.Lang === 'ja' ? '歌詞検索: 歌詞タイム' : 'Download Lyrics: Kasi-time',
    author: 'tomato111,Junya Renno',
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
                return 'http://www.kasi-time.com/item-' + id + '.html';
            else {
                title = title.replace(/-/g, ' '); // 語句の先頭のハイフンは除外検索を意味するので置換する
                artist = artist.replace(/-/g, ' ').replace(/cv[.:： ]/ig, ''); // CV:の表記は削った方が結果が良くなるので削る
                return 'https://www.google.co.jp/search?q='
                    + encodeURIComponent(title + ' ' + artist).replaceEach("'", '%27', '\\(', '%28', '\\)', '%29', '%20', '+', '!', '%21', 'g')
                    + '+site%3Awww.kasi-time.com';
            }
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
            var tmpti, id, pageTitle;

            var SearchRE = /<h3 class="r"><a href=.+?www.kasi-time.com\/item-(\d+)\.html.+?>(.+?)<\/a>/ig; // $1:id, $2:pageTitle
            var EmphasisRE = /<em>|<\/em>|<b>|<\/b>/ig;
            var FuzzyRE = /[-.'’&＆%％@＠～・×*＊+＋/／!！?？（）(),，、 　]/g;

            var InfoRE = new RegExp('<tr><th>歌手</th><td>(.+?)　?(?:<br>関連リンク:.+?)?</td></tr>' // $1:歌手 
                + '<tr><th>作詞</th><td>(.+?)　?</td></tr>' // $2:作詞
                + '<tr><th>作曲</th><td>(.+?)　?</td></tr>' // $3:作曲
                + '(?:<tr><th>編曲</th><td>(.+?)　?</td></tr>)?', 'i'); // $4:編曲 (ない場合が多い)
            var StartLyricRE = /var lyrics = '(.+?)';/i;
            var LineBreakRE = /<br>/ig;
            var LineFeedCode = prop.Save.LineFeedCode;

            if (depth === 1) { // lyric
                res = res.replace(/[\t ]*(?:\r\n|\r|\n)[\t ]*/g, '');
                onLoaded.info = title + LineFeedCode + LineFeedCode;

                if (InfoRE.test(res)) {
                    onLoaded.info += ('作詞  ' + RegExp.$2 + LineFeedCode
                        + '作曲  ' + RegExp.$3 + LineFeedCode
                        + (RegExp.$4 ? '編曲  ' + RegExp.$4 + LineFeedCode : '')
                        + '唄  ' + RegExp.$1 + LineFeedCode + LineFeedCode)
                        .replace(/<a.+?>|<\/a>/g, '')
                        .decodeHTMLEntities();
                }

                if (StartLyricRE.test(res)) {
                    this.lyrics = RegExp.$1
                        .replace(LineBreakRE, LineFeedCode)
                        .decodeHTMLEntities()
                        .trim();
                }
            }
            else { // search
                tmpti = title.toLowerCase().replace(FuzzyRE, '').slice(0, 30); // 曲名が長い場合は30文字で切り出す
                res = res.replace(EmphasisRE, ''); // 環境によっては検索文字に強調タグが付くようなので削る
                while (SearchRE.exec(res) !== null) {
                    id = RegExp.$1;
                    pageTitle = RegExp.$2.decodeHTMLEntities().toLowerCase().replace(FuzzyRE, '');

                    if (pageTitle.indexOf(tmpti) === 0) {
                        this.id = id;
                        return;
                    }
                }
            }
        }

    }

};
