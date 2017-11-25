pl = {
    name: 'dplugin_AniKasiPV',
    label: prop.Panel.Lang === 'ja' ? '歌詞検索: アニ歌詞PV' : 'Download Lyrics: AniKasiPV',
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
                return 'http://animationsong.com/archives/' + id + '.html';
            else {
                var FuzzySearchRE = /[-・×/／！？、]/g;  // 語句の先頭のハイフンは除外検索を意味するので置換する // あまり柔軟に結果を返してくれないのでいくつか空白に置換する
                title = title.replace(FuzzySearchRE, ' ');
                artist = artist.replace(FuzzySearchRE, ' ').replace(/cv[.:： ]/ig, ''); // CV:の表記は削った方が結果が良くなるので削る
                return 'http://animationsong.com/?s=' + encodeURIComponent(title + ' ' + artist).replaceEach("'", '%27', '\\(', '%28', '\\)', '%29', '%20', '+', '!', '%21', 'g');
            }
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
            var tmpti, id, pageTitle, backref;

            var SearchRE = /<a href=".+?animationsong\.com\/archives\/(\d+)\.html" rel="bookmark">(.+?)<\/a>/ig; // $1:id, $2:pageTitle
            var FuzzyRE = /[-.'’&＆%％@＠～・×*＊+＋/／!！?？（）(),，、 　]/g;

            var InfoRE = /<tr><th>歌手<\/th><td>(.+?)<\/td><\/tr><tr><th>制作者<\/th><td>作詞：?(.+?)　?作曲：?(.+?)　?編曲：(.+?)<\/td><\/tr>/i; // $1:歌手, $2:作詞, $3:作曲, $4:編曲
            var StartLyricRE = /<div class="kashitext"><h2>歌詞.*?<\/h2>(.+?)<\/div>/i;
            var IgnoreRE = /<font.+?>|<\/font>/ig;
            var LineBreakRE = /<br ?\/?>|<p>|<\/p>/ig;
            var LineFeedCode = prop.Save.LineFeedCode;

            if (depth === 1) { // lyric
                res = res.replace(/[\t ]*(?:\r\n|\r|\n)[\t ]*/g, '');
                onLoaded.info = title + LineFeedCode + LineFeedCode;

                if (backref = res.match(InfoRE)) {
                    if (backref[3] === '・')
                        backref[3] = backref[4];
                    if (backref[2] === '・')
                        backref[2] = backref[3];

                    onLoaded.info += ('作詞  ' + backref[2] + LineFeedCode
                        + '作曲  ' + backref[3] + LineFeedCode
                        + '編曲  ' + backref[4] + LineFeedCode
                        + '唄  ' + backref[1] + LineFeedCode + LineFeedCode)
                        .replace(/<a.+?>|<\/a>/ig, '')
                        .decodeHTMLEntities();
                }

                if (StartLyricRE.test(res)) {
                    this.lyrics = RegExp.$1
                        .replace(IgnoreRE, '')
                        .replace(LineBreakRE, LineFeedCode)
                        .decodeHTMLEntities()
                        .trim();
                }
            }
            else { // search
                tmpti = title.toLowerCase().replace(FuzzyRE, '');
                while (SearchRE.exec(res) !== null) {
                    id = RegExp.$1;
                    pageTitle = RegExp.$2.decodeHTMLEntities().toLowerCase().replace(FuzzyRE, '');

                    if (pageTitle.indexOf(tmpti) === 0 || pageTitle.indexOf('「' + tmpti) !== -1) { // 曲名が先頭にある場合(新しい記述)と「」で囲まれて末尾にある場合(古い記述)の2つがある
                        this.id = id;
                        return;
                    }
                }
            }
        }

    }

};
