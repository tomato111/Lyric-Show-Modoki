pl = {
    name: 'oplugin_NewFile_TXT',
    label: prop.Panel.Lang == 'ja' ? '作成: .txtファイル' : 'Create: .txt file',
    author: 'tomato111',
    onStartUp: function () { },// 最初に一度だけ呼び出される関数
    onPlay: function () { }, // 新たに曲が再生される度に呼び出される関数
    onCommand: function () { // プラグインのメニューをクリックすると呼び出される関数
        if (fb.IsPlaying)
            FuncCommand('C:\\Windows\\notepad.exe ' + parse_path + '.txt');
        else {
            StatusBar.setText(prop.Panel.Lang == 'ja' ? '再生していません。' : 'Not Playing');
            StatusBar.show();
        }
    }
};
