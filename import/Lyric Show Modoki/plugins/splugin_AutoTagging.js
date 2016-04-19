pl = {
    name: 'splugin_AutoTagging',
    label: prop.Panel.Lang == 'ja' ? '設定: 再生時にタグに保存' : 'Setting: Auto Tagging',
    author: 'tomato111',
    onStartUp: function () { // 最初に一度だけ呼び出される関数
    },
    onPlay: function () { // 新たに曲が再生された時に呼び出される関数
        this.onCommand.AutoTagging && saveToTag(getFieldName(), fb.TitleFormat('%title% / ').Eval(), true);
    },
    onCommand: function () { // プラグインのメニューをクリックすると呼び出される関数
        arguments.callee.AutoTagging = !Boolean(arguments.callee.AutoTagging)
        StatusBar.setText(arguments.callee.AutoTagging ? 'AutoTagging: ON' : 'AutoTagging: OFF');
        StatusBar.show();
        this.menuitem.Flag = arguments.callee.AutoTagging ? MF_CHECKED : MF_UNCHECKED;
        Menu.build();
    }
};
