pl = {
    name: 'splugin_AutoSearch',
    label: prop.Panel.Lang == 'ja' ? '設定: 再生時に検索' : 'Setting: Auto Search',
    author: 'tomato111',
    flag: MF_STRING,
    onStartUp: function () { // 最初に一度だけ呼び出される関数
        window.GetProperty('Plugin.Search.AutoSearch', 'dplugin_Miku_Hatsune_wiki, dplugin_Utamap, dplugin_Utanet');
        var AutoSaveTo = window.GetProperty('Plugin.Search.AutoSaveTo');

        Keybind.LyricShow_keyup[13] = function () {
            var tmp, status;
            var results = plugins['splugin_AutoSearch'].results;
            if (!results || !results.length)
                return;

            main(results[0].lyric);
            status = 'source: ' + results[0].name;
            if (results.length !== 1) {
                status += " (Press 'Enter' to switch)";
                tmp = results.shift();
                results.push(tmp);
            }
            StatusBar.setText(status);
            StatusBar.show();
            if (AutoSaveTo)
                if (/^Tag$/i.test(AutoSaveTo))
                    saveToTag(getFieldName(), status + '\n');
                else if (/^File$/i.test(AutoSaveTo))
                    saveToFile(parse_path + (filetype === 'lrc' ? '.lrc' : '.txt'), status + '\n');
        };

    },
    onPlay: function () { // 新たに曲が再生される度に呼び出される関数
        if (!this.onCommand.AutoSearch || lyric) {
            plugins['splugin_AutoSearch'].results = null;
            return;
        }

        var isAutoSearch = true,
            timeout_millisecond = 8000,
            date_start = new Date(),
            AvailablePluginNames = window.GetProperty('Plugin.Search.AutoSearch').split(/[ 　]*,[ 　]*/),
            results = [];

        plugins['splugin_AutoSearch'].results = results; // 各検索プラグインが結果をオブジェクトで格納する。{ name : plugin_name, lyric : plugin_result }


        for (var i = 0; i < AvailablePluginNames.length; i++) {
            plugins[AvailablePluginNames[i]] && plugins[AvailablePluginNames[i]].onCommand(isAutoSearch);
        }

        (function () { // 1秒ごとに進捗チェック
            var diff = new Date() - date_start;
            if (results.length === AvailablePluginNames.length || diff >= timeout_millisecond) {
                StatusBar.hide();
                arguments.callee.clearInterval();
                trim_res();
                Keybind.LyricShow_keyup[13]();
            }
        }).interval(1000);


        function trim_res() {
            var res = [];
            for (var i = 0; i < results.length; i++) {
                if (results[i].lyric)
                    res.push(results[i]);
            }
            results.length = 0;
            results.push.apply(results, res);
        }

    },
    onCommand: function () { // プラグインのメニューをクリックすると呼び出される関数
        arguments.callee.AutoSearch = !Boolean(arguments.callee.AutoSearch)
        StatusBar.setText(arguments.callee.AutoSearch ? 'AutoSearch: ON' : 'AutoSearch: OFF');
        StatusBar.show();
        this.flag = arguments.callee.AutoSearch ? MF_CHECKED : MF_UNCHECKED;
        Menu.build();
    }
};
