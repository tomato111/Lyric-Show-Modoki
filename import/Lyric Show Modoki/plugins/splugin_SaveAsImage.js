pl = {
    name: 'splugin_SaveAsImage',
    label: prop.Panel.Lang == 'ja' ? '保存: 画像として保存' : 'Save: Save As Image',
    author: 'tomato111',
    onStartUp: function () { // 最初に一度だけ呼び出される
        this.isAvailable = 'SaveAs' in gdi.CreateImage(1, 1);
        if (!this.isAvailable)
            return;

        var _this = this;

        var saveAsImage = function (file) {
            if (!file)
                return;

            var ext = file.match(/\.(.{3})$/)[1].toLowerCase();
            var ds = _this.currentInfo[0];
            var w = ds[0].textImg.Width;
            var h = _this.currentInfo[1];
            if (ds[_this.currentInfo[2] - 1].text !== '') // h は最終行の高さを含んでいないので空文字でないなら足してあげる
                h += ds[_this.currentInfo[2] - 1].height;

            var img = gdi.CreateImage(w, h + 15);
            var canvas = img.GetGraphics();
            ext !== 'png' && canvas.FillSolidRect(-1, -1, img.Width + 1, img.Height + 1, prop.Style.Color.Background);
            for (var i = 0; i < _this.currentInfo[2]; i++) {
                canvas.DrawImage(ds[i].textImg, 0, ds[i].cy, w, ds[i].height, 0, 0, w, ds[i].height, 0, 255);
            }
            img.ReleaseGraphics(canvas);
            img.SaveAs(file, 'image/' + ext.replace('jpg', 'jpeg'));
            img.Dispose();
        };

        var filter = "JPG - JPEG Format (*.jpg)|*.jpg|PNG - Portable Network Graphics (*.png)|*.png|GIF - Graphics Interchange Format (*.gif)|*.gif|BMP - Windows Bitmap (*.bmp)|*.bmp";

        this.fd = new FileDialog(commondir + 'FileDialog.exe -s "' + filter + '" jpg');
        this.fd.setOnReady(saveAsImage);
    },
    onCommand: function () { // プラグインのメニューをクリックすると呼び出される
        if (!this.isAvailable) {
            StatusBar.showText(prop.Panel.Lang == 'ja' ? 'このプラグインは JScript Panel 専用です。' : 'JScript Panel Only.');
            return;
        }
        if (!lyric) {
            StatusBar.showText(prop.Panel.Lang == 'ja' ? '歌詞がありません。' : 'Lyric is not found.');
            return;
        }

        if (prop.Style.DrawingMethod === 2 && (prop.Panel.ScrollType <= 3 || filetype === "txt")) {
            this.currentInfo = [LyricShow.setProperties.DrawStyle, LyricShow.setProperties.h, lyric.text.length];
            this.fd.open();
        }
        else {
            var tmpStyleTextRender = prop.Style.EnableStyleTextRender;
            var tmpScrollType = prop.Panel.ScrollType;

            prop.Style.EnableStyleTextRender = true;
            prop.Panel.ScrollType = 1;
            setDrawingMethod();

            this.currentInfo = [LyricShow.setProperties.DrawStyle, LyricShow.setProperties.h, lyric.text.length];
            this.fd.open();

            prop.Style.EnableStyleTextRender = tmpStyleTextRender;
            prop.Panel.ScrollType = tmpScrollType;
            setDrawingMethod();
        }
    }
};
