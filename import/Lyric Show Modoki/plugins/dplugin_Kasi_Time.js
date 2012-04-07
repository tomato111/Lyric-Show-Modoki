dplugin_Kasi_Time = {
    name: "dplugin_Kasi_Time",
    commandName: 'Kasi_Time',
    label: prop.Panel.Lang == 'ja' ? '歌詞検索: 歌詞タイム' : 'Download Lyrics: Kasi Time',
    author: 'Tomato',
    onCommand: function () {

        ws = new ActiveXObject("WScript.Shell");
        if (!fb.IsPlaying) {
            ws.popup("Not Playing.");
            return;
        }
        
        //###### Properties ########
        var File = parse_path + ".txt";
        var ShowInputDialog = true;
        //##########################

        var debug_html = false; // for debug
        var sa = new ActiveXObject("Shell.Application");
        var async = true;
        var depth = 0;
        var info = false;
        var txt = true;
        var LineFeedCode = prop.Save.LineFeedCode;
        var MetadbHandle = fb.GetNowPlaying();

        // title, artist for search
        var title = fb.TitleFormat("%title%").Eval();
        var artist = fb.TitleFormat("%artist%").Eval();

        if (ShowInputDialog) {
            title = prompt("Please input TITLE", "Lyrics Downloader", title);
            if (!title) return;
            artist = prompt("Please input ARTIST", "Lyrics Downloader", artist);
            if (!artist) return;
        }

        var searchRe = new RegExp('<table class="fortable" id="cattable">.+<a href="(.+?-(\\d+)\\.html)">' + title + '</a></td><td><a href=".+?\\.html">' + artist + '</a>', "i");
        var infoRe = new RegExp('<tr><td class="td1">(.*?)</td><td>(.*?)</td>', "i");
        var infovalRe = new RegExp('(?:<a href=".+?\\.html">)?([^<]+)(?:</a>)?', "ig");
        var lyricRe = new RegExp("document\\.write\\('(.+)'\\);", "i");
        var arRe = /^歌手  /;

        getHTML(null, "GET", createQuery(title), async, depth, onLoaded);

        function createQuery(word, page, id) {
            return "http://www.kasi-time.com/search.php?keyword=" + encodeURIComponent(word) + "&cat_index=song";
        }

        function onLoaded(request, depth) {
            debug_html && fb.trace("\nOpen#" + getHTML.PRESENT.depth + ": " + getHTML.PRESENT.file + "\n");

            var res = request.responseBody; // binary for without character corruption
            res = responseBodyToCharset(res, "EUC-JP");
            var resArray = res.split('\n');
            var Page = new AnalyzePage(resArray, depth);

            if (Page.searchResult) {
                getHTML(null, "GET", Page.searchResult, !async, info, onLoaded); // get info
                getHTML(null, "GET", Page.id, async, txt, onLoaded); // get lyric
            }
            else if (Page.Lyrics) {
                var text = onLoaded.Info + Page.Lyrics;

                debug_html && fb.trace("\n" + text + "\n===End debug=============");
                var intButton = ws.Popup(text
                                  + "\n\n==============================================\n"
                                  + "                                                                           この歌詞を保存しますか？", 0, "確認", 4);
                if (intButton != 7) {
                    try {
                        writeTextFile(text, File, prop.Save.CharacterCode);
                        Messages[6].popup(File);
                        FuncCommands(prop.Save.RunAfterSave, MetadbHandle);
                        main();
                    } catch (e) {
                        Messages[5].popup();
                    }
                }
                MetadbHandle.Dispose();
            }
            else if (onLoaded.Info) { return; }
            else {
                MetadbHandle.Dispose();
                intButton = ws.Popup("ページが見つかりませんでした。\nブラウザで開きますか？", 0, "確認", 36);
                if (intButton == 6)
                    sa.ShellExecute('"' + getHTML.PRESENT.file + '"', "", "", "open", 1);
            }

        }

        function AnalyzePage(resArray, depth) {
            if (depth === 0) { // search
                for (var i = 0; i < resArray.length; i++)
                    if (searchRe.test(resArray[i])) {
                        this.searchResult = "http://www.kasi-time.com/" + RegExp.$1;
                        this.id = "http://www.kasi-time.com/item_js.php?no=" + RegExp.$2;
                        debug_html && fb.trace(this.searchResult + "::" + this.id);
                        return;
                    }
            }
            else if (depth === false) { // info
                onLoaded.Info = title + LineFeedCode + LineFeedCode;
                var temp, str, ar;
                for (i = 0; i < resArray.length; i++)
                    if (temp = resArray[i].match(infoRe))
                        if (infovalRe.test(temp[2])) {
                            str = temp[1] + "  ";
                            infovalRe.lastIndex = 0;
                            while (infovalRe.exec(temp[2])) {
                                str += RegExp.$1;
                            }
                            if (arRe.test(str))
                                ar = str.replace(arRe, "唄  ") + LineFeedCode;
                            else
                                onLoaded.Info += str + LineFeedCode;
                        }
                onLoaded.Info += ar + LineFeedCode;
            }
            else { // found
                this.Lyrics = "";
                for (i = 0; i < resArray.length; i++)
                    if (lyricRe.test(resArray[i]))
                        this.Lyrics += RegExp.$1.replace(/&nbsp;/g, " ").replace(/<br>/g, LineFeedCode);
            }

        }

    }

};
