pl = {
    name: 'dplugin_Miku_Hatsune_wiki',
    label: prop.Panel.Lang == 'ja' ? '歌詞検索: 初音ミクWiki' : 'Download Lyrics: Miku Hatsune wiki',
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

        function createQuery(word) {
            return 'http://www5.atwiki.jp/hmiku/?cmd=search&keyword=' + encodeURIComponent(word).replaceEach("'", '%27', '\\(', '%28', '\\)', '%29', '%20', '+', 'g') + '&andor=and&ignore=1';
        }

        function onLoaded(request, depth, file) {
            StatusBar.setText((prop.Panel.Lang == 'ja' ? '検索中......' : 'Searching......') + label);
            StatusBar.show();
            debug_html && fb.trace('\nOpen#' + depth + ': ' + file + '\n');

            var res = request.responseText;

            debug_html && fb.trace(res);
            var resArray = res.split('\n');
            var Page = new AnalyzePage(resArray, depth);

            if (Page.id)
                getHTML(null, 'GET', Page.id, async, true, onLoaded);
            else if (depth === 0) {
                getHTML(null, 'GET', createQuery(title + ' ' + artist), async, ++depth, onLoaded);
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
            var tmpti, tmpar, backref, id, aimai, isLyric;

            var IdSearchRE = /<a href="(.*?)" +?title="(.+?)" style=".+?">/; // $1:id, $2:title
            var ContentsSearchRE = /id_[a-z0-9]{8}|^作詞：|^作曲：|^編曲：|^唄：/;
            var LineBreakRE = /<br ?\/>|<\/div>/ig;
            var Ignore1RE = /<a href.+?>|<\/a>|<span.+?>|<\/span>/ig;
            var Ignore2RE = /<.+?>|\t/ig;

            if (depth === true) { // lyric
                onLoaded.info = '';
                this.lyrics = '';
                for (var i = 0; i < resArray.length; i++) {
                    if (ContentsSearchRE.test(resArray[i])) {
                        debug_html && fb.trace(i + 1 + ': ' + RegExp.lastMatch);
                        if (RegExp.lastMatch === 'id_0a172479') {
                            isLyric = true; continue;
                        }
                        else if (RegExp.lastMatch.indexOf('id_') === -1) {
                            onLoaded.info += resArray[i].replace('：', '  ') + LineFeedCode; continue;
                        }
                        else if (isLyric || RegExp.lastMatch === 'id_738ae0ba') // Lyric_End or is_CD_Page
                            break;
                    }

                    if (isLyric)
                        this.lyrics += resArray[i];
                }

                onLoaded.info = title + LineFeedCode + LineFeedCode
                    + onLoaded.info.replace(Ignore1RE, '').replace(/&amp;/g, '&')
                    + LineFeedCode;
                this.lyrics = this.lyrics
                    .replace(LineBreakRE, LineFeedCode)
                    .replace(Ignore2RE, '')
                    .replace(/&amp;/g, '&')
                    .trim();
            }

            else { // search
                tmpti = title.toLowerCase();
                tmpar = artist.toLowerCase();
                for (i = 0; i < resArray.length; i++) {
                    if (backref = resArray[i].match(IdSearchRE)) {
                        backref[1] = backref[1].replace(/&amp;/g, '&');
                        backref[2] = backref[2].decNumRefToString().toLowerCase();
                        debug_html && fb.trace('title: ' + backref[2] + ' id: ' + backref[1]);
                        if (backref[2] === tmpti)
                            id = backref[1];
                        if (backref[2].indexOf(tmpti + '/') === 0 && backref[2].indexOf(tmpti + '/過去ログ') === -1 && backref[2].indexOf(tmpti + '/cd') === -1)
                            aimai = true;
                        if (backref[2] === tmpti + '/' + tmpar) {
                            aimai = false;
                            id = backref[1];
                            break;
                        }
                    }
                }

                debug_html && fb.trace('aimai: ' + aimai);
                if (id && !aimai)
                    this.id = id;
            }
        }

    }

};
