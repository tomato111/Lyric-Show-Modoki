pl = {
    name: 'splugin_AutoSearch',
    label: prop.Panel.Lang == 'ja' ? '設定: 再生時に検索' : 'Setting: Auto Search',
    author: 'tomato111',
    onStartUp: function () { // 最初に一度だけ呼び出される
        var temp = window.GetProperty('Plugin.Search.AutoSaveTo', '');
        if (!/^(?:File|Tag)$/i.test(temp))
            window.SetProperty('Plugin.Search.AutoSaveTo', '');

        var _this = this;
        var timeout_millisecond = 8000;

        this.AvailablePluginNames = window.GetProperty('Plugin.Search.AutoSearch', 'dplugin_Miku_Hatsune_wiki, dplugin_Utamap, dplugin_Utanet, dplugin_Kashiget, dplugin_Kasitime, dplugin_AZLyrics, dplugin_Kashinavi, dplugin_Tube365, dplugin_ViewLyrics').split(/[ 　]*,[ 　]*/);
        for (var i = 0; i < this.AvailablePluginNames.length;) {
            if (plugins[this.AvailablePluginNames[i]]) i++;
            else this.AvailablePluginNames.splice(i, 1);
        }
        this.i = 0;
        this.results = []; // 各検索プラグインが結果をオブジェクトで格納する。{ name : plugin_name, lyric : plugin_result }  // プラグインが処理を中止した場合にも plugin_result = null で格納すべき（処理が終わったことを明示しないとtimeout_millisecondの待機時間が生じる）
        this.timer = function () { // 進捗チェック
            //debug var a = ''; for (var i = 0; i < _this.results.length; i++) { a += _this.results[i].name + ", "; } console(a + ' (' + _this.results.length + '/' + _this.AvailablePluginNames.length + ')');
            var diff = new Date() - _this.date_start;
            if (_this.results.length === _this.AvailablePluginNames.length || diff >= timeout_millisecond) {
                StatusBar.hide();
                _this.timer.clearInterval();
                for (var i = 0; i < _this.results.length;) {
                    if (_this.results[i].lyric) i++;
                    else _this.results.splice(i, 1);
                }
                _this.showResults();
            }
        };

        this.showResults = function () {
            var status;
            var results = _this.results;
            var VL = plugins['dplugin_ViewLyrics'];
            if (!results.length && VL.results.length) {
                VL.showResults();
                return;
            }
            var AutoSaveTo = window.GetProperty('Plugin.Search.AutoSaveTo');

            main(results[0].lyric);
            status = 'src: ' + results[0].name;
            if (results.length !== 1) {
                status += ' (' + ++_this.i + '/' + results.length + ')' + " (Press 'Enter' to switch)";
                results.push(results.shift());
                if (_this.i === results.length) _this.i = 0;
            }
            if (VL.results.length) {
                status += "\n (Press ']' to switch to ViewLyrics)";
            }
            StatusBar.showText(status);

            if (/^Tag$/i.test(AutoSaveTo))
                saveToTag(getFieldName(), status + '\n');
            else if (/^File$/i.test(AutoSaveTo))
                saveToFile(parse_path + (filetype === 'lrc' ? '.lrc' : '.txt'), status + '\n');
        };

        this.setAutoSearchPluginName = function (pname) {
            var del;
            var PluginNames = window.GetProperty('Plugin.Search.AutoSearch').split(/[ 　]*,[ 　]*/);
            if (PluginNames.length === 1 && PluginNames[0] === '')
                PluginNames.length = 0;

            for (var i = 0; i < PluginNames.length;) {
                if (PluginNames[i] === pname) {
                    PluginNames.splice(i, 1);
                    StatusBar.showText('OFF : ' + pname);
                    del = true;
                }
                else
                    i++;
            }
            if (!del) {
                PluginNames.push(pname);
                StatusBar.showText('ON : ' + pname);
            }

            window.SetProperty('Plugin.Search.AutoSearch', PluginNames.join(', '));
            this.onStartUp();
            if (this.onCommand.AutoSearch) {
                plugins[pname].menuitem.Flag = del ? MF_UNCHECKED : MF_CHECKED;
                Menu.build();
            }
        };

        Keybind.LyricShow_keyup[221] = function () {

            var VL = plugins['dplugin_ViewLyrics'];
            var f = Keybind.LyricShow_keyup[13];
            if (f === _this.showResults && VL.results.length) {
                f = VL.showResults;
                f();
            }
            else if (f === VL.showResults && _this.results.length) {
                f = _this.showResults;
                f();
            }

            Keybind.LyricShow_keyup[13] = f;
        };

    },
    onPlay: function () { // 新たに曲が再生された時に呼び出される
        this.timer.clearInterval();
        this.i = 0;
        this.results.length = 0;
        if (!this.onCommand.AutoSearch || !this.AvailablePluginNames.length || !main.IsVisible || lyric) {
            return;
        }

        this.date_start = new Date();

        for (var i = 0; i < this.AvailablePluginNames.length; i++) {
            plugins[this.AvailablePluginNames[i]].onCommand(true);
        }

        this.timer.interval(1000);
        Keybind.LyricShow_keyup[13] = this.showResults;

    },
    onCommand: function () { // プラグインのメニューをクリックすると呼び出される
        var thisFunc = this.onCommand;
        thisFunc.AutoSearch = !thisFunc.AutoSearch;
        StatusBar.showText(thisFunc.AutoSearch ? 'AutoSearch: ON' : 'AutoSearch: OFF');
        var flag = thisFunc.AutoSearch ? MF_CHECKED : MF_UNCHECKED;
        this.menuitem.Flag = flag;
        for (var i = 0; i < this.AvailablePluginNames.length; i++) {
            plugins[this.AvailablePluginNames[i]].menuitem.Flag = flag;
        }
        Menu.build();
        thisFunc.AutoSearch && fb.IsPlaying && this.onPlay();
    }
};
