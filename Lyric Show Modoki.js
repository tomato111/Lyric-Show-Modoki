//## code for foo_uie_wsh_mod v1.5.0 or higher  ####//
//## Please check off "Grab Focus" and "Delay Load" ##//

// ==PREPROCESSOR==
// @name "Lyric Show Modoki"
// @version "1.4.3"
// @author "tomato111"
// @import "%fb2k_profile_path%import\common\lib.js"
// ==/PREPROCESSOR==
/// <reference path="lib.js"/>


//============================================
//== Global Variable and Function =====================
//============================================
// user reserved words
var plugins, lyric, parse_path, path, directory, filename, basename, filetype, dateLastModified, dateCreated, dataSize, charset, offsetinfo, backalpha
, offsetY, fixY, moveY, lineY, drag, drag_y, g_x, g_y, ww, wh, larea_seek, rarea_seek, seek_width, rarea_seek_x, arc_w, arc_h, ignore_remainder, Lock, Lock_MiddleButton, movable, jumpY
, Left_Center, Center_Left, Center_Right, Right_Center, centerleftX, TextHeight, TextHeightWithoutLPadding, BackgroundImg, isM4A
, prop, LyricShow, Edit, Buttons, StatusBar, Keybind, Menu, Messages, Label;

var fs = new ActiveXObject("Scripting.FileSystemObject"); // File System Object
var ws = new ActiveXObject("WScript.Shell"); // WScript Shell Object
var Trace = new TraceLog();
var scriptName = "Lyric Show Modoki";
var scriptVersion = "1.4.3";
var scriptdir = fb.ProfilePath + "import\\" + scriptName + "\\";
var commondir = fb.ProfilePath + "import\\common\\";
var down_pos = {};
var disp = {};
var TextRender = gdi.CreateStyleTextRender();
var DT_LEFT = 0x00000000;
var DT_CENTER = 0x00000001;
var DT_RIGHT = 0x00000002;
var DT_WORDBREAK = 0x00000010;
var DT_NOPREFIX = 0x00000800;
var GDIPlus_LEFT = 0x00000000;
var GDIPlus_CENTER = 0x10000000;
var GDIPlus_RIGHT = 0x20000000;
var tagRe = /\[\d\d:\d\d[.:]\d\d\]/;
var alltagsRe = /\[\d\d:\d\d[.:]\d\d\]/g;
var timeRe = /\[(\d\d):(\d\d)[.:](\d\d)\]/;
var firstRe = /^\[00:00[.:]00\]/;
var m4aRE = /^m4a$/i;
var repeatRes = getRepeatRes(scriptdir + "repeat.txt", scriptdir + "repeat-default.txt");

//========
// properties
//========
prop = new function () {
    // ---- Removed Property
    window.SetProperty("Panel.Interval", null);
    window.SetProperty("Panel.Interval2", null);
    window.SetProperty("Panel.Keybind.LastUsedPlugin", null);
    window.SetProperty("Style.DrawingMethod", null);
    window.SetProperty("Panel.Keybind.ScrollUp", null);
    window.SetProperty("Panel.Keybind.ScrollDown", null);
    window.SetProperty("Panel.LRC.ScrollStartTime", null);
    // ----


    var defaultpath = ws.SpecialFolders.item("Desktop") + "\\$replace(%artist% - %title%,*,＊,?,？,/,／,:,：)";

    // ==Panel====
    this.Panel = {
        // Lyrics Folder
        Path: window.GetProperty("Panel.Path", defaultpath),
        PathFuzzyLevel: window.GetProperty("Panel.Path.FuzzyLevel", 0),
        Lang: window.GetProperty("Panel.Language", ""),
        Conf: window.GetProperty("Panel.HideConfigureMenu", false),
        Interval: 15, // Don't change
        Editor: window.GetProperty("Panel.ExternalEditor", ""),
        NoLyric: window.GetProperty("Panel.NoLyricsFound", "Title: %title%\\nArtist: %artist%\\nAlbum: %album%\\n\\n-no lyrics-"),
        Priority: window.GetProperty("Panel.Priority", "Sync_Tag,Sync_File,Unsync_Tag,Unsync_File"),
        Contain: window.GetProperty("Panel.LRC.ContainNormalLines", false),
        ScrollType: window.getProperty("Panel.LRC.ScrollType", 1),
        AlphaDurationTime: 30,
        ScrollDurationTime: window.getProperty("Panel.LRC.ScrollDurationTime", 141), // value*10 [ms]前からスクロール開始 // 3の倍数を推奨
        ScrollToCenter: window.getProperty("Panel.LRC.ScrollToCenter", false),
        BackgroundEnable: window.GetProperty("Panel.Background.Enable", true),
        BackgroundPath: window.GetProperty("Panel.Background.Image", "<embed>||$directory_path(%path%)\\*.*||'%fb2k_profile_path%'\\import\\Lyric Show Modoki\\background.jpg"),
        BackgroundRaw: window.GetProperty("Panel.Background.ImageToRawBitmap", false),
        BackgroundOption: window.GetProperty("Panel.Background.ImageOption", "20,50").split(/[ 　]*,[ 　]*/),
        BackgroundKAR: window.GetProperty("Panel.Background.KeepAspectRatio", true),
        BackgroundStretch: window.GetProperty("Panel.Background.Stretch", true),
        ExpandRepetition: window.GetProperty("Panel.ExpandRepetition", false),
        AdjustScrolling: window.GetProperty("Panel.AdjustScrolling", 100),
        SingleClickSeek: window.GetProperty("Panel.SingleClickSeek", false),
        AutoScroll: window.GetProperty("Panel.AutoScroll", true),
        RunInTheBackground: window.GetProperty("Panel.RunInTheBackground", false),
        Keybind:
        {
            SeekToNextLine: window.GetProperty("Panel.Keybind.SeekToNextLine", 88), // Default is 'X' Key
            SeekToPreviousLine: window.GetProperty("Panel.Keybind.SeekToPreviousLine", 65), // Default is 'A' Key
            SeekToPlayingLine: window.GetProperty("Panel.Keybind.SeekToPlayingLine", 83), // Default is 'S' Key
            SeekToTop: window.GetProperty("Panel.Keybind.SeekToTop", 69), // Default is 'E' Key
            SwitchAutoScroll: window.GetProperty("Panel.Keybind.SwitchAutoScroll", 90), // Default is 'Z' Key
            ScrollToPlayingLine: window.GetProperty("Panel.Keybind.ScrollToPlayingLine", 81), // Default is 'Q' Key
            Reload: window.GetProperty("Panel.Keybind.Reload", 82), // Default is 'R' Key
            Properties: window.GetProperty("Panel.Keybind.Properties", 80), // Default is 'P' Key
            GoogleSearch: window.GetProperty("Panel.Keybind.GoogleSearch", 71) // Default is 'G' Key
        }
    };

    if (!this.Panel.Path)
        window.SetProperty("Panel.Path", this.Panel.Path = defaultpath);

    if (typeof this.Panel.PathFuzzyLevel !== "number" || this.Panel.PathFuzzyLevel < 0 || this.Panel.PathFuzzyLevel > 2)
        window.SetProperty("Panel.Path.FuzzyLevel", this.Panel.PathFuzzyLevel = 0);

    if (!this.Panel.Priority)
        window.SetProperty("Panel.Priority", this.Panel.Priority = "Sync_Tag,Sync_File,Unsync_Tag,Unsync_File");
    this.Panel.Priority = this.Panel.Priority.split(/[ 　]*,[ 　]*/);

    if (!this.Panel.BackgroundOption || !(this.Panel.BackgroundOption instanceof Array) || this.Panel.BackgroundOption.length < 2) {
        window.SetProperty("Panel.Background.ImageOption", this.Panel.BackgroundOption = "20,50");
        this.Panel.BackgroundOption = this.Panel.BackgroundOption.split(/[ 　]*,[ 　]*/);
    }

    if (typeof this.Panel.AdjustScrolling !== "number" || this.Panel.AdjustScrolling < 0)
        window.SetProperty("Panel.AdjustScrolling", this.Panel.AdjustScrolling = 100);

    if (typeof this.Panel.ScrollType !== "number" || this.Panel.ScrollType < 1 || this.Panel.ScrollType > 5)
        window.SetProperty("Panel.LRC.ScrollType", this.Panel.ScrollType = 1);

    if (typeof this.Panel.ScrollDurationTime !== "number" || this.Panel.ScrollDurationTime < 3 || this.Panel.ScrollDurationTime > 300)
        window.SetProperty("Panel.LRC.ScrollDurationTime", this.Panel.ScrollDurationTime = 141);


    // ==Style====
    this.Style = {
        // Color Style. white, black, user is available
        CSLS: window.GetProperty("Style.ColorStyle.LyricShow", "black"),
        CSE: window.GetProperty("Style.ColorStyle.Edit", "white"),
        // Font Style
        Font_Family: window.GetProperty("Style.Font-Family", ""),
        Font_Size: window.GetProperty("Style.Font-Size", 13),
        Font_Bold: window.GetProperty("Style.Font-Bold", true),
        Font_Italic: window.GetProperty("Style.Font-Italic", false),
        Shadow: window.GetProperty("Style.Text-Shadow", true),
        ShadowPosition: window.GetProperty("Style.Text-ShadowPosition", "1,2"),
        TextRoundSize: window.GetProperty("Style.Text-RoundSize", 5),
        // Text Alignment
        Align: window.GetProperty("Style.Align", DT_CENTER),
        // Padding
        HPadding: window.GetProperty("Style.Horizontal-Padding", 5),
        VPadding: window.GetProperty("Style.Vartical-Padding", 4),
        LPadding: window.GetProperty("Style.Line-Padding", 1),
        Highline: window.GetProperty("Style.HighlineColor for unsynced lyrics", true),
        CenterPosition: window.GetProperty("Style.CenterPosition", 46),
        EnableStyleTextRender: window.GetProperty("Style.EnableStyleTextRender", false),
        DrawingMethod: 0
    };

    this.Style.CLS = { // define color of LyricShow
        white: {
            Text: RGB(70, 70, 70),                  // Normal Text color
            TextShadow: RGB(225, 225, 225),         // Text Shadow color
            TextRound: RGB(235, 235, 235),    // Text Round color (for StyleTextRender)
            Background: RGBA(245, 245, 245, 255),   // Background color
            PlayingText: RGB(215, 65, 100)          // Playing Text color
        },
        black: {
            Text: RGB(190, 190, 190),
            TextShadow: RGB(55, 55, 55),
            TextRound: RGB(65, 65, 65),
            Background: RGBA(76, 76, 76, 255),
            PlayingText: RGB(255, 142, 196)
        },
        user: {
            Text: eval(window.GetProperty("Style.User.LyricShow.Text", "RGB(190, 190, 190)")),
            TextShadow: eval(window.GetProperty("Style.User.LyricShow.TextShadow", "RGB(55, 55, 55)")),
            TextRound: eval(window.GetProperty("Style.User.LyricShow.TextRound", "RGB(65, 65, 65)")),
            Background: eval(window.GetProperty("Style.User.LyricShow.Background", "RGBA(75, 75, 75, 255)")),
            PlayingText: eval(window.GetProperty("Style.User.LyricShow.PlayingText", "RGB(255, 142, 196)"))
        }
    };

    this.Style.CE = { // define color of Edit
        white: {
            Text: RGB(80, 80, 80),                          // Text color
            Background: RGBA(255, 255, 255, 255),           // Background color
            ViewBackground: RGBA(193, 219, 252, 80),        // Bacground color of ViewMode
            Line: RGBA(193, 219, 252, 200),                 // Bacground color of playing line
            Rule: RGBA(0, 0, 0, 40),                        // Ruled line color
            Length: RGB(100, 100, 100),                     // Number of line
            Seek: RGBA(255, 0, 0, 28),                      // Seek area color
            Arrow_img: gdi.Image(scriptdir + "seekb.png"),  // Arrow image
            ArrowOpacity: 120                               // Aroow image opacity
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

    // set DrawingMethod
    if (this.Style.EnableStyleTextRender)
        this.Style.DrawingMethod = 2;
    else if (this.Panel.ScrollType < 4)
        this.Style.DrawingMethod = 0;
    else
        this.Style.DrawingMethod = 1;

    // check Align
    if (typeof this.Style.Align != "number" || this.Style.Align < 0x00000000 || this.Style.Align > 0x00000006)
        window.SetProperty("Style.Align", this.Style.Align = DT_CENTER);

    // check Font and Set Style.Font
    var fontfamily = ["Meiryo", "Tahoma", "Arial", "Segoe UI", "MS Gothic"];

    fontfamily.unshift(this.Style.Font_Family);
    for (i = 0; i < fontfamily.length; i++)
        if (utils.CheckFont(fontfamily[i])) {
            window.SetProperty("Style.Font-Family", this.Style.Font_Family = fontfamily[i]);
            break;
        }

    if (!this.Style.Font_Size || typeof this.Style.Font_Size != "number")
        window.SetProperty("Style.Font-Size", this.Style.Font_Size = 13);

    this.Style.Font = gdi.Font(this.Style.Font_Family, this.Style.Font_Size, (this.Style.Font_Bold ? 1 : 0) + (this.Style.Font_Italic ? 2 : 0));

    // check TextShadow
    if (!/^-?\d+?,-?\d+$/.test(this.Style.ShadowPosition))
        window.SetProperty("Style.Text-ShadowPosition", "1,2");

    this.Style.ShadowPosition = this.Style.ShadowPosition.split(",");
    this.Style.ShadowPosition[0] = Number(this.Style.ShadowPosition[0]);
    this.Style.ShadowPosition[1] = Number(this.Style.ShadowPosition[1]);

    if (typeof this.Style.TextRoundSize != "number" || this.Style.TextRoundSize < 0)
        window.SetProperty("Style.Text-RoundSize", this.Style.TextRoundSize = 5);

    // check CenterPosition
    if (typeof this.Style.CenterPosition != "number" || this.Style.CenterPosition < 0 || this.Style.CenterPosition > 100)
        window.SetProperty("Style.CenterPosition", this.Style.CenterPosition = 46);

    // check Padding
    if (typeof this.Style.HPadding != "number")
        window.SetProperty("Style.Horizontal-Padding", this.Style.HPadding = 5);

    if (typeof this.Style.VPadding != "number")
        window.SetProperty("Style.Vartical-Padding", this.Style.VPadding = 4);

    if (typeof this.Style.LPadding != "number")
        window.SetProperty("Style.Line-Padding", this.Style.LPadding = 1);

    // StatusBar setting
    this.Style.StatusBarFont = gdi.Font(this.Style.Font_Family, 12, 1);
    this.Style.StatusBarColor = RGB(220, 220, 220);
    this.Style.StatusBarBackground = RGBA(90, 90, 90, 255);
    this.Style.StatusBarRect = RGBA(200, 200, 200, 255);


    // ==Edit====
    this.Edit = {
        Rule: window.GetProperty("Edit.ShowRuledLine", true),
        Step: window.GetProperty("Edit.Step", 14),
        Start: false,
        View: false
    };

    if (!this.Edit.Step && typeof this.Edit.Step != "number" || this.Edit.Step < 0)
        window.SetProperty("Edit.Step", this.Edit.Step = 14);


    // ==Save====
    this.Save = {
        // Character Code. Unicode, Shift_JIS, EUC-JP, UTF-8, UTF-8N is available.
        CharacterCode: window.GetProperty("Save.CharacterCode", "UTF-8"),
        // Line Feed Code. CR+LF, CR, LF is available.
        LineFeedCode: window.GetProperty("Save.LineFeedCode", "CR+LF"),
        // Run command after save
        RunAfterSave: window.GetProperty("Save.RunAfterSave", ""),
        TimetagSign: window.GetProperty("Save.Timetag[12:34:56]", false),
        ClipbordAutoSaveTo: window.GetProperty("Save.GetClipbord.AutoSaveTo", ""),
        iTunesMode: window.GetProperty("Save.iTunesMode", false)
    };

    if (!this.Save.CharacterCode || !/^(?:Unicode|Shift_JIS|EUC-JP|UTF-8|UTF-8N)$/i.test(this.Save.CharacterCode))
        window.SetProperty("Save.CharacterCode", this.Save.CharacterCode = "UTF-8");
    if (!this.Save.LineFeedCode || !/^(?:CR\+LF|CR|LF)$/i.test(this.Save.LineFeedCode))
        window.SetProperty("Save.LineFeedCode", this.Save.LineFeedCode = "CR+LF");

    this.Save.LineFeedCode = this.Save.LineFeedCode.replaceEach("CR", "\r", "LF", "\n", "\\+", "", "i"); // Set converted code

    if (this.Save.RunAfterSave) this.Save.RunAfterSave = this.Save.RunAfterSave.split("||");

    this.Save.TimetagSign = this.Save.TimetagSign ? ":" : ".";

    if (!this.Save.ClipbordAutoSaveTo || !/^(?:File|Tag)$/i.test(this.Save.ClipbordAutoSaveTo))
        window.SetProperty("Save.GetClipbord.AutoSaveTo", this.Save.ClipbordAutoSaveTo = "");
};

//========
//  load language
//========

LanguageLoader = {

    Messages: {},
    Label: {},

    Load: function (objFSO, path) {

        function checkLang(lang) {
            for (var i = 0; i < definedLanguage.length; i++)
                if (lang === definedLanguage[i])
                    return true;
            return false;
        }

        var definedLanguage = [];
        var languages = utils.Glob(path + "*.ini").toArray();

        for (var i = 0; i < languages.length; i++) {
            definedLanguage.push(objFSO.GetBaseName(languages[i]));
        }

        if (!prop.Panel.Lang || !checkLang(prop.Panel.Lang)) { // get lang from environment variable. show propmt if it cannot get a available language,  
            var EnvLang = ws.Environment("USER").Item("LANG").substring(0, 2);
            if (!checkLang(EnvLang)) {
                EnvLang = prompt("Please input menu language.\n\"" + definedLanguage.join('", "') + "\" is available.", scriptName, "en");
                if (!checkLang(EnvLang))
                    EnvLang = "en";
            }
            window.SetProperty("Panel.Language", prop.Panel.Lang = EnvLang);
        }

        languages[0] = new Ini(path + "default", 'UTF-8');
        languages[1] = new Ini(path + prop.Panel.Lang + ".ini", 'UTF-8');

        if (!languages[0].items.hasOwnProperty("Message") || !languages[0].items.hasOwnProperty("Label"))
            throw new Error("Faild to load default language file. (" + scriptName + ")");
        if (!languages[1].items.hasOwnProperty("Message"))
            languages[1].items.Message = {};
        if (!languages[1].items.hasOwnProperty("Label"))
            languages[1].items.Label = {};

        var lang0 = languages[0].items.Message;
        var lang1 = languages[1].items.Message;

        this.Messages = {
            NotFound: new Message(lang1.NotFound || lang0.NotFound, scriptName, 48),
            FailedToOpen: new Message(lang1.FailedToOpen || lang0.FailedToOpen, scriptName, 48),
            SavedToTag: new Message(lang1.SavedToTag || lang0.SavedToTag, scriptName, 64),
            FailedToSaveLyricsToFile: new Message(lang1.FailedToSaveLyricsToFile || lang0.FailedToSaveLyricsToFile, scriptName, 48),
            Saved: new Message(lang1.Saved || lang0.Saved, scriptName, 64),
            FailedToDelete: new Message(lang1.FailedToDelete || lang0.FailedToDelete, scriptName, 48),
            Delete: new Message(lang1.Delete || lang0.Delete, scriptName, 36),
            Deleted: new Message(lang1.Deleted || lang0.Deleted, scriptName, 64),
            FailedToSaveLyricsToTag: new Message(lang1.FailedToSaveLyricsToTag || lang0.FailedToSaveLyricsToTag, scriptName, 48),
            FailedToReadText: new Message(lang1.FailedToReadText || lang0.FailedToReadText, scriptName, 48),
            GetClipboard: new Message(lang1.GetClipboard || lang0.GetClipboard, scriptName, 48)
        };

        lang0 = languages[0].items.Label;
        lang1 = languages[1].items.Label;

        for (var name in lang0) {
            this.Label[name] = lang1[name] || lang0[name];
        }
    },
    Dispose: function () { delete LanguageLoader; }
};

LanguageLoader.Load(fs, scriptdir + "language\\");
Messages = LanguageLoader.Messages;
Label = LanguageLoader.Label;

//=========
// load plugins
//=========

PluginLoader = {

    Plugins: {},

    Load: function (objFSO, path) {
        var f, fc, item, stm, str, i = 0;
        var jsRE = /\.js$/i;

        try {
            f = objFSO.GetFolder(path);
        } catch (e) { throw new Error("The path to a plugins folder is wrong. (" + scriptName + ")"); }

        fc = new Enumerator(f.Files);

        for (; !fc.atEnd() ; fc.moveNext()) {
            if (!jsRE.test(fc.item().Name)) continue;
            try {
                str = readTextFile(fc.item().Path);
            } catch (e) { continue; }
            try {
                item = eval(str);
            } catch (e) {
                fb.trace(fc.item().Name + " is SyntaxError. (" + scriptName + ")");
                continue;
            }
            this.Plugins[item.name] = item;
        }
    },
    Dispose: function () { delete PluginLoader; }
};

PluginLoader.Load(fs, scriptdir + "plugins\\");
plugins = PluginLoader.Plugins;

//=======
// release Object
//=======

LanguageLoader.Dispose();
PluginLoader.Dispose();
ws = null;

//=======
//  function
//=======

function getRepeatRes(userfile, defaultfile) {

    var file = fs.FileExists(userfile) ? userfile : defaultfile;

    try {
        return eval("[" + readTextFile(file, 'UTF-8') + "]");
    } catch (e) {
        console("faild to load \"repeat.txt\" or \"repeat-default.txt\" (" + scriptName + ")");
        return;
    }
}

function setRGBdiff(color, dr, dg, db) {

    return RGB(getRed(color) + dr, getGreen(color) + dg, getBlue(color) + db);
}

function set_align() {

    Left_Center = Center_Left = Center_Right = Right_Center = false;

    switch (window.GetProperty("Style.Align", DT_CENTER)) {
        case 0x00000000:
            prop.Style.Align = prop.Style.DrawingMethod === 0 ? DT_LEFT | DT_NOPREFIX : GDIPlus_LEFT;
            prop.Edit.Align = DT_LEFT | DT_NOPREFIX | DT_WORDBREAK;
            break;
        case 0x00000001:
            prop.Style.Align = prop.Style.DrawingMethod === 0 ? DT_CENTER | DT_NOPREFIX : GDIPlus_CENTER;
            prop.Edit.Align = DT_CENTER | DT_NOPREFIX | DT_WORDBREAK;
            break;
        case 0x00000002:
            prop.Style.Align = prop.Style.DrawingMethod === 0 ? DT_RIGHT | DT_NOPREFIX : GDIPlus_RIGHT;
            prop.Edit.Align = DT_RIGHT | DT_NOPREFIX | DT_WORDBREAK;
            break;
        case 0x00000003:
            prop.Style.Align = prop.Style.DrawingMethod === 0 ? DT_LEFT | DT_NOPREFIX : GDIPlus_LEFT;
            Left_Center = true;
            prop.Edit.Align = DT_LEFT | DT_NOPREFIX | DT_WORDBREAK;
            break;
        case 0x00000004:
            prop.Style.Align = prop.Style.DrawingMethod === 0 ? DT_LEFT | DT_NOPREFIX : GDIPlus_LEFT;
            Center_Left = true;
            prop.Edit.Align = DT_LEFT | DT_NOPREFIX | DT_WORDBREAK;
            break;
        case 0x00000005:
            prop.Style.Align = prop.Style.DrawingMethod === 0 ? DT_RIGHT | DT_NOPREFIX : GDIPlus_RIGHT;
            Center_Right = true;
            prop.Edit.Align = DT_RIGHT | DT_NOPREFIX | DT_WORDBREAK;
            break;
        case 0x00000006:
            prop.Style.Align = prop.Style.DrawingMethod === 0 ? DT_RIGHT | DT_NOPREFIX : GDIPlus_RIGHT;
            Right_Center = true;
            prop.Edit.Align = DT_RIGHT | DT_NOPREFIX | DT_WORDBREAK;
            break;
    }

    RefreshDrawStyle();
}

function RefreshDrawStyle() {

    if (lyric) {
        LyricShow.setProperties.setWordbreakList();
        LyricShow.setProperties.setScrollSpeedList();
        LyricShow.setProperties.buildDrawStyle();
        LyricShow.set_on_paintInfo_x_w();
        ignore_remainder = true;
    }
}

function putTime(n, i) { // add timetag to i line

    var ms = n % 100; // ms +"0" [ms]
    var tmp = (n - ms) / 100;
    var s = tmp % 60;
    var m = (tmp - s) / 60;
    lyric.text[i] = "[" + doubleFig(m) + ":" + doubleFig(s) + prop.Save.TimetagSign + doubleFig(ms) + "]" + lyric.text[i];
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


    if (filetype === "lrc" && !withTag)
        for (var i = 0; i < textArray.length; i++)
            textArray[i] = textArray[i].replace(alltagsRe, "");

    text = textArray.join(LineFeedCode).trim();
    if (lyric.info.length)
        text = lyric.info.join(LineFeedCode) + LineFeedCode + text;

    setClipboard(text);
}

function getLyricFromClipboard() {

    var ws = new ActiveXObject("WScript.Shell");
    var text = getClipboard();
    if (text) {
        main(text);
        StatusBar.setText(Messages.GetClipboard.ret());
        StatusBar.show();
    }
    else
        Messages.FailedToReadText.popup();
}

function getFieldName(isEdit) {

    if (prop.Save.iTunesMode)
        var field = isM4A ? "LYRICS" : "UNSYNCED LYRICS";
    else
        field = (filetype === "lrc" || isEdit) ? "LYRICS" : "UNSYNCED LYRICS";
    return field;
}

function saveToTag(fieldname) {

    if (lyric && fieldname) {
        Lock = true;
        var meta = fb.GetNowPlaying();
        var LineFeedCode = prop.Save.LineFeedCode;
        var text = (lyric.info.length ? lyric.info.join(LineFeedCode) + LineFeedCode : "") + lyric.text.join(LineFeedCode).trim();
        try {
            writeTagField(text, fieldname, meta);
            StatusBar.setText(Messages.SavedToTag.ret('"' + fieldname + '"'));
            StatusBar.show();
            playSoundSimple(commondir + "finished.wav");
        } catch (e) {
            Messages.FailedToSaveLyricsToTag.popup("\n" + e.message);
        }
        meta.Dispose();
        Lock = false;
        (function () { main(); }).timeout(500);
    }
}

function saveToFile(file) {

    if (lyric && file) {
        Lock = true;
        var meta = fb.GetNowPlaying();
        var folder = fs.GetParentFolderName(file);
        var LineFeedCode = prop.Save.LineFeedCode;
        var text = (lyric.info.length ? lyric.info.join(LineFeedCode) + LineFeedCode : "") + lyric.text.join(LineFeedCode).trim();
        try {
            if (!fs.FolderExists(folder))
                createFolder(fs, folder);
            writeTextFile(text, file, prop.Save.CharacterCode);
            StatusBar.setText(Messages.Saved.ret(file));
            StatusBar.show();
            playSoundSimple(commondir + "finished.wav");
            FuncCommands(prop.Save.RunAfterSave, meta);
        } catch (e) {
            Messages.FailedToSaveLyricsToFile.popup("\n" + e.message);
        }
        meta.Dispose();
        Lock = false;
        main();
    }
}

function applyDelta(delta) {

    if (delta === 0 || (filetype === "lrc" && (prop.Panel.ScrollType === 4 || prop.Panel.ScrollType === 5)))
        return;

    var temp = offsetY + delta;

    if (temp >= fixY) {
        offsetY = fixY;
    }
    else if (temp <= LyricShow.setProperties.minOffsetY) {
        offsetY = LyricShow.setProperties.minOffsetY;
        movable && (movable = false);
        !ignore_remainder && (ignore_remainder = true);
    }
    else {
        offsetY = temp;
        prop.Panel.AutoScroll && !movable && (movable = true);
    }

    window.Repaint();
}

function seekLineTo(i) {

    if (prop.Edit.View || (!prop.Edit.Start && filetype === "lrc")) {

        var n = lyric.i + i;
        if (n > lyric.text.length)
            n = lyric.i;
        else if (n < 1)
            n = 1;

        if (!prop.Edit.Start)
            jumpY = offsetY;

        LyricShow.setProperties.DrawStyle[n - 1].doCommand(); // lyric.i は対象行なのでn-1がシーク先の行
    }
}


//===========================================
//== Create "LyricShow" Object ======================
//===========================================

LyricShow = new function (Style) {

    var p;
    var Files_Collection = {};
    var directoryRe = /.+\\/;
    var extensionRe = /^lrc|txt$/i;
    var FuzzyRE = ["", /[ 　]/g, /\(.*?\)/g];
    var BackgroundPath, BackgroundSize;
    var BackOption = prop.Panel.BackgroundOption;

    this.init = function () {

        prop.Edit.Start && Edit.end();
        this.end();
        offsetY = fixY;
    };

    this.initWithFile = function (file, IsSpecifiedPath) {

        var str, arr, exp;

        L:
            {
                for (var i = 0; i < prop.Panel.PathFuzzyLevel + 1; i++) { // Fuzzy Search
                    switch (i) {
                        case 0:
                            try {
                                var f = fs.GetFile(file);
                                break L;
                            } catch (e) { }
                            break;
                        case 1:
                            try {
                                // create File Collection
                                if (!Files_Collection[directory] || Files_Collection[directory].DateLastModified != String(fs.GetFolder(directory).DateLastModified)) {
                                    Files_Collection[directory] = [];
                                    Files_Collection[directory].DateLastModified = String(fs.GetFolder(directory).DateLastModified);
                                    arr = utils.Glob(directory + "*.*").toArray(); // fs.GetFolder(directory).Files でのコレクション処理は各アイテムのプロパティアクセスが遅すぎる. 代わりにutils.Glob()を使う
                                    for (var j = 0; j < arr.length; j++) {
                                        if (extensionRe.test(fs.GetExtensionName(arr[j]))) {
                                            exp = fs.GetFileName(arr[j]).replace(FuzzyRE[i], "").toLowerCase();
                                            Files_Collection[directory].push({ Name1: exp, Name2: exp.replace(FuzzyRE[i + 1], ""), Path: arr[j] });
                                        }
                                    }
                                } // create File Collection END

                                exp = fs.GetFileName(file).replace(FuzzyRE[i], "").toLowerCase();

                                for (j = 0; j < Files_Collection[directory].length; j++) {
                                    if (Files_Collection[directory][j].Name1 == exp) {
                                        file = Files_Collection[directory][j].Path;
                                        f = fs.GetFile(file);
                                        break L;
                                    }
                                }
                            } catch (e) { }
                            break;
                        case 2:
                            try {
                                exp = exp.replace(FuzzyRE[i], "");

                                for (j = 0; j < Files_Collection[directory].length; j++) {
                                    if (Files_Collection[directory][j].Name2 == exp) {
                                        file = Files_Collection[directory][j].Path;
                                        f = fs.GetFile(file);
                                        break L;
                                    }
                                }
                            } catch (e) { }
                            break;
                    } // switch END

                } // for END
            } // Label END

        if (!f) return;

        try {
            str = readTextFile(file);
        } catch (e) {
            Messages.FailedToOpen.popup();
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
        charset = readTextFile.lastCharset;
        if (!IsSpecifiedPath)
            parse_path = directory + "\\" + basename;
        return str;
    };

    this.initWithTag = function (tag) {

        try {
            var MetadbHandle = fb.GetNowPlaying();
            var FileInfo = MetadbHandle.GetFileInfo();
        } catch (e) {
            return;
        } finally { MetadbHandle && MetadbHandle.Dispose() }

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
        directory = parse_path.match(directoryRe)[0];

        return str;
    };

    this.readLyric = function (file, IsSpecifiedPath) {

        var str, isSync;

        if (/^(?:LYRICS|UNSYNCED LYRICS)$/.test(file)) {
            if (!(str = this.initWithTag(file))) return;
        }
        else if (/^(?:[a-z]:|\\)\\.+\.(?:lrc|txt)$/i.test(file)) {
            if (!(str = this.initWithFile(file, IsSpecifiedPath))) return;
        }
        else {
            if (!file || !parse_path) return; // 条件を満たす曲をスキップするようなコンポを入れているとparse_pathがなぜか空になってエラーを起こすので回避
            str = file;
            basename = "Temporary Text";
            filetype = "txt";
            directory = parse_path.match(directoryRe)[0];
        }


        isSync = tagRe.test(str);

        if (filetype === "lrc" && !isSync) // check
            filetype = "txt";
        else if (filetype === "txt" && isSync)
            filetype = "lrc";

        lyric = { text: str.trim().split(getLineFeedCode(str)), i: 1, info: [] };


        if (filetype === "lrc") { // analyze lrc
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
                        offset = offsetinfo = Number(RegExp.$1);

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
                // fb.trace(i + " :: " + tmpArray[timeArray[i]] + " :: " + timeArray[i] + " :: " + ms);

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

            this.trimLine_TopAndBottom(true);
        }

        else { // analyze "no lrc"
            if (prop.Panel.ExpandRepetition && repeatRes) { // Expand Repetition
                var temp;
                for (i = 0; i < lyric.text.length; i++) {
                    Li:
                        { // start label
                            for (j = 0; j < repeatRes.length; j++) {
                                if (!repeatRes[j].e.length && repeatRes[j].a.test(lyric.text[i])) { // put lyrics for repeats
                                    // console("put i:" + i + ", " + lyric.text[i]);
                                    for (k = i; k < lyric.text.length; k++) {
                                        if (k === i && repeatRes[j].d > 0)
                                            repeatRes[j].e.push(lyric.text[k].slice(repeatRes[j].d));
                                        else
                                            repeatRes[j].e.push(lyric.text[k]);

                                        if (repeatRes[j].b.test(lyric.text[k]))
                                            break;
                                    }

                                    // console("fin k:" + k + ", " + lyric.text[k]);
                                    for (; ;) // trim
                                        if (repeatRes[j].e[0] == "")
                                            repeatRes[j].e.shift();
                                        else if (repeatRes[j].e[repeatRes[j].e.length - 1] == "")
                                            repeatRes[j].e.pop();
                                        else
                                            break;
                                    i = k;
                                    break Li;
                                }
                                else if (repeatRes[j].c.test(lyric.text[i])) { // replace lyric for repeats
                                    // console("before i:" + i + ", " + lyric.text[i]);
                                    repeatRes[j].e.unshift(lyric.text.length - i);
                                    repeatRes[j].e.unshift(i);
                                    temp = Array.prototype.splice.apply(lyric.text, repeatRes[j].e) // splice は配列を展開しないで挿入するので、範囲を含めた配列にし(上2行)、applyで展開させて渡す
                                    temp.shift();
                                    lyric.text = lyric.text.concat(temp);
                                    // console("after i:" + i + ", " + lyric.text[i]);
                                    repeatRes[j].e.shift();
                                    repeatRes[j].e.shift();
                                    i += repeatRes[j].e.length - 1;
                                }
                            }
                        } // label END 
                }
            }

            this.trimLine_TopAndBottom();
        }

        return true;
    };

    this.trimLine_TopAndBottom = function (withTag) {

        var text = lyric.text;

        if (withTag) {
            if (!firstRe.test(text[0]))
                text.unshift("[00:00" + prop.Save.TimetagSign + "00]");
        }
        else {
            text.unshift("");
            text.push("");

            for (; ;)
                if (text[1] == "")
                    text.splice(1, 1);
                else break;

            for (; ;)
                if (text[text.length - 2] == "")
                    text.splice(text.length - 2, 1);
                else break;
        }
    };

    this.setProperties = {
        setLineList: function (View) {

            if (filetype === "lrc" || View) {
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

            var isLRC = filetype === "lrc";
            var contain = isLRC && prop.Panel.Contain;
            var wre = new RegExp(prop.Save.LineFeedCode, "g");
            var leftcenterX = ww;
            var c_ww = Center_Left || Center_Right ? ww - centerleftX + g_x : ww;
            var wreres;
            var line_arr, space, str, gdi_diff;

            var numOfWordbreak = 0;
            var wordbreakList = [];
            var wordbreakText = [];

            var temp_text;
            var temp_bmp = gdi.CreateImage(1, 1);
            var temp_gr = temp_bmp.GetGraphics();

            ///// GDI /////
            if (Style.DrawingMethod === 0 || View) {

                TextHeightWithoutLPadding = temp_gr.CalcTextHeight("Test", Style.Font);
                TextHeight = TextHeightWithoutLPadding + Style.LPadding;

                if (View) {
                    for (var i = 0; i < lyric.text.length; i++) {
                        wordbreakList[i] = Math.floor(temp_gr.CalcTextWidth(lyric.text[i].replace(alltagsRe, "") + "[00:00.00] ", Style.Font) / ww) + 1;
                        if (contain) {
                            wreres = lyric.text[i].match(wre);
                            if (wreres) wordbreakList[i] += wreres.length;
                        }
                        numOfWordbreak += wordbreakList[i] - 1;
                    }
                }
                else {
                    for (i = 0; i < lyric.text.length; i++) {
                        str = "";
                        line_arr = temp_gr.EstimateLineWrap(isLRC ? lyric.text[i].replace(alltagsRe, "") : lyric.text[i], Style.Font, c_ww).toArray();
                        wordbreakList[i] = line_arr.length / 2;
                        numOfWordbreak += wordbreakList[i] - 1;

                        for (var j = 0; j < line_arr.length; j += 2) {
                            if ((Left_Center || Right_Center) && leftcenterX)
                                if ((space = ww - line_arr[j + 1]) <= 0)
                                    leftcenterX = 0;
                                else if (space / 2 < leftcenterX)
                                    leftcenterX = space / 2;

                            if (str) str += prop.Save.LineFeedCode;
                            str += line_arr[j].trim();
                        }

                        wordbreakText[i] = str;
                    }

                    this.leftcenterX = Number(leftcenterX) + g_x; // Set offsetX for left-center
                }
            }
                ///// GDI+ /////
            else {

                TextHeightWithoutLPadding = temp_gr.MeasureString("Test", Style.Font, 0, 0, ww * 10, wh, 0).Height;
                TextHeight = TextHeightWithoutLPadding + Style.LPadding;

                for (i = 0; i < lyric.text.length; i++) {
                    str = "";

                    temp_text = isLRC ? lyric.text[i].replace(alltagsRe, "") : lyric.text[i];

                    if (temp_text)
                        gdi_diff = temp_gr.CalcTextWidth(temp_text, Style.Font) - Math.ceil(temp_gr.MeasureString(temp_text, Style.Font, 0, 0, ww * 10, wh, 0).Width); // gr.EstimateLineWrap() はGDI用なのでGDI+とのサイズ差を補正して利用する
                    else
                        gdi_diff = 0;

                    line_arr = temp_gr.EstimateLineWrap(temp_text, Style.Font, c_ww + gdi_diff).toArray();
                    wordbreakList[i] = line_arr.length / 2;
                    numOfWordbreak += wordbreakList[i] - 1;

                    for (j = 0; j < line_arr.length; j += 2) {
                        if ((Left_Center || Right_Center) && leftcenterX)
                            if ((space = ww - line_arr[j + 1]) <= 0)
                                leftcenterX = 0;
                            else if (space / 2 < leftcenterX)
                                leftcenterX = space / 2;

                        if (str) str += prop.Save.LineFeedCode;
                        str += line_arr[j].trim();
                    }

                    wordbreakText[i] = str;
                }

                this.leftcenterX = Number(leftcenterX) + g_x; // Set offsetX for left-center
            }

            this.numOfWordbreak = numOfWordbreak; // Set number Of wordbreak
            this.wordbreakList = wordbreakList; // Set Wordbreak List
            this.wordbreakText = wordbreakText; // Set Wordbreak Text

            temp_bmp.ReleaseGraphics(temp_gr);
            temp_bmp.Dispose();
            temp_gr = null;
            temp_bmp = null;
        },

        setScrollSpeedList: function () {

            var scrollSpeedList = [], scrollSpeedType2List = [];
            var lineList = this.lineList;
            var h, t, n, interval;

            this.h = 0; // 1ファイルの高さ // ワードブレイク時の行間にLPaddingは入らないのでwordbreakListを参照して計算した後に足し込んでいく
            for (var i = 0; i < lyric.text.length - 1; i++) { // 条件の-1は最後の行の高さを無視するため
                this.h += Math.ceil(this.wordbreakList[i] * TextHeightWithoutLPadding + Style.LPadding); // 行の高さ
            }

            this.minOffsetY = fixY - this.h; // オフセットYの最小値

            if (lineList) {
                interval = Math.max(1, prop.Style.DrawingMethod) * prop.Panel.Interval; // DrawingMethod == 2 では処理が追いつかないためintervalを2倍する // もちろんタイマー作動時も2倍にする
                for (i = 0; i < lineList.length; i++) {
                    h = Math.ceil(this.wordbreakList[i] * TextHeightWithoutLPadding + Style.LPadding); // 行の高さ
                    t = (lineList[i + 1] - lineList[i]) * 10 || 1; // 次の行までの時間[ms] // Infinity 対策で最小値を1にする
                    n = Math.floor(t / interval); // 更新可能回数
                    t = n * interval || 1; // 次の行までの時間を更新可能回数を考慮した時間に変換する // 変換した時間を基準に移動量を計算
                    scrollSpeedList[i] = h / t * interval; // 1回の更新での移動量(行ごとに変化する)
                    scrollSpeedType2List[i] = t >= prop.Panel.ScrollDurationTime * 10 ? h / (prop.Panel.ScrollDurationTime * 10) * interval : null; // Panel.ScrollType == 2 での1回の更新の移動量. スクロール開始は(prop.Panel.ScrollDurationTime*10)ミリ秒前.
                    if (scrollSpeedList[i] > h) // 1回の更新で行の高さを超える移動量となった場合はスキップ
                        scrollSpeedList[i] = h;
                }
                scrollSpeedList[i - 1] = scrollSpeedType2List[i - 1] = 0; // 最後の行の移動量は0
            } else {
                t = fb.PlaybackLength * 1000 / prop.Panel.Interval; // 1ファイルで更新する回数
                scrollSpeedList = { degree: this.h / t }; // 1回の更新での移動量(行に依らず一定)
                scrollSpeedList.degree *= prop.Panel.AdjustScrolling / 100;
            }

            this.scrollSpeedList = scrollSpeedList; // Set ScrollSpeed List
            this.scrollSpeedType2List = scrollSpeedType2List; // Set ScrollSpeed Type2 List
        },

        buildDrawStyle: function () {

            var p = LyricShow.setProperties;
            var isLRC = filetype === "lrc";
            var Count_ContainString = 0;

            var DrawStyle = { "-1": { y: 0, height: 0, nextY: 0 } };
            for (var i = 0; i < lyric.text.length; i++)
                DrawStyle[i] = new DrawString(i, isLRC);

            this.DrawStyle = DrawStyle; // build DrawStyle.

            // Constructor
            function DrawString(i, isLRC) {
                this.i = i;
                this.p = p;

                this.text = prop.Edit.Start ? lyric.text[i] : p.wordbreakText[i];
                this.y = DrawStyle[i - 1].nextY;
                this.height = Math.ceil(p.wordbreakList[i] * TextHeightWithoutLPadding + Style.LPadding);
                this.nextY = this.y + this.height;
                this.time = p.lineList ? p.lineList[i] / 100 : null;

                if (isLRC) {
                    if (this.text != "")
                        this.isEvenNum = Count_ContainString++ % 2 === 0;

                    this.speed = p.scrollSpeedList[i];
                    this.speedType2 = p.scrollSpeedType2List[i];

                    if (!this.speedType2 && i !== lyric.text.length - 1) { // 現在の行が prop.Panel.ScrollDurationTime * 10 以上の時間を持つか判別して speedType3 を作成 // 前の行の高さを移動するので再計算している
                        var h = DrawStyle[i - 1].height;
                        var t = (p.lineList[i + 1] - p.lineList[i]) * 10 || 1; // Infinity 対策で最小値を1にする
                        this.speedType3 = h / t * prop.Panel.Interval * Math.max(1, prop.Style.DrawingMethod);
                    }
                    else { // 最終行もこちらに分岐 // 前の行の高さを移動するので再計算している
                        h = DrawStyle[i - 1].height;
                        t = prop.Panel.ScrollDurationTime * 10;
                        this.speedType3 = h / t * prop.Panel.Interval * Math.max(1, prop.Style.DrawingMethod);
                        if (i === lyric.text.length - 1)
                            this.speedType3EOL = this.speedType3;
                    }
                } else
                    this.speed = p.scrollSpeedList.degree;

                this.cy = this.y + g_y; // Coordinate including Vartical-Padding
                this.sy = this.cy + prop.Style.ShadowPosition[1]; // shadow y position // Coordinate including Vartical-Padding
                this.nextCY = this.nextY + g_y; // Coordinate including Vartical-Padding

            }
            DrawString.prototype.scroll_0 = function (time) { // for unsynced lyrics
                if (!movable) return;

                offsetY -= this.speed;
                moveY += this.speed;

                if (moveY >= 1) {
                    moveY -= Math.floor(moveY);
                    return true; // refresh flag
                }
                // fb.trace(this.i + " :: " + this.height + " :: " + this.speed + " :: " + offsetY + " :: " + lyric.text.length + " :: " + time + " > " + LyricShow.setProperties.DrawStyle[this.i + 1].time * 100)
            };
            DrawString.prototype.scroll_1 = function (time) { // for synced lyrics
                if (movable) {
                    if (lineY < this.height) { // 移動許可範囲の設定
                        offsetY -= this.speed;
                        moveY += this.speed;
                        lineY += this.speed;
                    }

                    if (time >= this.p.lineList[this.i + 1]) {
                        !ignore_remainder && this.fix_offset(this.height, lineY);
                        ignore_remainder && (ignore_remainder = false); // 誤差補正の無効は一度だけ
                        moveY = lineY = 0;
                        lyric.i++;
                        return true; // refresh flag
                    }
                    else if (moveY >= 1) {
                        moveY -= Math.floor(moveY);
                        return true; // refresh flag
                    }
                }
                else if (time >= this.p.lineList[this.i + 1]) {
                    moveY = lineY = 0;
                    lyric.i++;
                    return true; // refresh flag
                }
                // fb.trace(this.i + " :: " + this.height + " :: " + this.speed + " :: " + offsetY + " :: " + lyric.text.length + " :: " + time + " > " + LyricShow.setProperties.DrawStyle[this.i + 1].time * 100)
            };
            DrawString.prototype.scroll_2 = function (time) { // for synced lyrics
                if (movable) {
                    if (lineY < this.height) { // 移動許可範囲の設定
                        if (this.speedType2) {
                            if (this.p.lineList[this.i + 1] - time <= prop.Panel.ScrollDurationTime) {
                                offsetY -= this.speedType2;
                                moveY += this.speedType2;
                                lineY += this.speedType2;
                            }
                        }
                        else {
                            offsetY -= this.speed;
                            moveY += this.speed;
                            lineY += this.speed;
                        }
                    }

                    if (time >= this.p.lineList[this.i + 1]) {
                        !ignore_remainder && this.fix_offset(this.height, lineY);
                        ignore_remainder && (ignore_remainder = false);
                        moveY = lineY = 0;
                        lyric.i++;
                        return true; // refresh flag
                    }
                    else if (moveY >= 1) {
                        moveY -= Math.floor(moveY);
                        return true; // refresh flag
                    }
                }
                else if (time >= this.p.lineList[this.i + 1]) {
                    moveY = lineY = 0;
                    lyric.i++;
                    return true; // refresh flag
                }
                // fb.trace(this.i + " :: " + this.height + " :: " + this.speed + " :: " + offsetY + " :: " + lyric.text.length + " :: " + time + " > " + LyricShow.setProperties.DrawStyle[this.i + 1].time * 100)
            };
            DrawString.prototype.scroll_3 = function (time) { // for synced lyrics
                if (movable) {
                    if (lineY < this.p.DrawStyle[this.i - 1].height) { // 移動許可範囲の設定
                        offsetY -= this.speedType3;
                        moveY += this.speedType3;
                        lineY += this.speedType3;
                    }

                    if (time >= this.p.lineList[this.i + 1]) {
                        //console(this.p.DrawStyle[this.i - 1].height + " h::i " + this.i + " :: " + this.text + " ::移動量 " + lineY + " ::補正値 " + (this.p.DrawStyle[this.i - 1].height - lineY).toFixed(15));
                        !ignore_remainder && this.fix_offset(this.p.DrawStyle[this.i - 1].height, lineY);
                        ignore_remainder && (ignore_remainder = false);
                        moveY = lineY = 0;
                        lyric.i++;
                        return true; // refresh flag
                    }
                    else if (moveY >= 1) {
                        moveY -= Math.floor(moveY);
                        return true; // refresh flag
                    }
                }
                else if (time >= this.p.lineList[this.i + 1]) {
                    moveY = lineY = 0;
                    lyric.i++;
                    return true; // refresh flag
                }
            };
            DrawString.prototype.scroll_4 = function (time) { // for synced lyrics
                var refresh;
                if (LyricShow.on_paintInfo.pl_alpha > 0)
                    if (this.p.lineList[this.i + 1] - time <= prop.Panel.AlphaDurationTime) {
                        LyricShow.on_paintInfo.pl_alpha -= 28; // 252の約数
                        refresh = true;
                    }

                if (this.i + 1 !== lyric.text.length)
                    if (LyricShow.on_paintInfo.l_alpha < 252 && time > this.p.lineList[this.i] + (this.p.lineList[this.i + 1] - this.p.lineList[this.i]) / 2.1) {
                        LyricShow.on_paintInfo.l_alpha += 28; // 252の約数
                        refresh = true;
                    }

                //--color--
                if (LyricShow.on_paintInfo.dpi < LyricShow.on_paintInfo.dpi_max) {
                    LyricShow.on_paintInfo.dpi++;
                    LyricShow.on_paintInfo.dpc = setRGBdiff(prop.Style.Color.Text, LyricShow.on_paintInfo.di[0] * LyricShow.on_paintInfo.dpi, LyricShow.on_paintInfo.di[1] * LyricShow.on_paintInfo.dpi, LyricShow.on_paintInfo.di[2] * LyricShow.on_paintInfo.dpi);
                    refresh = true;
                }
                //----

                if (time >= this.p.lineList[this.i + 1]) {
                    LyricShow.on_paintInfo.l_alpha = typeof this.p.DrawStyle[this.i + 1].isEvenNum === "undefined" ? 252 : 0;
                    LyricShow.on_paintInfo.pl_alpha = 252;
                    LyricShow.on_paintInfo.dpi = 0;
                    LyricShow.on_paintInfo.dpc = prop.Style.Color.Text;
                    lyric.i++;
                    return true; // refresh flag
                }
                else if (refresh) {
                    return true; // refresh flag
                }
            };
            DrawString.prototype.scroll_5 = function (time) { // for synced lyrics
                var refresh;
                if (LyricShow.on_paintInfo.pl_alpha > 0)
                    if (this.p.lineList[this.i + 1] - time <= prop.Panel.AlphaDurationTime * 3) {
                        LyricShow.on_paintInfo.pl_alpha -= 42; // 252の約数
                        refresh = true;
                    }

                if (this.i + 1 !== lyric.text.length)
                    if (LyricShow.on_paintInfo.l_alpha < 252 && this.p.lineList[this.i + 1] - time <= prop.Panel.AlphaDurationTime * 3) {
                        LyricShow.on_paintInfo.l_alpha += 42; // 252の約数
                        refresh = true;
                    }

                //--color--
                if (LyricShow.on_paintInfo.dpi < LyricShow.on_paintInfo.dpi_max) {
                    LyricShow.on_paintInfo.dpi++;
                    LyricShow.on_paintInfo.dpc = setRGBdiff(prop.Style.Color.Text, LyricShow.on_paintInfo.di[0] * LyricShow.on_paintInfo.dpi, LyricShow.on_paintInfo.di[1] * LyricShow.on_paintInfo.dpi, LyricShow.on_paintInfo.di[2] * LyricShow.on_paintInfo.dpi);
                    refresh = true;
                }
                //----

                if (time >= this.p.lineList[this.i + 1]) {
                    LyricShow.on_paintInfo.l_alpha = typeof this.p.DrawStyle[this.i + 1].isEvenNum === "undefined" ? 252 : 0;
                    LyricShow.on_paintInfo.pl_alpha = 252;
                    LyricShow.on_paintInfo.dpi = 0;
                    LyricShow.on_paintInfo.dpc = prop.Style.Color.Text;
                    lyric.i++;
                    return true; // refresh flag
                }
                else if (refresh) {
                    return true; // refresh flag
                }
            };
            DrawString.prototype.fix_offset = function (height, lineY) { // fix remainder
                var n = prop.Style.DrawingMethod === 2 ? 0.49 : 100;
                var diff = height - lineY;
                //console(diff);
                if (Math.abs(diff) <= n)
                    offsetY = Math.round(offsetY - diff);
                else if (diff > n)
                    offsetY = Math.round(offsetY - n);
                else
                    offsetY = Math.round(offsetY + n);
            };
            DrawString.prototype.draw_Edit = function (gr, text, color, x, w, align) {
                try {
                    gr.GdiDrawText(text, Style.Font, color, x, this.cy + offsetY, w, this.height, align);
                } catch (e) { }
            };
            DrawString.prototype.draw = function (gr, text, color, x, w) {
                switch (Style.DrawingMethod) {
                    case 0:
                        gr.GdiDrawText(text, Style.Font, color, x, this.cy + Math.ceil(offsetY), w, this.height, Style.Align);
                        break;
                    case 1:
                        gr.DrawString(text, Style.Font, color, x, this.cy + Math.ceil(offsetY), w, this.height, Style.Align);
                        break;
                    case 2:
                        TextRender.OutLineText(color, Style.Color.TextRound, 0);
                        TextRender.RenderStringRect(gr, text, Style.Font, x, this.cy + Math.ceil(offsetY), w, this.height, Style.Align);
                        break;
                }
            };
            DrawString.prototype.draw_withShadow = function (gr, text, color, x, w) {
                switch (Style.DrawingMethod) {
                    case 0:
                        gr.GdiDrawText(text, Style.Font, Style.Color.TextShadow, x + Style.ShadowPosition[0], this.sy + Math.ceil(offsetY), w, this.height, Style.Align);
                        gr.GdiDrawText(text, Style.Font, color, x, this.cy + Math.ceil(offsetY), w, this.height, Style.Align);
                        break;
                    case 1:
                        gr.DrawString(text, Style.Font, Style.Color.TextShadow, x + Style.ShadowPosition[0], this.sy + Math.ceil(offsetY), w, this.height, Style.Align);
                        gr.DrawString(text, Style.Font, color, x, this.cy + Math.ceil(offsetY), w, this.height, Style.Align);
                        break;
                    case 2:
                        //TextRender.DoubleOutLineText(color, Style.Color.TextShadow, RGBA(255, 255, 0, 30), 5, 5);
                        TextRender.OutLineText(color, Style.Color.TextRound, Style.TextRoundSize);
                        TextRender.RenderStringRect(gr, text, Style.Font, x, this.cy + Math.ceil(offsetY), w, this.height, Style.Align);
                        break;
                }
            };
            DrawString.prototype.draw_OneLine = function (gr, text, x, y, w) {
                var color = this.i === lyric.i - 1 ? LyricShow.on_paintInfo.dpc : Style.Color.Text;
                var alpha = this.i === lyric.i - 1 ? LyricShow.on_paintInfo.pl_alpha : LyricShow.on_paintInfo.l_alpha;
                switch (Style.DrawingMethod) { // Only GDI+
                    case 1:
                        gr.DrawString(text, Style.Font, setAlpha(color, alpha), x, y, w, this.height, Style.Align);
                        break;
                    case 2:
                        TextRender.OutLineText(setAlpha(color, alpha), setAlpha(Style.Color.TextRound, alpha), 0);
                        TextRender.RenderStringRect(gr, text, Style.Font, x, y, w, this.height, Style.Align);
                        break;
                }
            };
            DrawString.prototype.draw_OneLine_withShadow = function (gr, text, x, y, w) {
                var color = this.i === lyric.i - 1 ? LyricShow.on_paintInfo.dpc : Style.Color.Text;
                var alpha = this.i === lyric.i - 1 ? LyricShow.on_paintInfo.pl_alpha : LyricShow.on_paintInfo.l_alpha;
                switch (Style.DrawingMethod) { // Only GDI+
                    case 1:
                        gr.DrawString(text, Style.Font, setAlpha(Style.Color.TextShadow, alpha), x + Style.ShadowPosition[0], y + Style.ShadowPosition[1], w, this.height, Style.Align);
                        gr.DrawString(text, Style.Font, setAlpha(color, alpha), x, y, w, this.height, Style.Align);
                        break;
                    case 2:
                        TextRender.OutLineText(setAlpha(color, alpha), setAlpha(Style.Color.TextRound, alpha), Style.TextRoundSize);
                        TextRender.RenderStringRect(gr, text, Style.Font, x, y, w, this.height, Style.Align);
                        break;
                }
            };
            DrawString.prototype.onclick = function (x, y) {
                if (x < g_x || x > g_x + ww || y < offsetY + this.y || y > offsetY + this.nextCY)
                    return;
                this.doCommand();
                return true;
            };
            DrawString.prototype.doCommand = function () {
                if (this.time === 0) fb.PlaybackTime = 0;
                else if (this.time) fb.PlaybackTime = this.time;
            };
            // Constructor END
        }

    };

    this.searchLine = function (time) {

        this.pauseTimer(true);
        disp.top = 0;
        disp.bottom = lyric.text.length - 1;
        prop.Panel.AutoScroll && (movable = true);
        ignore_remainder = false; // 誤差補正ON
        time *= 100;
        var interval = prop.Panel.Interval * Math.max(1, prop.Style.DrawingMethod);
        var DrawStyle = LyricShow.setProperties.DrawStyle;
        var lineList = this.setProperties.lineList;
        if (lineList) {
            for (var i = 1; i < lineList.length; i++)
                if (lineList[i] > Math.round(time)) break;
            lyric.i = i; // 対象行

            switch (prop.Panel.ScrollType) {
                case 1:
                    lineY = (time - lineList[i - 1]) * 10 / interval * DrawStyle[i - 1].speed; // (i-1行になってから現在の再生時間になるまでに行われた更新回数) * 1回の更新での移動量
                    offsetY = fixY - DrawStyle[i - 1].y - lineY; // オフセットの変動値は(文字の高さ*行数)
                    break;
                case 2:
                    if (DrawStyle[i - 1].speedType2) { // speedType2を条件に使うことで、次の行までの時間が (prop.Panel.ScrollDurationTime*10) ミリ秒以上空く行であるか判別できる
                        lineY = 0;
                        if (lineList[i] - time > prop.Panel.ScrollDurationTime)
                            offsetY = fixY - DrawStyle[i - 1].y;
                        else {
                            lineY = (prop.Panel.ScrollDurationTime - (lineList[i] - time)) * 10 / interval * DrawStyle[i - 1].speedType2;
                            offsetY = fixY - DrawStyle[i - 1].y - lineY;
                        }
                    }
                    else { // そうでなければ　ScrollType === 1　と同じ動作をする
                        lineY = (time - lineList[i - 1]) * 10 / interval * DrawStyle[i - 1].speed;
                        offsetY = fixY - DrawStyle[i - 1].y - lineY;
                    }
                    break;
                case 3:
                    if (DrawStyle[i - 1].speedType2) {
                        lineY = DrawStyle[i - 2].height;
                        if (time - lineList[i - 1] > prop.Panel.ScrollDurationTime)
                            offsetY = fixY - DrawStyle[i - 1].y;
                        else {
                            lineY = (time - lineList[i - 1]) * 10 / interval * DrawStyle[i - 1].speedType3;
                            offsetY = fixY - DrawStyle[i - 2].y - lineY;
                        }
                    }
                    else {
                        if (time - lineList[i - 1] > prop.Panel.ScrollDurationTime)
                            offsetY = fixY - DrawStyle[i - 1].y;
                        else {
                            lineY = (time - lineList[i - 1]) * 10 / interval * (DrawStyle[i - 1].speedType3EOL || DrawStyle[i - 1].speedType3);
                            offsetY = fixY - DrawStyle[i - 2].y - lineY;
                        }
                    }
                    break;
                case 4:
                    offsetY = fixY;
                    LyricShow.on_paintInfo.pl_alpha = 252;
                    LyricShow.on_paintInfo.l_alpha = 252;
                    LyricShow.on_paintInfo.dpi = 0;
                    LyricShow.on_paintInfo.dpc = prop.Style.Color.Text;
                    jumpY = null;
                    break;
                case 5:
                    offsetY = fixY;
                    LyricShow.on_paintInfo.pl_alpha = 252;
                    LyricShow.on_paintInfo.l_alpha = 0;
                    LyricShow.on_paintInfo.dpi = 0;
                    LyricShow.on_paintInfo.dpc = prop.Style.Color.Text;
                    jumpY = null;
                    break;
            } // end switch

            if (jumpY) {
                if (prop.Panel.ScrollType === 3 && prop.Panel.ScrollToCenter) {// ScrollToCenter ではシーク後にいきなりスクロールすると見栄えが悪いのでlineYを埋めて回避. かつ移動済みのオフセット値に変更
                    lineY = DrawStyle[i - 2].height;
                    offsetY -= lineY
                }

                if (prop.Panel.ScrollToCenter)
                    this.moveLineWithAnimation(jumpY, offsetY);
                else
                    offsetY = jumpY;
                jumpY = null;
            }
        }
        else
            offsetY = fixY - this.setProperties.h * time / Math.round(fb.PlaybackLength * 100); // パネルの半分 - (1ファイルの高さ * 再生時間の割合)

        if (offsetY == parseInt(offsetY)) // 整数かどうか
            moveY = 0;
        else if (offsetY > 0)
            moveY = parseFloat("0." + String(fixY - offsetY).split(".")[1]);
        else
            moveY = parseFloat("0." + String(Math.abs(offsetY)).split(".")[1]);
        window.Repaint();
        this.pauseTimer(fb.IsPaused);
    };

    this.moveLineWithAnimation = function (from, to) {
        if (Lock) {
            this.moveLineWithAnimationTimer.clearInterval();
        }
        else {
            this.moveLineWithAnimation.IsPaused = fb.IsPaused;
            !fb.IsPaused && fb.Pause();
        }

        Lock = true;

        offsetY = Math.floor(from);
        this.moveLineWithAnimation.sum = 0
        this.moveLineWithAnimation.to = to;

        var h, t, interval;
        h = this.moveLineWithAnimation.h = to - offsetY; // 移動量 // 小分けしたものをfromに足し込んでいく
        t = this.moveLineWithAnimation.t = 90; // 移動時間[ms]
        interval = 15 * Math.max(1, prop.Style.DrawingMethod);
        this.moveLineWithAnimation.spe = h / t * interval // 1回の更新での移動量
        this.moveLineWithAnimationTimer.interval(interval);
    };
    this.moveLineWithAnimationTimer = function () { // for Timer
        if (!fb.IsPlaying) {
            LyricShow.moveLineWithAnimationTimer.clearInterval();
            Lock = false;
        } else {
            offsetY += LyricShow.moveLineWithAnimation.spe;
            LyricShow.moveLineWithAnimation.sum += LyricShow.moveLineWithAnimation.spe;
            if (Math.abs(LyricShow.moveLineWithAnimation.sum) >= Math.abs(LyricShow.moveLineWithAnimation.h)) { // 目標の移動量に達したら終了
                offsetY = LyricShow.moveLineWithAnimation.to;
                moveY = 0;
                LyricShow.moveLineWithAnimationTimer.clearInterval();
                !LyricShow.moveLineWithAnimation.IsPaused && fb.Pause();
                Lock = false;
            }
            window.Repaint();
        }
    };

    this.pauseTimer = function (state) {

        var lrc_interval = prop.Panel.Interval;
        if (prop.Style.DrawingMethod === 2 || prop.Panel.ScrollType === 4 || prop.Panel.ScrollType === 5) // DrawingMethod == 2 では処理が追いつかないためintervalを2倍する // setScrollSpeedListでも同様
            lrc_interval *= 2;

        if (state)
            for (var i = 0; ; i++)
                if (this.hasOwnProperty("scroll_" + i))
                    this["scroll_" + i].clearInterval();
                else break;
        else if (filetype === "txt")
            this.scroll_0.interval(prop.Panel.Interval);
        else
            this["scroll_" + prop.Panel.ScrollType].interval(lrc_interval);
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

        function IsSupportImage(file) {
            var ext = fs.GetExtensionName(file).toLowerCase();
            var SupportTypes = ["jpg", "jpeg", "png", "gif", "bmp"];

            for (var i = 0; i < SupportTypes.length; i++) {
                if (ext == SupportTypes[i])
                    return true;
            }
            return false;
        }

        function SearchImageInWildcard(path) {
            var foldername = fs.GetParentFolderName(path);
            if (!fs.FolderExists(foldername)) return false;

            var file, newImg;
            var exp = fs.GetFileName(path);
            var arr = utils.Glob(foldername + "\\*.*").toArray();

            for (var i = 0; i < arr.length; i++) {
                if (IsSupportImage(arr[i]) && utils.PathWildcardMatch(exp, fs.GetFileName(arr[i]))) {
                    newImg = GetImg(arr[i]);
                    if (newImg) return { path: arr[i], img: newImg }; // One file per path is enough
                }
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
                        size.height = Math.ceil(srcH * dspW / srcW);
                    }
                } else { // アスペクト比を無視
                    size.width = Math.min(srcW, dspW);
                    size.height = Math.min(srcH, dstH);
                }
            }
            size.x = Math.floor((dspW - size.width) / 2);
            size.y = Math.floor((dspH - size.height) / 2);
            return size;
        }

        var newImg, path, tmp, foldername, exp, e, file, res, same;
        var p = prop.Panel.BackgroundPath;
        if (p) {
            try {
                var metadb = fb.GetNowPlaying();
                p = fb.TitleFormat(p).EvalWithMetadb(metadb);
                p = p.replaceEach("%fb2k_path%", fb.FoobarPath, "%fb2k_profile_path%", fb.ProfilePath, "<embed>", "<" + metadb.RawPath + ">", "gi");
            }
            catch (e) { }
            finally { metadb && metadb.Dispose(); }

            p = p.split('||');
            if (p instanceof Array)
                for (var i = 0; i < p.length; i++) {
                    if (p[i].indexOf("*") == -1 && p[i].indexOf("?") == -1) { // If not wildcard exist
                        path = p[i];
                        newImg = GetImg(path);
                        if (newImg) break;
                    }
                    else { // Search in wildcard.
                        res = SearchImageInWildcard(p[i]);
                        if (res) {
                            path = res.path;
                            newImg = res.img;
                            break;
                        }
                    }
                }
            else {
                if (p.indexOf("*") == -1 && p.indexOf("?") == -1) {
                    path = p;
                    newImg = GetImg(path);
                }
                else {
                    res = SearchImageInWildcard(p);
                    if (res) {
                        path = res.path;
                        newImg = res.img;
                    }
                }
            }

            if (newImg) {
                /*if (path == BackgroundPath) {
                    newImg.Dispose();
                    return; // skip Calc, Resize, and Fade effect
                }*/
                same = Boolean(path == BackgroundPath);
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
                !same && this.fadeTimer();
            }
            else
                this.releaseGlaphic();
        }
    };

    this.start = function (path, text) {

        this.init();
        prop.Panel.BackgroundEnable && this.setBackgroundImage();
        L:
            {
                var pathIsArray = path instanceof Array;
                parse_path = pathIsArray ? path[0] : path; // set default parse_path for save
                try { // default ParentFolder of parse_path // 条件を満たす曲をスキップするようなコンポを入れているとparse_pathがなぜか空になってエラーを起こすのでtryで回避
                    directory = parse_path.match(directoryRe)[0];
                } catch (e) { }

                if (text) { // for Clipboad and FileDialog 
                    if (this.readLyric(text, true)) break L; // 第二引数は IsSpecifiedPath. 保存パスに影響
                    else return Messages.NotFound.trace();
                }
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
                return Messages.NotFound.trace(); // lyric is not found
            }

        this.setProperties.setLineList();
        this.setProperties.setWordbreakList();
        this.setProperties.setScrollSpeedList();
        this.setProperties.buildDrawStyle();

        this.set_on_paintInfo_x_w();
        this.set_on_paintInfo_RGBdiff();

        this.searchLine(fb.PlaybackTime);
        filetype === "txt" && (function () { offsetY = Math.ceil(offsetY) - (moveY - Math.floor(moveY)); }).timeout(1000) // 再生始めは不安定であるが、非同期歌詞ではlineYでの修正が出来ないのでディレイで一度だけ小数点以下を揃えて安定化させる
        if (fb.IsPlaying) // この行を実行する前に再生が停止される可能性があるので条件分岐でエラー回避
            isM4A = m4aRE.test(fs.GetExtensionName(fb.GetNowPlaying().Path));
    };

    this.end = function () {

        this.pauseTimer(true); // 従来のタイマーの後処理のようにtimerにnull等を代入するとclearで引っかかって余計に処理の記述が増える。中身はただの数字なので何もしなくて良い
        path = directory = filename = basename = filetype = lyric = offsetinfo = null;
        this.setProperties.lineList = this.setProperties.leftcenterX = this.setProperties.wordbreakList = this.setProperties.wordbreakText = this.setProperties.scrollSpeedList = this.scrollSpeedType2List = this.setProperties.DrawStyle = this.setProperties.h = this.setProperties.minOffsetY = null;
        lineY = moveY = null;

        if (repeatRes)
            for (var i = 0; i < repeatRes.length; i++)
                repeatRes[i].e = [];

        if (!prop.Panel.BackgroundEnable || !main.IsVisible)
            this.releaseGlaphic();
        else if (!fb.IsPlaying)
            this.releaseGlaphic();

        CollectGarbage();
    };

    this.scroll_0 = function () { // timerで呼び出す関数. timerで呼び出すとthisの意味が変わるのでthisは使わない

        if (offsetY < LyricShow.setProperties.minOffsetY) {
            offsetY = LyricShow.setProperties.minOffsetY;
            movable = false; // 移動不可のフラグ
        }
        LyricShow.setProperties.DrawStyle[lyric.i - 1].scroll_0(fb.PlaybackTime * 100) && window.Repaint();
    };

    this.scroll_1 = function () { // timerで呼び出す関数

        if (offsetY < LyricShow.setProperties.minOffsetY) {
            offsetY = LyricShow.setProperties.minOffsetY;
            movable = false;
            ignore_remainder = true; // ライン移動時の誤差補正を無効にする（一度だけ）
        }
        LyricShow.setProperties.DrawStyle[lyric.i - 1].scroll_1(fb.PlaybackTime * 100) && window.Repaint(); // lyric.i(対象行)の１個前(再生行)の情報でスクロール
    };

    this.scroll_2 = function () { // timerで呼び出す関数

        if (offsetY < LyricShow.setProperties.minOffsetY) {
            offsetY = LyricShow.setProperties.minOffsetY;
            movable = false;
            ignore_remainder = true;
        }
        LyricShow.setProperties.DrawStyle[lyric.i - 1].scroll_2(fb.PlaybackTime * 100) && window.Repaint();
    };

    this.scroll_3 = function () { // timerで呼び出す関数

        if (lyric.i === lyric.text.length) {
            if (fb.PlaybackTime * 100 - LyricShow.setProperties.lineList[lyric.i - 1] > prop.Panel.ScrollDurationTime) {
                if (LyricShow.setProperties.DrawStyle[lyric.i - 1].speedType3 !== 0)
                    LyricShow.setProperties.DrawStyle[lyric.i - 1].speedType3 = 0;
            }
            else
                LyricShow.setProperties.DrawStyle[lyric.i - 1].speedType3 = LyricShow.setProperties.DrawStyle[lyric.i - 1].speedType3EOL;
        }

        if (offsetY < LyricShow.setProperties.minOffsetY) {
            offsetY = LyricShow.setProperties.minOffsetY;
            movable = false;
            ignore_remainder = true;
        }
        LyricShow.setProperties.DrawStyle[lyric.i - 1].scroll_3(fb.PlaybackTime * 100) && window.Repaint();
    };

    this.scroll_4 = function () { // timerで呼び出す関数

        LyricShow.setProperties.DrawStyle[lyric.i - 1].scroll_4(fb.PlaybackTime * 100) && window.Repaint();
    };

    this.scroll_5 = function () { // timerで呼び出す関数

        LyricShow.setProperties.DrawStyle[lyric.i - 1].scroll_5(fb.PlaybackTime * 100) && window.Repaint();
    };

    this.calcOddNumHeight = function (DrawStyle, i) {

        var h1, h2;
        if (i - 1 === -1)
            h1 = 0;
        else if (typeof DrawStyle[i - 1].isEvenNum === "undefined" && i - 2 !== -1)
            h1 = DrawStyle[i - 2].height;
        else
            h1 = DrawStyle[i - 1].height;

        if (i + 1 === lyric.text.length)
            h2 = 0;
        else if (typeof DrawStyle[i + 1].isEvenNum === "undefined" && i + 2 !== lyric.text.length)
            h2 = DrawStyle[i + 2].height;
        else
            h2 = DrawStyle[i + 1].height;

        return Math.max(h1, h2);
    };

    this.set_on_paintInfo_RGBdiff = function () {

        var bc = getRGB(Style.Color.Text); // base color
        var tc = getRGB(Style.Color.PlayingText); // target color
        for (var i = 0; i < 3; i++) // [R_diff, G_diff, B_diff]
            this.on_paintInfo.di[i] = (tc[i] - bc[i]) / this.on_paintInfo.dpi_max; // scroll_4や5でdpi_max回足す
        this.on_paintInfo.dpc = Style.Color.Text;
        this.on_paintInfo.dpi = 0;

    };

    this.set_on_paintInfo_x_w = function () {

        this.on_paintInfo.x = Left_Center ? this.setProperties.leftcenterX : Center_Left ? centerleftX : g_x;
        this.on_paintInfo.w = Left_Center || Right_Center ? ww - this.setProperties.leftcenterX + g_x : Center_Left || Center_Right ? ww - centerleftX + g_x : ww;
    };

    this.on_paintInfo = {
        x: 0,
        w: 0,
        di: [],
        dpc: Style.Color.Text,
        dpi: 0,
        dpi_max: 48,
        pl_alpha: 252,
        l_alpha: 252
    };

    this.on_paint = function (gr) {
        var DrawStyle = LyricShow.setProperties.DrawStyle;

        // background color
        gr.FillSolidRect(-1, -1, window.Width + 1, window.Height + 1, Style.Color.Background);
        // background image
        if (BackgroundImg)
            if (prop.Panel.BackgroundRaw)
                gr.GdiDrawBitmap(BackgroundImg, BackgroundSize.x, BackgroundSize.y, BackgroundSize.width, BackgroundSize.height, 0, 0, BackgroundImg.Width, BackgroundImg.Height);
            else
                gr.DrawImage(BackgroundImg, BackgroundSize.x, BackgroundSize.y, BackgroundSize.width, BackgroundSize.height, 0, 0, BackgroundImg.Width, BackgroundImg.Height, BackOption[0], backalpha);

        // lyrics
        if (lyric) { // lyrics is found
            if (lyric.info.length && offsetY > 0 && prop.Panel.ScrollType !== 4 && prop.Panel.ScrollType !== 5)
                for (var i = 1; i <= lyric.info.length; i++) {
                    Style.Shadow && gr.GdiDrawText(lyric.info[lyric.info.length - i], Style.Font, Style.Color.TextShadow, this.on_paintInfo.x + Style.ShadowPosition[0], g_y + offsetY - TextHeight * i + Style.ShadowPosition[1], this.on_paintInfo.w, wh, DT_CENTER | DT_NOPREFIX);
                    gr.GdiDrawText(lyric.info[lyric.info.length - i], Style.Font, Style.Color.Text, this.on_paintInfo.x, g_y + offsetY - TextHeight * i, this.on_paintInfo.w, wh, DT_CENTER | DT_NOPREFIX);
                }

            if (filetype === "lrc") // for文の中の演算量を増やすわけにはいかないのでfor文自体を分岐させる
                if (prop.Panel.ScrollType === 4) {
                    if (Style.Shadow)
                        for (var i = lyric.i - 1, j = 0; j < 3 && i !== lyric.text.length; i++, j++) {
                            var yy = offsetY;
                            if (DrawStyle[i].isEvenNum)
                                yy += this.calcOddNumHeight(DrawStyle, i);
                            DrawStyle[i].draw_OneLine_withShadow(gr, DrawStyle[i].text, this.on_paintInfo.x, yy, this.on_paintInfo.w);
                            if (j === 1 && typeof DrawStyle[i].isEvenNum !== "undefined")
                                break;
                        }
                    else
                        for (i = lyric.i - 1, j = 0; j < 3 && i !== lyric.text.length; i++, j++) {
                            yy = offsetY;
                            if (DrawStyle[i].isEvenNum)
                                yy += this.calcOddNumHeight(DrawStyle, i);
                            DrawStyle[i].draw_OneLine(gr, DrawStyle[i].text, this.on_paintInfo.x, DrawStyle[i].isEvenNum ? offsetY + DrawStyle[i - Math.max(j, 1)].height : offsetY, this.on_paintInfo.w);
                            if (j === 1 && typeof DrawStyle[i].isEvenNum !== "undefined")
                                break;
                        }
                }
                else if (prop.Panel.ScrollType === 5) {
                    if (Style.Shadow)
                        for (i = lyric.i - 1, j = 0; j < 3 && i !== lyric.text.length; i++, j++) {
                            DrawStyle[i].draw_OneLine_withShadow(gr, DrawStyle[i].text, this.on_paintInfo.x, offsetY, this.on_paintInfo.w);
                            if (j === 1 && typeof DrawStyle[i].isEvenNum !== "undefined")
                                break;
                        }
                    else
                        for (i = lyric.i - 1, j = 0; j < 3 && i !== lyric.text.length; i++, j++) {
                            DrawStyle[i].draw_OneLine(gr, DrawStyle[i].text, this.on_paintInfo.x, offsetY, this.on_paintInfo.w);
                            if (j === 1 && typeof DrawStyle[i].isEvenNum !== "undefined")
                                break;
                        }
                }
                else
                    if (Style.Shadow)
                        for (i = 0; i < lyric.text.length; i++) {
                            var c = offsetY + DrawStyle[i].y;
                            if (c > wh) { disp.bottom = i - 1; break; } // do not draw text outside the screen. CPU utilization rises
                            else if (c < -DrawStyle[i].height) { disp.top = i + 1; continue; } // ditto
                            else DrawStyle[i].draw_withShadow(gr, DrawStyle[i].text, lyric.i - 1 === i ? Style.Color.PlayingText : Style.Color.Text, this.on_paintInfo.x, this.on_paintInfo.w);
                        }
                    else
                        for (i = 0; i < lyric.text.length; i++) {
                            c = offsetY + DrawStyle[i].y;
                            if (c > wh) { disp.bottom = i - 1; break; } // do not draw text outside the screen. CPU utilization rises
                            else if (c < -DrawStyle[i].height) { disp.top = i + 1; continue; } // ditto
                            else DrawStyle[i].draw(gr, DrawStyle[i].text, lyric.i - 1 === i ? Style.Color.PlayingText : Style.Color.Text, this.on_paintInfo.x, this.on_paintInfo.w);
                        }
            else
                if (Style.Shadow)
                    for (i = 0; i < lyric.text.length; i++) {
                        c = offsetY + DrawStyle[i].y;
                        if (c > wh) { disp.bottom = i - 1; break; }
                        else if (c < -DrawStyle[i].height) { disp.top = i + 1; continue; }
                        else DrawStyle[i].draw_withShadow(gr, DrawStyle[i].text, Style.Highline ? Style.Color.PlayingText : Style.Color.Text, this.on_paintInfo.x, this.on_paintInfo.w);
                    }
                else
                    for (i = 0; i < lyric.text.length; i++) {
                        c = offsetY + DrawStyle[i].y;
                        if (c > wh) { disp.bottom = i - 1; break; }
                        else if (c < -DrawStyle[i].height) { disp.top = i + 1; continue; }
                        else DrawStyle[i].draw(gr, DrawStyle[i].text, Style.Highline ? Style.Color.PlayingText : Style.Color.Text, this.on_paintInfo.x, this.on_paintInfo.w);
                    }
        }
        else if (!main.IsVisible) {
            Style.Shadow && gr.GdiDrawText("Click here to enable this panel.", Style.Font, Style.Color.TextShadow, g_x + Style.ShadowPosition[0], g_y + (wh * (46 / 100)) - 6 + Style.ShadowPosition[1], ww, wh, DT_CENTER | DT_WORDBREAK | DT_NOPREFIX);
            gr.GdiDrawText("Click here to enable this panel.", Style.Font, Style.Color.Text, g_x, g_y + (wh * (46 / 100)) - 6, ww, wh, DT_CENTER | DT_WORDBREAK | DT_NOPREFIX);
        }
        else if (fb.IsPlaying) { // lyrics is not found
            var wordbreak = 0;
            var s = fb.TitleFormat(prop.Panel.NoLyric).Eval().split("\\n");

            try {
                switch (Style.DrawingMethod) {
                    case 0:
                        TextHeightWithoutLPadding = gr.CalcTextHeight("Test", Style.Font);
                        TextHeight = TextHeightWithoutLPadding + Style.LPadding;
                        var offset = g_y + (wh / 2) - s.length / 2 * TextHeight;

                        for (i = 0; i < s.length; i++) {
                            Style.Shadow && gr.GdiDrawText(s[i], Style.Font, Style.Color.TextShadow, g_x + Style.ShadowPosition[0], offset + TextHeight * (i + wordbreak) + Style.ShadowPosition[1], ww, wh, DT_CENTER | DT_WORDBREAK | DT_NOPREFIX);
                            gr.GdiDrawText(s[i], Style.Font, Style.Color.Text, g_x, offset + TextHeight * (i + wordbreak), ww, wh, DT_CENTER | DT_WORDBREAK | DT_NOPREFIX);
                            wordbreak += Math.floor(gr.CalcTextWidth(s[i], Style.Font) / ww);
                        }
                        break;
                    case 1:
                        TextHeightWithoutLPadding = Math.ceil(gr.MeasureString("Test", Style.Font, 0, 0, ww * 10, wh, 0).Height);
                        TextHeight = TextHeightWithoutLPadding + Style.LPadding;
                        offset = g_y + (wh / 2) - s.length / 2 * TextHeight;

                        for (i = 0; i < s.length; i++) {
                            Style.Shadow && gr.DrawString(s[i], Style.Font, Style.Color.TextShadow, g_x + Style.ShadowPosition[0], offset + TextHeight * (i + wordbreak) + Style.ShadowPosition[1], ww, wh, GDIPlus_CENTER);
                            gr.DrawString(s[i], Style.Font, Style.Color.Text, g_x, offset + TextHeight * (i + wordbreak), ww, wh, GDIPlus_CENTER);
                            wordbreak += Math.floor(gr.MeasureString(s[i], Style.Font, 0, 0, ww * 10, wh, 0).Width / ww);

                        }
                        break;
                    case 2:
                        TextHeightWithoutLPadding = Math.ceil(gr.MeasureString("Test", Style.Font, 0, 0, ww * 10, wh, 0).Height);
                        TextHeight = TextHeightWithoutLPadding + Style.LPadding;
                        offset = g_y + (wh / 2) - s.length / 2 * TextHeight;

                        TextRender.OutLineText(Style.Color.Text, Style.Color.TextRound, Style.Shadow ? Style.TextRoundSize : 0);
                        for (i = 0; i < s.length; i++) {
                            TextRender.RenderStringRect(gr, s[i], Style.Font, g_x, offset + TextHeight * (i + wordbreak), ww, wh, GDIPlus_CENTER);
                            wordbreak += Math.floor(gr.MeasureString(s[i], Style.Font, 0, 0, ww * 10, wh, 0).Width / ww);
                        }
                        break;
                }
            } catch (e) { }


        }
    };

}(prop.Style);


//===========================================
//== Create "Edit" Object ==========================
//===========================================

Edit = new function (Style, p) {

    var edit_fixY, di = [];
    var larrowX, arrowY, rarrowX, Arrow_img, DrawStyle;
    var tagTopRe = /(^\[\d\d:\d\d[.:]\d\d\])/;

    this.init = function () {

        edit_fixY = TextHeight * 2;
        disp.top = 0;
        DrawStyle = p.DrawStyle;
        offsetY = edit_fixY + Style.LPadding / 2;

        if (filetype === "lrc") {
            lyric.i = lyric.text.length;
            offsetY -= DrawStyle[lyric.text.length - 1].y;
        }
        else
            lyric.i = 1;
    };

    this.moveNextLine = function (x, y) {

        putTime(Math.round(fb.PlaybackTime * 100), lyric.i);

        offsetY -= DrawStyle[lyric.i - 1].height;
        lyric.i++;
        window.Repaint();

        if (lyric.i == lyric.text.length) {
            Lock = true; // some command is prevent
            this.saveMenu(x, y);
            prop.Edit.Start && this.undo(); // saveMenu表示中に次の曲に遷移する可能性があるのでundoの前にチェックする
            (function () { Lock = false; }).timeout(200);
        }
    };

    this.undo = function (all) {

        if (lyric.i == 1) return;

        do {
            lyric.text[--lyric.i] = lyric.text[lyric.i].slice(10);
            offsetY += DrawStyle[lyric.i - 1].height;
            if (lyric.i == 1) break;
        } while (all)

        window.Repaint();
    };

    this.adjustTime = function (n) { // -100 < Int n < 100

        if (lyric.i == 1) return;

        Lock = true;

        var pl = lyric.i - 1;
        lyric.text[pl].match(timeRe);
        var pt = (RegExp.$1 * 60 + Number(RegExp.$2)) * 100 + Number(RegExp.$3);

        if (n < 0) {
            lyric.text[pl - 1].match(timeRe);
            var tt = (RegExp.$1 * 60 + Number(RegExp.$2)) * 100 + Number(RegExp.$3);
            if (pt - tt > -n || tt === 0) // 下限
                apply();
        }
        else {
            if (lyric.i !== lyric.text.length) {
                var r = lyric.text[pl + 1].match(timeRe);
                tt = (RegExp.$1 * 60 + Number(RegExp.$2)) * 100 + Number(RegExp.$3);
            }
            if (!r || tt - pt > n) // 上限
                apply();
        }

        Lock = false;

        function apply() {
            Edit.applyTimeDiff(pt, pl, n);
            if (prop.Edit.View)
                DrawStyle[pl].doCommand();
            else
                window.Repaint();
        }

    };

    this.offsetTime = function (n) { // -100 < Int n < 100

        if (lyric.i == 1) return;

        Lock = true;

        var tt;

        for (var i = 1; i < lyric.text.length; i++) {
            if (lyric.text[i].match(timeRe)) {
                tt = (RegExp.$1 * 60 + Number(RegExp.$2)) * 100 + Number(RegExp.$3);
                this.applyTimeDiff(tt, i, -n);
            }
        }

        if (prop.Edit.View)
            DrawStyle[lyric.i - 1].doCommand();
        else
            window.Repaint();

        Lock = false;
    };

    this.applyTimeDiff = function (time, i, diff) {

        if (diff === 0) return;

        time += diff;

        if (time < 0)
            time = 0;

        lyric.text[i] = lyric.text[i].slice(10);
        putTime(time, i);

        if (prop.Edit.View) {
            p.lineList[i] = time;
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
                    lyric.text.push(RegExp.$1 || "");
                    break;
                }
                a = text.splice(i, text.length - i, str || "");
                lyric.text = text.concat(a);
                break;
            case 2: // edit line
                a = text[i - 1].slice(0, 10);
                str = prompt("", Label.EditLine, text[i - 1].slice(10));
                if (str) text[i - 1] = a + str;
                break;
        }

        p.setWordbreakList(true);
        p.buildDrawStyle();
        DrawStyle = p.DrawStyle;

        window.Repaint();
    };

    this.saveMenu = function (x, y) {

        Lock_MiddleButton = true;
        var meta = fb.GetNowPlaying();
        var field = getFieldName(true);
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
                    StatusBar.setText(Messages.SavedToTag.ret('"' + field + '"'));
                    StatusBar.show();
                    playSoundSimple(commondir + "finished.wav");
                } catch (e) {
                    Messages.FailedToSaveLyricsToTag.popup("\n" + e.message);
                }
                break;
            case 4:
                try {
                    if (!fs.FolderExists(folder))
                        createFolder(fs, folder);
                    writeTextFile(text, file, prop.Save.CharacterCode);
                    StatusBar.setText(Messages.Saved.ret(file));
                    StatusBar.show();
                    playSoundSimple(commondir + "finished.wav");
                    FuncCommands(prop.Save.RunAfterSave, meta);
                } catch (e) {
                    Messages.FailedToSaveLyricsToFile.popup("\n" + e.message);
                }
                break;
        }
        meta.Dispose();
        Lock_MiddleButton = false;
    };

    this.deleteFile = function (file) {

        if (!file || Messages.Delete.popup(file) != 6)
            return;
        try {
            sendToRecycleBin(file);
            Menu.build(Menu.Edit);
            StatusBar.setText(Messages.Deleted.ret());
            StatusBar.show();
        } catch (e) {
            Messages.FailedToDelete.popup();
        }
    };

    this.start = function () {

        LyricShow.pauseTimer(true);
        with (prop.Style) { Color = CE[CSE]; }
        prop.Edit.Start = true;
        filetype === "txt" && putTime(0, 0);

        p.setLineList(true);
        p.setWordbreakList(true);
        p.buildDrawStyle();
        this.init();
        this.calcSeekIMGarea();

        if (filetype === "lrc")
            this.View.start();
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

    };

    this.View = new function () {

        this.setProperties = function () {
            p.setLineList(true);
            p.setWordbreakList(true);
            p.buildDrawStyle();
            DrawStyle = p.DrawStyle;
        };

        this.searchLine = function (time) {
            this.pauseTimer(true);
            disp.top = 0;

            time = Math.round(time * 100); // time *= 100 この計算になぜか微量の誤差が生じてapplyTimeDiffに影響が出るので対策する

            for (var i = 0; i < p.lineList.length; i++)
                if (p.lineList[i] > time) break;

            lyric.i = i;
            offsetY = edit_fixY + Style.LPadding / 2 - DrawStyle[lyric.i - 1].y;
            window.Repaint();
            this.pauseTimer(fb.IsPaused);
        };

        this.watchLineChange = function () {
            if (Math.round(fb.PlaybackTime * 100) >= p.lineList[lyric.i]) {
                offsetY -= LyricShow.setProperties.DrawStyle[lyric.i - 1].height;
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

        this.start = function () {
            prop.Edit.View = true;
            this.i = lyric.i; // ビューモード解除時に元に戻れるように値を退避
            this.offsetY = offsetY; // これも同様
            lyric.i !== lyric.text.length && this.setProperties();
            Edit.calcRGBdiff();
            this.searchLine(fb.PlaybackTime);
            Menu.build(Menu.Edit);
        };

        this.end = function () {
            prop.Edit.View = false;
            this.pauseTimer(true);
            lyric.i = this.i; // ビューモードに入る前の状態に戻す
            offsetY = this.offsetY; // これも同様
            this.i = this.offsetY = null;
            lyric.i == lyric.text.length && Edit.undo();
            Edit.calcRGBdiff();
        };
    }

    this.switchView = function () {

        prop.Edit.View = !prop.Edit.View;
        if (prop.Edit.View) Edit.View.start();
        else {
            Edit.View.end();
            window.Repaint();
            Menu.build(Menu.Edit);
        }
    };

    this.calcSeekIMGarea = function () {

        Arrow_img = Style.Color.Arrow_img;
        larrowX = Math.floor(seek_width / 2 - Arrow_img.width / 2);
        arrowY = Math.floor(wh / 2 - Arrow_img.height / 2 - 8);
        rarrowX = ww - larrowX - Arrow_img.width;
    };

    this.calcRGBdiff = function () {

        var bg = prop.Edit.View ? Style.Color.ViewBackground : Style.Color.Background;
        if (getAlpha(bg) != 0xff)
            bg = RGBAtoRGB(bg); // parse alpha value
        var b = getRGB(Style.Color.Text); // base color
        var t = getRGB(di[3] = bg); // target color
        for (var i = 0; i < 3; i++) // [R_diff, G_diff, B_diff]
            di[i] = Math.floor(prop.Edit.Step === 0 ? 0 : (t[i] - b[i]) / prop.Edit.Step);
    };

    this.on_paint = function (gr) {

        var p = lyric.i - 1; // playing line
        var n, str, ci, c;

        // background color
        gr.FillSolidRect(-1, -1, window.Width + 1, window.Height + 1, prop.Edit.View ? Style.Color.ViewBackground : Style.Color.Background);
        // playing line color
        try {
            gr.FillRoundRect(g_x + 1, g_y + edit_fixY, ww - 2, DrawStyle[p].height, 5, 5, Style.Color.Line);
        } catch (e) { }

        // lyrics
        for (var i = -2; i < lyric.text.length - 2; i++) {
            n = p + i;
            if (i == -2 && n >= 0) { disp.top = n; }
            if (n < 0) continue;
            else if (n >= lyric.text.length || offsetY + DrawStyle[n].nextY > wh) { disp.bottom = n - 1; break; }
            else {
                if (tagTopRe.test(lyric.text[n]))
                    str = RegExp.$1 + " " + lyric.text[n].replace(alltagsRe, "");
                else
                    str = lyric.text[n].replace(alltagsRe, "");
                ci = (i < prop.Edit.Step) ? (i < 0) ? (i >= -prop.Edit.Step) ? -i : null : i : null;
                c = ci === null ? di[3] : setRGBdiff(Style.Color.Text, di[0] * ci, di[1] * ci, di[2] * ci);
                // fb.trace(str + "::" + Style.Font + "::" + Style.Color.Text + "::" + g_x + "::" + g_y + "::" + offsetY + "::" + DrawStyle[n].y + "::" + ww + "::" + wh + "::" + Style.Align);
                DrawStyle[n].draw_Edit(gr, str, c, g_x, ww, prop.Edit.Align);
            }
        }

        if (prop.Edit.Rule) // rule
            for (var j = 1; j <= i + 3; j++)
                gr.DrawLine(ww - 4 + g_x, g_y + TextHeight * j, 4 + g_x, g_y + TextHeight * j, 1, Style.Color.Rule);

        // length
        gr.gdiDrawText("[" + lyric.i + " / " + lyric.text.length + "]", Style.Font, Style.Color.Length, g_x, window.Height - TextHeight + prop.Style.LPadding, window.Width, TextHeight, 0);

        if (larea_seek) { // seek
            gr.FillRoundRect(0, TextHeight, seek_width, Math.max(wh - 50, 0), arc_w, arc_h, Style.Color.Seek);
            gr.DrawImage(Arrow_img, larrowX, arrowY, Arrow_img.width, Arrow_img.height + 17, 0, 0, Arrow_img.width, Arrow_img.height, 0, Style.Color.ArrowOpacity);
        }
        if (rarea_seek) {
            gr.FillRoundRect(rarea_seek_x, TextHeight, seek_width, Math.max(wh - 50, 0), arc_w, arc_h, Style.Color.Seek);
            gr.DrawImage(Arrow_img, rarrowX, arrowY, Arrow_img.width, Arrow_img.height + 17, 0, 0, Arrow_img.width, Arrow_img.height, 180, Style.Color.ArrowOpacity);
        }
    };

}(prop.Style, LyricShow.setProperties);


//===========================================
//== Create "Buttons" Object =======================
//===========================================

Buttons = new function () {
    var offsetX, offsetY;
    var icon_height = 16;
    var icon_space = 4;
    var button = [];
    var lbtn_down = false;

    var buttonlist = [
        {
            Img: gdi.Image(scriptdir + "clear2.png"),
            Tiptext: Label.Reload,
            Func: function () {
                main(path || "");
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
                var a = prop.Edit.Align ^ DT_WORDBREAK ^ DT_NOPREFIX;
                if (++a > DT_RIGHT)
                    prop.Edit.Align = DT_LEFT;
                else
                    prop.Edit.Align = a;
                prop.Edit.Align |= DT_WORDBREAK | DT_NOPREFIX;
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

    this.buildButton = function () {
        offsetX = window.Width - 4;
        offsetY = window.Height - 19;
        for (var i = 0; i < buttonlist.length; i++) {
            button[i] = new Button(buttonlist[i], i);
            offsetX -= buttonlist[i].Img.width + (i > 0 ? icon_space : 0);
        }
    };
    this.buildButton();

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
    // Constructor END
};


//===========================================
//== Create "StatusBar" Object ======================
//===========================================

StatusBar = new function (Style) {
    this.TIMER = false;

    this.setText = function (Text) {
        this.Text = Text;

        var temp_bmp = gdi.CreateImage(1, 1);
        var temp_gr = temp_bmp.GetGraphics();
        var width = temp_gr.CalcTextWidth(Text, Style.StatusBarFont);

        this.Height = temp_gr.CalcTextHeight(Text, Style.StatusBarFont) * Math.ceil(width / (ww - 3));
        this.Y = g_y + wh - this.Height;

        temp_bmp.ReleaseGraphics(temp_gr);
        temp_bmp.Dispose();
        temp_gr = temp_bmp = null;
    };

    this.show = function (time) {
        this.hide.clearTimeout();
        this.TIMER = true;
        window.Repaint();
        this.hide.timeout(time || 6000);
    }

    this.hide = function () { // mainly for timer
        StatusBar.TIMER = false;
        window.Repaint();
    }
    this.on_paint = function (gr) {
        if (this.TIMER) {
            gr.FillSolidRect(g_x, this.Y, ww, this.Height, Style.StatusBarBackground);
            gr.DrawRect(g_x - 1, this.Y - 2, ww + 2, this.Height + 4, 1, Style.StatusBarRect);
            gr.GdiDrawText(this.Text, Style.StatusBarFont, Style.StatusBarColor, g_x + 3, this.Y, ww - 3, this.Height, DT_LEFT | DT_WORDBREAK | DT_NOPREFIX);
        }
    }

}(prop.Style);


//===========================================
//== Create "Keybind" Object ======================
//===========================================

Keybind = new function () {

    var commands = {
        SeekToNextLine: function () { seekLineTo(1); },
        SeekToPlayingLine: function () { seekLineTo(0); },
        SeekToPreviousLine: function () { seekLineTo(-1); },
        SeekToTop: function () {
            if (prop.Edit.View || (!prop.Edit.Start && filetype === "lrc"))
                LyricShow.setProperties.DrawStyle[1].doCommand();
            else fb.PlaybackTime = 0;
        },
        SwitchAutoScroll: function () {
            if (lyric) {
                window.SetProperty("Panel.AutoScroll", prop.Panel.AutoScroll = !prop.Panel.AutoScroll)
                movable = prop.Panel.AutoScroll;
                ignore_remainder = true;
                window.Repaint();
                Menu.build();
            }
        },
        ScrollToPlayingLine: function () { lyric && LyricShow.searchLine(fb.PlaybackTime); },
        Reload: function () { main(); },
        Properties: function () { window.ShowProperties(); },
        GoogleSearch: function () { fb.IsPlaying && FuncCommand("https://www.google.com/search?q=" + encodeURIComponent(fb.TitleFormat("%artist% %title%").Eval())); }
    };

    this.LyricShow_keydown = new function () {

        var keynum;

        for (var name in prop.Panel.Keybind) {
            keynum = prop.Panel.Keybind[name];
            this[keynum] = commands[name];
        }

        this[38] = function () { lyric && applyDelta(20); }, // Up
        this[40] = function () { lyric && applyDelta(-20); }, // Down
        this[67] = function () { // C
            if (on_key_down.Ctrl && lyric) copyLyric(true); // (+Ctrl)
        };
        this[86] = function () { // V
            if (on_key_down.Ctrl && fb.IsPlaying) { // (+Ctrl)
                getLyricFromClipboard();
                if (prop.Save.ClipbordAutoSaveTo) {
                    if (/^Tag$/i.test(prop.Save.ClipbordAutoSaveTo))
                        saveToTag(getFieldName());
                    else if (/^File$/i.test(prop.Save.ClipbordAutoSaveTo))
                        saveToFile(parse_path + (filetype === "lrc" ? ".lrc" : ".txt"));
                }
            }
        };
    };

    this.LyricShow_keyup = new function () {

        this[49] = this[97] = function () { // 1
            window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 1);
            main();
        }
        this[50] = this[98] = function () { // 2
            window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 2);
            main();
        }
        this[51] = this[99] = function () { // 3
            window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 3);
            main();
        }
        this[52] = this[100] = function () { // 4
            window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 4);
            if (!prop.Style.EnableStyleTextRender) {
                prop.Style.DrawingMethod = 1;
                set_align();
            }
            main();
        }
        this[53] = this[101] = function () { // 5
            window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 5);
            if (!prop.Style.EnableStyleTextRender) {
                prop.Style.DrawingMethod = 1;
                set_align();
            }
            main();
        }
        this[54] = this[102] = function () { // 6
            window.SetProperty("Style.EnableStyleTextRender", prop.Style.EnableStyleTextRender = !prop.Style.EnableStyleTextRender);
            if (prop.Style.EnableStyleTextRender)
                prop.Style.DrawingMethod = 2;
            else if (prop.Panel.ScrollType < 4)
                prop.Style.DrawingMethod = 0;
            else
                prop.Style.DrawingMethod = 1;
            set_align();
            main();
        }
        this[93] = function () { Menu.show(0, 0); } // Menu key
    };

    this.Edit_keydown = new function () {

        var keynum;

        keynum = prop.Panel.Keybind["SeekToNextLine"];
        this[keynum] = commands["SeekToNextLine"];
        keynum = prop.Panel.Keybind["SeekToPlayingLine"];
        this[keynum] = commands["SeekToPlayingLine"];
        keynum = prop.Panel.Keybind["SeekToPreviousLine"];
        this[keynum] = commands["SeekToPreviousLine"];
        keynum = prop.Panel.Keybind["SeekToTop"];
        this[keynum] = commands["SeekToTop"];

        this[13] = function () { !prop.Edit.View && Edit.moveNextLine(); }; // Enter
        this[33] = function () { !prop.Edit.View && Edit.undo(); }; // Page Up
        this[38] = function () { // Up
            if (on_key_down.Shift) Edit.offsetTime(5); // (+Shift)
            else Edit.adjustTime(-5);
        }
        this[40] = function () { // Down
            if (on_key_down.Shift) Edit.offsetTime(-5); // (+Shift)
            else Edit.adjustTime(5);
        }
    };

    this.Edit_keyup = new function () {
        this[93] = function () { Menu.show(0, 0); } // Menu key
    };
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
            Caption: Label.CopyWith + "\tCtrl+C",
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
                window.SetProperty("Style.Align", DT_LEFT);
                set_align();
                window.Repaint();
                Menu.build();
            }
        },
        {
            Flag: MF_STRING,
            Caption: Label.Align_Left_Center,
            Func: function () {
                window.SetProperty("Style.Align", 0x00000003);
                set_align();
                window.Repaint();
                Menu.build();
            }
        },
        {
            Flag: MF_STRING,
            Caption: Label.Align_Center_Left,
            Func: function () {
                window.SetProperty("Style.Align", 0x00000004);
                set_align();
                window.Repaint();
                Menu.build();
            }
        },
        {
            Flag: MF_STRING,
            Caption: Label.Align_Center,
            Func: function () {
                window.SetProperty("Style.Align", DT_CENTER);
                set_align();
                window.Repaint();
                Menu.build();
            }
        },
        {
            Flag: MF_STRING,
            Caption: Label.Align_Center_Right,
            Func: function () {
                window.SetProperty("Style.Align", 0x00000005);
                set_align();
                window.Repaint();
                Menu.build();
            }
        },
        {
            Flag: MF_STRING,
            Caption: Label.Align_Right_Center,
            Func: function () {
                window.SetProperty("Style.Align", 0x00000006);
                set_align();
                window.Repaint();
                Menu.build();
            }
        },
        {
            Flag: MF_STRING,
            Caption: Label.Align_Right,
            Func: function () {
                window.SetProperty("Style.Align", DT_RIGHT);
                set_align();
                window.Repaint();
                Menu.build();
            }
        }
    ];

    var submenu_Display = [
        {
            Caption: Label.StyleTextRender + "\t6",
            Func: function () {
                window.SetProperty("Style.EnableStyleTextRender", prop.Style.EnableStyleTextRender = !prop.Style.EnableStyleTextRender);
                if (prop.Style.EnableStyleTextRender)
                    prop.Style.DrawingMethod = 2;
                else if (prop.Panel.ScrollType < 4)
                    prop.Style.DrawingMethod = 0;
                else
                    prop.Style.DrawingMethod = 1;
                set_align();
                main();
            }
        },
        {
            Caption: Label.Bold,
            Func: function () {
                window.SetProperty("Style.Font-Bold", prop.Style.Font_Bold = !prop.Style.Font_Bold);
                prop.Style.Font = gdi.Font(prop.Style.Font_Family, prop.Style.Font_Size, (prop.Style.Font_Bold ? 1 : 0) + (prop.Style.Font_Italic ? 2 : 0));
                window.Repaint();
                Menu.build();
            }
        },
        {
            Caption: Label.Shadow,
            Func: function () {
                window.SetProperty("Style.Text-Shadow", prop.Style.Shadow = !prop.Style.Shadow);
                window.Repaint();
                Menu.build();
            }
        },
        {
            Caption: Label.Italic,
            Func: function () {
                window.SetProperty("Style.Font-Italic", prop.Style.Font_Italic = !prop.Style.Font_Italic);
                prop.Style.Font = gdi.Font(prop.Style.Font_Family, prop.Style.Font_Size, (prop.Style.Font_Bold ? 1 : 0) + (prop.Style.Font_Italic ? 2 : 0));
                window.Repaint();
                Menu.build();
            }
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
            Flag: MF_SEPARATOR
        },
        {
            Caption: Label.Highline,
            Func: function () {
                window.SetProperty("Style.HighlineColor for unsynced lyrics", prop.Style.Highline = !prop.Style.Highline);
                window.Repaint();
                Menu.build();
            }
        },
        {
            Caption: Label.ExpandR,
            Func: function () {
                window.SetProperty("Panel.ExpandRepetition", prop.Panel.ExpandRepetition = !prop.Panel.ExpandRepetition);
                main();
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Caption: Label.Contain,
            Func: function () {
                window.SetProperty("Panel.LRC.ContainNormalLines", prop.Panel.Contain = !prop.Panel.Contain);
                main();
            }
        },
        {
            Caption: Label.ScrollToCenter,
            Func: function () {
                window.SetProperty("Panel.LRC.ScrollToCenter", prop.Panel.ScrollToCenter = !prop.Panel.ScrollToCenter);
                Menu.build();
            }
        }
    ];

    var submenu_ScrollType = [
        {
            Flag: MF_STRING,
            Caption: Label.ScrollType1 + "\t1",
            Func: function () {
                window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 1);
                main();
            }
        },
        {
            Flag: MF_STRING,
            Caption: Label.ScrollType2 + "\t2",
            Func: function () {
                window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 2);
                main();
            }
        },
        {
            Flag: MF_STRING,
            Caption: Label.ScrollType3 + "\t3",
            Func: function () {
                window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 3);
                main();
            }
        },
        {
            Flag: MF_STRING,
            Caption: Label.ScrollType4 + "\t4",
            Func: function () {
                window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 4);
                if (!prop.Style.EnableStyleTextRender) { // Type4ではGDI+での描画が必要
                    prop.Style.DrawingMethod = 1;
                    set_align();
                }
                main();
            }
        },
        {
            Flag: MF_STRING,
            Caption: Label.ScrollType5 + "\t5",
            Func: function () {
                window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 5);
                if (!prop.Style.EnableStyleTextRender) { // Type5ではGDI+での描画が必要
                    prop.Style.DrawingMethod = 1;
                    set_align();
                }
                main();
            }
        }
    ];

    var submenu_Color_LyricShow = createColorMenuItems(prop.Style.CLS, "Style.ColorStyle.LyricShow", "CSLS");
    var submenu_Color_Edit = createColorMenuItems(prop.Style.CE, "Style.ColorStyle.Edit", "CSE");

    function createColorMenuItems(Color, PropName, Place) {
        var items = [], item;
        for (var name in Color) {
            item = {};
            item["Flag"] = MF_STRING;
            item["Caption"] = name;
            item["Func"] = function () {
                window.SetProperty(PropName, prop.Style[Place] = this.Caption);
                prop.Style.Color = Color[this.Caption];
                if (prop.Edit.Start) Edit.calcRGBdiff();
                else LyricShow.set_on_paintInfo_RGBdiff();
                window.Repaint();
                Menu.build(prop.Edit.Start ? Menu.Edit : "");
            };
            items.push(item);
        }

        return items;
    }

    if (plugins) {
        var submenu_Plugins = createPluginMenuItems(plugins);
    }

    function createPluginMenuItems(plugins) {
        var items = [], item, i = 1, FunctionKey = 111;
        for (var name in plugins) {
            item = {};
            item["Flag"] = MF_STRING;
            item["Caption"] = plugins[name].label + (i < 10 ? ("\tF" + i) : "");
            item["Func"] = plugins[name].onCommand;
            item["isPlugin"] = true;
            items.push(item);
            if (i < 10) // Set Keybind_up (F1～F9) 
                Keybind.LyricShow_keyup[FunctionKey + i++] = plugins[name].onCommand;
        }

        return items;
    }

    //=============
    //  main menu items
    //=============
    var menu_LyricShow = [
        {
            Caption: Label.Refresh,
            Func: main
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Caption: Label.Edit,
            Func: function () {
                Edit.start();
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Func: function () {
                window.SetProperty("Panel.AutoScroll", prop.Panel.AutoScroll = !prop.Panel.AutoScroll)
                movable = prop.Panel.AutoScroll;
                ignore_remainder = true;
                window.Repaint();
                Menu.build();
            }
        },
        {
            Caption: Label.ChangeScroll,
            Sub: submenu_ScrollType,
            Radio: null
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: MF_POPUP,
            Caption: Label.Display,
            Sub: submenu_Display
        },
        {
            Flag: MF_POPUP,
            Caption: Label.Align,
            Sub: submenu_Align,
            Radio: null
        },
        {
            Flag: MF_POPUP,
            Caption: Label.Color,
            Sub: submenu_Color_LyricShow,
            Radio: null
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Caption: Label.About,
            Func: function () {
                if (!lyric) return;
                var LineFeedCode = prop.Save.LineFeedCode;
                var lyrics = (lyric.info.length ? lyric.info.join(LineFeedCode) + LineFeedCode : "") + lyric.text.join(LineFeedCode).trim();
                var lineNum = lyric.text.length - (filetype === "lrc" ? 0 : 2);
                var strCount = lyrics.replace(new RegExp(LineFeedCode, "g"), "").length;

                if (path)
                    var str = path + "\nType: " + filetype.toUpperCase() + "\n"
                            + "Lyrics: " + lineNum + " lines, " + strCount + " length, " + dataSize / 1000 + " KB, read as " + charset + "\n"
                            + (offsetinfo ? "Applied offset: " + offsetinfo + " ms\n" : filetype === "lrc" ? "Applied offset: 0 ms\n" : "")
                            + lyrics;
                else
                    str = "Field: " + basename + "\nType: " + filetype.toUpperCase() + "\n"
                        + "Lyrics: " + lineNum + " lines, " + strCount + " length\n"
                        + (offsetinfo ? "Applied offset: " + offsetinfo + " ms\n" : filetype === "lrc" ? "Applied offset: 0 ms\n" : "")
                        + lyrics;

                fb.ShowPopupMessage(str, scriptName);
            }
        },
        {
            Caption: Label.Copy,
            Sub: submenu_Copy
        },
        {
            Caption: Label.SaveToTag,
            Func: function () {
                saveToTag(getFieldName());
            }
        },
        {
            Caption: Label.SaveToFile,
            Func: function () {
                saveToFile(parse_path + (filetype === "lrc" ? ".lrc" : ".txt"));
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Caption: Label.GetClipboard + "\tCtrl+V",
            Func: function () {
                getLyricFromClipboard();
                if (prop.Save.ClipbordAutoSaveTo) {
                    if (/^Tag$/i.test(prop.Save.ClipbordAutoSaveTo))
                        saveToTag(getFieldName());
                    else if (/^File$/i.test(prop.Save.ClipbordAutoSaveTo))
                        saveToFile(parse_path + (filetype === "lrc" ? ".lrc" : ".txt"));
                }
            }
        },
        {
            Caption: Label.Open,
            Func: function () {
                var filter = "Lyric Files(*.lrc;*.txt)|*.txt;*.lrc|LRC Files(*.lrc)|*.lrc|Text Files(*.txt)|*.txt|All Files(*.*)|*.*";
                var fd = new FileDialog(commondir + 'FileDialog.exe -o "' + filter + '" txt');
                fd.setOnReady(function (file) { file && main(file); });
                fd.open();
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
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
            Caption: Label.View,
            Func: Edit.switchView
        },
        {
            Flag: MF_SEPARATOR
        },
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
            Caption: Label.SaveToTag,
            Func: function () {
                saveToTag(getFieldName(true));
            }
        },
        {
            Caption: Label.SaveToFile,
            Func: function () {
                saveToFile(parse_path + ".lrc");
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
            Flag: MF_POPUP,
            Caption: Label.Color,
            Sub: submenu_Color_Edit,
            Radio: null
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
            submenu_Display[0].Flag = prop.Style.EnableStyleTextRender ? MF_CHECKED : MF_UNCHECKED;
            submenu_Display[1].Flag = prop.Style.Font_Bold ? MF_CHECKED : MF_UNCHECKED;
            submenu_Display[2].Flag = prop.Style.Shadow ? MF_CHECKED : MF_UNCHECKED;
            submenu_Display[3].Flag = prop.Style.Font_Italic ? MF_CHECKED : MF_UNCHECKED;
            submenu_Display[4].Flag = prop.Panel.BackgroundEnable ? MF_CHECKED : MF_UNCHECKED;
            submenu_Display[6].Flag = prop.Style.Highline ? MF_CHECKED : MF_UNCHECKED;
            submenu_Display[7].Flag = prop.Panel.ExpandRepetition ? MF_CHECKED : MF_UNCHECKED;
            submenu_Display[9].Flag = prop.Panel.Contain ? MF_CHECKED : MF_UNCHECKED;
            submenu_Display[10].Flag = prop.Panel.ScrollToCenter ? MF_CHECKED : MF_UNCHECKED;

            menu_LyricShow[5].Radio = prop.Panel.ScrollType - 1; // radio number begin with 0
            switch (Number(window.GetProperty("Style.Align"))) {
                case 0: // Left
                    menu_LyricShow[8].Radio = 0; break;
                case 1: // Center
                    menu_LyricShow[8].Radio = 3; break;
                case 2: // Right
                    menu_LyricShow[8].Radio = 6; break;
                case 3: // Left_Center
                    menu_LyricShow[8].Radio = 1; break;
                case 4: // Center_Left
                    menu_LyricShow[8].Radio = 2; break;
                case 5: // Center_Right
                    menu_LyricShow[8].Radio = 4; break;
                case 6: // Right_Center
                    menu_LyricShow[8].Radio = 5; break;
            }
            switch (prop.Style.CSLS) {
                case "white":
                    menu_LyricShow[9].Radio = 0; break;
                case "black":
                    menu_LyricShow[9].Radio = 1; break;
                case "user":
                    menu_LyricShow[9].Radio = 2; break;
            }
            switch (prop.Style.DrawingMethod) {
                case 0:
                    menu_LyricShow[10].Radio = 0; break;
                case 1:
                    menu_LyricShow[10].Radio = 1; break;
                case 2:
                    menu_LyricShow[10].Radio = 2; break;
            }
            menu_LyricShow[19].Flag = path ? MF_STRING : MF_GRAYED;
            menu_LyricShow[4].Caption = prop.Panel.AutoScroll ? Label.ForbidAutoScroll : Label.AllowAutoScroll;

            if (lyric) {
                menu_LyricShow[2].Flag = MF_STRING;
                menu_LyricShow[4].Flag = MF_STRING;
                menu_LyricShow[5].Flag = filetype === "lrc" ? MF_POPUP : MF_GRAYED;
                menu_LyricShow[11].Flag = MF_STRING;
                menu_LyricShow[12].Flag = MF_POPUP;
                menu_LyricShow[13].Flag = MF_STRING;
                menu_LyricShow[14].Flag = MF_STRING;
            }
            else {
                menu_LyricShow[2].Flag = menu_LyricShow[4].Flag = menu_LyricShow[5].Flag = menu_LyricShow[11].Flag = menu_LyricShow[12].Flag = menu_LyricShow[13].Flag = menu_LyricShow[14].Flag = MF_GRAYED;
            }

            if (fb.IsPlaying) {
                menu_LyricShow[0].Flag = MF_STRING;
                menu_LyricShow[16].Flag = MF_STRING;
                menu_LyricShow[17].Flag = MF_STRING;
                menu_LyricShow[20].Flag = MF_STRING;
            }
            else
                menu_LyricShow[0].Flag = menu_LyricShow[16].Flag = menu_LyricShow[17].Flag = menu_LyricShow[20].Flag = MF_GRAYED;
        }
    };

    this.Edit = {
        items: menu_Edit,
        refresh: function () {
            menu_Edit[0].Flag = prop.Edit.View ? MF_CHECKED : MF_UNCHECKED;
            menu_Edit[4].Flag = (prop.Edit.View && Edit.View.i == lyric.text.length) ? MF_STRING : MF_GRAYED;
            menu_Edit[5].Flag = (prop.Edit.View && Edit.View.i == lyric.text.length) ? MF_STRING : MF_GRAYED;
            menu_Edit[8].Flag = prop.Edit.View ? MF_GRAYED : MF_STRING;
            menu_Edit[9].Flag = prop.Edit.View ? MF_GRAYED : MF_STRING;
            switch (prop.Style.CSE) {
                case "white":
                    menu_Edit[11].Radio = 0; break;
                case "black":
                    menu_Edit[11].Radio = 1; break;
                case "user":
                    menu_Edit[11].Radio = 2; break;
            }
            menu_Edit[12].Flag = prop.Edit.Rule ? MF_CHECKED : MF_UNCHECKED;
            menu_Edit[14].Flag = fs.FileExists(parse_path + ".txt") ? MF_STRING : MF_GRAYED;
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
        Lock_MiddleButton = true;
        var ret = _menu.TrackPopupMenu(x, y);
        //console(ret);
        if (ret != 0)
            if (item_list[ret])
                item_list[ret].Func();
            else
                item_list._context.ExecuteByID(ret - item_list._contextIdx);
        Lock_MiddleButton = false;
    };

    this.getMenu = function () {
        return _menu;
    };

    this.addToMenu_LyricShow = function (items) {
        var temp = menu_LyricShow.splice(menu_LyricShow.length - 2, 2);
        menu_LyricShow = menu_LyricShow.concat(items).concat(temp);
        this.LyricShow.items = menu_LyricShow;
    }
};


//========================================
//== onLoad function ==========================
//========================================

set_align();
on_size();
for (var pname in plugins)
    plugins[pname].onStartUp();

function main(text) {

    if (arguments.callee.IsVisible !== window.IsVisible)
        arguments.callee.IsVisible = prop.Panel.RunInTheBackground ? true : window.IsVisible;

    if (arguments.callee.IsVisible && fb.IsPlaying) {
        var parse_paths = fb.TitleFormat(prop.Panel.Path).Eval().split("||");
        //Trace.start(" Read Lyrics ");
        LyricShow.start(parse_paths, text);
        //Trace.stop();
    }
    else
        LyricShow.init();

    window.Repaint();
    Menu.build();

    //(function () { if (lyric) { Edit.start(); } }).timeout(400);
}
main();


//========================================
//== Callback function =========================
//========================================
function on_paint(gr) {
    gr.SetTextRenderingHint(5);
    gr.SetSmoothingMode(2);
    //gr.SetInterpolationMode(7);

    if (!prop.Edit.Start) // Normal
        LyricShow && LyricShow.on_paint(gr);
    else { // Edit
        Edit.on_paint(gr);
        Buttons.on_paint_Button(gr);
    }

    StatusBar.on_paint(gr); // Status Bar
}

function on_size() {
    g_x = prop.Style.HPadding;
    g_y = prop.Style.VPadding;
    ww = Math.max(window.Width - g_x * 2, 0); // window.Width と window.Height を 0 に設定してくるコンポ（foo_uie_tabs等）があるので、Math.maxメソッドで負数を回避
    wh = Math.max(window.Height - g_y * 2, 0);
    centerleftX = Math.round(ww / 5 + g_x);
    fixY = Math.round(wh * (prop.Style.CenterPosition / 100));

    seek_width = Math.max(Math.floor(ww * 15 / 100), 0);
    rarea_seek_x = ww - seek_width;
    arc_w = (seek_width >= 30) * 15;
    arc_h = (wh - 50 >= 30) * 15;
    if (prop.Edit.Start) {
        Edit.calcSeekIMGarea();
        Buttons.buildButton();
    }

    ww && wh && RefreshDrawStyle();
    BackgroundImg && LyricShow.setBackgroundImage();
}

function on_focus(is_focused) {
    !main.IsVisible && main();
}

function on_playback_new_track(metadb) {
    main();
    for (var pname in plugins)
        plugins[pname].onPlay();
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
    if (!prop.Edit.Start && lyric)
        LyricShow.pauseTimer(state);
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
            else if (x >= rarea_seek_x && y < wh - 30 && !rarea_seek) {
                rarea_seek = true;
                window.Repaint();
            }
            else if ((x < rarea_seek_x || y > wh - 30) && rarea_seek) {
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
            drag_y = down_pos.y = y;
            down_pos.x = x;
        }
    }
    else if (!Lock)
        if (Buttons.CurrentButton)
            Buttons.on_mouse_lbtn_down(x, y);
        else if (larea_seek)
            fb.PlaybackTime -= 3;
        else if (rarea_seek)
            fb.PlaybackTime += 3;
        else if (mask == 9)
            fs.FileExists(parse_path + ".txt") && Edit.deleteFile(parse_path + ".txt");
        else if (!prop.Edit.View) {
            if (mask == 5)
                Edit.controlLine(0);
            else if (y < TextHeight * 2 + g_y)
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
        if (prop.Panel.ScrollType !== 4 && prop.Panel.ScrollType !== 5 && prop.Panel.SingleClickSeek && filetype === "lrc" && x === down_pos.x && y === down_pos.y) {
            jumpY = offsetY;
            for (var i = disp.top, j = disp.bottom; i <= j; i++)
                if (LyricShow.setProperties.DrawStyle[i].onclick(x, y))
                    break;
        }
    }
    else if (Buttons.CurrentButton)
        Buttons.on_mouse_lbtn_up(x, y);
    Buttons.resetFlag();
}

function on_mouse_lbtn_dblclk(x, y, mask) {
    if (prop.Edit.Start) on_mouse_lbtn_down(x, y, mask);
    else if (filetype !== "lrc") main();
    else if (prop.Panel.ScrollType !== 4 && prop.Panel.ScrollType !== 5 && !prop.Panel.SingleClickSeek) {
        jumpY = offsetY;
        for (var i = disp.top, j = disp.bottom; i <= j; i++)
            if (LyricShow.setProperties.DrawStyle[i].onclick(x, y))
                break;
    }
}

function on_mouse_mbtn_down(x, y, mask) {
    if (Lock_MiddleButton) return;
    else if (prop.Edit.Start) Edit.switchView();
    else if (lyric) Edit.start();
}

function on_mouse_mbtn_dblclk(x, y, mask) {
    on_mouse_mbtn_down(x, y, mask);
}

function on_mouse_wheel(step) {
    if (!prop.Edit.Start) {
        if (on_key_down.Ctrl) {
            if (step === 1 && prop.Style.Font_Size >= 48 || step === -1 && prop.Style.Font_Size <= 10)
                return;
            window.SetProperty("Style.Font-Size", prop.Style.Font_Size += step);
            prop.Style.Font = gdi.Font(prop.Style.Font_Family, prop.Style.Font_Size, (prop.Style.Font_Bold ? 1 : 0) + (prop.Style.Font_Italic ? 2 : 0));
            RefreshDrawStyle();
            lyric && LyricShow.searchLine(fb.PlaybackTime);
            StatusBar.setText("Font Size : " + prop.Style.Font_Size);
            StatusBar.show(3000);
        }
        else
            lyric && applyDelta(step * 20);
    }
    else if (!Lock) {
        if (!prop.Edit.View) {
            if (step === 1) // wheel up
                Edit.undo();
            else if (step === -1) // wheel down
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
    if (mask === 4) // Shift key
        return;
    else {
        !Lock && Menu.show(x, y);
        return true; // prevent default menu
    }
}

function on_key_down(vkey) {
    //console(vkey);
    if (vkey === 16)
        !on_key_down.Shift && (on_key_down.Shift = true);
    else if (vkey === 17)
        !on_key_down.Ctrl && (on_key_down.Ctrl = true);
    else if (!prop.Edit.Start)
        Keybind.LyricShow_keydown[vkey] && Keybind.LyricShow_keydown[vkey]();
    else if (!Lock)
        Keybind.Edit_keydown[vkey] && Keybind.Edit_keydown[vkey]();
}

function on_key_up(vkey) {
    if (vkey === 16)
        on_key_down.Shift = false;
    else if (vkey === 17)
        on_key_down.Ctrl = false;
    else if (!prop.Edit.Start)
        Keybind.LyricShow_keyup[vkey] && Keybind.LyricShow_keyup[vkey]();
    else if (!Lock)
        Keybind.Edit_keyup[vkey] && Keybind.Edit_keyup[vkey]();
}

function on_notify_data(name, info) {
    if (name === scriptName && typeof info === "string")
        main(typeof info === "string" ? info : null);
}

//EOF