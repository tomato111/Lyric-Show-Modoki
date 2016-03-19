pl = {
    name: 'dplugin_Utamap',
    label: prop.Panel.Lang == 'ja' ? '歌詞検索: うたまっぷ' : 'Download Lyrics: Utamap',
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

        function createQuery(word, page, id) {
            if (id)
                return 'http://www.utamap.com/phpflash/flashfalsephp.php?unum=' + id;
            else if (page)
                return 'http://www.utamap.com/searchkasi.php?page=' + page + '&searchname=title&sortname=0&pattern=1&word=' + EscapeSJIS(word).replace(/\+/g, '%2B').replace(/%20/g, '+') + '&act=search';
            else
                return 'http://www.utamap.com/searchkasi.php?searchname=title&word=' + EscapeSJIS(word).replace(/\+/g, '%2B').replace(/%20/g, '+') + '&act=search&search_by_keyword=%8C%9F%26%23160%3B%26%23160%3B%26%23160%3B%8D%F5&sortname=0&pattern=1';
        }

        function onLoaded(request, depth, file) {
            StatusBar.setText((prop.Panel.Lang == 'ja' ? '検索中......' : 'Searching......') + label);
            StatusBar.show();
            debug_html && fb.trace('\nOpen#' + depth + ': ' + file + '\n');
            if (depth === true) {
                var res = request.responseBody;
                res = responseBodyToCharset(res, 'UTF-8'); // fix character corruption
            }
            else
                res = request.responseText;

            debug_html && fb.trace(res);
            var resArray = res.split('\n');
            var Page = new AnalyzePage(resArray, depth);

            if (Page.id) {
                getHTML(null, 'GET', Page.url, !async, false, onLoaded);
                getHTML(null, 'GET', createQuery(null, null, Page.id), async, true, onLoaded);
            }
            else if (Page.next) {
                getHTML(null, 'GET', createQuery(title, ++depth), async, depth, onLoaded);
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
            else if (onLoaded.info) { return; }
            else {
                if (isAutoSearch) {
                    plugins['splugin_AutoSearch'].results.push({ name: label, lyric: null });
                    return;
                }
                StatusBar.hide();
                var intButton = ws.Popup(prop.Panel.Lang == 'ja' ? 'ページが見つかりませんでした。\nブラウザで開きますか？' : 'Page not found.\nOpen the URL in browser?', 0, 'Confirm', 36);
                if (intButton === 6)
                    FuncCommand('"' + file.replace(/page=\d+&/, '') + '"');
            }

        }

        function AnalyzePage(resArray, depth) {
            var id, url, tmpti, tmpar, backref;
            var SearchRE = new RegExp('<TD class=(ct\\d{3})>(?:<A href="(.+?=(.+?))">)?(.*?)(?:</A>)?</td>', 'i'); // $1:class, $2:relativeURL, $3:id, $4:innerText
            var InfoRE = new RegExp('<td class="pad5x10x0x10">(.*?)</td>', 'i'); // $1:innerHTML
            var FuzzyRE = /[-.'&＆～・*＊+＋/／!！。,、 　]/g;

            if (depth === false) { // info
                onLoaded.info = title + LineFeedCode + LineFeedCode;
                for (var i = 0, j = 0; i < resArray.length; i++)
                    if (InfoRE.test(resArray[i])) {
                        onLoaded.info += RegExp.$1.replace(/&nbsp;/g, ' ').replace(/<strong>|<\/strong>/gi, '').replace(/&amp;/g, '&') + (j++ % 2 ? LineFeedCode : '  ');
                    }
                onLoaded.info += LineFeedCode;
            }
            else if (depth === true) { // lyric
                this.lyrics = '';
                resArray[0] = resArray[0].replace(/^.+?&.+?=/, '');
                for (i = 0; i < resArray.length; i++) {
                    debug_html && fb.trace(i + ': ' + resArray[i]);
                    this.lyrics += resArray[i] + LineFeedCode;
                }
                this.lyrics = this.lyrics.trim();
            }
            else { // search
                tmpti = title.replace(/&/g, '&amp;').toLowerCase().replace(FuzzyRE, '');
                tmpar = artist.replace(/&/g, '&amp;').toLowerCase().replace(FuzzyRE, '');
                for (i = 0; i < resArray.length; i++)
                    if (backref = resArray[i].match(SearchRE)) {
                        debug_html && fb.trace('class: ' + backref[1] + ', id: ' + backref[3] + ', innerText: ' + backref[4]);
                        if (backref[1] === 'ct160' && backref[4].toLowerCase().replace(FuzzyRE, '') === tmpti) {
                            id = backref[3];
                            url = 'http://www.utamap.com' + backref[2].slice(1);
                            this.next = true;
                        }
                        else if (id && backref[1] === 'ct120' && backref[4].toLowerCase().replace(FuzzyRE, '') === tmpar) {
                            this.id = id;
                            this.url = url;
                            break;
                        }
                        else {
                            id = null;
                        }
                    }
            }
        }

    }

};
