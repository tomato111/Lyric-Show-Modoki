pl = {
    name: 'dplugin_Touhoukashi',
    label: prop.Panel.Lang == 'ja' ? '歌詞検索: 東方同人CD' : 'Download Lyrics: Touhou Doujin CD',
    author: 'tomato111',
    onStartUp: function () { // 最初に一度だけ呼び出される関数
        var temp = window.GetProperty('Plugin.Search.AutoSaveTo', ''); // 空欄 or Tag or File
        if (!/^(?:File|Tag)$/i.test(temp))
            window.SetProperty('Plugin.Search.AutoSaveTo', '');
    },
    onPlay: function () { }, // 新たに曲が再生される度に呼び出される関数
    onCommand: function (isAutoSearch) { // プラグインのメニューをクリックすると呼び出される関数

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
        getHTML(null, 'GET', createQuery(title), async, depth, onLoaded);

        //------------------------------------

        function createQuery(word, id) {
            if (id)
                return 'http://www31.atwiki.jp/touhoukashi/?page=' + id;
            else
                return 'http://www31.atwiki.jp/touhoukashi/search?andor=and&keyword=' + encodeURIComponent(word).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/%20/g, '+');
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
                getHTML(null, 'GET', createQuery(null, Page.id), async, ++depth, onLoaded);
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

        function AnalyzePage(resArray, depth) {
            var isInfo, isLyric;

            var IdSearchRE = new RegExp('<a href="http://www31.atwiki.jp/touhoukashi/.+?page=(.+?)" title="(?:\\d{1,2})?\\.? ?' + title, 'i'); // $1:id
            var ContentsSearchRE = new RegExp('(?:<h[23] id="id_.+?">' + title + '</h[23]>|(アルバム)：<a href=")', 'i'); // サイトの書式にブレがあるので少し複雑に
            var EndInfoRE = /<\/div>/i;
            var EndLyricRE = /<div class=/i;
            var LineBreakRE = /<div>|<br \/>/ig;
            var IgnoreRE = /<\/div>|<a.+?">|<\/a>/ig;

            if (depth === 1) { // lyric
                onLoaded.info = '';
                this.lyrics = '';
                for (var i = 0; i < resArray.length; i++) {
                    if (ContentsSearchRE.test(resArray[i]) && !isInfo) {
                        isInfo = true; if (!RegExp.$1) continue; // サイトの書式のブレに対応するため、continue;するかどうかを後方参照の有無で決める
                    }
                    if (EndInfoRE.test(resArray[i]) && isInfo) {
                        isInfo = false; isLyric = true; continue;
                    }
                    if (EndLyricRE.test(resArray[i]) && isLyric) {
                        break;
                    }

                    if (isInfo)
                        onLoaded.info += resArray[i];
                    if (isLyric)
                        this.lyrics += resArray[i];
                }

                onLoaded.info = title + LineFeedCode + LineFeedCode +
                    onLoaded.info
                    .replace(LineBreakRE, LineFeedCode)
                    .replace(IgnoreRE, '')
                    .replaceEach('&quot;', '"', '&amp;', '&', 'ig')
                    .trim() + LineFeedCode + LineFeedCode;
                this.lyrics = this.lyrics
                    .replace(LineBreakRE, LineFeedCode)
                    .replace(IgnoreRE, '')
                    .replaceEach('&quot;', '"', '&amp;', '&', 'ig')
                    .trim();
            }
            else { // search
                for (i = 0; i < resArray.length; i++)
                    if (IdSearchRE.test(resArray[i])) {
                        debug_html && fb.trace('id: ' + RegExp.$1);
                        this.id = RegExp.$1;
                        break;
                    }
            }
        }

    }

};
