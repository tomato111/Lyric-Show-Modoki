pl = {
    name: 'dplugin_AZLyrics',
    label: prop.Panel.Lang == 'ja' ? '歌詞検索: AZLyrics' : 'Download Lyrics: AZLyrics',
    author: 'tomato111',
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
        var NotAlphaNumericRE = /[^a-z0-9]/g;

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

        function createQuery(title, artist) {
            return 'http://www.azlyrics.com/lyrics/' + artist.toLowerCase().replace(NotAlphaNumericRE, '') + '/' + title.toLowerCase().replace(NotAlphaNumericRE, '') + '.html';
        }

        function onLoaded(request, depth, file) {
            StatusBar.setText((prop.Panel.Lang == 'ja' ? '検索中......' : 'Searching......') + label);
            StatusBar.show();
            debug_html && fb.trace('\nOpen#' + depth + ': ' + file + '\n');

            var res = request.responseText;

            debug_html && fb.trace(res);
            var resArray = res.split(getLineFeedCode(res));
            var Page = new AnalyzePage(resArray, depth);

            if (Page.lyrics) {
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

        function AnalyzePage(resArray, depth) {
            var isLyric;

            var StartLyricRE = /<!-- Usage of azlyrics/i;
            var EndLyricRE = /<\/div>/i;
            var LineBreakRE = /<br>/ig;
            var IgnoreRE = /<i>|<\/i>/ig;

            onLoaded.info = title + LineFeedCode + LineFeedCode;
            this.lyrics = '';

            for (var i = 0; i < resArray.length; i++){
                if (StartLyricRE.test(resArray[i])) {
                    isLyric = true; continue;
                }
                if (EndLyricRE.test(resArray[i]) && isLyric) {
                    break;
                }

                if (isLyric)
                    this.lyrics += resArray[i];
            }

            this.lyrics = this.lyrics
                .replace(LineBreakRE, LineFeedCode)
                .replace(IgnoreRE, '')
                .replaceEach('&quot;', '"', '&amp;', '&', 'ig')
                .trim();
        }

    }

};
