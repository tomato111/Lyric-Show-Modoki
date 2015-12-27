pl = {
    name: 'splugin_AutoSearch',
    label: prop.Panel.Lang == 'ja' ? '設定: 再生時に検索' : 'Setting: Auto Search',
    author: 'tomato111',
    flag: MF_STRING,
    onStartUp: function () { // 最初に一度だけ呼び出される関数
        var _this = this;
        var timeout_millisecond = 8000;

        this.AvailablePluginNames = window.GetProperty('Plugin.Search.AutoSearch', 'dplugin_Miku_Hatsune_wiki, dplugin_Utamap, dplugin_Utanet').split(/[ 　]*,[ 　]*/);
        this.results = []; // 各検索プラグインが結果をオブジェクトで格納する。{ name : plugin_name, lyric : plugin_result }  // プラグインが処理を中止した場合にも plugin_result = null で格納すべき（処理が終わったことを明示しないとtimeout_millisecondの待機時間が生じる）
        this.timer = function () { // 進捗チェック
            var diff = new Date() - _this.date_start;
            if (_this.results.length === _this.AvailablePluginNames.length || diff >= timeout_millisecond) {
                StatusBar.hide();
                arguments.callee.clearInterval();
                trim_res();
                Keybind.LyricShow_keyup[13]();
            }
        };

        Keybind.LyricShow_keyup[13] = function () {
            var tmp, status;
            var results = _this.results;
            if (!results.length)
                return;
            var AutoSaveTo = window.GetProperty('Plugin.Search.AutoSaveTo');

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

        function trim_res() {
            var res = [];
            var results = _this.results;
            for (var i = 0; i < results.length; i++) {
                if (results[i].lyric)
                    res.push(results[i]);
            }
            results.length = 0;
            results.push.apply(results, res);
        }

    },
    onPlay: function () { // 新たに曲が再生される度に呼び出される関数
        this.timer.clearInterval();
        this.results.length = 0;
        if (!this.onCommand.AutoSearch || lyric) {
            return;
        }

        this.date_start = new Date();

        for (var i = 0; i < this.AvailablePluginNames.length; i++) {
            plugins[this.AvailablePluginNames[i]] && plugins[this.AvailablePluginNames[i]].onCommand(true);
        }

        this.timer.interval(1000);

    },
    onCommand: function () { // プラグインのメニューをクリックすると呼び出される関数
        arguments.callee.AutoSearch = !arguments.callee.AutoSearch;
        StatusBar.setText(arguments.callee.AutoSearch ? 'AutoSearch: ON' : 'AutoSearch: OFF');
        StatusBar.show();
        this.flag = arguments.callee.AutoSearch ? MF_CHECKED : MF_UNCHECKED;
        Menu.build();
        arguments.callee.AutoSearch && fb.IsPlaying && this.onPlay();
    }
};
