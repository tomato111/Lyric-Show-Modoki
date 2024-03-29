﻿pl = {
    name: 'dplugin_Touhoukashi',
    label: prop.Panel.Lang === 'ja' ? '歌詞検索: 東方同人CD' : 'Download Lyrics: Touhou Doujin CD',
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
                return 'https://w.atwiki.jp/touhoukashi/?pageid=' + id;
            else
                return 'https://w.atwiki.jp/touhoukashi/search?andor=and&keyword='
                    + encodeURIComponent(title).replaceEach("'", '%27', '\\(', '%28', '\\)', '%29', '%20', '+', '!', '%21', 'g');
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

            var SearchRE = /<a href=".+?&amp;pageid=(.+?)" title="(?:\d{1,2})?[. ]?(.+?)" style=".+?">/ig; // $1:id, $2:pageTitle
            var FuzzyRE = /[-.'’&＆%％@＠～・×*＊+＋/／!！?？（）(),，、 　]/g;

            var StartLyricRE = /<div>(アルバム：.+?)<\/div>.+?<div>(.+?)<div class="/i; // $1:info, $2:lyric
            var IgnoreRE = /<\/div>|<a.+?>|<\/a>/ig;
            var LineBreakRE = /<div>|<br ?\/?>/ig;
            var LineFeedCode = prop.Save.LineFeedCode;

            if (depth === 1) { // lyric
                res = res.replace(/[\t ]*(?:\r\n|\r|\n)[\t ]*/g, '');
                if (StartLyricRE.test(res)) {
                    onLoaded.info = title + LineFeedCode + LineFeedCode + RegExp.$1;
                    this.lyrics = RegExp.$2
                        .replace(IgnoreRE, '')
                        .replace(LineBreakRE, LineFeedCode)
                        .decodeHTMLEntities()
                        .trim();

                    onLoaded.info = onLoaded.info
                        .replace(IgnoreRE, '')
                        .replace(LineBreakRE, LineFeedCode)
                        .decodeHTMLEntities()
                        .trim() + LineFeedCode + LineFeedCode;
                }
            }
            else { // search
                tmpti = title.toLowerCase().replace(FuzzyRE, '');
                while (SearchRE.exec(res) !== null) {
                    debug_html && fb.trace('id: ' + RegExp.$1 + ' pageTitle: ' + RegExp.$2);
                    id = RegExp.$1;
                    pageTitle = RegExp.$2.decodeHTMLEntities().toLowerCase().replace(FuzzyRE, '');

                    if (pageTitle === tmpti) {
                        this.id = id;
                        break;
                    }
                }
            }
        }

    }

};
