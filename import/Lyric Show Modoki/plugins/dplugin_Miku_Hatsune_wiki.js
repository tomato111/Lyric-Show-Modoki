pl = {
    name: 'dplugin_Miku_Hatsune_wiki',
    label: prop.Panel.Lang === 'ja' ? '歌詞検索: 初音ミクWiki' : 'Download Lyrics: Miku Hatsune wiki',
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
                return 'https://www5.atwiki.jp/hmiku/?pageid=' + id;
            else
                return 'https://www5.atwiki.jp/hmiku/?cmd=search&keyword='
                    + encodeURIComponent(title + ' ' + artist).replaceEach("'", '%27', '\\(', '%28', '\\)', '%29', '%20', '+', 'g')
                    + '&andor=and&ignore=1';
        }

        function onLoaded(request, depth, file) {
            StatusBar.showText((prop.Panel.Lang === 'ja' ? '検索中......' : 'Searching......') + label);
            debug_html && fb.trace('\nOpen#' + depth + ': ' + file + '\n');

            var res = request.responseText;

            debug_html && fb.trace(res);
            var Page = new AnalyzePage(res, depth);

            if (Page.id)
                getHTML(null, 'GET', createQuery(null, null, Page.id), ASYNC, true, onLoaded);
            else if (depth === 0) {
                getHTML(null, 'GET', createQuery(title, ''), ASYNC, ++depth, onLoaded);
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
            var tmpti, tmpar, backref, id, aimai;

            var SearchRE = /<a href=".+?&amp;pageid=(.+?)" title="(.+?)" style=".+?">/ig; // $1:id, $2:pageTitle
            var FuzzyRE = /[-.'’&＆%％@＠～・×*＊+＋／!！?？（）(),，、 　]/g; // スラッシュはこのサイトでは区切りの目安として使うので含めない

            var InfoRE = /(?:<div>|<br ?\/?>)(作詞：.+?)<\/div>/i; // $1:info
            var StartLyricRE = /<h3 id="id_0a172479">歌詞<\/h3>(.+?)(?:<h3|<table)/i;
            var IgnoreRE = /<.+?>/ig;
            var LineBreakRE = /<br ?\/?>|<\/div>/ig;
            var LineFeedCode = prop.Save.LineFeedCode;

            if (depth === true) { // lyric
                res = res.replace(/[\t ]*(?:\r\n|\r|\n)[\t ]*/g, '');
                onLoaded.info = title + LineFeedCode + LineFeedCode;

                if (InfoRE.test(res)) {
                    onLoaded.info += (RegExp.$1 + LineFeedCode + LineFeedCode)
                        .replace(LineBreakRE, LineFeedCode)
                        .replace(IgnoreRE, '')
                        .replace(/^(.+?)：/mg, '$1  ')
                        .decodeHTMLEntities();
                }

                if (StartLyricRE.test(res)) {
                    this.lyrics = RegExp.$1
                        .replace(LineBreakRE, LineFeedCode)
                        .replace(IgnoreRE, '')
                        .decodeHTMLEntities()
                        .trim();
                }
            }
            else { // search
                tmpti = title.toLowerCase().replace(FuzzyRE, '');
                tmpar = artist.toLowerCase().replace(FuzzyRE, '').slice(0, 2); // 表記揺れが激しいので極端に短くする
                while ((backref = SearchRE.exec(res)) !== null) {
                    debug_html && fb.trace('id: ' + backref[1] + ' pageTitle: ' + backref[2]);
                    backref[2] = backref[2].decodeHTMLEntities().toLowerCase().replace(FuzzyRE, '');

                    if (backref[2].indexOf(tmpti + '/' + tmpar) === 0) {
                        this.id = backref[1];
                        return;
                    }

                    if (backref[2] === tmpti)
                        id = backref[1];
                    if (backref[2].indexOf(tmpti + '/') === 0 && backref[2].indexOf('/過去ログ') === -1 && backref[2].indexOf('/cd') === -1)
                        aimai = true;

                }
                debug_html && fb.trace('aimai: ' + aimai);
                if (id && !aimai)
                    this.id = id;
            }
        }

    }

};
