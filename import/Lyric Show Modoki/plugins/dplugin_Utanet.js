pl = {
    name: "dplugin_Utanet",
    label: prop.Panel.Lang == 'ja' ? '歌詞検索: 歌ネット' : 'Download Lyrics: Uta-net',
    author: 'tomato111',
    onStartUp: function () { // 最初に一度だけ呼び出される関数
        var temp = window.GetProperty("Plugin.Search.AutoSaveTo", ""); // 空欄 or Tag or File
        if (!/^(?:File|Tag)$/i.test(temp))
            window.SetProperty("Plugin.Search.AutoSaveTo", "");
    },
    onPlay: function () { }, // 新たに曲が再生される度に呼び出される関数
    onCommand: function () { // プラグインのメニューをクリックすると呼び出される関数

        if (!fb.IsPlaying) {
            StatusBar.setText(prop.Panel.Lang == 'ja' ? '再生していません。' : 'Not Playing');
            StatusBar.show();
            return;
        }

        //###### Properties ########
        var ShowInputDialog = true; //タイトル名、アーティスト名の入力ダイアログを表示するならtrue
        //##########################

        var debug_html = false; // for debug
        var async = true;
        var depth = 0;
        var LineFeedCode = prop.Save.LineFeedCode;
        var AutoSaveTo = window.GetProperty("Plugin.Search.AutoSaveTo");

        // title, artist for search
        var title = fb.TitleFormat("%title%").Eval();
        var artist = fb.TitleFormat("%artist%").Eval();

        if (ShowInputDialog) {
            title = prompt("Please input TITLE", "Uta-net", title);
            if (!title) return;
            artist = prompt("Please input ARTIST", "Uta-net", artist);
            if (!artist) return;
        }

        StatusBar.setText("検索中......Uta-net");
        StatusBar.show();
        getHTML(null, "GET", createQuery(title), async, depth, onLoaded, notFound);

        //------------------------------------

        function createQuery(word, id) {
            if (id)
                return "http://www.uta-net.com/user/phplib/svg/showkasi.php?ID=" + id + "&WIDTH=560&HEIGHT=1092&FONTSIZE=15&t=1437802371";
            else
                return "http://www.uta-net.com/search/?Keyword=" + EscapeSJIS(word).replace(/%20/g, '+') + "&x=" + Math.floor((Math.random() * 45 + 1)) + "&y=" + Math.floor((Math.random() * 23 + 1)) + "&Aselect=2&Bselect=4";
        }

        function notFound(request) { // Uta-netは検索結果が0だと404を返す
            StatusBar.hide();
            var intButton = ws.Popup("ページが見つかりませんでした。\nブラウザで開きますか？", 0, "確認", 36);
            if (intButton == 6)
                FuncCommand('"' + getHTML.PRESENT.file + '"', "", "", "open", 1);
        }

        function onLoaded(request, depth) {
            StatusBar.setText("検索中......Uta-net");
            StatusBar.show();
            debug_html && fb.trace("\nOpen#" + getHTML.PRESENT.depth + ": " + getHTML.PRESENT.file + "\n");

            if (depth === 0) {
                var res = request.responseBody;
                res = responseBodyToCharset(res, "Shift_JIS"); // fix character corruption
            }
            else {
                res = request.responseBody;
                res = responseBodyToCharset(res, "UTF-8"); // fix character corruption
            }

            debug_html && fb.trace(res);
            var resArray = res.split('\n');
            var Page = new AnalyzePage(resArray, depth);

            if (Page.id) {
                getHTML(null, "GET", createQuery(false, Page.id), async, ++depth, onLoaded);
            }
            else if (Page.lyrics) {
                var text = onLoaded.info + Page.lyrics;

                debug_html && fb.trace("\n" + text + "\n===End debug=============");
                main(text);
                StatusBar.setText("検索終了。歌詞を取得しました。");
                StatusBar.show();
                if (AutoSaveTo)
                    if (/^Tag$/i.test(AutoSaveTo))
                        saveToTag(getFieldName());
                    else if (/^File$/i.test(AutoSaveTo))
                        saveToFile(parse_path + (filetype === "lrc" ? ".lrc" : ".txt"));
            }
            else {
                StatusBar.hide();
                var intButton = ws.Popup("ページが見つかりませんでした。\nブラウザで開きますか？", 0, "確認", 36);
                if (intButton == 6)
                    FuncCommand('"' + getHTML.PRESENT.file + '"', "", "", "open", 1);
            }

        }

        function AnalyzePage(resArray, depth) {
            var id, url, tmpti, tmpar, res;

            var searchRe = new RegExp('<tr><td class="side td1"><a href="/song/(\\d+)/">(.+?)</a>(?:<a.+?</a>)?</td>' // $1:id, $2曲名
                + '<td class="td2"><a href=".*?">(.*?)</a></td>' // $3歌手名
                + '<td class="td3">(.*?)</td>' // $4作詞者
                + '<td class="td4">(.*?)</td>', "i"); // $5作曲者

            this.id = null;
            this.lyrics = null;

            if (depth === 1) { // lyric
                res = resArray[0].replace(/^.+?font-size="\d+">/i, "");
                res = res.replace(/<rect.+svg>$/i, "");
                res = res.replace(/<text.+?>/gi, "");
                res = res.replace(/<\/text>/gi, LineFeedCode);
                this.lyrics = res.trim();
            }
            else { // search
                tmpti = title;
                tmpar = artist;
                title = title.replace(/&/g, "&amp;");
                artist = artist.replace(/&/g, "&amp;");
                for (i = 0; i < resArray.length; i++)
                    if (searchRe.test(resArray[i]))
                        if (RegExp.$2 == title && RegExp.$3 == artist) {
                            debug_html && fb.trace("id: " + RegExp.$1 + ", title: " + RegExp.$2 + ", artist: " + RegExp.$3);
                            this.id = RegExp.$1;

                            onLoaded.info = tmpti + LineFeedCode + LineFeedCode
                                + "作詞  " + RegExp.$4 + LineFeedCode
                                + "作曲  " + RegExp.$5 + LineFeedCode
                                + "唄  " + tmpar + LineFeedCode + LineFeedCode;

                        }
            }
            title = tmpti;
            artist = tmpar;
        }

    }

};
