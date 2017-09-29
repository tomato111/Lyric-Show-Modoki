pl = {
    name: 'uplugin_Lyric_Show_Modoki',
    label: prop.Panel.Lang === 'ja' ? '更新チェック: Lyric Show Modoki' : 'Check Update: Lyric Show Modoki',
    author: 'tomato111',
    onStartUp: function () { // 最初に一度だけ呼び出される
        window.GetProperty('Plugin.CheckUpdateOnStartUp', false) && this.onCommand(true);
    },
    onCommand: function (isStartUp) { // プラグインのメニューをクリックすると呼び出される

        var debug_html = false; // for debug
        var onCommand = arguments.callee;

        !isStartUp && StatusBar.showText(prop.Panel.Lang === 'ja' ? '更新チェック中......' : 'checking update......');
        getHTML(null, 'GET', 'http://ashiato1.blog62.fc2.com/blog-entry-64.html', ASYNC, 0, onLoaded);

        //------------------------------------

        function onLoaded(request, depth, file) {
            !isStartUp && StatusBar.showText(prop.Panel.Lang === 'ja' ? '更新チェック中......' : 'checking update......');
            debug_html && fb.trace('\nOpen#' + ': ' + file + '\n');

            var res = request.responseText;

            debug_html && fb.trace(res);
            var resArray = res.split('\n');
            var Version = new AnalyzePage(resArray);

            Version.result();
        }

        function AnalyzePage(resArray) {

            this.result;

            var searchRE = /id="latestver".+?href="(https:\/\/github\.com\/tomato111.+?Lyric-Show-Modoki-(\d{1,2})\.(\d{1,2})\.(\d{1,2})\.zip)/;
            var n = 0;
            var latestFilePath;
            var currentVersion;
            var latestVersion;
            var diff;

            for (i = 0; i < resArray.length; i++) {
                if (searchRE.test(resArray[i])) {

                    latestFilePath = RegExp.$1;
                    currentVersion = scriptVersion.split('.');
                    latestVersion = [RegExp.$2, RegExp.$3, RegExp.$4];

                    debug_html && fb.trace('latest ver: ' + latestVersion.join('.') + '\ncurrent ver: ' + scriptVersion);

                    do {
                        diff = latestVersion[n] - currentVersion[n];
                    } while (diff === 0 && n++ < 2);


                    if (diff > 0) // there is a new version.
                        this.result = function () {
                            if (isStartUp) {
                                Menu.insertItems(
                                    'LyricShow',
                                    -3,
                                    [
                                        {
                                            Flag: MF_STRING,
                                            Caption: prop.Panel.Lang === 'ja' ? '## 新しいバージョンが利用可能です ##' : '## New version is available ##',
                                            Func: onCommand
                                        }
                                    ]
                                );
                                Menu.build();
                            }
                            else {
                                getHTML(null, 'GET', 'https://raw.githubusercontent.com/tomato111/Lyric-Show-Modoki/master/README.md', !ASYNC, 0,
                                    function (request) {
                                        var res = request.responseText;
                                        var historyRE = new RegExp('(--v[\\S\\s]+)--v' + scriptVersion);
                                        var asteriskRE = /\* /g;
                                        var hyphenRE = /-{3,}/g;
                                        var spaceRE = / {2}$/mg;
                                        if (historyRE.test(res))
                                            fb.ShowPopupMessage(RegExp.$1.replace(asteriskRE, '- ').replace(hyphenRE, '--------------------------------').replace(spaceRE, '').trim(), 'Lyric Show Modoki');
                                    });
                                StatusBar.hide();
                                var intButton = ws.Popup(prop.Panel.Lang === 'ja'
                                    ? '新しいバージョンがあります。\n現在: v' + scriptVersion + '  最新: v' + latestVersion.join('.') + '\n\nダウンロードしますか？（デスクトップに保存）'
                                    : 'There is a new version.\nCurrent: v' + scriptVersion + '  Latest: v' + latestVersion.join('.') + '\n\nDownload it? (Save to desktop)', 0, 'Lyric Show Modoki', 36);
                                if (intButton === 6) {
                                    StatusBar.showText(prop.Panel.Lang === 'ja' ? 'ダウンロード中......' : 'Downloading......');
                                    getHTML(null, 'GET', latestFilePath, ASYNC, 0,
                                        function (request, depth, file) {
                                            if (request.status === 200) {
                                                var res = request.responseBody;
                                                responseBodyToFile(res, ws.SpecialFolders.item('Desktop') + '\\' + file.match(/^.+\/(.+)$/)[1]);
                                                StatusBar.showText(prop.Panel.Lang === 'ja' ? 'デスクトップにダウンロードしました。' : 'Downloaded to desktop.');
                                            }
                                            else {
                                                fb.ShowPopupMessage('download error: ' + request.status, 'Lyric Show Modoki');
                                            }
                                        });
                                }
                            }
                        };
                    else // up-to-date.
                        this.result = function () {
                            !isStartUp && StatusBar.showText(prop.Panel.Lang === 'ja' ? '新しいバージョンはありません。 v' + scriptVersion : 'This script is up-to-date.  v' + scriptVersion);
                        };

                    return;
                }
            } // END for

            this.result = function () {
                !isStartUp && StatusBar.showText(prop.Panel.Lang === 'ja' ? 'バージョンチェックに失敗しました。' : 'Faild to check version.');
            };
        }

    }
};
