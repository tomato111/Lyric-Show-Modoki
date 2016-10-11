pl = {
    name: 'lplugin_ESLyric',
    label: 'ESLyric: 检索',
    author: 'Elia',
    onStartUp: function() {
        var ESLyric; 

        // ESLyric component is installed and can create COM object.
        try {
            ESLyric = new ActiveXObject("ESLyric");
        } catch (e) {
            return;
        }
        //
        ESLyric.SetLyricCallback(onLyricGet);
        fb.IsPlaying && fb.RunMainMenuCommand('View/ESLyric/Reload lyric'); // trigger onLyricGet
        fb.IsPlaying && fb.RunMainMenuCommand('视图/ESLyric/重载歌词');

        function onLyricGet(obj) {

            main(obj.lyricText);

        }

    },

    onCommand: function() {
        if (!utils.checkComponent("foo_uie_eslyric"))
            return;
        fb.IsPlaying && fb.RunMainMenuCommand('View/ESLyric/Search...');
        fb.IsPlaying && fb.RunMainMenuCommand('视图/ESLyric/搜索歌词...');
    }
}
