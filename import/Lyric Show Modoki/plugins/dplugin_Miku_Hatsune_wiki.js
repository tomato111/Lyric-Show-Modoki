dplugin_Miku_Hatsune_wiki = {
    name: "dplugin_Miku_Hatsune_wiki",
    label: prop.Panel.Lang == 'ja' ? '歌詞検索: 初音ミクWiki' : 'Download Lyrics: Miku Hatsune wiki',
    author: 'tomato111',
    onCommand: function () {

        ws = new ActiveXObject("WScript.Shell");
        if (!fb.IsPlaying) {
            ws.popup("Not Playing.");
            return;
        }

        //###### Properties ########
        var ShowInputDialog = true; //タイトル名、アーティスト名の入力ダイアログを表示するならtrue
        var AutoSave = false; //歌詞が見つかったと同時にファイルに保存するならtrue
        //##########################

        var debug_html = false; // for debug
        var sa = new ActiveXObject("Shell.Application");
        var async = true;
        var first = -1;
        var second = -2;
        var found = true;
        var LineFeedCode = prop.Save.LineFeedCode;

        // title, artist for search
        var title = fb.TitleFormat("%title%").Eval();
        var artist = fb.TitleFormat("%artist%").Eval();

        if (ShowInputDialog) {
            title = prompt("Please input TITLE", "Lyrics Downloader", title);
            if (!title) return;
            artist = prompt("Please input ARTIST", "Lyrics Downloader", artist);
            if (!artist) return;
        }

        StatusBar.setText("検索中......");
        StatusBar.show();
        getHTML(null, "GET", createQuery(title), async, first, onLoaded);

        function createQuery(word) {
            return "http://www5.atwiki.jp/hmiku/?cmd=search&keyword=" + encodeURIComponent(word) + "&andor=and&ignore=1";
        }

        function onLoaded(request, depth) {
            StatusBar.setText("検索中......");
            StatusBar.show();
            debug_html && fb.trace("\nOpen#" + getHTML.PRESENT.depth + ": " + getHTML.PRESENT.file + "\n");
            var res = request.responseText;
            var resArray = res.split('\n');
            var Page = new AnalyzePage(resArray, depth);

            if (Page.FoundPage)
                getHTML(null, "GET", Page.FoundPage, async, found, onLoaded);
            else if (depth == first) {
                getHTML(null, "GET", createQuery(title + " " + artist), async, second, onLoaded);
            }

            if (Page.errorMes)
                Page.errorMes();
            if (Page.FoundLyrics) {
                var text = (Page.Info + LineFeedCode + Page.Lyrics).replace(/\s{1,}$/, LineFeedCode);

                debug_html && fb.trace("\n" + text + "\n===End debug=============");
                main(text);
                StatusBar.setText("検索終了。歌詞を取得しました。");
                StatusBar.show();
                if (AutoSave)
                    saveToFile(parse_path + (filetype === "lrc" ? ".lrc" : ".txt"));
            }
        }

        function AnalyzePage(resArray, found) {
            var re = new RegExp(found !== true ? '<a href="(.*?)" +?title="(' + title.replaceEach("\\*", "\\*", "\\?", "\\?", "g") + '.*?)"(?: style=".+?")?>' : 'id_[a-z0-9]{8}|^作詞|^作曲|^編曲|^唄');
            var lyricsFlag = false, id = null, intButton = null, foundPage = null;
            var aimai = false, mat = false, isCD = false;
            if (found !== true) {
                for (var i = 0; i < resArray.length; i++)
                    if (re.test(resArray[i])) {
                        debug_html && fb.trace("TITLE: " + RegExp.$2 + " URL: " + RegExp.$1);
                        if (RegExp.$2 == title)
                            foundPage = RegExp.$1.replace(/amp;/g, "");
                        if (RegExp.$2.indexOf(title + "/") == 0 && RegExp.$2.indexOf(title + "/過去ログ") != 0 && RegExp.$2.indexOf(title + "/CD") != 0)
                            !aimai && (aimai = true) && debug_html && fb.trace("aimai turn true");
                        if (RegExp.$2 == title + "/" + artist) {
                            foundPage = RegExp.$1.replace(/amp;/g, "");
                            mat = true;
                            debug_html && fb.trace("match and break");
                            break;
                        }
                    }

                if (foundPage && !aimai || foundPage && mat)
                    this.FoundPage = foundPage;
                else if (found == -2) {
                    this.errorMes = function () {
                        StatusBar.hide();
                        var mes = aimai ? "ページが取得出来ませんでした。\nアーティスト名が間違っていないか確認してください。" : "ページが見つかりませんでした。";
                        var intButton = ws.Popup(mes + "\n\ブラウザで開きますか？", 0, "確認", 36);
                        if (intButton == 6)
                            sa.ShellExecute('"' + getHTML.PRESENT.file + '"', "", "", "open", 1);
                    }
                }
            }

            else {
                this.Info = title + LineFeedCode + LineFeedCode;
                this.Lyrics = "";
                for (i = 0; i < resArray.length; i++) {
                    id = resArray[i].match(re);
                    debug_html && id && fb.trace(i + 1 + "行目: " + id);
                    if (id) {
                        if (id == "id_0a172479") {
                            lyricsFlag = true;
                            continue;
                        }
                        else if (id.toString().indexOf("id_") != 0)
                            this.Info += resArray[i].replace(/<a href.+?>|<\/a>|<\/a>.*?<\/a>|<span.+?>|<\/span>/g, "") + LineFeedCode;
                        else if (lyricsFlag)
                            break;
                        else if (id == "id_738ae0ba") {
                            isCD = true;
                            break;
                        }
                    }
                    if (lyricsFlag)
                        this.Lyrics += resArray[i].replace(/<br ?\/>|<\/div>/g, LineFeedCode);
                }

                if (!lyricsFlag) {
                    this.errorMes = function () {
                        StatusBar.hide();
                        var intButton = ws.Popup((isCD ? "ページがありません" : "ページ内に歌詞が記載されていません") + "\nブラウザで開きますか？", 0, "確認", 36);
                        if (intButton == 6)
                            sa.ShellExecute('"' + getHTML.PRESENT.file + '"', "", "", "open", 1);
                    }
                }
                else {
                    this.Lyrics = this.Lyrics.replace(/<.+?>|\t/g, "").replace(/&quot;/g, "\"").replace(/&nbsp;/g, " ");
                    this.FoundLyrics = true;
                }
            }

        }


    }

};
