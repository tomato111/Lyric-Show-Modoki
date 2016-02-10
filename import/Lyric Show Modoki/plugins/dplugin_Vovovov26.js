pl = {
    name: 'dplugin_Vovovov26',
    label: prop.Panel.Lang == 'ja' ? '歌詞検索: 個人用東方歌詞置き場' : 'Download Lyrics: Touhou Kashi Okiba',
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

        //###### Properties ########
        var ShowInputDialog = true & !isAutoSearch; //タイトル名、アーティスト名の入力ダイアログを表示するならtrue
        //##########################

        var debug_html = false; // for debug
        var async = true;
        var depth = 0;
        var LineFeedCode = prop.Save.LineFeedCode;
        var AutoSaveTo = window.GetProperty('Plugin.Search.AutoSaveTo');
        var label = this.label.replace(/^.+?: /, '');

        // title, artist for search
        var title = fb.TitleFormat('%title%').Eval();
        var artist = fb.TitleFormat('%artist%').Eval();

        if (ShowInputDialog) {
            title = prompt('Please input TITLE', label, title);
            if (!title) return;
            artist = prompt('Please input ARTIST', label, artist);
            if (!artist) return;
        }

        StatusBar.setText('検索中......' + label);
        StatusBar.show();
        getHTML(null, 'GET', createQuery(title), async, depth, onLoaded);

        //------------------------------------

        function createQuery(word, id) {
            if (id)
                return 'http://vovovov26.blog.fc2.com/blog-entry-' + id + '.html';
            else
                return 'http://vovovov26.blog.fc2.com/?q=' + encodeURIComponent(word).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/%20/g, '+');
        }

        function onLoaded(request, depth) {
            StatusBar.setText('検索中......' + label);
            StatusBar.show();
            debug_html && fb.trace('\nOpen#' + getHTML.PRESENT.depth + ': ' + getHTML.PRESENT.file + '\n');

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
                    StatusBar.setText('検索終了。歌詞を取得しました。');
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
                var intButton = ws.Popup('ページが見つかりませんでした。\nブラウザで開きますか？', 0, '確認', 36);
                if (intButton == 6)
                    FuncCommand('"' + getHTML.PRESENT.file + '"');
            }

        }

        function AnalyzePage(resArray, depth) {
            var tmp;

            var IdSearchRe = new RegExp('<h3><a href="blog-entry-(\\d+?)\\.html">' + title + '</a></h3>', 'i'); //$1: id
            var ContentsSearchRe = /<div class="contents_body">(.+)/i; //$1: contents

            this.id = null;
            this.lyrics = null;

            if (depth === 1) { // lyric
                onLoaded.info = title + LineFeedCode + LineFeedCode;
                for (var i = 0; i < resArray.length; i++)
                    if (ContentsSearchRe.test(resArray[i])) {
                        tmp = RegExp.$1.split('<br /><br /><br /><br />' + title + '<br />');
                        if (tmp.length === 2)
                            onLoaded.info += tmp[1]
                                .replace(/<div class="fc2_footer".+/i, '')
                                .replace(/<br \/>/g, LineFeedCode)
                                .trim() + LineFeedCode + LineFeedCode;

                        this.lyrics = tmp[0]
                            .replace(/<br \/>/g, LineFeedCode)
                            .trim();
                        return;
                    }
            }
            else { // search
                for (i = 0; i < resArray.length; i++)
                    if (IdSearchRe.test(resArray[i])) {
                        debug_html && fb.trace('id: ' + RegExp.$1);
                        this.id = RegExp.$1;
                        return;
                    }
            }
        }

    }

};
