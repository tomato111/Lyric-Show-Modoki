//## code for foo_uie_wsh_mod v1.5.0 or higher  ####//
//## Please check off "Grab Focus" and "Delay Load" ##//

// ==PREPROCESSOR==
// @name "Lyric Show Modoki"
// @version "1.0.3"
// @author "tomato111"
// @import "%fb2k_path%import\common\lib.js"
// ==/PREPROCESSOR==
/// <reference path="lib.js"/>


//============================================
//== Global Variable and Function =====================
//============================================
// user reserved words
var scriptName, scriptdir, commondir, plugins, lyric, parse_path, path, directory, filename, basename, filetype, dateLastModified, dateCreated, dataSize, backalpha
, fs, ws, prop, Messages, Label, tagRe, timeRe, firstRe, TextHeight, offsetY, fixY, moveY, lineY, drag, drag_y, ww, wh, larea_seek, rarea_seek, seek_width, rarea_seek_x, disp, Lock
, debug_read, debug_scroll, debug_edit, debug_view
, DT_LEFT, DT_CENTER, DT_RIGHT, DT_WORDBREAK, DT_NOPREFIX
, LyricShow, Edit, Buttons, Menu;

debug_read = false, debug_scroll = false, debug_edit = false, debug_view = false; // for debug
fs = new ActiveXObject("Scripting.FileSystemObject"); // File System Object
ws = new ActiveXObject("WScript.Shell"); // WScript Shell Object
scriptName = "Lyric Show Modoki";
scriptdir = fb.FoobarPath + "import\\" + scriptName + "\\";
commondir = fb.FoobarPath + "import\\common\\";
disp = {};
DT_LEFT = 0x00000000;
DT_CENTER = 0x00000001;
DT_RIGHT = 0x00000002;
DT_WORDBREAK = 0x00000010;
DT_NOPREFIX = 0x00000800;
tagRe = /\[\d\d:\d\d[.:]\d\d\]/;
timeRe = /\[(\d\d):(\d\d)[.:](\d\d)\]/;
firstRe = /^\[00:00[.:]00\]/;

//========
// properties
//========
prop = new function () {
    var defaultpath = ws.SpecialFolders.item("Desktop") + "\\$replace(%artist% - %title%,*,＊,?,？,/,／,:,：)";

    // ==Panel====
    this.Panel = {
        // Lyrics Folder
        Path: window.GetProperty("Panel.Path", defaultpath),
        Lang: window.GetProperty("Panel.Language", ""),
        Conf: window.GetProperty("Panel.HideConfigureMenu", false),
        Interval: window.GetProperty("Panel.RefreshInterval", 30),
        Editor: window.GetProperty("Panel.ExternalEditor", ""),
        NoLyric: window.GetProperty("Panel.NoLyricsFound", "Title: %title%\\nArtist: %artist%\\nAlbum: %album%\\n\\n-no lyrics-"),
        Priority: window.GetProperty("Panel.Priority", "Sync_Tag,Sync_File,Unsync_Tag,Unsync_File"),
        Contain: window.GetProperty("Panel.LRC.ContainNormalLines", false),
        BackgroundEnable: window.GetProperty("Panel.Background.Enable", true),
        BackgroundPath: window.GetProperty("Panel.Background.Image", "<embed>||'%fb2k_path%'\\import\\Lyric Show Modoki\\background.jpg"),
        BackgroundRaw: window.GetProperty("Panel.Background.ImageToRawBitmap", false),
        BackgroundOption: window.GetProperty("Panel.Background.ImageOption", "20,50").split(/[ 　]*,[ 　]*/),
        BackgroundKAR: window.GetProperty("Panel.Background.KeepAspectRatio", true),
        BackgroundStretch: window.GetProperty("Panel.Background.Stretch", true)
    };

    if (!this.Panel.Path)
        window.SetProperty("Panel.Path", this.Panel.Path = defaultpath);

    if (!this.Panel.Priority)
        window.SetProperty("Panel.Priority", this.Panel.Priority = "Sync_Tag,Sync_File,Unsync_Tag,Unsync_File");
    this.Panel.Priority = this.Panel.Priority.split(/[ 　]*,[ 　]*/);

    var interval = this.Panel.Interval;
    if (!interval || typeof interval !== "number" || interval < 30)
        window.SetProperty("Panel.RefreshInterval", this.Panel.Interval = 30);

    if (!this.Panel.BackgroundOption || !(this.Panel.BackgroundOption instanceof Array) || this.Panel.BackgroundOption.length < 2) {
        window.SetProperty("Panel.Background.ImageOption", this.Panel.BackgroundOption = "20,50");
        this.Panel.BackgroundOption = this.Panel.BackgroundOption.split(/[ 　]*,[ 　]*/);
    }

    // ==Style====
    this.Style = {
        // Color Style. white, black, user is available.
        CSLS: window.GetProperty("Style.ColorStyle.LyricShow", "black"),
        CSE: window.GetProperty("Style.ColorStyle.Edit", "white"),
        // Font Style. 
        Font_Family: window.GetProperty("Style.Font-Family", ""),
        Font_Size: window.GetProperty("Style.Font-Size", 12),
        Font_Bold: window.GetProperty("Style.Font-Bold", true),
        // text alignment.
        Align: DT_WORDBREAK | DT_NOPREFIX | window.GetProperty("Style.Align", DT_CENTER),
        // Padding
        HPadding: window.GetProperty("Style.Horizontal-Padding", 5),
        VPadding: window.GetProperty("Style.Vartical-Padding", 4),
        LPadding: window.GetProperty("Style.Line-Padding", 0),
        Highline: window.GetProperty("Style.HighlineColor for unsynced lyrics", true)
    };

    this.Style.CLS = { // define color of LyricShow 
        white: {
            Text: RGB(70, 70, 70),                            // Normal Text color
            Background: RGBA(245, 245, 245, 255),  // Background color
            PlayingText: RGB(225, 72, 106)              // Playing Text color
        },
        black: {
            Text: RGB(190, 190, 190),
            Background: RGBA(76, 76, 76, 255),
            PlayingText: RGB(255, 142, 196)
        },
        user: {
            Text: eval(window.GetProperty("Style.User.LyricShow.Text", "RGB(190, 190, 190)")),
            Background: eval(window.GetProperty("Style.User.LyricShow.Background", "RGBA(75, 75, 75, 255)")),
            PlayingText: eval(window.GetProperty("Style.User.LyricShow.PlayingText", "RGB(255, 142, 196)"))
        }
    };

    this.Style.CE = { // define color of Edit
        white: {
            Text: RGB(80, 80, 80),                                  // Text color
            Background: RGBA(255, 255, 255, 255),       // Background color
            ViewBackground: RGBA(193, 219, 252, 80), // Bacground color of ViewMode
            Line: RGBA(193, 219, 252, 200),                   // Bacground color of playing line
            Rule: RGBA(0, 0, 0, 40),                                 // Ruled line color
            Length: RGB(100, 100, 100),                         // Number of line
            Seek: RGBA(255, 0, 0, 28),                            // Seek area color
            Arrow_img: gdi.Image(scriptdir + "seekb.png"), // Arrow image
            ArrowOpacity: 120                                         // Aroow image opacity
        },
        black: {
            Text: RGB(210, 210, 210),
            Background: RGBA(0, 0, 0, 200),
            ViewBackground: RGBA(0, 0, 0, 189),
            Line: RGBA(153, 255, 20, 70),
            Rule: RGBA(255, 255, 205, 40),
            Length: RGB(180, 180, 180),
            Seek: RGBA(20, 205, 255, 28),
            Arrow_img: gdi.Image(scriptdir + "seekw.png"),
            ArrowOpacity: 100
        },
        user: {
            Text: eval(window.GetProperty("Style.User.Edit.Text", "RGB(210, 210, 210)")),
            Background: eval(window.GetProperty("Style.User.Edit.Background", "RGBA(0,0,0,200)")),
            ViewBackground: eval(window.GetProperty("Style.User.Edit.ViewBackground", "RGBA(0,0,0,189)")),
            Line: eval(window.GetProperty("Style.User.Edit.PlayingLine", "RGBA(153, 255, 20, 70)")),
            Rule: eval(window.GetProperty("Style.User.Edit.RuledLine", "RGBA(255, 255, 205, 40)")),
            Length: eval(window.GetProperty("Style.User.Edit.LineNumber", "RGB(180, 180, 180)")),
            Seek: eval(window.GetProperty("Style.User.Edit.SeekArea", "RGBA(20, 205, 255, 28)")),
            Arrow_img: eval(gdi.Image(window.GetProperty("Style.User.Edit.ArrowImage", scriptdir + "seekw.png"))),
            ArrowOpacity: window.GetProperty("Style.User.Edit.ArrowOpacity", 120)
        }
    };

    // check CSLS and Set Style.Color
    if (!(this.Style.CSLS in this.Style.CLS))
        window.SetProperty("Style.ColorStyle.LyricShow", this.Style.CSLS = "black");
    this.Style.Color = this.Style.CLS[this.Style.CSLS];

    // check CSE
    if (!(this.Style.CSE in this.Style.CE))
        window.SetProperty("Style.ColorStyle.Edit", this.Style.CSE = "white");

    // check Font and Set Style.Font
    var fontfamily = ["Meiryo", "Tahoma", "Arial", "Segoe UI", "MS Gothic"];

    fontfamily.unshift(this.Style.Font_Family);
    for (i = 0; i < fontfamily.length; i++)
        if (utils.CheckFont(fontfamily[i])) {
            window.SetProperty("Style.Font-Family", this.Style.Font_Family = fontfamily[i]);
            break;
        }

    if (!this.Style.Font_Size || typeof this.Style.Font_Size != "number")
        window.SetProperty("Style.Font-Size", this.Style.Font_Size = 12);

    this.Style.Font = gdi.Font(this.Style.Font_Family, this.Style.Font_Size, this.Style.Font_Bold && 1);

    // check Padding
    if (typeof this.Style.HPadding != "number")
        window.SetProperty("Style.Horizontal-Padding", this.Style.HPadding = 5);

    if (typeof this.Style.VPadding != "number")
        window.SetProperty("Style.Vartical-Padding", this.Style.VPadding = 4);

    if (typeof this.Style.VPadding != "number")
        window.SetProperty("Style.Line-Padding", this.Style.LPadding = 0);

    g_x = this.Style.HPadding;
    g_y = this.Style.VPadding;
    ww = window.Width - g_x * 2;
    wh = window.Height - g_y * 2;
    fixY = wh / 2;
    seek_width = Math.floor(ww * 15 / 100);
    rarea_seek_x = ww - seek_width;


    // ==Edit====
    this.Edit = {
        Rule: window.GetProperty("Edit.ShowRuledLine", true),
        Step: window.GetProperty("Edit.Step", 10),
        Start: false,
        View: false
    };

    if (!this.Edit.Step && typeof this.Edit.Step != "number" || this.Edit.Step < 0)
        window.SetProperty("Edit.Step", this.Edit.Step = 10);


    // ==Save====
    this.Save = {
        // Character Code. Unicode, Shift_JIS, EUC-JP, UTF-8, UTF-8N is available.
        CharacterCode: window.GetProperty("Save.CharacterCode", "Unicode"),
        // Line Feed Code. CR+LF, CR, LF is available.
        LineFeedCode: window.GetProperty("Save.LineFeedCode", "CR+LF"),
        // Run command after save
        RunAfterSave: window.GetProperty("Save.RunAfterSave", "")
    };

    if (!this.Save.CharacterCode || !/^(?:Unicode|Shift_JIS|EUC-JP|UTF-8|UTF-8N)$/i.test(this.Save.CharacterCode))
        window.SetProperty("Save.CharacterCode", this.Save.CharacterCode = "Unicode");
    if (!this.Save.LineFeedCode || !/^(?:CR\+LF|CR|LF)$/i.test(this.Save.LineFeedCode))
        window.SetProperty("Save.LineFeedCode", this.Save.LineFeedCode = "CR+LF");

    this.Save.LineFeedCode = this.Save.LineFeedCode.replaceEach("CR", "\r", "LF", "\n", "\\+", "", "i"); // Set converted code

    if (this.Save.RunAfterSave) this.Save.RunAfterSave = this.Save.RunAfterSave.split("||");
};

//========
//  language
//========

var definedLanguage = ["en", "ja"]; // available language

if (!prop.Panel.Lang || !checkLang(prop.Panel.Lang)) { // get lang from environment variable. show propmt if it cannot get a available language,  
    var EnvLang = ws.Environment("USER").Item("LANG").substring(0, 2);
    if (!checkLang(EnvLang)) {
        EnvLang = prompt("Please input menu language.\n" + definedLanguage + " is available.", scriptName, "en");
        if (!checkLang(EnvLang))
            EnvLang = "en";
    }
    window.SetProperty("Panel.Language", prop.Panel.Lang = EnvLang);
}

switch (prop.Panel.Lang) {
    case "en":
        Messages = [
            new Message("Lyric is not found (" + scriptName + ")", "Info", 48), //0
            new Message("Couldn't open file.\nIt has most likely been moved, renamed, or deleted.", "Error", 48), //1
            new Message("Saved to tag.\n", "Info", 64), //2
            new Message("The extension of reading lyrics is wrong.\nIt is read as ", scriptName, 48), //3
            new Message("Save？", "Confirmation", 36), //4
            new Message("Couldn't save lyrics to a text file.", "Error", 48), //5
            new Message("Saved!\n", "Info", 64), //6
            new Message("The file is locked or does not exist", "Error", 48), //7
            new Message("Delete? \n", "Confirmation", 36), //8
            new Message("Deleted.", "Info", 64), //9
            new Message("Couldn't save lyrics to tag.", "Error", 48), //10
            new Message("Couldn't read the text.", "Error", 48) //11
        ];
        Label = {
            Prop: "Properties...",
            Help: "Help...",
            Conf: "Configure...",
            Edit: "Edit",
            Save: "[ Save ]",
            Open: "Open...",
            OpenIn: "Open with external editor",
            OpenFolder: "Open folder",
            SaveToTag: "Save to tag",
            SaveToFile: "Save to file",
            Refresh: "Refresh",
            About: "About current lyric",
            Contain: "Contain Normal Lines",
            BEnable: "Show Background Image",
            Copy: "Copy lyrics",
            CopyWith: "Copy with timetag",
            CopyWithout: "Copy without timetag",
            CreateLyric: "Create from clipboard",
            Align: "Align",
            Align_Left: "Left",
            Align_Center: "Center",
            Align_Right: "Right",
            Rule: "Show Ruled Line",
            View: "Vew Mode",
            EditLine: "Edit Line",
            InsertLine: "Insert Line",
            DeleteLine: "Delete Line",
            DeleteFile: "Delete TXT File",
            LyricShow: "Cancel",
            InserLineText: "Please input a sentence to insert.\n(begin with '##' to add it to the end)",
            Clear: "Clear All",
            Reload: "Reload",
            Plugins: "Plugins",
            OffsetP: "Offset+",
            OffsetM: "Offset-"
        };
        break;
    case "ja":
        Messages = [
            new Message("歌詞はありません (" + scriptName + ")", "情報", 48), //0
            new Message("ファイルが開けませんでした。\nファイルが移動、リネーム、または削除された可能性があります。", "エラー", 48), //1
            new Message("タグに保存しました\n", "情報", 64), //2
            new Message("拡張子とファイルの内容が一致しません。\n以下として読み込みます。\n", scriptName, 48), //3
            new Message("保存しますか？", "確認", 36), //4
            new Message("ファイルに保存出来ませんでした。", "エラー", 48), //5
            new Message("保存しました\n", "情報", 64), //6
            new Message("ファイルがロックされているか、ファイルが存在しません。", "エラー", 48), //7
            new Message("削除しますか? \n", "確認", 36), //8
            new Message("削除しました", "Info", 64), //9
            new Message("タグに保存できませんでした。", "エラー", 48), //10
            new Message("文字を取得できませんでした。", "エラー", 48) //11
        ];
        Label = {
            Prop: "設定...",
            Help: "ヘルプﾟ...",
            Conf: "Configure...",
            Edit: "編集開始",
            Save: "[保存]",
            Open: "開く...",
            OpenIn: "外部エディタで開く",
            OpenFolder: "フォルダを開く",
            SaveToTag: "タグに保存",
            SaveToFile: "ファイルに保存",
            Refresh: "更新",
            About: "この歌詞について",
            Contain: "通常の行を含める",
            BEnable: "背景画像を表示する",
            Copy: "コピー",
            CopyWith: "タイムタグ付きでコピー",
            CopyWithout: "タイムタグなしでコピー",
            CreateLyric: "クリップボードから作成",
            Align: "列揃え",
            Align_Left: "左",
            Align_Center: "中央",
            Align_Right: "右",
            Rule: "罫線を表示",
            View: "ビューモード",
            EditLine: "行を編集",
            InsertLine: "行を挿入",
            DeleteLine: "行を削除",
            DeleteFile: "TXTﾌｧｲﾙを削除する",
            LyricShow: "編集をやめる",
            InserLineText: "挿入する文字を入力してください。\n(ﾌｧｲﾙ末尾へ挿入するには先頭を##で開始)",
            Clear: "すべてクリア",
            Reload: "再読み込み",
            Plugins: "プラグイン",
            OffsetP: "オフセット＋",
            OffsetM: "オフセット－"
        };
        break;
}

//=========
// load plugins
//=========

PluginLoader = {

    Load: function (objFSO, path) {
        if (path) this.path = path;

        var f, fc, item, stm, str, p = {}, i = 0;
        this.Plugins = p;
        try {
            f = objFSO.GetFolder(this.path);
        } catch (e) { throw new Error("The pass to a plugins folder is wrong. (" + scriptName + ")"); }

        fc = new Enumerator(f.Files);

        for (; !fc.atEnd(); fc.moveNext()) {
            try {
                str = readTextFile(fc.item());
            } catch (e) { continue; }
            try {
                item = eval(str);
            } catch (e) {
                fb.trace(fc.item().name + " is SyntaxError. (" + scriptName + ")");
                continue;
            }
            p[item.commandName] = item;
        }
    },
    Refresh: function () { this.load(this.path); },
    Dispose: function () { delete PluginLoader }
};

PluginLoader.Load(fs, scriptdir + "plugins\\");
plugins = PluginLoader.Plugins;

//=======
// release Object 
//=======

PluginLoader.Dispose();
ws = null;

//=======
//  function
//=======

function checkLang(lang) {

    for (var i = 0; i < definedLanguage.length; i++)
        if (lang === definedLanguage[i])
            return true;
    return false;
}

function setRGBdiff(color, dr, dg, db) {

    return RGB(getRed(color) + dr, getGreen(color) + dg, getBlue(color) + db);
}

function trimLine_TopAndBottom(withTag) { // trim top and bottom

    var text = lyric.text;

    if (withTag) {
        if (!firstRe.test(text[0]))
            text.unshift("[00:00.00]");
    }
    else {
        text.unshift("");
        text.push("");

        for (; ; )
            if (text[1] == "")
                text.splice(1, 1);
            else break;

        for (; ; )
            if (text[text.length - 2] == "")
                text.splice(text.length - 2, 1);
            else break;
    }
}

function putTime(n, i) { // add timetag to i line

    var ms = n % 100; // ms +"0" [ms]
    var tmp = (n - ms) / 100;
    var s = tmp % 60;
    var m = (tmp - s) / 60;
    lyric.text[i] = "[" + doubleFig(m) + ":" + doubleFig(s) + "." + doubleFig(ms) + "]" + lyric.text[i];
}

function doubleFig(num) { // 桁合わせ

    if (num < 10)
        num = "0" + num;
    return num;
}

function copyLyric(withTag) { // copy lyric to clipboad

    var LineFeedCode = prop.Save.LineFeedCode;
    var textArray = lyric.text.slice(0);
    var text;


    if (filetype == "lrc" && !withTag)
        for (var i = 0; i < textArray.length; i++)
            textArray[i] = textArray[i].replace(tagRe, "");

    text = textArray.join(LineFeedCode).trim();
    if (lyric.info.length)
        text = lyric.info.join(LineFeedCode) + LineFeedCode + text;

    setClipboard(text);

}

function createLyricByClipboard() {

    if (fb.IsPlaying)
        var meta = fb.GetNowPlaying();
    else
        return;

    var ws = new ActiveXObject("WScript.Shell");
    var text = getClipboard();
    if (text) {
        var intButton = ws.Popup(text
                         + "\n\n==============================================\n"
                         + "                                                                           この歌詞を保存しますか？", 0, "確認", 4);
        if (intButton === 6)
            try {
                var file = parse_path + (tagRe.test(text) ? ".lrc" : ".txt");
                console(file);
                var folder = fs.GetParentFolderName(file);
                console(folder);
                if (!fs.FolderExists(folder))
                    createFolder(fs, folder);
                writeTextFile(text, file, prop.Save.CharacterCode);
                Messages[6].popup(file);
                FuncCommands(prop.Save.RunAfterSave, meta);
                main();
            } catch (e) {
                Messages[5].popup("\n" + e.message);
            }
            finally {
                meta.Dispose();
            }
    }
    else
        Messages[11].popup();
}

function applyDelta(delta) {

    if (delta === 0) return;

    var temp = offsetY + delta;

    if ((temp <= wh / 2) && (temp >= LyricShow.setProperties.minOffsetY)) {
        offsetY = temp;
        window.Repaint();
    }
}

function GetImg(path) {
    if (path.charAt(0) === "<") {
        var embeddedImage = utils.GetAlbumArtEmbedded(path.slice(1, -1), 0);
        if (embeddedImage)
            return embeddedImage;
    }
    else {
        if (fs.FileExists(path))
            return gdi.Image(path);
    }
    return null;
}

function CalcImgSize(img, dspW, dspH, strch, kar) {

    if (!img) return;
    var srcW = img.width;
    var srcH = img.height;
    if (strch == undefined) strch = prop.Panel.BackgroundStretch;
    if (kar == undefined) kar = prop.Panel.BackgroundKAR;

    var size;
    if (strch) { // パネルより小さい画像を拡大するかどうか
        size = { x: 0, y: 0, width: dspW, height: dspH };
        if (kar) { // アスペクト比を考慮
            size.width = Math.ceil(srcW * dspH / srcH); // 画像の縦をパネルの高さと仮定し、横幅を計算
            if (size.width > dspW) { // パネル幅を超えるなら、画像の横をパネル幅と仮定し、高さを計算
                size.width = dspW;
                size.height = Math.ceil(srcH * dspW / srcW);
            }
        }
    } else { // パネルに合わせて拡大はしないが縮小はする
        size = { x: 0, y: 0, width: srcW, height: srcH };
        if (kar) { // アスペクト比を考慮
            if (srcH > dspH) {
                size.height = dspH;
                size.width = Math.ceil(srcW * dspH / srcH);
            }
            if (size.width > dspW) {
                size.width = dspW;
                size.height = Math.ceil(srcH * dstW / srcW);
            }
        } else { // アスペクト比を無視
            size.width = Math.min(srcW, dstW);
            size.height = Math.min(srcH, dstH);
        }
    }
    size.x = Math.floor((dspW - size.width) / 2);
    size.y = Math.floor((dspH - size.height) / 2);
    return size;
}


//===========================================
//== Create "LyricShow" Object ======================
//===========================================

LyricShow = new function (Style) {

    var Busy, Old, New, Color, p, DrawStyle;
    var directoryRe = /.+\\/;
    var extRe = /\.(?:lrc|txt)$/i;
    var BackgroundPath, BackgroundImg, BackgroundSize;
    var BackOption = prop.Panel.BackgroundOption;

    this.init = function () {

        prop.Edit.Start && Edit.end();
        this.end();
        Color = Style.Color;
        offsetY = fixY;
    };

    this.initWithFile = function (file) {

        var str, fbs;

        try {
            var f = fs.GetFile(file);
        } catch (e) {
            try { directory = file.match(directoryRe)[0] } catch (e) { }
            return;
        }

        try {
            str = readTextFile(file);
        } catch (e) {
            Messages[1].popup();
            return;
        }

        path = f.Path;
        directory = f.ParentFolder;
        filename = f.Name;
        basename = fs.GetBaseName(path);
        filetype = fs.GetExtensionName(path);
        dateLastModified = f.DateLastModified;
        dateCreated = f.DateCreated;
        dataSize = f.Size;
        parse_path = directory + "\\" + basename;
        return str;
    };

    this.initWithTag = function (tag) {

        try {
            var MetadbHandle = fb.GetNowPlaying();
            var FileInfo = MetadbHandle.GetFileInfo();
        } catch (e) {
            return;
        } finally { MetadbHandle.Dispose() }

        var idx = FileInfo.MetaFind(tag);
        var str = FileInfo.MetaValue(idx, 0); // second arguments is numbar for multivalue. e.g.) ab;cde;f

        if (!str) return;

        if (/^LYRICS$/.test(tag)) {
            basename = "LYRICS";
            filetype = "lrc";
        } else {
            basename = "UNSYNCED LYRICS";
            filetype = "txt";
        }
        return str;
    };

    this.readLyric = function (file) {

        var str, isSync;

        if (/^(?:LYRICS|UNSYNCED LYRICS)$/.test(file)) {
            if (!(str = this.initWithTag(file))) return;
        }
        else {
            if (!(str = this.initWithFile(file))) return;
        }


        isSync = tagRe.test(str);

        if (filetype == "lrc" && !isSync) { // check
            filetype = "txt";
            Messages[3].fbpopup("UNSYNCED LYRICS\n\n" + (path ? "file:" + path : fb.TitleFormat("title: %title%'\n'artist: %artist%").Eval()));
        }
        else if (filetype == "txt" && isSync) {
            filetype = "lrc";
            Messages[3].fbpopup("SYNCED LYRICS\n\n" + (path ? "file:" + path : fb.TitleFormat("title: %title%'\n'artist: %artist%").Eval()));
        }

        lyric = { text: str.trim().split(getLineFeedCode(str)), i: 1, info: [] };


        if (filetype == "lrc") { // analyze lrc
            var value, key, tmp, tagstart, tmpkey, tmptext, dublicate;
            var m, ms, offset;
            var tmpArray = [], timeArray = [];
            var offsetRe = /\[offset:(-?\d+)\]/;
            var isTagRe = /(\[[\d.:[\]]+\])(.*)/;
            var keyRe = /\[[\d:.]+\]/g;
            var spaceRe = /^[ 　]*$/;
            var notNumberRe = /\D/g;

            for (var i = 0; i < lyric.text.length; i++) {
                if (!tagstart)
                    if (offsetRe.test(lyric.text[i]))
                        offset = Number(RegExp.$1);

                tmp = lyric.text[i].match(isTagRe);
                if (!tmp) {
                    if (prop.Panel.Contain)
                        if (tagstart && tmpkey)
                            tmpArray[tmpkey] += prop.Save.LineFeedCode + lyric.text[i];
                        else if (!tagstart)
                            lyric.info[i] = lyric.text[i].replace(offsetRe, "[offset:0]");
                    continue;
                }

                if (!tagstart) tagstart = true;

                key = tmp[1].match(keyRe);
                value = tmp[2] ? tmp[2].replace(spaceRe, "") : "";
                for (var j = 0; j < key.length; j++) {
                    tmpkey = key[j].replace(notNumberRe, "") - 0;
                    if (tmpArray[tmpkey])
                        tmpArray[tmpkey] += "$$dublicate$$" + value;
                    else
                        tmpArray[tmpkey] = value
                }
            }

            i = 0;
            for (key in tmpArray)
                timeArray[i++] = key;
            timeArray.sort(function (a, b) { return a - b; });

            lyric.text = [];
            for (i = 0, j = 0; i < timeArray.length; i++) {
                tmptext = tmpArray[timeArray[i]];
                dublicate = tmptext.split("$$dublicate$$");
                m = Math.floor(timeArray[i] / 10000);
                ms = m * 6000 + timeArray[i] % 10000;
                if (offset && ms != 0) {
                    ms = ms - Math.round(offset / 10);
                    ms = ms < 0 ? 0 : ms;
                }
                debug_read && fb.trace(i + " :: " + tmpArray[timeArray[i]] + " :: " + timeArray[i] + " :: " + ms);

                if (dublicate instanceof Array)
                    for (var k = 0; k < dublicate.length; k++) {
                        lyric.text[j] = dublicate[k];
                        putTime(ms, j++);
                    }
                else {
                    lyric.text[j] = dublicate;
                    putTime(ms, j++);
                }
            }

            trimLine_TopAndBottom(true);
        }

        else
            trimLine_TopAndBottom();

        return true;
    };

    this.setProperties = {
        setLineList: function (View) {

            if (filetype == "lrc" || View) {
                var lineList = [""];
                var text = lyric.text;
                for (var i = 0; i < text.length; i++)
                    if (timeRe.test(text[i]))
                        lineList[i] = (RegExp.$1 * 60 + Number(RegExp.$2)) * 100 + Number(RegExp.$3); // key=line number, value=start time [ms*1/10]

                this.lineList = lineList; // Set Line List
            }
            else
                this.lineList = null;
        },

        setWordbreakList: function (View) {

            var isLRC = filetype == "lrc";
            var contain = isLRC && prop.Panel.Contain;
            var wre = new RegExp(prop.Save.LineFeedCode, "g");
            var wreres;
            var temp_bmp = gdi.CreateImage(1, 1);
            var temp_gr = temp_bmp.GetGraphics();

            if (!TextHeight)
                TextHeight = temp_gr.CalcTextHeight("Sample", Style.Font) + Style.LPadding;

            if (View) {
                var numOfWordbreakWithTag = 0;
                var wordbreakListWithTag = [];

                for (var i = 0; i < lyric.text.length; i++) {
                    wordbreakListWithTag[i] = (temp_gr.CalcTextWidth(lyric.text[i].replace(tagRe, "") + "[00:00.00] ", Style.Font) > ww) ? 2 : 1;
                    if (contain) {
                        wreres = lyric.text[i].match(wre);
                        if (wreres) wordbreakListWithTag[i] += wreres.length;
                    }
                    numOfWordbreakWithTag = numOfWordbreakWithTag + wordbreakListWithTag[i] - 1;
                }

                this.numOfWordbreakWithTag = numOfWordbreakWithTag; // Set number Of wordbreak
                this.wordbreakListWithTag = wordbreakListWithTag; // Set Wordbreak List

            }
            else {
                var numOfWordbreak = 0;
                var wordbreakList = [];

                for (i = 0; i < lyric.text.length; i++) {
                    wordbreakList[i] = (temp_gr.CalcTextWidth(isLRC ? lyric.text[i].slice(10) : lyric.text[i], Style.Font) > ww) ? 2 : 1;
                    if (contain) {
                        wreres = lyric.text[i].match(wre);
                        if (wreres) wordbreakList[i] += wreres.length;
                    }
                    numOfWordbreak = numOfWordbreak + wordbreakList[i] - 1;
                }

                this.numOfWordbreak = numOfWordbreak; // Set number Of wordbreak
                this.wordbreakList = wordbreakList; // Set Wordbreak List

            }

            temp_bmp.ReleaseGraphics(temp_gr);
            temp_bmp.Dispose();
            temp_gr = null;
            temp_bmp = null;

        },

        setScrollSpeedList: function () {

            var scrollSpeedList = [];
            var lineList = this.lineList;
            var h, t, l, d;

            l = lyric.text.length + Number(this.numOfWordbreak); // 1ファイルの行数(ワードブレイク含む)
            this.h = l * TextHeight; // 1ファイルの高さ // Set FileHeight
            this.minOffsetY = wh / 2 - this.h; // オフセットYの最小値 // Set minimum offsetY

            if (lineList) {
                for (var i = 0; i < lineList.length; i++) {
                    h = this.wordbreakList[i] * TextHeight; // 行の高さ
                    t = (lineList[i + 1] - lineList[i]) * 10; // 次の行までの時間[ms]
                    scrollSpeedList[i] = h / t * prop.Panel.Interval; // 1回の更新での移動量(行ごとに変化する)
                    if (scrollSpeedList[i] > h) // 1回の更新で行の高さを超える移動量となった場合はスキップ
                        scrollSpeedList[i] = h;
                }
                scrollSpeedList[i - 1] = 0; // 最後の行の移動量は0
            } else {
                t = fb.PlaybackLength * 1000 / prop.Panel.Interval; // 1ファイルで更新する回数
                scrollSpeedList = { degree: this.h / t }; // 1回の更新での移動量(行に依らず一定)
            }

            this.scrollSpeedList = scrollSpeedList; // Set ScrollSpeed List

        },

        buildDrawStyle: function (View) {

            var DrawStyle = { "-1": { nextY: 0, nextYWithTag: 0} };
            for (var i = 0; i < lyric.text.length; i++)
                DrawStyle[i] = new DrawString(i);

            this.DrawStyle = DrawStyle; // build DrawStyle.

            // Constructor
            function DrawString(i) {
                var p = LyricShow.setProperties;

                this.i = i;

                if (View) {
                    this.text = lyric.text[i];
                    this.time = p.lineList[i] / 100;
                    this.heightWithTag = p.wordbreakListWithTag[i] * TextHeight;
                    this.yWithTag = DrawStyle[i - 1].nextYWithTag;
                    this.nextYWithTag = this.yWithTag + this.heightWithTag;
                }
                else {
                    this.time = p.lineList ? p.lineList[i] / 100 : null;
                    this.height = p.wordbreakList[i] * TextHeight;
                    this.isLRC = p.scrollSpeedList instanceof Array;
                    if (this.isLRC) {
                        this.text = lyric.text[i].slice(10);
                        this.speed = p.scrollSpeedList[i];
                    } else {
                        this.text = lyric.text[i];
                        this.speed = p.scrollSpeedList.degree;
                        this.highline = Style.Highline;
                    }
                    this.y = DrawStyle[i - 1].nextY;
                    this.nextY = this.y + this.height;
                    this.cy = this.y + g_y;
                }
            }
            DrawString.prototype.scroll = function (time) {
                if (offsetY > LyricShow.setProperties.minOffsetY) {
                    offsetY -= this.speed;
                    moveY += this.speed;
                    lineY += this.speed;
                }
                if (this.isLRC && time >= LyricShow.setProperties.lineList[this.i + 1]) {
                    offsetY = Math.round(offsetY - this.height + lineY); // fix remainder. offsetY - (this.height - lineY)
                    moveY = lineY = 0;
                    lyric.i++;
                    return true; // refresh flag
                }
                if (moveY >= 1) {
                    moveY -= Math.floor(moveY);
                    return true; // refresh flag
                }
                //                    debug_scroll && fb.trace(this.i + " :: " + this.height + " :: " + this.speed + " :: " + offsetY + " :: " + lyric.text.length + " :: " + time + " > " + LyricShow.setProperties.DrawStyle[this.i + 1].time * 100)
            };
            DrawString.prototype.draw = function (gr) {
                gr.GdiDrawText(this.text, Style.Font, (this.highline || lyric.i - 1 === this.i) ? Style.Color.PlayingText : Style.Color.Text, g_x, this.cy + offsetY, ww, wh, Style.Align);
            };
            DrawString.prototype.onclick = function (x, y) {
                if (prop.Edit.View) {
                    if (!(x > g_x && x < wh && (y > offsetY + this.yWithTag) && (y < offsetY + this.nextYWithTag)))
                        return;
                } else
                    if (!(x > g_x && x < wh && (y > offsetY + this.y) && (y < offsetY + this.nextY)))
                        return;
                this.doCommand();
                return true;
            };
            DrawString.prototype.doCommand = function () {
                if (this.time === 0) fb.PlaybackTime = 0;
                else if (this.time) fb.PlaybackTime = this.time;
            };
            // Constructor end
        }

    };

    this.searchLine = function (time) {

        Busy = true;
        disp.top = 0;
        disp.bottom = lyric.text.length - 1;
        Old = time *= 100;
        var lineList = this.setProperties.lineList;
        if (lineList) {
            for (var i = 1; i < lineList.length; i++)
                if (lineList[i] > time) break;
            lyric.i = i;

            lineY = (time - lineList[i - 1]) * 10 / prop.Panel.Interval * DrawStyle[i - 1].speed; // (i-1行になってから現在の再生時間になるまでに行われた更新回数) * 1回の更新での移動量
            offsetY = fixY - DrawStyle[i - 1].y - lineY; // オフセットの変動値は(文字の高さ*行数)
        }
        else
            offsetY = fixY - this.setProperties.h * time / Math.round(fb.PlaybackLength * 100); // パネルの半分 - (1ファイルの高さ * 再生時間の割合)

        moveY = Math.abs(offsetY % 1);
        window.Repaint();
        Busy = false;
    };

    this.pauseTimer = function (state) {

        if (state)
            this.scroll.clearInterval();
        else
            this.scroll.interval(prop.Panel.Interval);
    };

    this.fadeTimer = function (reverse) {

        this.increaseAlpha.clearInterval();
        this.decreaseAlpha.clearInterval();

        if (!reverse) {
            backalpha = 0;
            this.increaseAlpha.interval(50);
        }
        else {
            backalpha = 255;
            this.decreaseAlpha.interval(30);
        }
    };

    this.increaseAlpha = function () {

        backalpha += 17;
        if (backalpha >= 255) {
            LyricShow.increaseAlpha.clearInterval();
            backalpha = 255;
        }
        window.Repaint();
    };

    this.decreaseAlpha = function () {

        backalpha -= 17;
        if (backalpha <= 0) {
            LyricShow.decreaseAlpha.clearInterval();
            backalpha = 0;
        }
        window.Repaint();
    };

    this.releaseGlaphic = function () {

        if (BackgroundImg) {
            BackgroundImg.Dispose();
            BackgroundImg = BackgroundSize = BackgroundPath = null;
        }
    };

    this.checkGlaphicExists = function () {
        return Boolean(BackgroundImg);
    };

    this.setBackgroundImage = function () {

        var newImg, path, tmp;
        var p = prop.Panel.BackgroundPath;
        if (p) {
            try {
                var metadb = fb.GetNowPlaying();
                p = fb.TitleFormat(p).EvalWithMetadb(metadb);
                p = p.replaceEach("%fb2k_path%", fb.FoobarPath, "%fb2k_profile_path%", fb.ProfilePath, "<embed>", "<" + metadb.RawPath + ">", "gi");
                if (BackgroundPath && (BackgroundPath.indexOf(metadb.Path) !== -1 || p.indexOf('<') === -1 && p.indexOf(BackgroundPath) !== -1)) {
                    return; // skip GetImg
                }
            }
            catch (e) { }
            finally { metadb.Dispose(); }

            p = p.split('||');
            if (p instanceof Array)
                for (var i = 0; i < p.length; i++) {
                    path = p[i];
                    newImg = GetImg(path);
                    if (newImg) break;
                }
            else {
                path = p;
                newImg = GetImg(path);
            }

            if (newImg) {
                if (path == BackgroundPath) {
                    newImg.Dispose();
                    return; // skip Calc, Reseize, and Fade effect
                }
                BackgroundPath = path;
                BackgroundSize = CalcImgSize(newImg, window.Width, window.Height, prop.Panel.BackgroundStretch, prop.Panel.BackgroundKAR);
                tmp = newImg.Resize(BackgroundSize.width, BackgroundSize.height, 7); // DrawImage関数でリサイズやアルファ値(255以外)を指定し頻繁に更新すると負荷が無視できないので先に適用しておく
                BackgroundImg = tmp.ApplyAlpha(BackOption[1]);
                tmp.Dispose(); // 生成した画像オブジェクトはその都度開放した方がいい(と思う)のでtmpを用いてそう出来るよう遠回りをした
                newImg.Dispose();
                if (prop.Panel.BackgroundRaw) {
                    tmp = BackgroundImg.CreateRawBitmap();
                    BackgroundImg.Dispose(); // 同じくその都度解放する
                    BackgroundImg = tmp;
                }
                this.fadeTimer();
            }
            else
                this.releaseGlaphic();
        }
    };

    this.start = function (path) {

        this.init();
        prop.Panel.BackgroundEnable && this.setBackgroundImage();
        L:
        {
            if (extRe.test(path) && this.readLyric(path)) break L; // for FileDialog
            var pathIsArray = path instanceof Array;
            parse_path = pathIsArray ? path[0] : path; // set default parse_path for save
            for (var p = prop.Panel.Priority, i = 0; i < p.length; i++) { // according to priority order
                switch (p[i]) {
                    case "Sync_Tag":
                        if (this.readLyric("LYRICS")) break L;
                        else break;
                    case "Sync_File":
                        if (pathIsArray)
                            for (var j = 0; j < path.length; j++) {
                                if (this.readLyric(path[j] + ".lrc")) break L;
                            }
                        else
                            if (this.readLyric(path + ".lrc")) break L;
                        break;
                    case "Unsync_Tag":
                        if (this.readLyric("UNSYNCED LYRICS")) break L;
                        else break;
                    case "Unsync_File":
                        if (pathIsArray)
                            for (j = 0; j < path.length; j++) {
                                if (this.readLyric(path[j] + ".txt")) break L;
                            }
                        else
                            if (this.readLyric(path + ".txt")) break L;
                        break;
                }
            }
            return Messages[0].trace(); // file is not found
        }

        this.setProperties.setLineList();
        this.setProperties.setWordbreakList();
        this.setProperties.setScrollSpeedList();
        this.setProperties.buildDrawStyle();

        DrawStyle = LyricShow.setProperties.DrawStyle;
        this.searchLine(fb.PlaybackTime);
        this.pauseTimer(fb.IsPaused);
    };

    this.end = function () {

        this.pauseTimer(true); // 従来のタイマーの後処理のようにtimerにnull等を代入するとclearで引っかかって余計に処理の記述が増える。中身はただの数字なので何もしなくて良い
        path = directory = filename = basename = filetype = lyric = readTextFile.lastCharset = null;
        this.setProperties.lineList = this.setProperties.wordbreakList = this.setProperties.scrollSpeedList = this.setProperties.DrawStyle = this.setProperties.h = DrawStyle = null;
        lineY = moveY = null;

        if (!prop.Panel.BackgroundEnable)
            this.releaseGlaphic();
        else if (!fb.IsPlaying)
            this.releaseGlaphic();

        CollectGarbage();
    };

    this.scroll = function () {

        if (!Busy && lyric.i < lyric.text.length) {
            New = fb.PlaybackTime * 100
            if (New > Old) { // fb.PlaybackTime を信用してはいけない。再生始めは不安定で時間が戻ったりする
                Old = New;
                if (LyricShow.setProperties.DrawStyle[lyric.i - 1].scroll(New)) // lyric.i(対象行)の１個前(再生行)の情報でスクロール //timerで呼び出すとthisの意味が変わるのでthisは使わない
                    window.Repaint();
            }
        }
    };

    this.on_paint = function (gr) {

        gr.FillSolidRect(-1, -1, window.Width + 1, window.Height + 1, Color.Background);
        if (BackgroundImg)
            if (prop.Panel.BackgroundRaw)
                gr.GdiDrawBitmap(BackgroundImg, BackgroundSize.x, BackgroundSize.y, BackgroundSize.width, BackgroundSize.height, 0, 0, BackgroundImg.Width, BackgroundImg.Height);
            else
                gr.DrawImage(BackgroundImg, BackgroundSize.x, BackgroundSize.y, BackgroundSize.width, BackgroundSize.height, 0, 0, BackgroundImg.Width, BackgroundImg.Height, BackOption[0], backalpha);

        if (!main.IsVisible)
            gr.GdiDrawText("Click here to enable this panel.", Style.Font, Color.Text, g_x, g_y + offsetY - 6, ww, wh, Style.Align);
        else if (lyric) { // lyrics is found
            //            gr.FillSolidRect(0, fixY + 2, window.Width, 1, RGB(255, 0, 128)); gr.FillSolidRect(0, fixY + 2 + TextHeight, window.Width, 1, RGB(255, 0, 128));
            if (lyric.info.length && offsetY > 0)
                for (var i = 1; i <= lyric.info.length; i++)
                    gr.GdiDrawText(lyric.info[lyric.info.length - i], Style.Font, Color.Text, g_x, g_y + offsetY - TextHeight * i, ww, wh, Style.Align ^ DT_WORDBREAK);

            for (i = 0; i < lyric.text.length; i++) {
                var c = offsetY + DrawStyle[i].y;
                if (c > wh) { disp.bottom = i - 1; break; } // do not draw text outside the screen. CPU utilization rises
                else if (c < -DrawStyle[i].height) { disp.top = i + 1; continue; } // ditto
                else DrawStyle[i].draw(gr);
            }
        } // lyrics is not found
        else if (fb.IsPlaying) {
            if (!TextHeight)
                TextHeight = gr.CalcTextHeight("Sample", Style.Font) + Style.LPadding;
            var s = fb.TitleFormat(prop.Panel.NoLyric).Eval().split("\\n");
            var offset = g_y + offsetY - s.length / 2 * TextHeight;
            var wordbreak = 0;
            for (i = 0; i < s.length; i++) {
                gr.GdiDrawText(s[i], Style.Font, Color.Text, g_x, offset + TextHeight * (i + wordbreak), ww, wh, Style.Align);
                gr.CalcTextWidth(s[i], Style.Font) > ww && wordbreak++;
            }
        }
    };

} (prop.Style);


//===========================================
//== Create "Edit" Object ==========================
//===========================================

Edit = new function (Style, p) {

    var edit_fixY, di = [];
    var larrowX, arrowY, rarrowX, Arrow_img, Color, DrawStyle;
    var tagBottomRe = /([.:]\d\d\])/;

    this.init = function () {

        edit_fixY = TextHeight * 2;
        disp.top = 0;
        Color = Style.Color;
        DrawStyle = p.DrawStyle;
        offsetY = edit_fixY + Style.LPadding / 2;

        if (filetype == "lrc") {
            lyric.i = lyric.text.length;
            offsetY -= DrawStyle[lyric.i - 1].yWithTag;
        }
        else
            lyric.i = 1;

    };

    this.moveNextLine = function (x, y) {

        putTime(Math.round(fb.PlaybackTime * 100), lyric.i);

        offsetY -= DrawStyle[lyric.i - 1].heightWithTag;
        lyric.i++;
        window.Repaint();

        if (lyric.i == lyric.text.length) {
            Lock = true; // some command is prevent
            this.saveMenu(x, y);
            prop.Edit.Start && this.undo();
            (function () { Lock = false; }).timeout(200);
        }
    };

    this.undo = function (all) {

        if (lyric.i == 1) return;

        do {
            lyric.text[--lyric.i] = lyric.text[lyric.i].slice(10);
            offsetY += DrawStyle[lyric.i - 1].heightWithTag;
            if (lyric.i == 1) break;
        } while (all)

        window.Repaint();
    }

    this.adjustTime = function (n) { // -100 < Int n < 100

        if (lyric.i == 1) return;

        Lock = true;
        var pl = lyric.i - 1

        this.applyTimeDiff(lyric.text[pl].match(timeRe), pl, n);

        if (prop.Edit.View)
            DrawStyle[pl].doCommand();
        else
            window.Repaint();
        Lock = false;
    };

    this.offsetTime = function (n) { // -100 < Int n < 100

        if (lyric.i == 1) return;

        Lock = true;
        var timeArray;

        for (var i = 1; i < lyric.text.length; i++) {
            if (!(timeArray = lyric.text[i].match(timeRe)))
                break;
            this.applyTimeDiff(timeArray, i, -n)
        }

        if (prop.Edit.View)
            DrawStyle[lyric.i - 1].doCommand();
        else
            window.Repaint();
        Lock = false;
    };

    this.applyTimeDiff = function (timeArray, i, diff) {

        var ms, s, MS, S, M;

        ms = Number(timeArray[3]) + diff;
        if (ms >= 100) {
            s = Number(timeArray[2]) + 1;
            MS = ms - 100;
            if (s >= 60) {
                M = Number(timeArray[1]) + 1;
                S = s - 60;
            }
            else {
                M = Number(timeArray[1]);
                S = s;
            }
        }
        else if (ms < 0) {
            s = Number(timeArray[2]) - 1;
            MS = ms + 100;
            if (s < 0) {
                M = Number(timeArray[1]) - 1;
                S = s + 60;
            }
            else {
                M = Number(timeArray[1]);
                S = s;
            }
        }
        else {
            MS = ms
            S = Number(timeArray[2]);
            M = Number(timeArray[1]);
        }

        if (M < 0) {
            MS = 0; S = 0; M = 0;
        }

        lyric.text[i] = lyric.text[i].replace(tagRe, "[" + doubleFig(M) + ":" + doubleFig(S) + "." + doubleFig(MS) + "]");
        if (prop.Edit.View) {
            p.lineList[i] = (M * 60 + S) * 100 + MS;
            DrawStyle[i].time = p.lineList[i] / 100;
        }

    };

    this.controlLine = function (n, s) {

        var a, str;
        var text = lyric.text;
        var i = lyric.i;

        switch (n) {
            case -1: // delete line
                text.splice(i, 1);
                if (i == text.length) this.undo();
                break;
            case 0: // space control for shortcut key
                if (text[i] != "") {
                    a = text.splice(i, text.length - i, "");
                    lyric.text = text.concat(a);
                } else text.splice(i, 1);
                break;
            case 1: // insert line
                str = prompt(Label.InserLineText, Label.InsertLine, "");
                if (/^##(.*)/.test(str)) { // insert line to bottom
                    lyric.text.push(RegExp.$1 ? RegExp.$1 : "");
                    break;
                }
                a = text.splice(i, text.length - i, str ? str : "");
                lyric.text = text.concat(a);
                break;
            case 2: // edit line
                a = text[i - 1].slice(0, 10);
                str = prompt("", Label.EditLine, text[i - 1].slice(10));
                if (str) text[i - 1] = a + str;
                break;
        }

        p.setWordbreakList(true);
        p.buildDrawStyle(true);
        DrawStyle = p.DrawStyle;

        window.Repaint();
    };

    this.saveMenu = function (x, y) {

        var meta = fb.GetNowPlaying();
        var field = "LYRICS";
        var file = parse_path + ".lrc";
        var folder = fs.GetParentFolderName(file);
        var LineFeedCode = prop.Save.LineFeedCode;
        var text = (lyric.info.length ? lyric.info.join(LineFeedCode) + LineFeedCode : "") + lyric.text.join(LineFeedCode);
        var _menu, ret;

        Menu.build(Menu.Save);
        _menu = Menu.getMenu();
        ret = _menu.TrackPopupMenu(x || 0, y || 0);
        Menu.build(Menu.Edit);
        switch (ret) {
            case 3:
                try {
                    writeTagField(text, field, meta);
                    Messages[2].popup('"' + field + '"');
                } catch (e) {
                    Messages[10].popup("\n" + e.message);
                }
                break;
            case 4:
                try {
                    if (!fs.FolderExists(folder))
                        createFolder(fs, folder);
                    writeTextFile(text, file, prop.Save.CharacterCode);
                    Messages[6].popup(file);
                    FuncCommands(prop.Save.RunAfterSave, meta);
                } catch (e) {
                    Messages[5].popup("\n" + e.message);
                }
                break;
        }
        meta.Dispose();
    };

    this.deleteFile = function (file) {

        if (!file || Messages[8].popup(file) != 6)
            return;
        try {
            sendToRecycleBin(file);
            Menu.build(Menu.Edit);
            Messages[9].popup();
        } catch (e) {
            Messages[7].popup();
        }
    };

    this.start = function () {

        LyricShow.pauseTimer(true);
        with (prop.Style) { Color = CE[CSE]; }
        prop.Edit.Start = true;
        filetype == "txt" && putTime(0, 0);

        p.setLineList(true);
        p.setWordbreakList(true);
        p.buildDrawStyle(true);
        this.init();

        this.calcSeekIMGarea();
        if (filetype == "lrc")
            this.View.start(true);
        else {
            this.calcRGBdiff();
            window.Repaint();
            Menu.build(Menu.Edit);
        }

    };

    this.end = function () {

        prop.Edit.Start = false;
        prop.Edit.View && this.View.end();
        with (prop.Style) { Color = CLS[CSLS]; }
        window.Repaint();

    };

    this.View = new function () {

        this.setProperties = function () {
            p.setLineList(true);
            p.setWordbreakList(true);
            p.buildDrawStyle(true);
            DrawStyle = p.DrawStyle;
        };

        this.searchLine = function (time) {
            disp.top = 0;
            time *= 100;
            for (var i = 0; i < p.lineList.length; i++) {
                if (p.lineList[i] > time) break;
            }
            lyric.i = i;
            offsetY = edit_fixY + Style.LPadding / 2 - DrawStyle[lyric.i - 1].yWithTag;
            window.Repaint();
        };

        this.watchLineChange = function () {
            if (Math.round(fb.PlaybackTime * 100) >= p.lineList[lyric.i]) {
                offsetY -= LyricShow.setProperties.DrawStyle[lyric.i - 1].heightWithTag;
                lyric.i++;
                window.Repaint();
            }
        };

        this.pauseTimer = function (state) {
            if (state)
                this.watchLineChange.clearInterval();
            else
                this.watchLineChange.interval(prop.Panel.Interval);
        };

        this.start = function (PropExists) {
            prop.Edit.View = true;
            this.i = lyric.i;
            this.offsetY = offsetY;
            !PropExists && this.setProperties();
            Edit.calcRGBdiff();
            this.searchLine(fb.PlaybackTime);
            this.pauseTimer(fb.IsPaused);
            Menu.build(Menu.Edit);
        };

        this.end = function () {
            prop.Edit.View = false;
            this.pauseTimer(true);
            lyric.i = this.i;
            offsetY = this.offsetY;
            this.i = this.offsetY = null;
            lyric.i == lyric.text.length && Edit.undo();
            Edit.calcRGBdiff();
            window.Repaint();
        };
    }

    this.switchView = function () {

        prop.Edit.View = !prop.Edit.View;
        if (prop.Edit.View) Edit.View.start();
        else {
            Edit.View.end();
            Menu.build(Menu.Edit);
        }
    };

    this.calcSeekIMGarea = function () {

        Arrow_img = Color.Arrow_img;
        larrowX = Math.floor(seek_width / 2 - Color.Arrow_img.width / 2);
        arrowY = Math.floor(wh / 2 - Color.Arrow_img.height / 2 - 8);
        rarrowX = ww - larrowX - Color.Arrow_img.width;
    };

    this.calcRGBdiff = function () {

        var bg = prop.Edit.View ? Color.ViewBackground : Color.Background
        if (getAlpha(bg) != 0xff)
            bg = RGBAtoRGB(bg); // parse alpha value
        var b = getRGB(Color.Text); // base color
        var t = getRGB(di[3] = bg); // target color
        for (var i = 0; i < 3; i++) // [R_diff, G_diff, B_diff]
            di[i] = Math.floor(prop.Edit.Step === 0 ? 0 : (t[i] - b[i]) / prop.Edit.Step);
    };

    this.on_paint = function (gr) {

        var p = lyric.i - 1; // playing line
        var tmp = g_y + offsetY + TextHeight;
        var n, str, ci, c;

        // background
        gr.FillSolidRect(-1, -1, window.Width + 1, window.Height + 1, prop.Edit.View ? Color.ViewBackground : Color.Background);
        // playing line
        gr.FillRoundRect(g_x + 1, g_y + edit_fixY, ww - 2, DrawStyle[p].heightWithTag, 5, 5, Color.Line);

        for (var i = -2; i < lyric.text.length - 2; i++) { // lyrics
            n = p + i;
            if (i == -2 && n >= 0) { disp.top = n; }
            if (n < 0) continue;
            else if (n >= lyric.text.length || tmp + DrawStyle[n].nextYWithTag > wh) { disp.bottom = n - 1; break; } // 画面下のアイコンに被らない程度に描画
            else {
                str = lyric.text[n].replace(tagBottomRe, "$1 ");
                ci = (i < prop.Edit.Step) ? (i < 0) ? (i >= -prop.Edit.Step) ? -i : null : i : null;
                c = ci === null ? di[3] : setRGBdiff(Color.Text, di[0] * ci, di[1] * ci, di[2] * ci);
                debug_view && fb.trace(str + "::" + Style.Font + "::" + Color.Text + "::" + g_x + "::" + g_y + "::" + offsetY + "::" + DrawStyle[n].yWithTag + "::" + ww + "::" + wh + "::" + Style.Align);
                gr.GdiDrawText(str, Style.Font, c, g_x, g_y + offsetY + DrawStyle[n].yWithTag, ww, wh, Style.Align);
            }
        }

        if (prop.Edit.Rule) // rule
            for (var j = 1; j <= i + 3; j++)
                gr.DrawLine(ww - 4 + g_x, g_y + TextHeight * j, 4 + g_x, g_y + TextHeight * j, 1, Color.Rule);

        // length
        gr.gdiDrawText("[" + lyric.i + " / " + lyric.text.length + "]", Style.Font, Color.Length, g_x, window.Height - TextHeight + prop.Style.LPadding, window.Width, TextHeight, 0);

        if (larea_seek) { // seek
            gr.FillRoundRect(0, TextHeight, seek_width, wh - 50, 15, 15, Color.Seek);
            gr.DrawImage(Arrow_img, larrowX, arrowY, Arrow_img.width, Arrow_img.height + 17, 0, 0, Arrow_img.width, Arrow_img.height, 0, Color.ArrowOpacity);
        }
        if (rarea_seek) {
            gr.FillRoundRect(rarea_seek_x, TextHeight, seek_width, wh - 50, 15, 15, Color.Seek);
            gr.DrawImage(Arrow_img, rarrowX, arrowY, Arrow_img.width, Arrow_img.height + 17, 0, 0, Arrow_img.width, Arrow_img.height, 180, Color.ArrowOpacity);
        }
    };

} (prop.Style, LyricShow.setProperties);


//===========================================
//== Create "Buttons" Object =======================
//===========================================

Buttons = new function () {
    var offsetX = window.Width - 4;
    var offsetY = window.Height - 19;
    var icon_height = 16;
    var icon_space = 4;
    var button = [];
    var lbtn_down = false;

    var buttonlist = [
        {
            Img: gdi.Image(scriptdir + "clear2.png"),
            Tiptext: Label.Reload,
            Func: function () {
                main(path ? path : "");
                (function () {
                    if (lyric) {
                        Edit.start();
                    }
                }).timeout(400);
            }
        },
        {
            Img: gdi.Image(scriptdir + "clear.png"),
            Tiptext: Label.Clear,
            Func: function () {
                prop.Edit.View && Edit.View.end();
                Edit.undo(true);
                Menu.build(Menu.Edit);
            }
        },
        {
            Img: gdi.Image(scriptdir + "dummy.png"),
            Tiptext: "",
            Func: function () { }
        },
        {
            Img: gdi.Image(scriptdir + "align.png"),
            Tiptext: Label.Align,
            Func: function () {
                var a = prop.Style.Align ^ DT_WORDBREAK ^ DT_NOPREFIX
                if (++a > DT_RIGHT)
                    window.SetProperty("Style.Align", prop.Style.Align = DT_LEFT);
                else
                    window.SetProperty("Style.Align", prop.Style.Align = a);
                prop.Style.Align |= DT_WORDBREAK | DT_NOPREFIX;
                window.Repaint();
            }
        },
        {
            Img: gdi.Image(scriptdir + "dummy.png"),
            Tiptext: "",
            Func: function () { }
        },
        {
            Img: gdi.Image(scriptdir + "offset-.png"),
            Tiptext: Label.OffsetM,
            Func: function () {
                Edit.offsetTime(-5);
            }
        },
        {
            Img: gdi.Image(scriptdir + "offset+.png"),
            Tiptext: Label.OffsetP,
            Func: function () {
                Edit.offsetTime(5);
            }
        }
    ];

    for (var i = 0; i < buttonlist.length; i++) {
        button[i] = new Button(buttonlist[i], i);
        offsetX -= buttonlist[i].Img.width + (i > 0 ? icon_space : 0);
    }

    this.on_paint_Button = function (gr) {
        for (var i = 0; i < button.length; i++)
            button[i].Draw(gr);
    };

    this.isMouseOver = function (x, y) {
        return (x >= offsetX && y >= offsetY && y <= offsetY + icon_height);
    };

    this.on_mouse_over = function (x, y) {
        for (var i = 0; i < button.length; i++)
            if (button[i].isMouseOver(x, y)) {
                if (this.CurrentButton != button[i]) {
                    this.CurrentButton && this.CurrentButton.DeactivateTooltip();
                    this.CurrentButton = button[i];
                    this.CurrentButton.ActivateTooltip();
                }
                return;
            }
        if (this.CurrentButton) {
            this.CurrentButton.DeactivateTooltip();
            this.CurrentButton = null;
        }
    };

    this.on_mouse_lbtn_down = function () {
        lbtn_down = true;
    };

    this.on_mouse_lbtn_up = function () {
        if (lbtn_down)
            Buttons.CurrentButton.Func();
    };

    this.resetFlag = function () {
        if (lbtn_down)
            lbtn_down = false;
    };

    // Constructor
    function Button(obj, i) {
        this.img = obj.Img;
        this.x = offsetX - this.img.width - (i > 0 ? icon_space : 0);
        this.y = offsetY;
        this.width = this.img.width;
        this.height = this.img.height;
        this.Tiptext = obj.Tiptext;
        this.Func = obj.Func;
    };
    Button.prototype.isMouseOver = function (x, y) {
        return (x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height);
    };
    Button.prototype.Draw = function (gr) {
        gr.DrawImage(this.img, this.x, this.y, this.width, this.height, 0, 0, this.width, this.height, 0, 160);
    };
    Button.prototype.ActivateTooltip = function () {
        this.tip = window.CreateTooltip();
        this.tip.Text = this.Tiptext;
        this.tip.Activate();
    };
    Button.prototype.DeactivateTooltip = function () {
        if (this.tip) {
            this.tip.Deactivate();
            this.tip.Dispose();
            this.tip = null;
        }
    };
    // Constructor end
};


//===========================================
//== Create "Menu" Object =========================
//===========================================

Menu = new function () {
    var MF_SEPARATOR = 0x00000800;
    var MF_ENABLED = 0x00000000;
    var MF_GRAYED = 0x00000001;
    var MF_DISABLED = 0x00000002;
    var MF_UNCHECKED = 0x00000000;
    var MF_CHECKED = 0x00000008;
    var MF_STRING = 0x00000000;
    var MF_POPUP = 0x00000010;
    var MF_RIGHTJUSTIFY = 0x00004000;

    var _menu;

    //============
    //  sub menu items
    //============
    var submenu_Copy = [
        {
            Flag: MF_STRING,
            Caption: Label.CopyWith,
            Func: function () {
                if (lyric)
                    copyLyric(true);
            }
        },
        {
            Flag: MF_STRING,
            Caption: Label.CopyWithout,
            Func: function () {
                if (lyric)
                    copyLyric();
            }
        }
    ];

    var submenu_Align = [
        {
            Flag: MF_STRING,
            Caption: Label.Align_Left,
            Func: function () {
                window.SetProperty("Style.Align", prop.Style.Align = DT_LEFT);
                prop.Style.Align |= DT_WORDBREAK | DT_NOPREFIX;
                window.Repaint();
                Menu.build();
            }
        },
        {
            Flag: MF_STRING,
            Caption: Label.Align_Center,
            Func: function () {
                window.SetProperty("Style.Align", prop.Style.Align = DT_CENTER);
                prop.Style.Align |= DT_WORDBREAK | DT_NOPREFIX;
                window.Repaint();
                Menu.build();
            }
        },
        {
            Flag: MF_STRING,
            Caption: Label.Align_Right,
            Func: function () {
                window.SetProperty("Style.Align", prop.Style.Align = DT_RIGHT);
                prop.Style.Align |= DT_WORDBREAK | DT_NOPREFIX;
                window.Repaint();
                Menu.build();
            }
        }
    ];

    if (plugins) {
        var submenu_Plugins = createPluginMenuItems(plugins);
    }

    function createPluginMenuItems(plugins) {
        var items = [], item;
        for (var name in plugins) {
            item = {};
            item["Flag"] = MF_STRING;
            item["Caption"] = plugins[name].label;
            item["Func"] = plugins[name].onCommand;
            items.push(item);
        }

        return items;
    }

    //=============
    //  main menu items
    //=============
    var menu_LyricShow = [
        {
            Flag: MF_STRING,
            Caption: Label.Refresh,
            Func: main
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: MF_STRING,
            Caption: Label.Edit,
            Func: function () {
                Edit.start();
            }
        },
        {
            Flag: MF_STRING,
            Caption: Label.Align,
            Sub: submenu_Align,
            Radio: null
        },
        {
            Caption: Label.BEnable,
            Func: function () {
                window.SetProperty("Panel.Background.Enable", prop.Panel.BackgroundEnable = !prop.Panel.BackgroundEnable);
                if (prop.Panel.BackgroundEnable)
                    if (LyricShow.checkGlaphicExists()) {
                        LyricShow.fadeTimer();
                        Menu.build();
                    }
                    else
                        main();
                else {
                    if (!prop.Panel.BackgroundRaw) {
                        LyricShow.fadeTimer(true);
                        Menu.build();
                    }
                    else
                        main();
                }
            }
        },
        {
            Caption: Label.Contain,
            Func: function () {
                window.SetProperty("Panel.LRC.ContainNormalLines", prop.Panel.Contain = !prop.Panel.Contain);
                main();
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: MF_STRING,
            Caption: Label.About,
            Func: function () {
                var LineFeedCode = prop.Save.LineFeedCode;
                var lyrics = (lyric.info.length ? lyric.info.join(LineFeedCode) + LineFeedCode : "") + lyric.text.join(LineFeedCode).trim();

                if (path)
                    var str = path + "\nLastModified: " + dateLastModified + "\nCreated: " + dateCreated + "\n"
                            + "Lyrics: " + Number(lyric.text.length - 1) + " lines, " + dataSize / 1000 + " kB, read as " + readTextFile.lastCharset + "\n"
                            + lyrics;
                else
                    str = "Field: " + basename + "\n" + filetype.toUpperCase() + "\n"
                        + "Lyrics: " + Number(lyric.text.length - 1) + " lines\n"
                        + lyrics;

                fb.ShowPopupMessage(str);
            }
        },
        {
            Flag: MF_POPUP,
            Caption: Label.Copy,
            Sub: submenu_Copy
        },
        {
            Flag: MF_STRING,
            Caption: Label.SaveToTag,
            Func: function () {
                if (lyric) {
                    var meta = fb.GetNowPlaying();
                    var field = filetype == "lrc" ? "LYRICS" : "UNSYNCED LYRICS";
                    var LineFeedCode = prop.Save.LineFeedCode;
                    var text = (lyric.info.length ? lyric.info.join(LineFeedCode) + LineFeedCode : "") + lyric.text.join(LineFeedCode).trim();
                    try {
                        writeTagField(text, field, meta);
                        Messages[2].popup('"' + field + '"');
                    } catch (e) {
                        Messages[10].popup("\n" + e.message);
                    }
                    meta.Dispose();
                }
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: MF_STRING,
            Caption: Label.CreateLyric,
            Func: createLyricByClipboard
        },
        {
            Flag: MF_STRING,
            Caption: Label.Open,
            Func: function () {
                var filter = "Lyric Files(*.lrc;*.txt)|*.txt;*.lrc|LRC Files(*.lrc)|*.lrc|Text Files(*.txt)|*.txt|All Files(*.*)|*.*";
                var fd = new FileDialog(commondir + 'FileDialog.exe -o "' + filter + '" txt');
                fd.setOnReady(function (file) { main(file); });
                fd.open();
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: MF_STRING,
            Caption: Label.OpenIn,
            Func: function () {
                if (path)
                    if (prop.Panel.Editor)
                        FuncCommand(prop.Panel.Editor + " " + path);
                    else
                        FuncCommand(path);
            }
        },
        {
            Flag: MF_STRING,
            Caption: Label.OpenFolder,
            Func: function () {
                if (path)
                    FuncCommand("explorer.exe /select,\"" + path + "\"");
                else if (directory)
                    FuncCommand(directory);
            }
        }
    ];

    var menu_Edit = [
        {
            Caption: Label.LyricShow,
            Func: function () {
                main();
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: MF_STRING,
            Caption: Label.SaveToTag,
            Func: function () {
                var meta = fb.GetNowPlaying();
                var field = "LYRICS";
                var LineFeedCode = prop.Save.LineFeedCode;
                var text = (lyric.info.length ? lyric.info.join(LineFeedCode) + LineFeedCode : "") + lyric.text.join(LineFeedCode);
                try {
                    writeTagField(text, field, meta);
                    Messages[2].popup('"' + field + '"');
                } catch (e) {
                    Messages[10].popup("\n" + e.message);
                }
                meta.Dispose();
                main();
            }
        },
        {
            Flag: MF_STRING,
            Caption: Label.SaveToFile,
            Func: function () {
                Lock = true;
                var meta = fb.GetNowPlaying();
                var file = parse_path + ".lrc";
                var folder = fs.GetParentFolderName(file);
                var LineFeedCode = prop.Save.LineFeedCode;
                var text = (lyric.info.length ? lyric.info.join(LineFeedCode) + LineFeedCode : "") + lyric.text.join(LineFeedCode);
                try {
                    if (!fs.FolderExists(folder))
                        createFolder(fs, folder);
                    writeTextFile(text, file, prop.Save.CharacterCode);
                    Messages[6].popup(file);
                    FuncCommands(prop.Save.RunAfterSave, meta);
                } catch (e) {
                    Messages[5].popup();
                }
                meta.Dispose();
                Lock = false;
                main();
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Caption: Label.View,
            Func: Edit.switchView
        },
        {
            Caption: Label.Rule,
            Func: function () {
                window.SetProperty("Edit.ShowRuledLine", prop.Edit.Rule = !prop.Edit.Rule);
                window.Repaint();
                Menu.build(Menu.Edit);
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Caption: Label.EditLine,
            Func: function () { Edit.controlLine(2); }
        },
        {
            Caption: Label.InsertLine,
            Func: function () { Edit.controlLine(1); }
        },
        {
            Caption: Label.DeleteLine,
            Func: function () { Edit.controlLine(-1); }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Caption: Label.DeleteFile,
            Func: function () { Edit.deleteFile(parse_path + ".txt"); }
        }
    ];

    var common = [
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: MF_STRING,
            Caption: Label.Prop,
            Func: function () { window.ShowProperties(); }
        },
        {
            Flag: MF_STRING,
            Caption: Label.Help,
            Func: function () { FuncCommand("http://ashiato1.blog62.fc2.com/blog-entry-64.html"); }
        },
        {
            Flag: MF_SEPARATOR
        },
        { // mustn't add a item after this
            Flag: MF_POPUP,
            Caption: "Now Playing",
            Sub: function (IMenuObj) {
                var _context = fb.CreateContextMenuManager();
                _context.InitNowPlaying();
                _context.BuildMenu(IMenuObj, idx, -1);

                item_list._context = _context;
                item_list._contextIdx = idx;
            }
        }
    ];


    if (submenu_Plugins) // Insert plugin items
        menu_LyricShow = menu_LyricShow.concat(
            {
                Flag: MF_SEPARATOR
            },
            {
                Flag: MF_POPUP,
                Caption: Label.Plugins,
                Sub: submenu_Plugins
            }
        );

    menu_LyricShow = menu_LyricShow.concat(common); // Insert common menuitems
    menu_Edit = menu_Edit.concat(common);

    if (!prop.Panel.Conf) { // Insert "Configure" item
        var conf = [
            {
                Flag: MF_STRING,
                Caption: Label.Conf,
                Func: function () { window.ShowConfigure(); }
            }
        ];
        var temp = menu_LyricShow.splice(menu_LyricShow.length - 2, 2);
        menu_LyricShow = menu_LyricShow.concat(conf).concat(temp);
        temp = menu_Edit.splice(menu_Edit.length - 2, 2);
        menu_Edit = menu_Edit.concat(conf).concat(temp);
    }


    var menu_Save = [
        {
            Flag: MF_GRAYED,
            Caption: Label.Save
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: MF_STRING,
            Caption: Label.SaveToTag
        },
        {
            Flag: MF_STRING,
            Caption: Label.SaveToFile
        }
    ];

    //========
    //  menu_obj
    //========
    this.LyricShow = {
        items: menu_LyricShow,
        refresh: function () {
            menu_LyricShow[3].Radio = Number(prop.Style.Align ^ DT_WORDBREAK ^ DT_NOPREFIX); // radio number begin with 0
            menu_LyricShow[4].Flag = prop.Panel.BackgroundEnable ? MF_CHECKED : MF_UNCHECKED;
            menu_LyricShow[14].Flag = path ? MF_STRING : MF_GRAYED;

            if (lyric) {
                menu_LyricShow[2].Flag = MF_STRING;
                menu_LyricShow[5].Flag = filetype == "lrc" ? prop.Panel.Contain ? MF_CHECKED : MF_UNCHECKED : MF_GRAYED;
                menu_LyricShow[7].Flag = MF_STRING;
                menu_LyricShow[8].Flag = MF_STRING;
                menu_LyricShow[9].Flag = MF_STRING;
            }
            else
                menu_LyricShow[2].Flag = menu_LyricShow[5].Flag = menu_LyricShow[7].Flag = menu_LyricShow[8].Flag = menu_LyricShow[9].Flag = MF_GRAYED;

            if (fb.IsPlaying) {
                menu_LyricShow[11].Flag = MF_STRING;
                menu_LyricShow[12].Flag = MF_STRING;
                menu_LyricShow[15].Flag = MF_STRING;
            }
            else
                menu_LyricShow[11].Flag = menu_LyricShow[12].Flag = menu_LyricShow[15].Flag = MF_GRAYED;
        }
    };

    this.Edit = {
        items: menu_Edit,
        refresh: function () {
            menu_Edit[2].Flag = (prop.Edit.View && Edit.View.i == lyric.text.length) ? MF_STRING : MF_GRAYED;
            menu_Edit[3].Flag = (prop.Edit.View && Edit.View.i == lyric.text.length) ? MF_STRING : MF_GRAYED;
            menu_Edit[5].Flag = prop.Edit.View ? MF_CHECKED : MF_UNCHECKED;
            menu_Edit[6].Flag = prop.Edit.Rule ? MF_CHECKED : MF_UNCHECKED;
            menu_Edit[9].Flag = prop.Edit.View ? MF_GRAYED : MF_STRING;
            menu_Edit[10].Flag = prop.Edit.View ? MF_GRAYED : MF_STRING;
            menu_Edit[12].Flag = fs.FileExists(parse_path + ".txt") ? MF_STRING : MF_GRAYED;
        }
    };

    this.Save = {
        items: menu_Save,
        refresh: function () { }
    }

    //=====
    //  build
    //=====
    this.build = function (mobj) {
        _menu && _menu.Dispose();
        this.init();
        mobj = mobj || this.LyricShow;
        mobj.refresh();
        _menu = buildMenu(mobj.items);
    };

    this.init = function () {
        item_list = {};
        idx = 1;
    };

    this.show = function (x, y) {
        var ret = _menu.TrackPopupMenu(x, y);
        if (ret != 0)
            if (item_list[ret]) item_list[ret].Func();
            else item_list._context.ExecuteByID(ret - item_list._contextIdx);
    };

    this.getMenu = function () {
        return _menu;
    };

};


//========================================
//== onLoad function ==========================
//========================================

function main(path) {

    if (arguments.callee.IsVisible !== window.IsVisible)
        arguments.callee.IsVisible = window.IsVisible;

    if (arguments.callee.IsVisible && fb.IsPlaying) {
        var parse_paths = fb.TitleFormat(prop.Panel.Path).Eval().split("||");
        LyricShow.start(path ? path : parse_paths);
    }
    else
        LyricShow.init();

    window.Repaint();
    Menu.build();
    debug_edit && (
        function () {
            if (lyric) {
                Edit.start();
                Menu.build(Menu.Edit);
                debug_edit = false;
            }
        }
        ).timeout(400);
}
main();


//========================================
//== Callback function =========================
//========================================
function on_paint(gr) {
    /*    gr.SetTextRenderingHint(5);
    gr.SetSmoothingMode(2);
    gr.SetInterpolationMode(7);
    */

    if (!prop.Edit.Start)
        LyricShow.on_paint(gr);
    else {
        Edit.on_paint(gr);
        Buttons.on_paint_Button(gr);
    }
}

function on_size() {
    ww = window.Width - g_x * 2;
    wh = window.Height - g_y * 2;
    fixY = wh / 2;

    seek_width = Math.floor(ww * 15 / 100);
    rarea_seek_x = ww - seek_width;
}

function on_focus(is_focused) {
    !main.IsVisible && main();
}

function on_playback_new_track(metadb) {
    main();
}

function on_playback_seek(time) {
    if (!prop.Edit.Start) {
        lyric && LyricShow.searchLine(time);
    }
    else if (prop.Edit.View)
        Edit.View.searchLine(time);
}

function on_playback_stop(reason) {
    if (reason == 0 || reason == 1)
        main();
}

function on_playback_pause(state) {
    if (!prop.Edit.Start && lyric) {
        LyricShow.pauseTimer(state);
    }
    else if (prop.Edit.View)
        Edit.View.pauseTimer(state);
}

function on_mouse_move(x, y) {
    if (drag) {
        applyDelta(y - drag_y);
        drag_y = y;
    }
    else if (prop.Edit.Start) {
        if (Buttons.isMouseOver(x, y))
            Buttons.on_mouse_over(x, y);
        else if (Buttons.CurrentButton) {
            Buttons.CurrentButton.DeactivateTooltip();
            Buttons.CurrentButton = null;
        }
        else
            if (x <= seek_width && !larea_seek) {
                larea_seek = true;
                window.Repaint();
            }
            else if (x > seek_width && larea_seek) {
                larea_seek = false;
                window.Repaint();
            }
            else if (x >= rarea_seek_x && y < ww - 60 && !rarea_seek) {
                rarea_seek = true;
                window.Repaint();
            }
            else if ((x < rarea_seek_x || y > ww - 60) && rarea_seek) {
                rarea_seek = false;
                window.Repaint();
            }
    }
}

function on_mouse_leave() {
    if (Buttons.CurrentButton) {
        Buttons.CurrentButton.DeactivateTooltip();
        Buttons.CurrentButton = null;
    }

    if (larea_seek || rarea_seek) {
        larea_seek = rarea_seek = false;
        window.Repaint();
    }
}

function on_mouse_lbtn_down(x, y, mask) {
    if (!prop.Edit.Start) {
        if (lyric) {
            drag = true;
            drag_y = y;
        }
        if (path && (x < g_x || x > g_x + ww || y < g_y || y > g_y + wh))
            if (prop.Panel.Editor)
                FuncCommand(prop.Panel.Editor + " " + path);
            else
                FuncCommand(path);
    }
    else if (!Lock)
        if (Buttons.CurrentButton)
            Buttons.on_mouse_lbtn_down(x, y);
        else if (larea_seek)
            fb.PlaybackTime -= 3;
        else if (rarea_seek)
            fb.PlaybackTime += 3;
        else if (!prop.Edit.View) {
            if (mask == 5)
                Edit.controlLine(0);
            else if (mask == 9)
                fs.FileExists(parse_path + ".txt") && Edit.deleteFile(parse_path + ".txt");
            else if (y < TextHeight * 2)
                Edit.undo();
            else
                Edit.moveNextLine(x, y);
        }
        else
            for (var i = disp.top, j = disp.bottom; i <= j; i++)
                if (LyricShow.setProperties.DrawStyle[i].onclick(x, y))
                    break;
}

function on_mouse_lbtn_up(x, y, mask) {
    if (!prop.Edit.Start) {
        drag = false;
    }
    else if (Buttons.CurrentButton)
        Buttons.on_mouse_lbtn_up(x, y);
    Buttons.resetFlag();
}

function on_mouse_lbtn_dblclk(x, y, mask) {
    if (prop.Edit.Start) on_mouse_lbtn_down(x, y, mask);
    else
        for (var i = disp.top, j = disp.bottom; i <= j; i++)
            if (LyricShow.setProperties.DrawStyle[i].onclick(x, y))
                break;
}

function on_mouse_mbtn_down(x, y, mask) {
    if (prop.Edit.Start) Edit.switchView();
    else if (lyric) Edit.start();
}

function on_mouse_mbtn_dblclk(x, y, mask) {
    on_mouse_mbtn_down(x, y, mask);
}

function on_mouse_wheel(step) {
    if (!prop.Edit.Start) {
        applyDelta(step * 20);
    }
    else if (!Lock) {
        if (!prop.Edit.View) {
            if (step == 1) // wheel up
                Edit.undo();
            else if (step == -1) // wheel down
                Edit.moveNextLine();
        }
        else {
            var i = lyric.i - 1 - step;
            if (i < lyric.text.length && i >= 0)
                LyricShow.setProperties.DrawStyle[i].doCommand();
        }
    }
}

function on_mouse_rbtn_up(x, y, mask) {
    if (mask == 4) // Shift key
        return;
    else {
        !Lock && Menu.show(x, y);
        return true; // prevent default menu
    }
}

function on_key_down(vkey) {
    if (!prop.Edit.Start) {
        switch (vkey) {
            case 38: // Up
                applyDelta(20);
                break;
            case 40: // Down
                applyDelta(-20);
                break;
        }
    }
    else if (!Lock) {
        switch (vkey) {
            case 13: // Enter
                !prop.Edit.View && Edit.moveNextLine();
                break;
            case 16: // Shift
                !on_key_down.Shift && (on_key_down.Shift = true)
                break;
            case 33: // Page Up
                if (!prop.Edit.View) {
                    Edit.undo();
                }
                break;
            case 38:
                if (on_key_down.Shift) Edit.offsetTime(5);
                else Edit.adjustTime(-5);
                break;
            case 40:
                if (on_key_down.Shift) Edit.offsetTime(-5);
                else Edit.adjustTime(5);
                break;
        }
    }

}

function on_key_up(vkey) {
    if (vkey === 16)
        on_key_down.Shift = false;
}

function on_notify_data(name, info) {
    name == scriptName && main();
}

//EOF