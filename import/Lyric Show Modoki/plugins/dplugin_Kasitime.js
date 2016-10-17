pl = {
    name: 'dplugin_Kasitime',
    label: prop.Panel.Lang == 'ja' ? '歌詞検索: 歌詞タイム' : 'Download Lyrics: Kasi Time',
    author: 'tomato111,Junya Renno',
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
        getHTML(null, 'GET', createQuery(title, artist), async, depth, onLoaded);

        //------------------------------------

        function createQuery(title, artist, id) {
            if (id)
                return 'http://www.kasi-time.com/item-' + id + '.html';
            else
                return 'https://www.google.co.jp/search?q='
                    + encodeURIComponent(title).replaceEach("'", '%27', '\\(', '%28', '\\)', '%29', '%20', '+', '!', '%21', 'g')
                    + '+'
                    + encodeURIComponent(artist).replaceEach("'", '%27', '\\(', '%28', '\\)', '%29', '%20', '+', '!', '%21', 'g')
                    + '+site%3Ahttp%3A%2F%2Fwww.kasi-time.com';
        }

        function onLoaded(request, depth, file) {
            StatusBar.setText((prop.Panel.Lang == 'ja' ? '検索中......' : 'Searching......') + label);
            StatusBar.show();
            debug_html && fb.trace('\nOpen#' + depth + ': ' + file + '\n');

            var res = request.responseText;

            debug_html && fb.trace(res);
            var resArray = res.split('\n');
            var Page = new AnalyzePage(resArray, depth);

            if (Page.id) {
                getHTML(null, 'GET', createQuery(null, null, Page.id), async, ++depth, onLoaded);
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
        function decodeEntity(word) {
            return word.replaceEach(
		              		"&lt;", "<",
		              		"&gt;", ">",
		              		"&larr;", "←",
		              		"&uarr;", "↑",
		              		"&rarr;", "→",
		              		"&darr;", "↓",
		              		"&amp;", '&',
		              		"&hellip;", '…',
		              		"&bull;", '•',
		              		"&hearts;", '♥',
		              		"&clubs;", '♣',
		              		"&spades;", '♠',
		              		"&diams;", '♦',
		              		"&#039;", "'",
		              		"&quot;", '"',
		              		"&#064;", "@",
		              		"g");
        }

        function AnalyzePage(resArray, depth) {
            var tmpti, id, pageTitle;

            var SearchRE = /<h3 class="r"><a href=.+?www.kasi-time.com\/item-(\d+)\.html.+?>(.+?)<\/a>/ig; // $1:id, $2:pageTitle
            var FuzzyRE = /[-.'&＆～・*＊+＋/／!！。,、 　]/g;

            var InfoRE = /<meta name="description" content="歌手:(.*?) 作詞:(.*?) 作曲:(.*?) +(?:.+に関連している曲です|歌い出し)/i; // $1:歌手, $2:作詞, $3:作曲
            var StartLyricRE = /var lyrics = '/i;
            var LineBreakRE = /<br>/ig;

            if (depth === 1) { // lyric
                onLoaded.info = title + LineFeedCode + LineFeedCode;
                for (var i = 0; i < resArray.length; i++) {
                    if (InfoRE.test(resArray[i])) {
                        onLoaded.info += '作詞  ' + RegExp.$2 + LineFeedCode
                            + '作曲  ' + RegExp.$3 + LineFeedCode
                            + '唄  ' + RegExp.$1 + LineFeedCode + LineFeedCode;
                    }

                    if (StartLyricRE.test(resArray[i])) {
                        this.lyrics = RegExp.rightContext.slice(0, -2);
                        break;
                    }
                }

                onLoaded.info = decodeEntity(onLoaded.info)
                    .decNumRefToString();
                this.lyrics = decodeEntity(this.lyrics)
                    .decNumRefToString()
                    .replace(LineBreakRE, LineFeedCode)
                    .trim();
            } else { // search
                tmpti = title.toLowerCase().replace(FuzzyRE, '');
                for (i = 0; i < resArray.length; i++) {

                    while (SearchRE.exec(resArray[i]) !== null) {
                        id = RegExp.$1;
                        pageTitle = RegExp.$2.decNumRefToString().toLowerCase().replace(FuzzyRE, '');

                        if (pageTitle.indexOf(tmpti) === 0) { // Google検索結果はページタイトルが一定の文字数で省略されるため、アーティスト名が途切れやすい。なので曲名が前方一致した時点で取得するようにする
                            this.id = id;
                            return;
                        }
                    }
                    if (id)
                        break;
                }
            }
        }

    }

};
