pl = {
    name: 'dplugin_Utamap',
    label: prop.Panel.Lang === 'ja' ? '歌詞検索: うたまっぷ' : 'Download Lyrics: Utamap',
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

        function createQuery(title, artist, page, id) {
            if (id)
                return 'https://www.utamap.com/phpflash/flashfalsephp.php?unum=' + id;
            else if (page)
                return 'https://www.utamap.com/searchkasi.php?searchname=title&page=' + page + '&sortname=0&pattern=1&word=' + EscapeSJIS(title).replace(/\+/g, '%2B').replace(/%20/g, '+');
            else
                return 'https://www.utamap.com/searchkasi.php?searchname=title&word='
                    + EscapeSJIS(title).replace(/\+/g, '%2B').replace(/%20/g, '+')
                    + '&act=search&search_by_keyword=%8C%9F%26%23160%3B%26%23160%3B%26%23160%3B%8D%F5&sortname=0&pattern=1';
        }

        function onLoaded(request, depth, file) {
            StatusBar.showText((prop.Panel.Lang === 'ja' ? '検索中......' : 'Searching......') + label);
            debug_html && fb.trace('\nOpen#' + depth + ': ' + file + '\n');

            if (depth === true) {
                var res = request.responseBody;
                res = responseBodyToCharset(res, 'UTF-8'); // fix character corruption
            }
            else
                res = request.responseText;

            debug_html && fb.trace(res);
            var Page = new AnalyzePage(res, depth);

            if (Page.id) {
                getHTML(null, 'GET', createQuery(null, null, null, Page.id), ASYNC, true, onLoaded);
            }
            else if (Page.next) {
                getHTML(null, 'GET', createQuery(title, '', ++depth), ASYNC, depth, onLoaded);
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
                    FuncCommand('"' + file.replace(/page=\d+&/, '') + '"');
            }

        }

        function AnalyzePage(res, depth) {
            var tmpti, tmpar, backref;

            var SearchRE = new RegExp('<td class=ct160><a href=".+?=(.+?)">(.*?)</a></td>\\s+' // $1:id, $2:曲名
                + '<td class=ct120>(.*?)</td>\\s+' // $3:歌手
                + '<td class=ct120>(.*?)</td>\\s+' // $4:作詞
                + '<td class=ct120>(.*?)</td>', 'ig'); // $5:作曲
            var FuzzyRE = /[-.'’&＆%％@＠～・×*＊+＋/／!！?？（）(),，、 　]/g;

            var IgnoreRE = /^.+?&.+?=/ig;
            var LineBreakRE = /\n/ig;
            var LineFeedCode = prop.Save.LineFeedCode;

            if (depth === true) { // lyric
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

                    this.next = true; // SearchREがヒットした時点で次のページを場合によって調べるフラグをたてる
                }
            }
        }

    }

};
