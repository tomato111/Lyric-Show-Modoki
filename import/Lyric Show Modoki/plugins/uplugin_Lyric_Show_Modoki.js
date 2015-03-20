pl = {
    name: "uplugin_Lyric_Show_Modoki",
    label: prop.Panel.Lang == 'ja' ? '更新チェック: Lyric Show Modoki' : 'Check Update: Lyric Show Modoki',
    author: 'tomato111',
    onStartUp: function () { // 最初に一度だけ呼び出される関数
        var cu = window.GetProperty("Plugin.CheckUpdateOnStartUp", false);
        if (cu) {
            this.onCommand(true);
            var f = this.onCommand;
            (function () {
                if (f.result) {
                    Menu.addToMenu_LyricShow(
                        [
                            {
                                Flag: 0x00000000,
                                Caption: prop.Panel.Lang == 'ja' ? "## 新しいバージョンが利用可能です ##" : "## New version is available ##",
                                Func: f
                            }
                        ]
                    );
                    Menu.build(prop.Edit.Start ? Menu.Edit : "");
                }
            }).timeout(1500);
        }
    },
    onPlay: function () { }, // 新たに曲が再生される度に呼び出される関数
    onCommand: function (isStartUp) { // プラグインのメニューをクリックすると呼び出される関数

        var debug_html = false; // for debug
        var ws = new ActiveXObject("WScript.Shell");
        var sa = new ActiveXObject("Shell.Application");
        var async = true;
        var depth = false;
        var onCommand = arguments.callee;

        StatusBar.setText(prop.Panel.Lang == 'ja' ? "更新チェック中......" : "checking update......");
        !isStartUp && StatusBar.show();

        try {
            getHTML(null, "GET", "http://ashiato1.blog62.fc2.com/blog-entry-64.html", async, depth, onLoaded);
        } catch (e) {
            StatusBar.setText(prop.Panel.Lang == 'ja' ? "更新チェックに失敗しました。" : "failed to check update.");
            !isStartUp && StatusBar.show();
        }

        //------------------------------------

        function onLoaded(request) {
            !isStartUp && StatusBar.show();
            debug_html && fb.trace("\nOpen#" + ": " + getHTML.PRESENT.file + "\n");

            var res = request.responseBody; // binary for without character corruption
            res = responseBodyToCharset(res, "UTF-8");

            var resArray = res.split('\n');
            var Version = new AnalyzePage(resArray);

            Version.result();
        }

        function AnalyzePage(resArray) {

            this.LatestFilePath;
            this.LatestVersion;
            this.result;

            var searchRE = /id="latestver".+?href="(https:\/\/github\.com\/tomato111.+?Lyric-Show-Modoki-(\d{1,2})\.(\d{1,2})\.(\d{1,2})\.zip)/;
            var n = 0;
            var currentVersion;
            var latestVersion;
            var diff;

            for (i = 0; i < resArray.length; i++) {
                if (searchRE.test(resArray[i])) {

                    this.LatestFilePath = RegExp.$1;
                    this.LatestVersion = RegExp.$2 + "." + RegExp.$3 + "." + RegExp.$4;

                    debug_html && fb.trace("latest ver: " + this.LatestVersion + "\ncurrent ver: " + scriptVersion);

                    currentVersion = scriptVersion.split(".");
                    latestVersion = [RegExp.$2, RegExp.$3, RegExp.$4];

                    do {
                        diff = latestVersion[n] - currentVersion[n];
                    } while (diff === 0 && n++ < 2)


                    if (diff > 0) // there is a new version.
                        this.result = function () {
                            if (isStartUp) {
                                onCommand.result = true;
                            }
                            else {
                                getHTML(null, "GET", "https://raw.githubusercontent.com/tomato111/Lyric-Show-Modoki/master/README.md", !async, depth,
                                    function (request) {
                                        var res = request.responseBody;
                                        res = responseBodyToCharset(res, "UTF-8");
                                        var historyRE = new RegExp("(--v[\\S\\s]+)--v" + scriptVersion);
                                        var asteriskRE = /\* /g;
                                        var hyphenRE = /-{3,}/g;
                                        var spaceRE = /  $/mg;
                                        if (historyRE.test(res))
                                            fb.ShowPopupMessage(RegExp.$1.replace(asteriskRE, "- ").replace(hyphenRE, "--------------------------------").replace(spaceRE, "").trim(), "Lyric Show Modoki");
                                    });
                                StatusBar.hide();
                                var intButton = ws.Popup(prop.Panel.Lang == 'ja'
                                    ? "新しいバージョンがあります。\n現在: v" + scriptVersion + "  最新: v" + this.LatestVersion + "\n\nダウンロードしますか？（デスクトップに保存）"
                                    : "There is a new version.\nCurrent: v" + scriptVersion + "  Latest: v" + this.LatestVersion + "\n\nDownload it? (Save to desktop)", 0, "Lyric Show Modoki", 36);
                                if (intButton == 6) {
                                    StatusBar.setText(prop.Panel.Lang == 'ja' ? "ダウンロード中......" : "Downloading......");
                                    StatusBar.show();
                                    getHTML(null, "GET", this.LatestFilePath, async, depth,
                                        function (request, depth, file) {
                                            var res = request.responseBody;
                                            responseBodyToFile(res, ws.SpecialFolders.item("Desktop") + "\\" + file.match(/^.+\/(.+)$/)[1]);
                                            StatusBar.setText(prop.Panel.Lang == 'ja' ? "デスクトップにダウンロードしました。" : "Downloaded to desktop.");
                                            StatusBar.show();
                                        });
                                }
                            }
                        };
                    else // up-to-date.
                        this.result = function () {
                            StatusBar.setText(prop.Panel.Lang == 'ja' ? "新しいバージョンはありません。 v" + scriptVersion : "This script is up-to-date.  v" + scriptVersion);
                            !isStartUp && StatusBar.show();
                        };

                    return;
                }
            } // END for

            this.result = function () {
                StatusBar.setText(prop.Panel.Lang == 'ja' ? "バージョンチェックに失敗しました。" : "Faild to check version.");
                !isStartUp && StatusBar.show();
            };
        }

    }
};
