pl = {
    name: 'dplugin_Vovovov26',
    label: prop.Panel.Lang == 'ja' ? '歌詞検索: 個人用東方歌詞置き場' : 'Download Lyrics: Touhou Kashi Okiba',
    author: 'tomato111',
    onStartUp: function () { // 最初に一度だけ呼び出される
    },
    onCommand: function (isAutoSearch) { // プラグインのメニューをクリックすると呼び出される

        if (!isAutoSearch && utils.IsKeyPressed(VK_CONTROL)) {
            plugins['splugin_AutoSearch'].setAutoSearchPluginName(this.name);
            return;
        }

        if (!fb.IsPlaying) {
            StatusBar.showText(prop.Panel.Lang == 'ja' ? '再生していません。' : 'Not Playing');
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

        StatusBar.showText((prop.Panel.Lang == 'ja' ? '検索中......' : 'Searching......') + label);
        getHTML(null, 'GET', createQuery(title), ASYNC, 0, onLoaded);

        //------------------------------------

        function createQuery(word, id) {
            if (id)
                return 'http://vovovov26.blog.fc2.com/blog-entry-' + id + '.html';
            else
                return 'http://vovovov26.blog.fc2.com/?q=' + encodeURIComponent(word).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/%20/g, '+');
        }

        function onLoaded(request, depth, file) {
            StatusBar.showText((prop.Panel.Lang == 'ja' ? '検索中......' : 'Searching......') + label);
            debug_html && fb.trace('\nOpen#' + depth + ': ' + file + '\n');

            var res = request.responseText;

            debug_html && fb.trace(res);
            var resArray = res.split('\n');

            var Page = new AnalyzePage(resArray, depth);

            if (Page.id) {
                getHTML(null, 'GET', createQuery(null, Page.id), ASYNC, ++depth, onLoaded);
            }
            else if (Page.lyrics) {
                var text = onLoaded.info + Page.lyrics;

                debug_html && fb.trace('\n' + text + '\n===End debug=============');
                if (isAutoSearch) {
                    plugins['splugin_AutoSearch'].results.push({ name: label, lyric: text });
                }
                else {
                    main(text);
                    StatusBar.showText(prop.Panel.Lang == 'ja' ? '検索終了。歌詞を取得しました。' : 'Search completed.');

                    plugin_auto_save();
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
            var tmp, tmpti;

            var IdSearchRE = /<h3><a href="blog-entry-(\d+?)\.html">(.+?)<\/a><\/h3>/i; // $1:id, $2:title
            var ContentsSearchRE = /<div class="contents_body">(.+)/i; // $1:contents
            var LineFeedCode = prop.Save.LineFeedCode;

            if (depth === 1) { // lyric
                onLoaded.info = title + LineFeedCode + LineFeedCode;
                for (var i = 0; i < resArray.length; i++)
                    if (ContentsSearchRE.test(resArray[i])) {
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
                tmpti = title.toLowerCase();
                for (i = 0; i < resArray.length; i++)
                    if (IdSearchRE.test(resArray[i])) {
                        debug_html && fb.trace('title: ' + RegExp.$2 + ' id: ' + RegExp.$1);
                        if (RegExp.$2.toLowerCase() === tmpti) {
                            this.id = RegExp.$1;
                            break;
                        }
                    }
            }
        }

    }

};
