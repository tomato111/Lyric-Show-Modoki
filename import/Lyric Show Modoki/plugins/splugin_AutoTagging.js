pl = {
    name: "splugin_AutoTagging",
    label: prop.Panel.Lang == 'ja' ? '設定: 再生時にタグに保存' : 'Setting: Auto Tagging',
    author: 'tomato111',
    onStartUp: function () { }, // 最初に一度だけ呼び出される関数
    onPlay: function () { // 新たに曲が再生される度に呼び出される関数
        this.onCommand.AutoTagging && saveToTag(getFieldName());

        function saveToTag(fieldname) {

            if (lyric && fieldname) {
                Lock = true;
                var meta = fb.GetNowPlaying();
                var LineFeedCode = prop.Save.LineFeedCode;
                var text = (lyric.info.length ? lyric.info.join(LineFeedCode) + LineFeedCode : "") + lyric.text.join(LineFeedCode).trim();
                try {
                    writeTagField(text, fieldname, meta);
                    StatusBar.setText(Messages.SavedToTag.ret('"' + fieldname + '" ' + fb.TitleFormat('%title%').EvalWithMetadb(meta)));
                    StatusBar.show();
//                  playSoundSimple(commondir + "finished.wav");
                } catch (e) {
                    Messages.FailedToSaveLyricsToTag.popup("\n" + e.message);
                }
                meta.Dispose();
                Lock = false;
            }
        }

    },
    onCommand: function () { // プラグインのメニューをクリックすると呼び出される関数
        arguments.callee.AutoTagging = !Boolean(arguments.callee.AutoTagging)
        StatusBar.setText(arguments.callee.AutoTagging ? 'AutoTagging: ON' : 'AutoTagging: OFF');
        StatusBar.show();
    }
};
