pl = {
    name: 'dplugin_Utamap',
    label: prop.Panel.Lang == 'ja' ? '歌詞検索: うたまっぷ' : 'Download Lyrics: Utamap',
    author: 'tomato111',
    flag: MF_STRING,
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

        //###### Properties ########
        var ShowInputDialog = true & !isAutoSearch; //タイトル名、アーティスト名の入力ダイアログを表示するならtrue
        //##########################

        var debug_html = false; // for debug
        var async = true;
        var depth = 0;
        var info = false;
        var txt = true;
        var LineFeedCode = prop.Save.LineFeedCode;
        var AutoSaveTo = window.GetProperty('Plugin.Search.AutoSaveTo');
        var label = this.label.replace(/^.+?: /, '');

        // title, artist for search
        var title = fb.TitleFormat('%title%').Eval();
        var artist = fb.TitleFormat('%artist%').Eval();

        if (ShowInputDialog) {
            title = prompt('Please input TITLE', 'Utamap', title);
            if (!title) return;
            artist = prompt('Please input ARTIST', 'Utamap', artist);
            if (!artist) return;
        }

        StatusBar.setText('検索中......Utamap');
        StatusBar.show();
        getHTML(null, 'GET', createQuery(title), async, depth, onLoaded);

        //------------------------------------

        function createQuery(word, page, id) {
            if (id)
                return 'http://www.utamap.com/phpflash/flashfalsephp.php?unum=' + id;
            else
                return 'http://www.utamap.com/searchkasi.php?searchname=title&word=' + EscapeSJIS(word).replace(/%20/g, '+') + (page ? ('&page=' + page) : '') + '&act=search&sortname=1&pattern=1';
        }

        function onLoaded(request, depth) {
            StatusBar.setText('検索中......Utamap');
            StatusBar.show();
            debug_html && fb.trace('\nOpen#' + getHTML.PRESENT.depth + ': ' + getHTML.PRESENT.file + '\n');
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
                getHTML(null, 'GET', Page.url, !async, info, onLoaded);
                getHTML(null, 'GET', createQuery(false, true, Page.id), async, txt, onLoaded);
            }
            else if (!Page.searchResult) {
                if (Page.Lyrics) {
                    var text = onLoaded.Info + Page.Lyrics;

                    debug_html && fb.trace('\n' + text + '\n===End debug=============');
                    if (isAutoSearch) {
                        plugins['splugin_AutoSearch'].results.push({ name: label, lyric: text });
                    }
                    else {
                        main(text);
                        StatusBar.setText('検索終了。歌詞を取得しました。');
                        StatusBar.show();
                        if (AutoSaveTo)
                            if (/^Tag$/i.test(AutoSaveTo))
                                saveToTag(getFieldName());
                            else if (/^File$/i.test(AutoSaveTo))
                                saveToFile(parse_path + (filetype === 'lrc' ? '.lrc' : '.txt'));
                    }
                }
                else if (onLoaded.Info) { return; }
                else{
                    if (isAutoSearch) {
                        plugins['splugin_AutoSearch'].results.push({ name: label, lyric: null });
                        return;
                    }
                    StatusBar.hide();
                    var intButton = ws.Popup('ページが見つかりませんでした。\nブラウザで開きますか？', 0, '確認', 36);
                    if (intButton == 6)
                        FuncCommand('"' + getHTML.PRESENT.file.replace(/&page=\d+/, '') + '"');
                }
            }
            else {
                getHTML(null, 'GET', createQuery(title, ++depth), async, depth, onLoaded);
            }

        }

        function AnalyzePage(resArray, depth) {
            var id, url, tmpti, tmpar;
            var searchRe = new RegExp('<TD class=(ct\\d{3})>(?:<A href="(.+?=(.+?))">)?(.*?)(?:</A>)?</td>', 'i');
            var infoRe = new RegExp('<td class="pad5x10x0x10">(.*?)</td>', 'i');
            this.searchResult = false;

            if (depth === false) { // info
                onLoaded.Info = title + LineFeedCode + LineFeedCode;
                for (var i = 0, j = 0; i < resArray.length; i++)
                    if (infoRe.test(resArray[i])) {
                        onLoaded.Info += RegExp.$1.replace(/&nbsp;/g, ' ').replace(/<strong>|<\/strong>/gi, '').replace(/&amp;/g, '&') + (j++ % 2 ? LineFeedCode : '  ');
                    }
                onLoaded.Info += LineFeedCode;
            }
            else if (depth === true) { // lyric
                this.Lyrics = '';
                resArray[0] = resArray[0].replace(/^.+?&.+?=/, '');
                for (i = 0; i < resArray.length; i++) {
                    debug_html && fb.trace(i + ': ' + resArray[i]);
                    this.Lyrics += resArray[i] + LineFeedCode;
                }
                this.Lyrics = this.Lyrics.trim();
            }
            else { // search
                tmpti = title.replace(/&/g, '&amp;');
                tmpar = artist.replace(/&/g, '&amp;');
                for (i = 0; i < resArray.length; i++)
                    if (searchRe.test(resArray[i])) {
                        debug_html && fb.trace('class: ' + RegExp.$1 + ', id: ' + RegExp.$3 + ', value: ' + RegExp.$4);
                        if (RegExp.$1 == 'ct160' && RegExp.$4 == tmpti) {
                            id = RegExp.$3;
                            url = 'http://www.utamap.com' + RegExp.$2.slice(1);
                            !this.searchResult && (this.searchResult = true);
                        }
                        else if (id && RegExp.$1 == 'ct120' && RegExp.$4 == tmpar) {
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
