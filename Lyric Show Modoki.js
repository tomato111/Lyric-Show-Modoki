//## code for foo_uie_wsh_mod v1.5.6 or higher  ####//
//## Please check off "Grab Focus" and "Delay Load" ##//

// ==PREPROCESSOR==
// @name "Lyric Show Modoki"
// @version "1.8.0"
// @author "tomato111"
// @import "%fb2k_profile_path%import\common\lib.js"
// ==/PREPROCESSOR==


//============================================
//== Global Variable and Function ============
//============================================
// user reserved words
var plugins, lyric, parse_path, directory, filetype, infoPath, Messages, Label
    , offsetY, fixY, fromY, g_x, g_y, ww, wh, seek_width, arc_w, arc_h, centerleftX
    , isAnim, isExternalSeek, ignore_remainder, movable, textHeight;

var fs = new ActiveXObject("Scripting.FileSystemObject"); // File System Object
var ws = new ActiveXObject("WScript.Shell"); // WScript Shell Object
var Trace = new TraceLog();
var scriptName = "Lyric Show Modoki";
var scriptVersion = "1.8.0";
var scriptdir = fb.ProfilePath + "import\\" + scriptName + "\\";
var commondir = fb.ProfilePath + "import\\common\\";
var align = {};
var mouse = {};
var disp = {};
var backupLyric = [];
var TextRender = gdi.CreateStyleTextRender();
var DT_LEFT = 0x00000000;
var DT_CENTER = 0x00000001;
var DT_RIGHT = 0x00000002;
var DT_WORDBREAK = 0x00000010;
var DT_NOPREFIX = 0x00000800;
var DT_WORD_ELLIPSIS = 0x00040000;
var GDIPlus_LEFT = 0x00000000;
var GDIPlus_CENTER = 0x10000000;
var GDIPlus_RIGHT = 0x20000000;
var MF_SEPARATOR = 0x00000800;
var MF_ENABLED = 0x00000000;
var MF_GRAYED = 0x00000001;
var MF_DISABLED = 0x00000002;
var MF_UNCHECKED = 0x00000000;
var MF_CHECKED = 0x00000008;
var MF_STRING = 0x00000000;
var VK_SHIFT = 0x10;
var VK_CONTROL = 0x11;
var ASYNC = true;
var alltagsRE = /\[\d\d\d?:\d\d[.:]\d\d\]/g;
var tagTimeRE = /^\[(\d\d\d?):(\d\d)[.:](\d\d)\]/;
var isSyncRE = /^\[\d\d\d?:\d\d[.:]\d\d\]/m;
var repeatRes = getRepeatRes(scriptdir + "repeat.txt", scriptdir + "repeat-default.txt");

//========
// properties
//========
var prop = new function () {
    // ---- Removed Property
    window.SetProperty("Panel.Interval", null);
    window.SetProperty("Panel.Interval2", null);
    window.SetProperty("Panel.Keybind.LastUsedPlugin", null);
    window.SetProperty("Style.DrawingMethod", null);
    window.SetProperty("Panel.Keybind.ScrollUp", null);
    window.SetProperty("Panel.Keybind.ScrollDown", null);
    window.SetProperty("Panel.LRC.ScrollStartTime", null);
    window.SetProperty("Panel.Background.ImageToRawBitmap", null);
    window.SetProperty("Panel.Background.ImageOption", null);
    window.SetProperty("Style.User.Edit.ArrowImage", null);
    window.SetProperty("Style.User.Edit.ArrowOpacity", null);
    // ----


    var defaultpath = ws.SpecialFolders.item("Desktop") + "\\$replace(%artist% - %title%,*,＊,?,？,/,／,:,：)";

    // ==Panel====
    this.Panel = {
        Path: window.GetProperty("Panel.Path", defaultpath), // Lyrics Folder
        PathFuzzyLevel: window.GetProperty("Panel.Path.FuzzyLevel", 0),
        Lang: window.GetProperty("Panel.Language", ""),
        HideConf: window.GetProperty("Panel.HideConfigureMenu", false),
        Interval: 15, // Don't change
        Editor: window.GetProperty("Panel.ExternalEditor", ""),
        NoLyric: window.GetProperty("Panel.NoLyricsFound", "Title: %title%\\nArtist: %artist%\\nAlbum: %album%\\n\\n-no lyrics-"),
        Priority: window.GetProperty("Panel.Priority", "Sync_Tag,Sync_File,Unsync_Tag,Unsync_File"),
        Contain: window.GetProperty("Panel.LRC.ContainNormalLines", false),
        ScrollType: window.GetProperty("Panel.LRC.ScrollType", 1),
        SkipEmptyLine: window.GetProperty("Panel.LRC.SkipEmptyLine", true),
        AlphaDurationTime: 30,
        ScrollDurationTime: window.GetProperty("Panel.LRC.ScrollDurationTime", 141), // value*10 [ms]前からスクロール開始 // 3の倍数を推奨
        ScrollToCenter: window.GetProperty("Panel.LRC.ScrollToCenter", false),
        BackgroundAlpha: window.GetProperty("Panel.Background.Alpha", 50),
        BackgroundAngle: window.GetProperty("Panel.Background.Angle", 20),
        BackgroundEnable: window.GetProperty("Panel.Background.Enable", true),
        BackgroundPath: window.GetProperty("Panel.Background.Image", "<embed>||$directory_path(%path%)\\*.*||'%fb2k_profile_path%'\\import\\Lyric Show Modoki\\background.jpg"),
        BackgroundKAR: window.GetProperty("Panel.Background.KeepAspectRatio", true),
        BackgroundStretch: window.GetProperty("Panel.Background.Stretch", true),
        BackgroundBlur: window.GetProperty("Panel.Background.Blur", false),
        BackgroundBlurValue: window.GetProperty("Panel.Background.BlurValue", 50),
        BackgroundBlurAlpha: window.GetProperty("Panel.Background.BlurAlpha", 76),
        ExpandRepetition: window.GetProperty("Panel.ExpandRepetition", false),
        AdjustScrolling: window.GetProperty("Panel.AdjustScrolling", 100),
        SingleClickSeek: window.GetProperty("Panel.SingleClickSeek", false),
        AutoScroll: window.GetProperty("Panel.AutoScroll", true),
        RunInTheBackground: window.GetProperty("Panel.RunInTheBackground", false),
        MouseWheelDelta: window.GetProperty("Panel.MouseWheelDelta", 30),
        MouseWheelSmoothing: window.GetProperty("Panel.MouseWheelSmoothing", true),
        RefreshOnPanelResize: window.GetProperty("Panel.RefreshOnPanelResize", false),
        InfoPath: window.GetProperty("Panel.InfoPath", ""),
        GuessPlaybackTempo: window.GetProperty("Panel.GuessPlaybackTempo", false),
        FollowExternalSeek: window.GetProperty("Panel.FollowExternalSeek", true),
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

    if (typeof this.Panel.BackgroundAlpha !== "number" || this.Panel.BackgroundAlpha < 0 || this.Panel.BackgroundAlpha > 255)
        window.SetProperty("Panel.Background.Alpha", this.Panel.BackgroundAlpha = 50);

    if (typeof this.Panel.BackgroundAngle !== "number")
        window.SetProperty("Panel.Background.Angle", this.Panel.BackgroundAngle = 20);

    if (typeof this.Panel.BackgroundBlurValue !== "number" || this.Panel.BackgroundBlurValue < 1 || this.Panel.BackgroundBlurValue > 100 || this.Panel.BackgroundBlurValue % 1) //v1.8.0で型が整数に変わったので%1でチェック
        window.SetProperty("Panel.Background.BlurValue", this.Panel.BackgroundBlurValue = 50);

    if (typeof this.Panel.BackgroundBlurAlpha !== "number" || this.Panel.BackgroundBlurAlpha < 0 || this.Panel.BackgroundBlurAlpha > 255)
        window.SetProperty("Panel.Background.BlurAlpha", this.Panel.BackgroundBlurAlpha = 76);

    if (typeof this.Panel.AdjustScrolling !== "number" || this.Panel.AdjustScrolling < 0)
        window.SetProperty("Panel.AdjustScrolling", this.Panel.AdjustScrolling = 100);

    if (typeof this.Panel.ScrollType !== "number" || this.Panel.ScrollType < 1 || this.Panel.ScrollType > 5)
        window.SetProperty("Panel.LRC.ScrollType", this.Panel.ScrollType = 1);

    if (typeof this.Panel.ScrollDurationTime !== "number" || this.Panel.ScrollDurationTime < 3 || this.Panel.ScrollDurationTime > 300)
        window.SetProperty("Panel.LRC.ScrollDurationTime", this.Panel.ScrollDurationTime = 141);

    if (typeof this.Panel.MouseWheelDelta !== "number" || this.Panel.MouseWheelDelta < 0)
        window.SetProperty("Panel.MouseWheelDelta", this.Panel.MouseWheelDelta = 30);

    // ==Style====
    this.Style = {
        CS_LS: window.GetProperty("Style.ColorStyle.LyricShow", "black"),
        CS_E: window.GetProperty("Style.ColorStyle.Edit", "white"),
        Font_Family: window.GetProperty("Style.Font-Family", ""),
        Font_Size: window.GetProperty("Style.Font-Size", 13),
        Font_Bold: window.GetProperty("Style.Font-Bold", true),
        Font_Italic: window.GetProperty("Style.Font-Italic", false),
        Shadow: window.GetProperty("Style.Text-Shadow", true),
        ShadowPosition: window.GetProperty("Style.Text-ShadowPosition", "1,2"),
        TextRoundSize: window.GetProperty("Style.Text-RoundSize", 5),
        Align: window.GetProperty("Style.Align", DT_CENTER),
        AlignNoLyric: window.GetProperty("Style.AlignNoLyric", DT_CENTER),
        HPadding: window.GetProperty("Style.Horizontal-Padding", 5),
        VPadding: window.GetProperty("Style.Vartical-Padding", "4,4").toString().split(/[ 　]*,[ 　]*/),
        LPadding: window.GetProperty("Style.Line-Padding", 1),
        Highline: window.GetProperty("Style.HighlineColor for unsynced lyrics", true),
        CenterPosition: window.GetProperty("Style.CenterPosition", 46),
        EnableStyleTextRender: window.GetProperty("Style.EnableStyleTextRender", true),
        FadeInPlayingColor: window.GetProperty("Style.FadeInPlayingColor", false),
        Fading: window.GetProperty("Style.Fading", false),
        FadingHeight: window.GetProperty("Style.FadingHeight", "40,40").toString().split(/[ 　]*,[ 　]*/),
        DrawingMethod: 0,
        KeepPlayingColor: window.GetProperty("Style.KeepPlayingColor", false)
    };

    this.Style.C_LS = { // define color of LyricShow
        white: {
            Text: RGB(80, 80, 80),                  // Normal Text color
            TextShadow: RGB(225, 225, 225),         // Text Shadow color
            TextRound: RGB(240, 240, 240),          // Text Round color (for StyleTextRender)
            Background: RGBA(248, 248, 248, 255),   // Background color
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
            Background: eval(window.GetProperty("Style.User.LyricShow.Background", "RGBA(76, 76, 76, 255)")),
            PlayingText: eval(window.GetProperty("Style.User.LyricShow.PlayingText", "RGB(255, 142, 196)"))
        }
    };

    this.Style.C_E = { // define color of Edit
        white: {
            Text: RGB(80, 80, 80),                          // Text color
            Background: RGBA(255, 255, 255, 255),           // Background color
            ViewBackground: RGBA(236, 244, 254, 255),       // Bacground color of ViewMode
            Line: RGBA(193, 219, 252, 200),                 // Bacground color of playing line
            Rule: RGBA(0, 0, 0, 40),                        // Ruled line color
            Length: RGB(100, 100, 100),                     // Number of line
            Seek: RGBA(255, 0, 0, 28),                      // Seek area color
            SeekArrow: RGBA(128, 128, 128, 128)             // Seek arrow color
        },
        black: {
            Text: RGB(210, 210, 210),
            Background: RGBA(0, 0, 0, 210),
            ViewBackground: RGBA(0, 3, 3, 195),
            Line: RGBA(153, 255, 20, 70),
            Rule: RGBA(255, 255, 205, 40),
            Length: RGB(180, 180, 180),
            Seek: RGBA(20, 205, 255, 28),
            SeekArrow: RGBA(128, 128, 128, 160)
        },
        user: {
            Text: eval(window.GetProperty("Style.User.Edit.Text", "RGB(210, 210, 210)")),
            Background: eval(window.GetProperty("Style.User.Edit.Background", "RGBA(0, 0, 0, 210)")),
            ViewBackground: eval(window.GetProperty("Style.User.Edit.ViewBackground", "RGBA(0, 3, 3, 195)")),
            Line: eval(window.GetProperty("Style.User.Edit.PlayingLine", "RGBA(153, 255, 20, 70)")),
            Rule: eval(window.GetProperty("Style.User.Edit.RuledLine", "RGBA(255, 255, 205, 40)")),
            Length: eval(window.GetProperty("Style.User.Edit.LineNumber", "RGB(180, 180, 180)")),
            Seek: eval(window.GetProperty("Style.User.Edit.SeekArea", "RGBA(20, 205, 255, 28)")),
            SeekArrow: eval(window.GetProperty("Style.User.Edit.SeekArrow", "RGBA(128, 128, 128, 160)"))
        }
    };

    // check CS_LS and Set Style.Color
    if (!(this.Style.CS_LS in this.Style.C_LS))
        window.SetProperty("Style.ColorStyle.LyricShow", this.Style.CS_LS = "black");
    this.Style.Color = this.Style.C_LS[this.Style.CS_LS];

    // check CS_E
    if (!(this.Style.CS_E in this.Style.C_E))
        window.SetProperty("Style.ColorStyle.Edit", this.Style.CS_E = "white");

    // check Align
    if (typeof this.Style.Align !== "number" || this.Style.Align < 0x00000000 || this.Style.Align > 0x00000006)
        window.SetProperty("Style.Align", this.Style.Align = DT_CENTER);

    if (typeof this.Style.AlignNoLyric !== "number" || this.Style.AlignNoLyric < 0x00000000 || this.Style.AlignNoLyric > 0x00000006)
        window.SetProperty("Style.AlignNoLyric", this.Style.AlignNoLyric = DT_CENTER);

    // check Font and Set Style.Font
    var fontfamily = ["Meiryo", "Tahoma", "Arial", "Segoe UI", "MS Gothic"];

    fontfamily.unshift(this.Style.Font_Family);
    for (i = 0; i < fontfamily.length; i++)
        if (utils.CheckFont(fontfamily[i])) {
            window.SetProperty("Style.Font-Family", this.Style.Font_Family = fontfamily[i]);
            break;
        }

    if (!this.Style.Font_Size || typeof this.Style.Font_Size !== "number")
        window.SetProperty("Style.Font-Size", this.Style.Font_Size = 13);

    this.Style.Font = gdi.Font(this.Style.Font_Family, this.Style.Font_Size, (this.Style.Font_Bold ? 1 : 0) + (this.Style.Font_Italic ? 2 : 0));

    // check TextShadow
    if (!/^-?\d+?,-?\d+$/.test(this.Style.ShadowPosition))
        window.SetProperty("Style.Text-ShadowPosition", "1,2");

    this.Style.ShadowPosition = this.Style.ShadowPosition.split(",");
    this.Style.ShadowPosition[0] = Number(this.Style.ShadowPosition[0]);
    this.Style.ShadowPosition[1] = Number(this.Style.ShadowPosition[1]);

    if (typeof this.Style.TextRoundSize !== "number" || this.Style.TextRoundSize < 0)
        window.SetProperty("Style.Text-RoundSize", this.Style.TextRoundSize = 5);

    // check CenterPosition
    if (typeof this.Style.CenterPosition !== "number" || this.Style.CenterPosition < 0 || this.Style.CenterPosition > 100)
        window.SetProperty("Style.CenterPosition", this.Style.CenterPosition = 46);

    // check FadingHeight
    if (!this.Style.FadingHeight || this.Style.FadingHeight.length < 2
        || !/^\d+$/.test(this.Style.FadingHeight[0]) || !/^\d+$/.test(this.Style.FadingHeight[1])) {

        window.SetProperty("Style.FadingHeight", this.Style.FadingHeight = "40,40");
        this.Style.FadingHeight = this.Style.FadingHeight.split(/[ 　]*,[ 　]*/);
    }
    this.Style.FadingHeight[0] = Number(this.Style.FadingHeight[0]);
    this.Style.FadingHeight[1] = Number(this.Style.FadingHeight[1]);

    // check Padding
    if (typeof this.Style.HPadding !== "number")
        window.SetProperty("Style.Horizontal-Padding", this.Style.HPadding = 5);

    if (!this.Style.VPadding || this.Style.VPadding.length < 2
        || !/^\d+$/.test(this.Style.VPadding[0]) || !/^\d+$/.test(this.Style.VPadding[1])) {

        window.SetProperty("Style.Vartical-Padding", this.Style.VPadding = "4,4");
        this.Style.VPadding = this.Style.VPadding.split(/[ 　]*,[ 　]*/);
    }
    this.Style.VPadding[0] = Number(this.Style.VPadding[0]);
    this.Style.VPadding[1] = Number(this.Style.VPadding[1]);

    if (typeof this.Style.LPadding !== "number")
        window.SetProperty("Style.Line-Padding", this.Style.LPadding = 1);

    // StatusBar setting
    this.Style.StatusBarFont = gdi.Font(this.Style.Font_Family, 12, 1);
    this.Style.StatusBarColor = RGB(220, 220, 220);
    this.Style.StatusBarBackground = RGBA(90, 90, 90, 255);
    this.Style.StatusBarRect = RGBA(160, 160, 160, 255);


    // ==Edit====
    this.Edit = {
        Rule: window.GetProperty("Edit.ShowRuledLine", true),
        Step: window.GetProperty("Edit.Step", 14),
        Keybind:
        {
            AheadBy3Seconds: window.GetProperty("Edit.Keybind.AheadBy3Seconds", 39), // Default is 'Right' Key
            BackBy3Seconds: window.GetProperty("Edit.Keybind.BackBy3Seconds", 37) // Default is 'Left' Key
        }
    };

    if (!this.Edit.Step && typeof this.Edit.Step !== "number" || this.Edit.Step < 0)
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

    if (!/^(?:Unicode|Shift_JIS|EUC-JP|UTF-8|UTF-8N)$/i.test(this.Save.CharacterCode))
        window.SetProperty("Save.CharacterCode", this.Save.CharacterCode = "UTF-8");
    if (!/^(?:CR\+LF|LF)$/i.test(this.Save.LineFeedCode))
        window.SetProperty("Save.LineFeedCode", this.Save.LineFeedCode = "CR+LF");

    this.Save.LineFeedCode = this.Save.LineFeedCode.replaceEach("CR", "\r", "LF", "\n", "\\+", "", "i"); // Set converted code

    if (this.Save.RunAfterSave) this.Save.RunAfterSave = this.Save.RunAfterSave.split("||");

    this.Save.TimetagSign = this.Save.TimetagSign ? ":" : ".";

    if (!/^(?:File|Tag)$/i.test(this.Save.ClipbordAutoSaveTo))
        window.SetProperty("Save.GetClipbord.AutoSaveTo", this.Save.ClipbordAutoSaveTo = "");


    // ==Plugin====
    this.Plugin = {
        AutoSaveTo: window.GetProperty("Plugin.Search.AutoSaveTo", ""),
        AutoSaveLrcTo: window.GetProperty("Plugin.Search.AutoSaveLrcTo", ""),
        Disable: window.GetProperty("Plugin.Disable", ""), // set plugin's names. (e.g. dplugin_Utamap, oplugin_NewFile_TXT
        FunctionKey: window.GetProperty("Plugin.FunctionKey", "splugin_AutoSearch,,,,,,,,uplugin_Lyric_Show_Modoki").split(",") // set plugin's names. (e.g. ,,dplugin_AZLyrics,,,,,,uplugin_Lyric_Show_Modoki
    };

    this.Plugin.FunctionKey.length = 9;

    if (!/^(?:File|Tag)?$/i.test(this.Plugin.AutoSaveTo))
        window.SetProperty("Plugin.Search.AutoSaveTo", this.Plugin.AutoSaveTo = "");
    if (!/^(?:File|Tag)?$/i.test(this.Plugin.AutoSaveLrcTo))
        window.SetProperty("Plugin.Search.AutoSaveLrcTo", this.Plugin.AutoSaveLrcTo = "");
}();

//========
// load language
//========

LanguageLoader = {

    Messages: {},
    Label: {},

    Load: function (path) {

        function checkLang(lang) {
            for (var i = 0; i < definedLanguage.length; i++)
                if (lang === definedLanguage[i])
                    return true;
            return false;
        }

        var definedLanguage = [];
        var languages = utils.Glob(path + "*.ini").toArray();

        for (var i = 0; i < languages.length; i++) {
            definedLanguage.push(fs.GetBaseName(languages[i]));
        }

        if (!prop.Panel.Lang || !checkLang(prop.Panel.Lang)) { // get lang from environment variable. show propmt if it cannot get a available language,  
            var EnvLang = ws.Environment("USER").Item("LANG").substring(0, 2);
            if (!checkLang(EnvLang)) {
                EnvLang = prompt('Please input menu language.\n"' + definedLanguage.join('", "') + '" is available.', scriptName, "en");
                if (!checkLang(EnvLang))
                    EnvLang = "en";
            }
            window.SetProperty("Panel.Language", prop.Panel.Lang = EnvLang);
        }

        languages[0] = new Ini(path + "default", "UTF-8");
        languages[1] = new Ini(path + prop.Panel.Lang + ".ini", "UTF-8");

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
            GetClipboard: new Message(lang1.GetClipboard || lang0.GetClipboard, scriptName, 48),
            LargeFieldsConfig: new Message(lang1.LargeFieldsConfig || lang0.LargeFieldsConfig, scriptName, 48)
        };

        lang0 = languages[0].items.Label;
        lang1 = languages[1].items.Label;

        for (var name in lang0) {
            this.Label[name] = lang1[name] || lang0[name];
        }
    }
};

LanguageLoader.Load(scriptdir + "language\\");
Messages = LanguageLoader.Messages;
Label = LanguageLoader.Label;

//=========
// load plugins
//=========

PluginLoader = {

    Plugins: {},

    Load: function (path) {
        var f, fc, str, pl;
        var jsRE = /\.js$/i;
        var asgRE = /^[^{]*/;
        var disableRE = new RegExp("^(?:" + prop.Plugin.Disable.trim().replace(/[ 　]*,[ 　]*/g, "|") + ")$");

        try {
            f = fs.GetFolder(path);
        } catch (e) { throw new Error("The path to a plugins folder is wrong. (" + scriptName + ")"); }

        fc = new Enumerator(f.Files);

        for (; !fc.atEnd(); fc.moveNext()) {
            if (!jsRE.test(fc.item().Name)) continue;
            try {
                str = readTextFile(fc.item().Path);
            } catch (e) { continue; }
            try {
                eval(str.replace(asgRE, "pl="));
            } catch (e) {
                fb.trace(fc.item().Name + " is SyntaxError. (" + scriptName + ")");
                continue;
            }
            if (!disableRE.test(pl.name))
                this.Plugins[pl.name] = pl;
        }
    }
};

PluginLoader.Load(scriptdir + "plugins\\");
plugins = PluginLoader.Plugins;

//=======
// function
//=======

function getRepeatRes(userfile, defaultfile) {

    var file = fs.FileExists(userfile) ? userfile : defaultfile;

    try {
        return eval("[" + readTextFile(file, "UTF-8") + "]");
    } catch (e) {
        console("faild to load \"repeat.txt\" or \"repeat-default.txt\" (" + scriptName + ")");
        return;
    }
}

function setRGBdiff(color, dr, dg, db) {

    return RGB(getRed(color) + dr, getGreen(color) + dg, getBlue(color) + db);
}

function setDrawingMethod() {

    if (prop.Style.EnableStyleTextRender)
        prop.Style.DrawingMethod = 2;
    else if (prop.Panel.ScrollType > 3 || prop.Style.Fading)
        prop.Style.DrawingMethod = 1;
    else
        prop.Style.DrawingMethod = 0;

    setAlign();
}

function setAlign() {

    align.Left_Center = align.Center_Left = align.Center_Right = align.Right_Center = false;

    switch (window.GetProperty("Style.Align")) {
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
            align.Left_Center = true;
            prop.Edit.Align = DT_LEFT | DT_NOPREFIX | DT_WORDBREAK;
            break;
        case 0x00000004:
            prop.Style.Align = prop.Style.DrawingMethod === 0 ? DT_LEFT | DT_NOPREFIX : GDIPlus_LEFT;
            align.Center_Left = true;
            prop.Edit.Align = DT_LEFT | DT_NOPREFIX | DT_WORDBREAK;
            break;
        case 0x00000005:
            prop.Style.Align = prop.Style.DrawingMethod === 0 ? DT_RIGHT | DT_NOPREFIX : GDIPlus_RIGHT;
            align.Center_Right = true;
            prop.Edit.Align = DT_RIGHT | DT_NOPREFIX | DT_WORDBREAK;
            break;
        case 0x00000006:
            prop.Style.Align = prop.Style.DrawingMethod === 0 ? DT_RIGHT | DT_NOPREFIX : GDIPlus_RIGHT;
            align.Right_Center = true;
            prop.Edit.Align = DT_RIGHT | DT_NOPREFIX | DT_WORDBREAK;
            break;
    }

    align.Left_Center_NL = align.Center_Left_NL = align.Center_Right_NL = align.Right_Center_NL = false;

    switch (window.GetProperty("Style.AlignNoLyric")) {
        case 0x00000000:
            prop.Style.AlignNoLyric = prop.Style.DrawingMethod === 0 ? DT_LEFT | DT_NOPREFIX | DT_WORDBREAK : GDIPlus_LEFT;
            break;
        case 0x00000001:
            prop.Style.AlignNoLyric = prop.Style.DrawingMethod === 0 ? DT_CENTER | DT_NOPREFIX | DT_WORDBREAK : GDIPlus_CENTER;
            break;
        case 0x00000002:
            prop.Style.AlignNoLyric = prop.Style.DrawingMethod === 0 ? DT_RIGHT | DT_NOPREFIX | DT_WORDBREAK : GDIPlus_RIGHT;
            break;
        case 0x00000003:
            prop.Style.AlignNoLyric = prop.Style.DrawingMethod === 0 ? DT_LEFT | DT_NOPREFIX | DT_WORDBREAK : GDIPlus_LEFT;
            align.Left_Center_NL = true;
            break;
        case 0x00000004:
            prop.Style.AlignNoLyric = prop.Style.DrawingMethod === 0 ? DT_LEFT | DT_NOPREFIX | DT_WORDBREAK : GDIPlus_LEFT;
            align.Center_Left_NL = true;
            break;
        case 0x00000005:
            prop.Style.AlignNoLyric = prop.Style.DrawingMethod === 0 ? DT_RIGHT | DT_NOPREFIX | DT_WORDBREAK : GDIPlus_RIGHT;
            align.Center_Right_NL = true;
            break;
        case 0x00000006:
            prop.Style.AlignNoLyric = prop.Style.DrawingMethod === 0 ? DT_RIGHT | DT_NOPREFIX | DT_WORDBREAK : GDIPlus_RIGHT;
            align.Right_Center_NL = true;
            break;
    }

    refreshDrawStyle();
}

function refreshDrawStyle() {

    if (lyric) {
        LyricShow.Properties.setWordbreakList();
        LyricShow.Properties.setScrollSpeedList();
        LyricShow.Properties.setPaintInfo();
        LyricShow.Properties.buildDrawStyle();
        ignore_remainder = true;
        !Edit.isStarted && LyricShow.searchLine(fb.PlaybackTime);
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

    return (num < 10) ? "0" + num : num;
}

function copyLyric(withoutTag) { // copy lyric to clipboad

    if (!lyric)
        return;

    var LineFeedCode = prop.Save.LineFeedCode;
    var text = lyric.text.join(LineFeedCode);

    if (filetype === "lrc" && withoutTag)
        text = text.replace(alltagsRE, "");

    if (lyric.info.length)
        text = lyric.info.join(LineFeedCode) + LineFeedCode + text;

    setClipboard(text.trim());
}

function getLyricFromClipboard() {

    var text = getClipboard();
    if (text) {
        main(text);
        StatusBar.showText(Messages.GetClipboard.ret(), 3000);
    }
    else
        Messages.FailedToReadText.popup();
}

function getFieldName() {

    if (prop.Save.iTunesMode) {
        var isM4A = fs.GetExtensionName(fb.GetNowPlaying().Path).toLowerCase() === "m4a";
        var field = isM4A ? "LYRICS" : "UNSYNCED LYRICS";
    }
    else
        field = (filetype === "lrc" || Edit.isStarted) ? "LYRICS" : "UNSYNCED LYRICS";
    return field;
}

function saveToTag(fieldname, status, silent) {

    if (lyric && fieldname) {
        var meta = fb.GetNowPlaying();
        var LineFeedCode = prop.Save.LineFeedCode;
        var text = (lyric.info.length ? lyric.info.join(LineFeedCode) + LineFeedCode : "") + lyric.text.join(LineFeedCode).trim();
        try {
            writeTagField(text, fieldname, meta);
            StatusBar.showText((status ? status : "") + Messages.SavedToTag.ret('"' + fieldname + '"'));
            !silent && playSoundSimple(commondir + "finished.wav");
        } catch (e) {
            Messages.FailedToSaveLyricsToTag.popup("\n" + e.message);
        }
        meta.Dispose();
    }
}

function saveToFile(file, status, silent) {

    if (lyric && file) {
        var meta = fb.GetNowPlaying();
        var folder = fs.GetParentFolderName(file);
        var LineFeedCode = prop.Save.LineFeedCode;
        var text = (lyric.info.length ? lyric.info.join(LineFeedCode) + LineFeedCode : "") + lyric.text.join(LineFeedCode).trim();
        try {
            if (!fs.FolderExists(folder))
                createFolder(fs, folder);
            writeTextFile(text, file, prop.Save.CharacterCode);
            StatusBar.showText((status ? status : "") + Messages.Saved.ret(file));
            !silent && playSoundSimple(commondir + "finished.wav");
            FuncCommands(prop.Save.RunAfterSave, meta);
        } catch (e) {
            Messages.FailedToSaveLyricsToFile.popup("\n" + e.message);
        }
        meta.Dispose();
    }
}

function plugin_auto_save(status, silent) {

    var to;
    if (filetype === "lrc")
        to = prop.Plugin.AutoSaveLrcTo;
    else
        to = prop.Plugin.AutoSaveTo;

    if (/^Tag$/i.test(to))
        saveToTag(getFieldName(), status, silent);
    else if (/^File$/i.test(to))
        saveToFile(parse_path + "." + filetype, status, silent);
}

function applyDelta(delta, isMouseMove) {

    if (delta === 0 || (filetype === "lrc" && (prop.Panel.ScrollType === 4 || prop.Panel.ScrollType === 5)))
        return;

    if (isMouseMove || !prop.Panel.MouseWheelSmoothing) {
        applyDelta.applySimple(offsetY + delta);
    }
    else {
        if (isAnim) {
            applyDelta.AnmDelta += delta;
            applyDelta.ElapsedTime = 75;

        }
        else {
            isAnim = true;
            applyDelta.AnmDelta = delta;
            applyDelta.ElapsedTime = 0;
            applyDelta.applyAnimation.interval(15);
        }
    }

}
applyDelta.applySimple = function (n) {
    if (n >= fixY) {
        if (offsetY !== fixY) {
            offsetY = fixY;
            LyricShow.repaintRect();
        }
    }
    else if (n <= LyricShow.Properties.minOffsetY) {
        if (offsetY !== LyricShow.Properties.minOffsetY) {
            offsetY = LyricShow.Properties.minOffsetY;
            LyricShow.repaintRect();
        }
        movable = false;
        ignore_remainder = true;
    }
    else {
        offsetY = n;
        prop.Panel.AutoScroll && (movable = true);
        LyricShow.repaintRect();
    }
};
applyDelta.applyAnimation = function () { // for Timer
    if (applyDelta.ElapsedTime < 75) {
        applyDelta.applySimple(offsetY + applyDelta.AnmDelta / 20);
    }
    else {
        applyDelta.applySimple(offsetY + applyDelta.AnmDelta / 10);
        applyDelta.AnmDelta -= applyDelta.AnmDelta / 10;
    }
    applyDelta.ElapsedTime += 15;
    if (applyDelta.ElapsedTime >= 300) { // 更新回数 20
        arguments.callee.clearInterval();
        isAnim = false;
    }
};

function seekLineTo(i) {

    if (Edit.View.isStarted || (!Edit.isStarted && filetype === "lrc")) {

        var n = lyric.i + i;
        if (n > lyric.text.length)
            n = lyric.text.length;
        else if (n < 1)
            n = 1;

        LyricShow.Properties.DrawStyle[n - 1].doCommand(); // lyric.i は対象行なのでn-1がシーク先の行
    }
}


//===========================================
//== Create "LyricShow" Object ==============
//===========================================

var LyricShow = new function (Style) {

    var Files_Collection = {};
    var directoryRE = /.+\\/;
    var extensionRE = /^lrc|txt$/i;
    var zeroTagRE = /^\[00:00[.:]00\]$/;
    var FuzzyRE = ["", /[ 　]/g, /\(.*?\)/g];
    var tempo = 1;
    var moveY, lineY, textHeightWithoutLPadding;
    var BGImg, BGColorScheme, BGSize, BGAlpha;

    this.init = function () {

        Edit.isStarted && Edit.end();
        this.end();
        offsetY = fixY;
    };

    this.initWithFile = function (file, keepDefaultPath) {

        var str, dir, f, arr, exp;

        L:
        {
            for (var i = 0; i <= prop.Panel.PathFuzzyLevel; i++) { // Fuzzy Search
                switch (i) {
                    case 0:
                        try {
                            f = fs.GetFile(file);
                            break L;
                        } catch (e) { }
                        break;
                    case 1:
                        try {
                            // create File Collection
                            dir = parse_path.match(directoryRE)[0];
                            if (!Files_Collection[dir] || Files_Collection[dir].DateLastModified !== String(fs.GetFolder(dir).DateLastModified)) {
                                Files_Collection[dir] = [];
                                Files_Collection[dir].DateLastModified = String(fs.GetFolder(dir).DateLastModified);
                                arr = utils.Glob(dir + "*.*").toArray(); // fs.GetFolder(dir).Files でのコレクション処理は各アイテムのプロパティアクセスが遅すぎる. 代わりにutils.Glob()を使う
                                for (var j = 0; j < arr.length; j++) {
                                    if (extensionRE.test(fs.GetExtensionName(arr[j]))) {
                                        exp = fs.GetFileName(arr[j]).replace(FuzzyRE[i], "").toLowerCase();
                                        Files_Collection[dir].push({ Name1: exp, Name2: exp.replace(FuzzyRE[i + 1], ""), Path: arr[j] });
                                    }
                                }
                            } // create File Collection END

                            exp = fs.GetFileName(file).replace(FuzzyRE[i], "").toLowerCase();

                            for (j = 0; j < Files_Collection[dir].length; j++) {
                                if (Files_Collection[dir][j].Name1 === exp) {
                                    file = Files_Collection[dir][j].Path;
                                    f = fs.GetFile(file);
                                    break L;
                                }
                            }
                        } catch (e) { }
                        break;
                    case 2:
                        try {
                            exp = exp.replace(FuzzyRE[i], "");

                            for (j = 0; j < Files_Collection[dir].length; j++) {
                                if (Files_Collection[dir][j].Name2 === exp) {
                                    file = Files_Collection[dir][j].Path;
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

        if (!str) return;

        directory = f.ParentFolder;
        filetype = isSyncRE.test(str) ? "lrc" : "txt";
        lyric = {
            text: str.trim().split(getLineFeedCode(str)),
            path: f.Path,
            dataSize: f.Size,
            charset: readTextFile.lastCharset
        };

        if (!keepDefaultPath)
            parse_path = directory + "\\" + fs.GetBaseName(lyric.path);

        return true;
    };

    this.initWithTag = function (tag) {

        try {
            var MetadbHandle = fb.GetNowPlaying();
            var FileInfo = MetadbHandle.GetFileInfo();
        } catch (e) {
            return;
        } finally { MetadbHandle && MetadbHandle.Dispose(); }

        var idx = FileInfo.MetaFind(tag);
        var str = FileInfo.MetaValue(idx, 0); // second arguments is numbar for multivalue. e.g.) ab;cde;f

        if (!str) return;
        if (str === ".")
            Messages.LargeFieldsConfig.fbpopup();

        filetype = isSyncRE.test(str) ? "lrc" : "txt";
        lyric = {
            text: str.trim().split(getLineFeedCode(str)),
            fieldname: /^LYRICS$/.test(tag) ? "LYRICS" : "UNSYNCED LYRICS"
        };

        return true;
    };

    this.readLyric = function (file, keepDefaultPath) {

        if (/^(?:LYRICS|UNSYNCED LYRICS)$/.test(file)) {
            if (!this.initWithTag(file)) return;
        }
        else if (/^(?:[a-z]:|\\)\\.+\.(?:lrc|txt)$/i.test(file)) {
            if (!this.initWithFile(file, keepDefaultPath)) return;
        }
        else {
            if (!file || !parse_path) return; // 条件を満たす曲をスキップするようなコンポを入れているとparse_pathがなぜか空になってエラーを起こすので回避
            filetype = isSyncRE.test(file) ? "lrc" : "txt";
            lyric = {
                text: file.trim().split(getLineFeedCode(file)),
                fieldname: "Temporary Text"
            };
        }

        lyric.i = 1;
        lyric.info = [];

        if (filetype === "lrc") { // analyze lrc
            var value, key, tmp, tagstart, tmpkey, tmptext, dublicate;
            var m, ms;
            var tmpArray = [], timeArray = [];
            var offsetRe = /\[offset: *(-?\d+) *\]/i;
            var isTagRe = /(\[[\d.:[\]]+\])(.*)/;
            var keyRe = /\[[\d:.]+\]/g;
            var spaceRe = /^[ 　]*$/;
            var notNumberRe = /\D/g;

            for (var i = 0; i < lyric.text.length; i++) {
                if (!tagstart)
                    if (offsetRe.test(lyric.text[i]))
                        lyric.offset = Number(RegExp.$1);

                tmp = lyric.text[i].match(isTagRe);
                if (!tmp) {
                    if (prop.Panel.Contain) {
                        if (tagstart)
                            tmpArray[tmpkey] += prop.Save.LineFeedCode + lyric.text[i];
                        else
                            lyric.info[i] = lyric.text[i].replace(offsetRe, "[offset:0]");
                    }
                    continue;
                }

                if (!tagstart) tagstart = true;

                key = tmp[1].match(keyRe);
                value = tmp[2].replace(spaceRe, "");
                for (var j = 0; j < key.length; j++) {
                    tmpkey = key[j].replace(notNumberRe, "") - 0;
                    if (tmpArray[tmpkey])
                        tmpArray[tmpkey] += "$$dublicate$$" + value;
                    else
                        tmpArray[tmpkey] = value;
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
                if (lyric.offset && ms !== 0) {
                    ms -= Math.round(lyric.offset / 10);
                    ms = Math.max(ms, 0);
                }
                // fb.trace(i + " :: " + tmpArray[timeArray[i]] + " :: " + timeArray[i] + " :: " + ms);

                for (var k = 0; k < dublicate.length; k++) {
                    lyric.text[j] = dublicate[k];
                    putTime(ms, j++);
                }
            }
        }

        else { // analyze "no lrc"
            if (prop.Panel.ExpandRepetition && repeatRes) { // Expand Repetition
                var temp;
                for (i = 0; i < lyric.text.length; i++) {

                    for (j = 0; j < repeatRes.length; j++) {
                        if (!repeatRes[j].e.length && repeatRes[j].a.test(lyric.text[i])) { // put lyric
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
                                if (repeatRes[j].e[0] === "")
                                    repeatRes[j].e.shift();
                                else if (repeatRes[j].e[repeatRes[j].e.length - 1] === "")
                                    repeatRes[j].e.pop();
                                else
                                    break;
                            i = k;
                            break;
                        }
                        if (repeatRes[j].e.length && repeatRes[j].c.test(lyric.text[i])) { // replace lyric
                            // console("before i:" + i + ", " + lyric.text[i]);
                            repeatRes[j].e.unshift(lyric.text.length - i);
                            repeatRes[j].e.unshift(i);
                            temp = Array.prototype.splice.apply(lyric.text, repeatRes[j].e); // splice は配列を展開しないで挿入するので、範囲を含めた配列にし(上2行)、applyで展開させて渡す
                            temp.shift();
                            lyric.text = lyric.text.concat(temp);
                            // console("after i:" + i + ", " + lyric.text[i]);
                            repeatRes[j].e.shift();
                            repeatRes[j].e.shift();
                            i += repeatRes[j].e.length - 1;
                        }
                    }

                }
            }
        }

        this.trimLine();
        return true;
    };

    this.trimLine = function () {

        var text = lyric.text;

        if (filetype === "lrc") {
            if (!zeroTagRE.test(text[0]))
                text.unshift("[00:00" + prop.Save.TimetagSign + "00]");
        }
        else {
            for (; ;)
                if (text[0] === "")
                    text.shift();
                else break;

            for (; ;)
                if (text[text.length - 1] === "")
                    text.pop();
                else break;

            text.unshift("");
            text.push("");
        }
    };

    this.backup = function () {

        var LineFeedCode = prop.Save.LineFeedCode;
        var backup = lyric.text.join(LineFeedCode).trim();
        if (lyric.info.length)
            backup = lyric.info.join(LineFeedCode) + LineFeedCode + backup;
        if (backupLyric[0] !== backup) {
            backupLyric.unshift(backup);
            backupLyric.length = 6;
        }
    };

    this.Properties = {
        setLineList: function () {

            var lineList = [];
            var text = lyric.text;
            for (var i = 0; i < text.length; i++) {
                if (tagTimeRE.test(text[i]))
                    lineList[i] = (RegExp.$1 * 60 + Number(RegExp.$2)) * 100 + Number(RegExp.$3); // key=line number, value=start time [ms*1/10]
            }

            this.lineList = lineList.length ? lineList : null; // Set Line List
        },

        setWordbreakList: function () {

            var leftcenterX = ww;
            var c_ww = (align.Center_Left || align.Center_Right) ? ww - centerleftX + g_x : ww;
            var line_arr, str, gdi_diff;

            var wordbreakList = [];
            var wordbreakText = [];

            var temp_text;
            var temp_bmp = gdi.CreateImage(1, 1);
            var temp_gr = temp_bmp.GetGraphics();

            ///// GDI /////
            if (Style.DrawingMethod === 0 || Edit.isStarted) {

                textHeightWithoutLPadding = temp_gr.CalcTextHeight("Test", Style.Font);
                textHeight = textHeightWithoutLPadding + Style.LPadding;

                for (var i = 0; i < lyric.text.length; i++) {
                    temp_text = (Edit.isStarted ? "[00:00.00] " : "") + lyric.text[i].replace(alltagsRE, "");

                    line_arr = temp_gr.EstimateLineWrap(temp_text, Style.Font, Edit.isStarted ? ww : c_ww).toArray();
                    wordbreakList[i] = line_arr.length / 2;

                    for (var j = 0; j < line_arr.length; j += 2) {
                        leftcenterX = Math.min((ww - line_arr[j + 1]) / 2, leftcenterX);

                        if (j === 0) str = line_arr[j];
                        else str += prop.Save.LineFeedCode + line_arr[j];
                    }

                    wordbreakText[i] = Edit.isStarted ? str.replace("[00:00.00] ", "") : str;
                }

            }
            ///// GDI+ /////
            else {

                textHeightWithoutLPadding = temp_gr.MeasureString("Test", Style.Font, 0, 0, ww * 10, wh, 0).Height;
                textHeight = textHeightWithoutLPadding + Style.LPadding;

                for (i = 0; i < lyric.text.length; i++) {
                    temp_text = lyric.text[i].replace(alltagsRE, "");

                    gdi_diff = temp_gr.CalcTextWidth(temp_text, Style.Font) - Math.ceil(temp_gr.MeasureString(temp_text, Style.Font, 0, 0, ww * 10, wh, 0).Width); // gr.EstimateLineWrap() はGDI用なのでGDI+とのサイズ差を補正して利用する

                    line_arr = temp_gr.EstimateLineWrap(temp_text, Style.Font, c_ww + gdi_diff).toArray();
                    wordbreakList[i] = line_arr.length / 2;

                    for (j = 0; j < line_arr.length; j += 2) {
                        leftcenterX = Math.min((ww - line_arr[j + 1]) / 2, leftcenterX);

                        if (j === 0) str = line_arr[j];
                        else str += prop.Save.LineFeedCode + line_arr[j];
                    }

                    wordbreakText[i] = str;
                }

            }

            temp_bmp.ReleaseGraphics(temp_gr);
            temp_bmp.Dispose();
            temp_gr = null;
            temp_bmp = null;

            this.wordbreakList = wordbreakList; // Set Wordbreak List
            this.wordbreakText = wordbreakText; // Set Wordbreak Text

            this.leftcenterX = Math.floor(Math.max(leftcenterX, 0)) + g_x; // Set offsetX for left-center
        },

        setScrollSpeedList: function () {

            var scrollSpeedList = [], scrollSpeedType2List = [], scrollSpeedType3List = [];
            var lineList = this.lineList;
            var h, t, n, interval;

            this.h = 0; // 1ファイルの高さ // ワードブレイク時の行間にLPaddingは入らないのでwordbreakListを参照して計算した後に足し込んでいく
            for (var i = 0; i < lyric.text.length - 1; i++) { // 条件の-1は最後の行の高さを無視するため
                this.h += Math.ceil(this.wordbreakList[i] * textHeightWithoutLPadding + Style.LPadding); // 行の高さ
            }

            this.minOffsetY = fixY - this.h; // オフセットYの最小値

            if (lineList) {
                interval = prop.Panel.Interval;
                for (i = 0; i < lineList.length; i++) {
                    h = Math.ceil(this.wordbreakList[i] * textHeightWithoutLPadding + Style.LPadding); // 行の高さ
                    t = (lineList[i + 1] - lineList[i]) * 10; // 次の行までの時間[ms]
                    n = Math.floor(t / interval) || 1; // 更新可能回数. 最低でも1
                    t = n * interval; // 次の行までの時間を更新可能回数を考慮した時間に変換する // 変換した時間を基準に移動量を計算
                    scrollSpeedList[i] = h / t * interval; // 1回の更新での移動量(行ごとに変化)

                    //Type2
                    if (t >= prop.Panel.ScrollDurationTime * 10)
                        scrollSpeedType2List[i] = h / (prop.Panel.ScrollDurationTime * 9.75) * interval; // スクロール開始は(prop.Panel.ScrollDurationTime*10)ミリ秒前.
                    else
                        /*NOP*/; //scrollSpeedList の値を使用

                    //Type3
                    h = Math.ceil(this.wordbreakList[i - 1] * textHeightWithoutLPadding + Style.LPadding) || 0; // 前の行の高さ
                    if (t >= prop.Panel.ScrollDurationTime * 10 || i === lineList.length - 1) // 最終行もこちらに分岐
                        scrollSpeedType3List[i] = h / (prop.Panel.ScrollDurationTime * 9.75) * interval;
                    else
                        scrollSpeedType3List[i] = h / t * interval;
                }
                scrollSpeedList[i - 1] = scrollSpeedType2List[i - 1] = 0; // 最後の行の移動量は0 (Type3は除く)
            }
            else {
                t = fb.PlaybackLength * 1000 / prop.Panel.Interval; // 1ファイルで更新する回数
                scrollSpeedList = { degree: this.h / t }; // 1回の更新での移動量(行に依らず一定)
                scrollSpeedList.degree *= prop.Panel.AdjustScrolling / 100;
            }

            this.scrollSpeedList = scrollSpeedList; // Set ScrollSpeed List
            this.scrollSpeedType2List = scrollSpeedType2List; // Set ScrollSpeed Type2 List
            this.scrollSpeedType3List = scrollSpeedType3List; // Set ScrollSpeed Type3 List
        },

        setPaintInfo: function () {

            this.x = 0;
            this.w = 0;
            this.n = Math.ceil(Style.TextRoundSize / 2);
            this.di = [];
            this.dpc = Style.Color.Text;
            this.dpi = 0;
            this.dpi_max = 48;
            this.pl_alpha = 252;
            this.l_alpha = 252;

            this.x = align.Left_Center ? this.leftcenterX : align.Center_Left ? centerleftX : g_x;
            this.w = align.Left_Center || align.Right_Center ? ww - this.leftcenterX + g_x : align.Center_Left || align.Center_Right ? ww - centerleftX + g_x : ww;

            var bc = getRGB(Style.Color.Text); // base color
            var tc = getRGB(Style.Color.PlayingText); // target color
            for (var i = 0; i < 3; i++) // [R_diff, G_diff, B_diff]
                this.di[i] = (tc[i] - bc[i]) / this.dpi_max; // 徐々に着色する時にdpi_max回足す
        },

        buildDrawStyle: function () {

            var p = LyricShow.Properties;
            var count_ContainString = 0;

            try {
                // XXX:
                Object.defineProperty({}, "test", { get: function () { } });
                var useLazyTextRender = true;
            } catch (ex) {
                useLazyTextRender = false;
                //fb.trace("defineProperty is not support.");
            }

            // Constructor
            function DrawString(i) {
                this.i = i;

                this.text = p.wordbreakText[i];
                this.y = DrawStyle[i - 1].nextY;
                this.height = Math.ceil(p.wordbreakList[i] * textHeightWithoutLPadding + Style.LPadding);
                this.nextY = this.y + this.height;
                this.sy = this.y + prop.Style.ShadowPosition[1]; // shadow y position
                this.time = p.lineList ? p.lineList[i] / 100 : null;

                if (filetype === "lrc") {
                    if (this.text !== "" || !prop.Panel.SkipEmptyLine) // 空文字の場合、プロパティ値はundefined
                        this.isEvenNum = count_ContainString++ % 2 === 0;

                    this.speed = p.scrollSpeedList[i];
                    this.speedType2 = p.scrollSpeedType2List[i];
                    this.speedType3 = p.scrollSpeedType3List[i];
                } else
                    this.speed = p.scrollSpeedList.degree;

                // textHighlineImg はここで作成。textImg は遅延評価し、初期化時間の短縮を図る
                if (!Edit.isStarted && Style.DrawingMethod === 2 && (prop.Panel.ScrollType <= 3 || filetype === "txt"))
                    !this.textHighlineImg && (this.textHighlineImg = this.buildTextHighlineImg());
            }
            function defineLazyPrototypeGetter(fn, name, lambda) {
                Object.defineProperty(fn.prototype, name, {
                    configurable: true,
                    get: function getter() {
                        var value = lambda.call(this);
                        Object.defineProperty(this, name, {
                            configurable: true,
                            value: value
                        });
                        return value;
                    }
                });
            }
            DrawString.prototype.buildTextImg = function buildTextImg() {
                var w = LyricShow.Properties.w;
                // --normal----
                var textImg = gdi.CreateImage(w + LyricShow.Properties.n * 2, this.height);
                var canvas = textImg.GetGraphics();
                canvas.SetTextRenderingHint(5);
                canvas.SetSmoothingMode(2);
                TextRender.OutLineText(Style.Color.Text, Style.Color.TextRound, Style.Shadow ? Style.TextRoundSize : 0);
                TextRender.RenderStringRect(canvas, this.text, Style.Font, LyricShow.Properties.n, 0, w, this.height, Style.Align);
                textImg.ReleaseGraphics(canvas);

                return textImg;
            };
            DrawString.prototype.buildTextHighlineImg = function buildTextHighlineImg() {
                var w = LyricShow.Properties.w;
                // --highline----
                var textHighlineImg = gdi.CreateImage(w + LyricShow.Properties.n * 2, this.height);
                var canvas = textHighlineImg.GetGraphics();
                canvas.SetTextRenderingHint(5);
                canvas.SetSmoothingMode(2);
                TextRender.OutLineText(Style.Color.PlayingText, Style.Color.TextRound, Style.Shadow ? Style.TextRoundSize : 0);
                TextRender.RenderStringRect(canvas, this.text, Style.Font, LyricShow.Properties.n, 0, w, this.height, Style.Align);
                textHighlineImg.ReleaseGraphics(canvas);

                return textHighlineImg;
            };

            if (useLazyTextRender) {
                defineLazyPrototypeGetter(DrawString, "textImg", DrawString.prototype.buildTextImg);
                defineLazyPrototypeGetter(DrawString, "textHighlineImg", DrawString.prototype.buildTextHighlineImg);
                DrawString.prototype.dispose = function dispose() {
                    var self = this;
                    ["textImg", "textHighlineImg"].forEach(function (s) {
                        self.hasOwnProperty(s) && self[s].Dispose();
                    });
                };
            } else {
                DrawString.prototype.dispose = function dispose() {
                    this.textImg && this.textImg.Dispose();
                    this.textHighlineImg && this.textHighlineImg.Dispose();
                };
            }
            DrawString.prototype.scroll_0 = function () { // for unsynced lyrics
                if (!movable) return;

                var s = this.speed * tempo;
                offsetY -= s;
                moveY += s;

                if (moveY >= 1) {
                    moveY -= Math.floor(moveY);
                    return true; // refresh flag
                }
            };
            DrawString.prototype.scroll_1 = function (time) { // for synced lyrics
                //--color--
                if (Style.FadeInPlayingColor && (LyricShow.Properties.dpi < LyricShow.Properties.dpi_max)) {
                    LyricShow.Properties.dpi++;
                    LyricShow.Properties.dpc = setRGBdiff(prop.Style.Color.Text, LyricShow.Properties.di[0] * LyricShow.Properties.dpi, LyricShow.Properties.di[1] * LyricShow.Properties.dpi, LyricShow.Properties.di[2] * LyricShow.Properties.dpi);
                    var refresh = true;
                }
                //----

                if (movable) {
                    if (lineY < this.height) { // 移動許可範囲の設定
                        var s = this.speed * tempo;
                        offsetY -= s;
                        moveY += s;
                        lineY += s;
                    }

                    if (time >= p.lineList[this.i + 1]) {
                        !ignore_remainder && this.fix_offset(this.height, lineY);
                        ignore_remainder = false; // 誤差補正の無効は一度だけ
                        moveY = lineY = 0;
                        LyricShow.Properties.dpi = 0;
                        LyricShow.Properties.dpc = prop.Style.Color.Text;
                        lyric.i++;
                        return true; // refresh flag
                    }
                    else if (moveY >= 1) {
                        moveY -= Math.floor(moveY);
                        return true; // refresh flag
                    }
                }
                else if (time >= p.lineList[this.i + 1]) {
                    moveY = lineY = 0;
                    LyricShow.Properties.dpi = 0;
                    LyricShow.Properties.dpc = prop.Style.Color.Text;
                    lyric.i++;
                    return true; // refresh flag
                }
                // fb.trace(this.i + " :: " + this.height + " :: " + this.speed + " :: " + offsetY + " :: " + lyric.text.length + " :: " + time + " > " + p.DrawStyle[this.i + 1].time * 100)

                if (refresh) {
                    return true; // refresh flag
                }
            };
            DrawString.prototype.scroll_2 = function (time) { // for synced lyrics
                //--color--
                if (Style.FadeInPlayingColor && (LyricShow.Properties.dpi < LyricShow.Properties.dpi_max)) {
                    LyricShow.Properties.dpi++;
                    LyricShow.Properties.dpc = setRGBdiff(prop.Style.Color.Text, LyricShow.Properties.di[0] * LyricShow.Properties.dpi, LyricShow.Properties.di[1] * LyricShow.Properties.dpi, LyricShow.Properties.di[2] * LyricShow.Properties.dpi);
                    var refresh = true;
                }
                //----

                if (movable) {
                    if (lineY < this.height) { // 移動許可範囲の設定
                        if (this.speedType2) {
                            if (p.lineList[this.i + 1] - time <= prop.Panel.ScrollDurationTime) {
                                var s = this.speedType2 * tempo;
                                offsetY -= s;
                                moveY += s;
                                lineY += s;
                            }
                        }
                        else {
                            s = this.speed * tempo;
                            offsetY -= s;
                            moveY += s;
                            lineY += s;
                        }
                    }
                    else {
                        !ignore_remainder && this.fix_offset(this.height, lineY);
                        !ignore_remainder && (refresh = true);
                        ignore_remainder = true;
                    }

                    if (time >= p.lineList[this.i + 1]) {
                        !ignore_remainder && this.fix_offset(this.height, lineY);
                        ignore_remainder = false;
                        moveY = lineY = 0;
                        LyricShow.Properties.dpi = 0;
                        LyricShow.Properties.dpc = prop.Style.Color.Text;
                        lyric.i++;
                        return true; // refresh flag
                    }
                    else if (moveY >= 1) {
                        moveY -= Math.floor(moveY);
                        return true; // refresh flag
                    }
                }
                else if (time >= p.lineList[this.i + 1]) {
                    moveY = lineY = 0;
                    LyricShow.Properties.dpi = 0;
                    LyricShow.Properties.dpc = prop.Style.Color.Text;
                    lyric.i++;
                    return true; // refresh flag
                }
                // fb.trace(this.i + " :: " + this.height + " :: " + this.speed + " :: " + offsetY + " :: " + lyric.text.length + " :: " + time + " > " + p.DrawStyle[this.i + 1].time * 100)

                if (refresh) {
                    return true; // refresh flag
                }
            };
            DrawString.prototype.scroll_3 = function (time) { // for synced lyrics
                //--color--
                if (Style.FadeInPlayingColor && (LyricShow.Properties.dpi < LyricShow.Properties.dpi_max)) {
                    LyricShow.Properties.dpi++;
                    LyricShow.Properties.dpc = setRGBdiff(prop.Style.Color.Text, LyricShow.Properties.di[0] * LyricShow.Properties.dpi, LyricShow.Properties.di[1] * LyricShow.Properties.dpi, LyricShow.Properties.di[2] * LyricShow.Properties.dpi);
                    var refresh = true;
                }
                //----

                if (movable) {
                    if (lineY < p.DrawStyle[this.i - 1].height) { // 移動許可範囲の設定
                        var s = this.speedType3 * tempo;
                        offsetY -= s;
                        moveY += s;
                        lineY += s;
                    }

                    if (time >= p.lineList[this.i + 1]) {
                        //console(p.DrawStyle[this.i - 1].height + " h::i " + this.i + " :: " + this.text + " ::移動量 " + lineY + " ::補正値 " + (p.DrawStyle[this.i - 1].height - lineY).toFixed(15));
                        !ignore_remainder && this.fix_offset(p.DrawStyle[this.i - 1].height, lineY);
                        ignore_remainder = false;
                        moveY = lineY = 0;
                        LyricShow.Properties.dpi = 0;
                        LyricShow.Properties.dpc = prop.Style.Color.Text;
                        lyric.i++;
                        return true; // refresh flag
                    }
                    else if (moveY >= 1) {
                        moveY -= Math.floor(moveY);
                        return true; // refresh flag
                    }
                }
                else if (time >= p.lineList[this.i + 1]) {
                    moveY = lineY = 0;
                    LyricShow.Properties.dpi = 0;
                    LyricShow.Properties.dpc = prop.Style.Color.Text;
                    lyric.i++;
                    return true; // refresh flag
                }

                if (refresh) {
                    return true; // refresh flag
                }
            };
            DrawString.prototype.scroll_4 = function (time) { // for synced lyrics
                var refresh;
                if (LyricShow.Properties.pl_alpha > 0)
                    if (p.lineList[this.i + 1] - time <= prop.Panel.AlphaDurationTime) {
                        LyricShow.Properties.pl_alpha -= 14; // 252の約数
                        refresh = true;
                    }

                if (this.i + 1 !== lyric.text.length)
                    if (LyricShow.Properties.l_alpha < 252 && time > p.lineList[this.i] + (p.lineList[this.i + 1] - p.lineList[this.i]) / 2.2) {
                        LyricShow.Properties.l_alpha += 14; // 252の約数
                        refresh = true;
                    }

                //--color--
                if (LyricShow.Properties.dpi < LyricShow.Properties.dpi_max) {
                    LyricShow.Properties.dpi++;
                    LyricShow.Properties.dpc = setRGBdiff(prop.Style.Color.Text, LyricShow.Properties.di[0] * LyricShow.Properties.dpi, LyricShow.Properties.di[1] * LyricShow.Properties.dpi, LyricShow.Properties.di[2] * LyricShow.Properties.dpi);
                    refresh = true;
                }
                //----

                if (time >= p.lineList[this.i + 1]) {
                    LyricShow.Properties.l_alpha = typeof p.DrawStyle[this.i + 1].isEvenNum === "undefined" ? 252 : 0;
                    LyricShow.Properties.pl_alpha = 252;
                    LyricShow.Properties.dpi = 0;
                    LyricShow.Properties.dpc = prop.Style.Color.Text;
                    lyric.i++;
                    return true; // refresh flag
                }
                else if (refresh) {
                    return true; // refresh flag
                }
            };
            DrawString.prototype.scroll_5 = function (time) { // for synced lyrics
                var refresh;
                if (LyricShow.Properties.pl_alpha > 0)
                    if (p.lineList[this.i + 1] - time <= prop.Panel.AlphaDurationTime * 3) {
                        LyricShow.Properties.pl_alpha -= 21; // 252の約数
                        refresh = true;
                    }

                if (this.i + 1 !== lyric.text.length)
                    if (LyricShow.Properties.l_alpha < 252 && p.lineList[this.i + 1] - time <= prop.Panel.AlphaDurationTime * 3) {
                        LyricShow.Properties.l_alpha += 21; // 252の約数
                        refresh = true;
                    }

                //--color--
                if (LyricShow.Properties.dpi < LyricShow.Properties.dpi_max) {
                    LyricShow.Properties.dpi++;
                    LyricShow.Properties.dpc = setRGBdiff(prop.Style.Color.Text, LyricShow.Properties.di[0] * LyricShow.Properties.dpi, LyricShow.Properties.di[1] * LyricShow.Properties.dpi, LyricShow.Properties.di[2] * LyricShow.Properties.dpi);
                    refresh = true;
                }
                //----

                if (time >= p.lineList[this.i + 1]) {
                    LyricShow.Properties.l_alpha = typeof p.DrawStyle[this.i + 1].isEvenNum === "undefined" ? 252 : 0;
                    LyricShow.Properties.pl_alpha = 252;
                    LyricShow.Properties.dpi = 0;
                    LyricShow.Properties.dpc = prop.Style.Color.Text;
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
            DrawString.prototype.draw_Edit = function (gr, color) {
                var text = this.text;
                if (tagTimeRE.test(lyric.text[this.i]))
                    text = RegExp.lastMatch + " " + text;
                else
                    text = text.trim();

                gr.GdiDrawText(text, Style.Font, color, g_x, this.y + offsetY, ww, this.height, prop.Edit.Align);
            };
            DrawString.prototype.draw = function (gr) {
                if (filetype === "lrc") {
                    if (Style.FadeInPlayingColor)
                        var color = (this.i === lyric.i - 1) ? LyricShow.Properties.dpc : Style.Color.Text;
                    else
                        color = (this.i === lyric.i - 1) ? Style.Color.PlayingText : Style.Color.Text;

                    if (Style.KeepPlayingColor && this.i < lyric.i - 1)
                        color = Style.Color.PlayingText;
                }
                else
                    color = Style.Highline ? Style.Color.PlayingText : Style.Color.Text;

                var x = LyricShow.Properties.x;
                var y = this.y + Math.ceil(offsetY);
                var w = LyricShow.Properties.w;
                var alpha = 255;
                if (Style.Fading) {
                    if (y + this.height <= g_y + Style.FadingHeight[0])
                        alpha = (y + this.height - g_y) / Style.FadingHeight[0] * 255;
                    else if (g_y + wh - y <= Style.FadingHeight[1])
                        alpha = (g_y + wh - y) / Style.FadingHeight[1] * 255;
                    alpha = Math.max(alpha, 0);
                }

                switch (Style.DrawingMethod) {
                    case 0:
                        gr.GdiDrawText(this.text, Style.Font, color, x, y, w, this.height, Style.Align);
                        break;
                    case 1:
                        gr.DrawString(this.text, Style.Font, setAlpha(color, alpha), x, y, w, this.height, Style.Align);
                        break;
                    case 2:
                        !useLazyTextRender && !this.textImg && (this.textImg = this.buildTextImg());
                        x -= LyricShow.Properties.n;
                        w = this.textImg.Width;
                        var h = this.textImg.Height;
                        if (color === Style.Color.Text)
                            gr.DrawImage(this.textImg, x, y, w, h, 0, 0, w, h, 0, alpha);
                        else if (this.i === lyric.i - 1) {
                            Style.FadeInPlayingColor && gr.DrawImage(this.textImg, x, y, w, h, 0, 0, w, h, 0, alpha);
                            gr.DrawImage(this.textHighlineImg, x, y, w, h, 0, 0, w, h, 0, Style.FadeInPlayingColor ? (LyricShow.Properties.dpi / 48) * alpha : alpha);
                        }
                        else
                            gr.DrawImage(this.textHighlineImg, x, y, w, h, 0, 0, w, h, 0, alpha);
                        break;
                }
            };
            DrawString.prototype.draw_withShadow = function (gr) {
                if (filetype === "lrc") {
                    if (Style.FadeInPlayingColor)
                        var color = this.i === lyric.i - 1 ? LyricShow.Properties.dpc : Style.Color.Text;
                    else
                        color = this.i === lyric.i - 1 ? Style.Color.PlayingText : Style.Color.Text;

                    if (Style.KeepPlayingColor && this.i < lyric.i - 1)
                        color = Style.Color.PlayingText;
                }
                else
                    color = Style.Highline ? Style.Color.PlayingText : Style.Color.Text;

                var x = LyricShow.Properties.x;
                var y = this.y + Math.ceil(offsetY);
                var w = LyricShow.Properties.w;
                var alpha = 255;
                if (Style.Fading) {
                    if (y + this.height <= g_y + Style.FadingHeight[0])
                        alpha = (y + this.height - g_y) / Style.FadingHeight[0] * 255;
                    else if (g_y + wh - y <= Style.FadingHeight[1])
                        alpha = (g_y + wh - y) / Style.FadingHeight[1] * 255;
                    alpha = Math.max(alpha, 0);
                }

                switch (Style.DrawingMethod) {
                    case 0:
                        gr.GdiDrawText(this.text, Style.Font, Style.Color.TextShadow, x + Style.ShadowPosition[0], this.sy + Math.ceil(offsetY), w, this.height, Style.Align);
                        gr.GdiDrawText(this.text, Style.Font, color, x, y, w, this.height, Style.Align);
                        break;
                    case 1:
                        gr.DrawString(this.text, Style.Font, setAlpha(Style.Color.TextShadow, alpha), x + Style.ShadowPosition[0], this.sy + Math.ceil(offsetY), w, this.height, Style.Align);
                        gr.DrawString(this.text, Style.Font, setAlpha(color, alpha), x, y, w, this.height, Style.Align);
                        break;
                    case 2:
                        !useLazyTextRender && !this.textImg && (this.textImg = this.buildTextImg());
                        x -= LyricShow.Properties.n;
                        w = this.textImg.Width;
                        var h = this.textImg.Height;
                        if (color === Style.Color.Text)
                            gr.DrawImage(this.textImg, x, y, w, h, 0, 0, w, h, 0, alpha);
                        else if (this.i === lyric.i - 1) {
                            Style.FadeInPlayingColor && gr.DrawImage(this.textImg, x, y, w, h, 0, 0, w, h, 0, alpha);
                            gr.DrawImage(this.textHighlineImg, x, y, w, h, 0, 0, w, h, 0, Style.FadeInPlayingColor ? (LyricShow.Properties.dpi / 48) * alpha : alpha);
                        }
                        else
                            gr.DrawImage(this.textHighlineImg, x, y, w, h, 0, 0, w, h, 0, alpha);
                        break;
                }
            };
            DrawString.prototype.draw_OneLine = function (gr, y) {
                var color = this.i === lyric.i - 1 ? LyricShow.Properties.dpc : Style.Color.Text;
                var alpha = this.i === lyric.i - 1 ? LyricShow.Properties.pl_alpha : LyricShow.Properties.l_alpha;
                var x = LyricShow.Properties.x;
                var w = LyricShow.Properties.w;
                switch (Style.DrawingMethod) { // Only GDI+
                    case 1:
                        gr.DrawString(this.text, Style.Font, setAlpha(color, alpha), x, y, w, this.height, Style.Align);
                        break;
                    case 2:
                        TextRender.OutLineText(setAlpha(color, alpha), setAlpha(Style.Color.TextRound, alpha), 0);
                        TextRender.RenderStringRect(gr, this.text, Style.Font, x, y, w, this.height, Style.Align);
                        break;
                }
            };
            DrawString.prototype.draw_OneLine_withShadow = function (gr, y) {
                var color = this.i === lyric.i - 1 ? LyricShow.Properties.dpc : Style.Color.Text;
                var alpha = this.i === lyric.i - 1 ? LyricShow.Properties.pl_alpha : LyricShow.Properties.l_alpha;
                var x = LyricShow.Properties.x;
                var w = LyricShow.Properties.w;
                switch (Style.DrawingMethod) { // Only GDI+
                    case 1:
                        gr.DrawString(this.text, Style.Font, setAlpha(Style.Color.TextShadow, alpha), x + Style.ShadowPosition[0], y + Style.ShadowPosition[1], w, this.height, Style.Align);
                        gr.DrawString(this.text, Style.Font, setAlpha(color, alpha), x, y, w, this.height, Style.Align);
                        break;
                    case 2:
                        TextRender.OutLineText(setAlpha(color, alpha), setAlpha(Style.Color.TextRound, alpha), Style.TextRoundSize);
                        TextRender.RenderStringRect(gr, this.text, Style.Font, x, y, w, this.height, Style.Align);
                        break;
                }
            };
            DrawString.prototype.onclick = function (x, y) {
                if (x < g_x || x > g_x + ww || y < offsetY + this.y || y > offsetY + this.nextY)
                    return;
                this.doCommand();
                return true;
            };
            DrawString.prototype.doCommand = function () {
                if (utils.IsKeyPressed(VK_CONTROL)) {
                    var word = encodeURIComponent(this.text.replace(/[\s　]+/g, " ")).replaceEach("'", '%27', '\\(', '%28', '\\)', '%29', '%20', '+', '!', '%21', 'g');
                    word && FuncCommand("https://www.google.com/search?q=" + word);
                    word && FuncCommand("https://twitter.com/search?q=" + word);
                }
                else
                    if (typeof this.time === 'number' && isFinite(this.time)) {
                        fromY = offsetY;
                        fb.PlaybackTime = this.time;
                    }
            };
            // Constructor END

            //Trace.start("buildDrawStyle")
            var DrawStyle = { "-1": { y: 0, height: 0, nextY: 0 } };
            for (var i = 0; i < lyric.text.length; i++)
                DrawStyle[i] = new DrawString(i);
            //Trace.stop()

            this.DrawStyle = DrawStyle;
        }

    };

    this.searchLine = function (time) {

        this.pauseTimer(true);
        prop.Panel.AutoScroll && (movable = true);
        ignore_remainder = false; // 誤差補正ON
        time *= 100;
        var interval = prop.Panel.Interval;
        var DrawStyle = this.Properties.DrawStyle;
        var lineList = this.Properties.lineList;
        if (lineList) {
            for (var i = 1; i < lineList.length; i++) {
                if (lineList[i] > Math.round(time)) break;
            }
            lyric.i = i; // 対象行

            LyricShow.Properties.dpi = 0;
            LyricShow.Properties.dpc = prop.Style.Color.Text;
            switch (prop.Panel.ScrollType) {
                case 1:
                    lineY = (time - lineList[i - 1]) * 10 / interval * DrawStyle[i - 1].speed; // (i-1行になってから現在の再生時間になるまでに行われた更新回数) * 1回の更新での移動量
                    offsetY = fixY - DrawStyle[i - 1].y - lineY; // オフセットの変動値は(文字の高さ*行数)
                    break;
                case 2:
                    if (DrawStyle[i - 1].speedType2) { // speedType2を条件に使うことで、次の行までの時間が (prop.Panel.ScrollDurationTime*10) ミリ秒以上空く行であるか判別できる
                        if (lineList[i] - time > prop.Panel.ScrollDurationTime) {
                            lineY = 0;
                            offsetY = fixY - DrawStyle[i - 1].y;
                        }
                        else {
                            lineY = (prop.Panel.ScrollDurationTime - (lineList[i] - time)) * 10 / interval * DrawStyle[i - 1].speedType2;
                            offsetY = fixY - DrawStyle[i - 1].y - lineY;
                        }
                    }
                    else { // そうでなければ ScrollType === 1 と同じ動作をする
                        lineY = (time - lineList[i - 1]) * 10 / interval * DrawStyle[i - 1].speed;
                        offsetY = fixY - DrawStyle[i - 1].y - lineY;
                    }
                    break;
                case 3:
                    if (DrawStyle[i - 1].speedType2 || i === lyric.text.length) { // 最終行もこちら
                        if (time - lineList[i - 1] > prop.Panel.ScrollDurationTime || fromY) { // fromYでの分岐: ScrollToCenter直後のスクロールは見栄えが悪いので、移動済みの状態にする
                            lineY = DrawStyle[i - 2].height;
                            offsetY = fixY - DrawStyle[i - 1].y;
                        }
                        else {
                            lineY = (time - lineList[i - 1]) * 10 / interval * DrawStyle[i - 1].speedType3;
                            offsetY = fixY - DrawStyle[i - 2].y - lineY;
                        }
                    }
                    else {
                        lineY = (time - lineList[i - 1]) * 10 / interval * DrawStyle[i - 1].speedType3;
                        offsetY = fixY - DrawStyle[i - 2].y - lineY;
                    }
                    break;
                case 4:
                    offsetY = fixY;
                    LyricShow.Properties.pl_alpha = 252;
                    LyricShow.Properties.l_alpha = 252;
                    fromY = null;
                    break;
                case 5:
                    offsetY = fixY;
                    LyricShow.Properties.pl_alpha = 252;
                    LyricShow.Properties.l_alpha = 0;
                    fromY = null;
                    break;
            } // end switch
        }
        else
            offsetY = fixY - this.Properties.h * time / (fb.PlaybackLength * 100); // パネルの半分 - (1ファイルの高さ * 再生時間の割合)

        if (isExternalSeek) {
            if (!prop.Panel.FollowExternalSeek)
                offsetY = fromY;
        }
        else if (fromY) {
            if (prop.Panel.ScrollToCenter)
                this.applyDelta(fromY, offsetY);
            else
                offsetY = fromY;
        }
        fromY = null;


        moveY = offsetY % 1; // 整数なら0
        if (moveY > 0)
            moveY = 1 - moveY;
        else if (moveY < 0)
            moveY = Math.abs(moveY);

        window.Repaint();
        this.pauseTimer(fb.IsPaused);
    };

    this.applyDelta = function (from, to) {
        var ad = arguments.callee;

        if (isAnim) {
            ad.applyAnimation.clearInterval();
        }
        else {
            ad.IsPaused = fb.IsPaused;
            !fb.IsPaused && fb.Pause();
        }

        isAnim = true;

        offsetY = from;
        ad.anmDelta = to - from;
        ad.to = to;
        ad.applyAnimation.interval(15);
    };
    this.applyDelta.applyAnimation = function () { // for Timer
        var ad = LyricShow.applyDelta;

        offsetY += ad.anmDelta / 3.5;
        ad.anmDelta -= ad.anmDelta / 3.5;
        if (Math.abs(ad.anmDelta) <= 1) {
            offsetY = ad.to;
            moveY = 0;
            arguments.callee.clearInterval();
            !ad.IsPaused && fb.Pause();
            isAnim = false;
        }
        LyricShow.repaintRect();
    };

    this.pauseTimer = function (state) {

        if (prop.Panel.GuessPlaybackTempo) {
            if (state)
                this.guessPlaybackTempo.clearInterval();
            else
                this.guessPlaybackTempo.interval(1000);
        }

        if (state) {
            for (var i = 0; ; i++)
                if (this.hasOwnProperty("scroll_" + i))
                    this["scroll_" + i].clearInterval();
                else break;
        }
        else if (filetype === "txt")
            this.scroll_0.interval(prop.Panel.Interval);
        else
            this["scroll_" + prop.Panel.ScrollType].interval(prop.Panel.Interval);
    };

    this.guessPlaybackTempo = function () { // for Timer // every second

        var fn = arguments.callee;
        var t = fb.PlaybackTime;
        var c = t - fn.time;
        if (!c)
            tempo = 1;
        else if (c > 0)
            tempo = Math.round(c * 100) / 100;

        fn.time = t;
    };

    this.repaintRect = function () {
        window.RepaintRect(this.Properties.x - this.Properties.n, 0, this.Properties.w + this.Properties.n * 2, window.Height);
    };

    this.BackgroundImage = {

        isSupportImage: function (file) {
            var ext = fs.GetExtensionName(file).toLowerCase();
            var SupportTypes = ["jpg", "jpeg", "png", "gif", "bmp"];

            for (var i = 0; i < SupportTypes.length; i++) {
                if (ext === SupportTypes[i])
                    return true;
            }
            return false;
        },
        searchImageInWildcard: function (path) {
            var foldername = fs.GetParentFolderName(path);
            if (!fs.FolderExists(foldername))
                return;

            var newImg;
            var exp = fs.GetFileName(path);
            var arr = utils.Glob(foldername + "\\*.*").toArray();

            for (var i = 0; i < arr.length; i++) {
                if (this.isSupportImage(arr[i]) && utils.PathWildcardMatch(exp, fs.GetFileName(arr[i]))) {
                    newImg = this.getImg(arr[i]);
                    if (newImg)
                        return newImg; // One file per path is enough
                }
            }
        },
        getImg: function (path) {
            if (path.charAt(0) === "<")
                return utils.GetAlbumArtEmbedded(path.slice(1, -1), 0);
            else if (fs.FileExists(path))
                return gdi.Image(path);
        },
        calcImgSize: function (img, dspW, dspH, strch, kar) {
            if (!img) return;
            var srcW = img.width;
            var srcH = img.height;

            var size;
            if (strch) { // パネルより小さい画像を拡大する
                size = { x: 0, y: 0, width: dspW || 1, height: dspH || 1 };
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
        },
        applyBlur: function (image, blurValue) {
            var w = image.Width;
            var h = image.Height;

            image.BoxBlur(blurValue, 2); // iteration は2で十分

            var newImg = gdi.CreateImage(w, h);
            var canvas = newImg.GetGraphics();
            var offset = Math.min(blurValue * 2, 100);
            canvas.DrawImage(image, 0 - offset, 0 - offset, w + offset * 2, h + offset * 2, 0, 0, w, h, 0, 255); // 上下左右をoffsetの値分だけ引き伸ばして中央部分を切り取る // blurを強く掛けるほど中央寄りにする

            newImg.ReleaseGraphics(canvas);
            image.Dispose();

            return newImg;
        },
        applyAngle: function (image, angle) {
            if (angle % 360 === 0)
                return image;

            var newImg = gdi.CreateImage(window.Width, window.Height);
            var canvas = newImg.GetGraphics();
            canvas.DrawImage(image, BGSize.x, BGSize.y, image.Width, image.Height, 0, 0, image.Width, image.Height, angle, 255); // パネル外にはみ出すとgr.DrawImageメソッドの描画速度が低下するので、パネルサイズで切り取る

            newImg.ReleaseGraphics(canvas);
            image.Dispose();

            BGSize = {
                x: 0, // パネルサイズで切り取ったので 0
                y: 0,
                width: newImg.Width,
                height: newImg.Height
            };

            return newImg;
        },
        build: function () {
            var newImg, newColorScheme, tmp;
            var p = prop.Panel.BackgroundPath;
            if (p) {
                try {
                    var metadb = fb.GetNowPlaying();
                    p = fb.TitleFormat(p).EvalWithMetadb(metadb);
                    p = p.replaceEach("%fb2k_path%", fb.FoobarPath, "%fb2k_profile_path%", fb.ProfilePath, "<embed>", "<" + metadb.RawPath + ">", "gi");
                } catch (e) {
                    return;
                } finally { metadb && metadb.Dispose(); }

                p = p.split("||");
                for (var i = 0; i < p.length; i++) {
                    if (p[i].indexOf("*") === -1 && p[i].indexOf("?") === -1) { // If not wildcard exist
                        newImg = this.getImg(p[i]);
                        if (newImg) break;
                    }
                    else { // Search in wildcard.
                        newImg = this.searchImageInWildcard(p[i]);
                        if (newImg) break;
                    }
                }

                if (newImg) {
                    BGSize = this.calcImgSize(newImg, window.Width, window.Height, prop.Panel.BackgroundStretch || prop.Panel.BackgroundBlur, prop.Panel.BackgroundKAR && !prop.Panel.BackgroundBlur);
                    tmp = newImg.Resize(BGSize.width, BGSize.height, 7); // gr.DrawImageメソッドでリサイズ、アルファ値(255以外)、アングル(0以外)を指定し頻繁に更新すると、描画速度の低下と負荷が無視できないので先に適用しておく
                    if (prop.Panel.BackgroundBlur) {
                        tmp = this.applyBlur(tmp, prop.Panel.BackgroundBlurValue);
                        BGImg = tmp.ApplyAlpha(prop.Panel.BackgroundBlurAlpha);
                    }
                    else {
                        tmp = this.applyAngle(tmp, prop.Panel.BackgroundAngle);
                        BGImg = tmp.ApplyAlpha(prop.Panel.BackgroundAlpha);
                    }

                    newColorScheme = newImg.GetColorScheme(-1).toArray().toString();
                    if (BGColorScheme !== newColorScheme) {
                        BGColorScheme = newColorScheme;
                        this.fadeTimer();
                    }

                    tmp.Dispose();
                    newImg.Dispose();
                }
                else
                    this.releaseGlaphic();
            }
        },
        releaseGlaphic: function () {
            if (BGImg) {
                BGImg.Dispose();
                BGImg = BGSize = BGColorScheme = null;
            }
        },
        isSet: function () {
            return Boolean(BGImg);
        },
        fadeTimer: function (reverse) {
            this.increaseAlpha.clearInterval();
            this.decreaseAlpha.clearInterval();

            if (!reverse) {
                BGAlpha = 0;
                this.increaseAlpha.interval(50);
            }
            else {
                BGAlpha = 255;
                this.decreaseAlpha.interval(30);
            }
        },
        increaseAlpha: function () {
            BGAlpha += 17;
            if (BGAlpha >= 255) {
                arguments.callee.clearInterval();
                BGAlpha = 255;
            }
            window.Repaint();
        },
        decreaseAlpha: function () {
            BGAlpha -= 17;
            if (BGAlpha <= 0) {
                arguments.callee.clearInterval();
                BGAlpha = 0;
            }
            window.Repaint();
        }
    };

    this.start = function (path, text) {

        this.init();
        prop.Panel.BackgroundEnable && this.BackgroundImage.build();

        parse_path = path[0]; // default parse_path for save
        try { // default ParentFolder of parse_path // 条件を満たす曲をスキップするようなコンポを入れているとparse_pathがなぜか空になってエラーを起こすのでtryで回避
            directory = parse_path.match(directoryRE)[0];
        } catch (e) { }

        L:
        {
            if (text) { // for Clipboad and FileDialog 
                if (this.readLyric(text, true)) break L; // 第二引数は keepDefaultPath. textがファイルパスだった場合でも保存場所はdefault parse_pathのままになる
                else return;
            }
            for (var p = prop.Panel.Priority, i = 0; i < p.length; i++) { // according to priority order
                switch (p[i]) {
                    case "Sync_Tag":
                        if (this.readLyric("LYRICS")) break L;
                        break;
                    case "Sync_File":
                        for (var j = 0; j < path.length; j++) {
                            if (this.readLyric(path[j] + ".lrc")) break L;
                        }
                        break;
                    case "Unsync_Tag":
                        if (this.readLyric("UNSYNCED LYRICS")) break L;
                        break;
                    case "Unsync_File":
                        for (j = 0; j < path.length; j++) {
                            if (this.readLyric(path[j] + ".txt")) break L;
                        }
                        break;
                }
            }
            return Messages.NotFound.trace(); // lyric is not found
        }

        this.Properties.setLineList();
        this.Properties.setWordbreakList();
        this.Properties.setScrollSpeedList();
        this.Properties.setPaintInfo();
        this.Properties.buildDrawStyle();

        this.searchLine(fb.PlaybackTime);
        this.backup();
    };

    this.end = function () {

        this.pauseTimer(true); // 従来のタイマーの後処理のようにtimerにnull等を代入するとclearで引っかかって余計に処理の記述が増える。中身はただの数字なので何もしなくて良い

        if (lyric)
            for (var i = 0, j = lyric.text.length; i < j; i++) {
                this.Properties.DrawStyle[i].dispose();
            }

        directory = filetype = lyric = null;
        this.Properties.lineList = this.Properties.wordbreakList = this.Properties.wordbreakText = this.Properties.scrollSpeedList = this.Properties.scrollSpeedType2List = this.Properties.scrollSpeedType3List = this.Properties.DrawStyle = null;
        lineY = moveY = fromY = null;

        if (repeatRes)
            for (i = 0; i < repeatRes.length; i++)
                repeatRes[i].e = [];

        if (!prop.Panel.BackgroundEnable || !main.IsVisible || !fb.IsPlaying)
            this.BackgroundImage.releaseGlaphic();

        CollectGarbage();
    };

    this.scroll_0 = function () { // timerで呼び出す関数. timerで呼び出すとthisの意味が変わるのでthisは使わない

        if (offsetY < LyricShow.Properties.minOffsetY) {
            offsetY = LyricShow.Properties.minOffsetY;
            movable = false; // 移動不可のフラグ
        }
        LyricShow.Properties.DrawStyle[lyric.i - 1].scroll_0() && LyricShow.repaintRect();
    };

    this.scroll_1 = function () { // timerで呼び出す関数

        if (offsetY < LyricShow.Properties.minOffsetY) {
            offsetY = LyricShow.Properties.minOffsetY;
            movable = false;
            ignore_remainder = true; // ライン移動時の誤差補正を無効にする（一度だけ）
        }
        LyricShow.Properties.DrawStyle[lyric.i - 1].scroll_1(fb.PlaybackTime * 100) && LyricShow.repaintRect(); // lyric.i(対象行)の１個前(再生行)の情報でスクロール
    };

    this.scroll_2 = function () { // timerで呼び出す関数

        if (offsetY < LyricShow.Properties.minOffsetY) {
            offsetY = LyricShow.Properties.minOffsetY;
            movable = false;
            ignore_remainder = true;
        }
        LyricShow.Properties.DrawStyle[lyric.i - 1].scroll_2(fb.PlaybackTime * 100) && LyricShow.repaintRect();
    };

    this.scroll_3 = function () { // timerで呼び出す関数

        if (offsetY < LyricShow.Properties.minOffsetY) {
            offsetY = LyricShow.Properties.minOffsetY;
            movable = false;
            ignore_remainder = true;
        }

        if (lyric.i === lyric.text.length) {
            if (fb.PlaybackTime * 100 - LyricShow.Properties.lineList[lyric.i - 1] > prop.Panel.ScrollDurationTime * 1.3)
                return;
        }
        LyricShow.Properties.DrawStyle[lyric.i - 1].scroll_3(fb.PlaybackTime * 100) && LyricShow.repaintRect();
    };

    this.scroll_4 = function () { // timerで呼び出す関数

        LyricShow.Properties.DrawStyle[lyric.i - 1].scroll_4(fb.PlaybackTime * 100) && LyricShow.repaintRect();
    };

    this.scroll_5 = function () { // timerで呼び出す関数

        LyricShow.Properties.DrawStyle[lyric.i - 1].scroll_5(fb.PlaybackTime * 100) && LyricShow.repaintRect();
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

    this.on_paint = function (gr) {
        var DrawStyle = LyricShow.Properties.DrawStyle;

        // background color
        gr.FillSolidRect(-1, -1, window.Width + 1, window.Height + 1, Style.Color.Background);
        // background image
        if (BGImg && BGAlpha) // alphaが0の場合は負荷軽減のため描画をスキップ
            gr.DrawImage(BGImg, BGSize.x, BGSize.y, BGSize.width, BGSize.height, 0, 0, BGSize.width, BGSize.height, 0, BGAlpha);

        // lyrics
        if (lyric) { // lyrics is found
            disp.top = 0;
            disp.bottom = lyric.text.length - 1;

            if (lyric.info.length && offsetY > 0 && prop.Panel.ScrollType !== 4 && prop.Panel.ScrollType !== 5)
                for (var i = 1; i <= lyric.info.length; i++) {
                    Style.Shadow && gr.GdiDrawText(lyric.info[lyric.info.length - i], Style.Font, Style.Color.TextShadow, this.Properties.x + Style.ShadowPosition[0], Math.ceil(g_y + offsetY - textHeight * i + Style.ShadowPosition[1]), this.Properties.w, wh, DT_CENTER | DT_NOPREFIX);
                    gr.GdiDrawText(lyric.info[lyric.info.length - i], Style.Font, Style.Color.Text, this.Properties.x, Math.ceil(g_y + offsetY - textHeight * i), this.Properties.w, wh, DT_CENTER | DT_NOPREFIX);
                }

            if (filetype === "lrc") // for文の中の演算量を増やすわけにはいかないのでfor文自体を分岐させる
                if (prop.Panel.ScrollType === 4) {
                    if (Style.Shadow)
                        for (i = lyric.i - 1, j = 0; j < 3 && i !== lyric.text.length; i++ , j++) {
                            var y = offsetY;
                            if (DrawStyle[i].isEvenNum)
                                y += this.calcOddNumHeight(DrawStyle, i);
                            DrawStyle[i].draw_OneLine_withShadow(gr, y);
                            if (j === 1 && typeof DrawStyle[i].isEvenNum !== "undefined")
                                break;
                        }
                    else
                        for (i = lyric.i - 1, j = 0; j < 3 && i !== lyric.text.length; i++ , j++) {
                            y = offsetY;
                            if (DrawStyle[i].isEvenNum)
                                y += this.calcOddNumHeight(DrawStyle, i);
                            DrawStyle[i].draw_OneLine(gr, y);
                            if (j === 1 && typeof DrawStyle[i].isEvenNum !== "undefined")
                                break;
                        }
                }
                else if (prop.Panel.ScrollType === 5) {
                    if (Style.Shadow)
                        for (i = lyric.i - 1, j = 0; j < 3 && i !== lyric.text.length; i++ , j++) {
                            DrawStyle[i].draw_OneLine_withShadow(gr, offsetY);
                            if (j === 1 && typeof DrawStyle[i].isEvenNum !== "undefined")
                                break;
                        }
                    else
                        for (i = lyric.i - 1, j = 0; j < 3 && i !== lyric.text.length; i++ , j++) {
                            DrawStyle[i].draw_OneLine(gr, offsetY);
                            if (j === 1 && typeof DrawStyle[i].isEvenNum !== "undefined")
                                break;
                        }
                }
                else
                    if (Style.Shadow)
                        for (i = 0; i < lyric.text.length; i++) {
                            var c = offsetY + DrawStyle[i].y;
                            if (c > g_y + wh) { disp.bottom = i - 1; break; } // do not draw text outside the screen. CPU utilization rises
                            else if (c < g_y - DrawStyle[i].height) { disp.top = i + 1; continue; } // ditto
                            else DrawStyle[i].draw_withShadow(gr);
                        }
                    else
                        for (i = 0; i < lyric.text.length; i++) {
                            c = offsetY + DrawStyle[i].y;
                            if (c > g_y + wh) { disp.bottom = i - 1; break; } // do not draw text outside the screen. CPU utilization rises
                            else if (c < g_y - DrawStyle[i].height) { disp.top = i + 1; continue; } // ditto
                            else DrawStyle[i].draw(gr);
                        }
            else
                if (Style.Shadow)
                    for (i = 0; i < lyric.text.length; i++) {
                        c = offsetY + DrawStyle[i].y;
                        if (c > g_y + wh) { disp.bottom = i - 1; break; }
                        else if (c < g_y - DrawStyle[i].height) { disp.top = i + 1; continue; }
                        else DrawStyle[i].draw_withShadow(gr);
                    }
                else
                    for (i = 0; i < lyric.text.length; i++) {
                        c = offsetY + DrawStyle[i].y;
                        if (c > g_y + wh) { disp.bottom = i - 1; break; }
                        else if (c < g_y - DrawStyle[i].height) { disp.top = i + 1; continue; }
                        else DrawStyle[i].draw(gr);
                    }
        }
        else if (!main.IsVisible) {
            Style.Shadow && gr.GdiDrawText("Click here to enable this panel.", Style.Font, Style.Color.TextShadow, g_x + Style.ShadowPosition[0], g_y + (wh * (46 / 100)) - 6 + Style.ShadowPosition[1], ww, wh, DT_CENTER | DT_WORDBREAK | DT_NOPREFIX);
            gr.GdiDrawText("Click here to enable this panel.", Style.Font, Style.Color.Text, g_x, g_y + (wh * (46 / 100)) - 6, ww, wh, DT_CENTER | DT_WORDBREAK | DT_NOPREFIX);
        }
        else if (fb.IsPlaying) { // lyrics is not found
            var text_w, noLyricX, noLyricW, offset;
            var leftcenterX_NL = ww;
            var wordbreak = 0;

            var s = fb.TitleFormat(prop.Panel.NoLyric).Eval().split("\\n");

            if (Style.DrawingMethod === 0)
                for (i = 0; i < s.length; i++) {
                    text_w = gr.CalcTextWidth(s[i], Style.Font);
                    leftcenterX_NL = Math.min((ww - text_w) / 2, leftcenterX_NL);
                }
            else
                for (i = 0; i < s.length; i++) {
                    text_w = gr.MeasureString(s[i], Style.Font, 0, 0, ww * 10, wh, 0).Width;
                    leftcenterX_NL = Math.min((ww - text_w) / 2, leftcenterX_NL);
                }
            leftcenterX_NL = Math.floor(Math.max(leftcenterX_NL, 0)) + g_x;

            noLyricX = align.Left_Center_NL ? leftcenterX_NL : align.Center_Left_NL ? centerleftX : g_x;
            noLyricW = align.Left_Center_NL || align.Right_Center_NL ? ww - leftcenterX_NL + g_x : align.Center_Left_NL || align.Center_Right_NL ? ww - centerleftX + g_x : ww;

            if (Style.DrawingMethod === 0) {
                textHeightWithoutLPadding = gr.CalcTextHeight("Test", Style.Font);
                textHeight = textHeightWithoutLPadding + Style.LPadding;
            }
            else {
                textHeightWithoutLPadding = Math.ceil(gr.MeasureString("Test", Style.Font, 0, 0, ww * 10, wh, 0).Height);
                textHeight = textHeightWithoutLPadding + Style.LPadding;
            }
            offset = g_y + (wh / 2) - s.length / 2 * textHeight;

            try {
                switch (Style.DrawingMethod) {
                    case 0:
                        for (i = 0; i < s.length; i++) {
                            Style.Shadow && gr.GdiDrawText(s[i], Style.Font, Style.Color.TextShadow, noLyricX + Style.ShadowPosition[0], offset + textHeight * (i + wordbreak) + Style.ShadowPosition[1], noLyricW, wh, Style.AlignNoLyric);
                            gr.GdiDrawText(s[i], Style.Font, Style.Color.Text, noLyricX, offset + textHeight * (i + wordbreak), noLyricW, wh, Style.AlignNoLyric);
                            wordbreak += Math.floor(gr.CalcTextWidth(s[i], Style.Font) / noLyricW);
                        }
                        break;
                    case 1:
                        for (i = 0; i < s.length; i++) {
                            Style.Shadow && gr.DrawString(s[i], Style.Font, Style.Color.TextShadow, noLyricX + Style.ShadowPosition[0], offset + textHeight * (i + wordbreak) + Style.ShadowPosition[1], noLyricW, wh, Style.AlignNoLyric);
                            gr.DrawString(s[i], Style.Font, Style.Color.Text, noLyricX, offset + textHeight * (i + wordbreak), noLyricW, wh, Style.AlignNoLyric);
                            wordbreak += Math.floor(gr.MeasureString(s[i], Style.Font, 0, 0, ww * 10, wh, 0).Width / noLyricW);

                        }
                        break;
                    case 2:
                        TextRender.OutLineText(Style.Color.Text, Style.Color.TextRound, Style.Shadow ? Style.TextRoundSize : 0);
                        for (i = 0; i < s.length; i++) {
                            TextRender.RenderStringRect(gr, s[i], Style.Font, noLyricX, offset + textHeight * (i + wordbreak), noLyricW, wh, Style.AlignNoLyric);
                            wordbreak += Math.floor(gr.MeasureString(s[i], Style.Font, 0, 0, ww * 10, wh, 0).Width / noLyricW);
                        }
                        break;
                }
            } catch (e) { }


        }
    };
}(prop.Style);


//===========================================
//== Create "Edit" Object ===================
//===========================================

var Edit = new function (Style, p) {

    var DrawStyle, edit_fixY, di = [];

    this.init = function () {

        edit_fixY = g_y + textHeight * 2;
        offsetY = edit_fixY + Math.round(Style.LPadding / 2);
        DrawStyle = p.DrawStyle;

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

        if (lyric.i === lyric.text.length) {
            this.saveMenu(x, y);
            this.isStarted && this.undo(); // saveMenu表示中に次の曲に遷移する可能性があるのでundoの前にチェックする
        }
    };

    this.undo = function (all) {

        if (lyric.i === 1) return;

        do {
            lyric.text[--lyric.i] = lyric.text[lyric.i].replace(tagTimeRE, "");
            offsetY += DrawStyle[lyric.i - 1].height;
            if (lyric.i === 1) break;
        } while (all);

        window.Repaint();
    };

    this.adjustTime = function (n) {

        if (lyric.i === 1) return;

        var pl = lyric.i - 1;
        lyric.text[pl].match(tagTimeRE);
        var pt = (RegExp.$1 * 60 + Number(RegExp.$2)) * 100 + Number(RegExp.$3);

        if (n < 0) {
            lyric.text[pl - 1].match(tagTimeRE);
            var tt = (RegExp.$1 * 60 + Number(RegExp.$2)) * 100 + Number(RegExp.$3);
            if (pt - tt > -n || tt === 0) // 下限
                apply();
        }
        else {
            if (lyric.i !== lyric.text.length) {
                var r = lyric.text[pl + 1].match(tagTimeRE);
                tt = (RegExp.$1 * 60 + Number(RegExp.$2)) * 100 + Number(RegExp.$3);
            }
            if (!r || tt - pt > n) // 上限
                apply();
        }

        function apply() {
            Edit.applyTimeDiff(pt, pl, n);
            if (Edit.View.isStarted)
                DrawStyle[pl].doCommand();
            else
                window.Repaint();
        }

    };

    this.offsetTime = function (n) {

        if (lyric.i === 1) return;

        var tt;

        for (var i = 1; i < lyric.text.length; i++) {
            if (tagTimeRE.test(lyric.text[i])) {
                tt = (RegExp.$1 * 60 + Number(RegExp.$2)) * 100 + Number(RegExp.$3);
                this.applyTimeDiff(tt, i, -n);
            }
        }

        if (this.View.isStarted)
            DrawStyle[lyric.i - 1].doCommand();
        else
            window.Repaint();
    };

    this.applyTimeDiff = function (time, i, diff) {

        if (diff === 0) return;

        time += diff;

        if (time < 0)
            time = 0;

        lyric.text[i] = lyric.text[i].replace(tagTimeRE, "");
        putTime(time, i);

        if (this.View.isStarted) {
            p.lineList[i] = time;
            DrawStyle[i].time = p.lineList[i] / 100;
        }
    };

    this.controlLine = function (n) {

        var a, str;
        var text = lyric.text;
        var i = lyric.i;

        switch (n) {
            case -1: // delete line
                text.splice(i, 1);
                (i === text.length) && this.undo();
                break;
            case 0: // space control
                if (text[i] !== "") {
                    a = text.splice(i, text.length - i, "");
                    text.push.apply(text, a);
                }
                else {
                    text.splice(i, 1);
                    (i === text.length) && this.undo();
                }
                break;
            case 1: // insert line
                str = prompt(Label.InserLineText, Label.InsertLine, "");
                if (typeof str !== "undefined")
                    if (str.indexOf("##") === 0) // insert line to bottom
                        text.push(str.slice(2));
                    else {
                        a = text.splice(lyric.i, text.length - lyric.i, str);
                        text.push.apply(text, a);
                    }
                else
                    return;
                break;
            case 2: // edit line
                str = prompt("", Label.EditLine, text[i - 1].replace(tagTimeRE, ""));
                if (typeof str !== "undefined")
                    text[i - 1] = text[i - 1].match(tagTimeRE)[0] + str;
                else
                    return;
                break;
        }

        p.setWordbreakList();
        p.buildDrawStyle();
        DrawStyle = p.DrawStyle;
        n === 2 && (offsetY = edit_fixY + Math.round(Style.LPadding / 2) - DrawStyle[lyric.i - 1].y);

        window.Repaint();
    };

    this.saveMenu = function (x, y) {

        // メニュー表示中に曲が遷移しても正常に保存できるように情報を保持しておく. 関連してメニューの定義もここで行う
        var meta = fb.GetNowPlaying();
        var field = getFieldName();
        var file = parse_path + ".lrc";
        var folder = fs.GetParentFolderName(file);
        var LineFeedCode = prop.Save.LineFeedCode;
        var text = (lyric.info.length ? lyric.info.join(LineFeedCode) + LineFeedCode : "") + lyric.text.join(LineFeedCode);

        Menu.build({
            id: "Save",
            items: [
                {
                    Flag: MF_GRAYED,
                    Caption: Label.Save
                },
                {
                    Flag: MF_SEPARATOR
                },
                {
                    Flag: MF_STRING,
                    Caption: Label.SaveToTag,
                    Func: function () {
                        try {
                            writeTagField(text, field, meta);
                            StatusBar.showText(Messages.SavedToTag.ret('"' + field + '"'));
                            playSoundSimple(commondir + "finished.wav");
                        } catch (e) {
                            Messages.FailedToSaveLyricsToTag.popup("\n" + e.message);
                        }
                    }
                },
                {
                    Flag: MF_STRING,
                    Caption: Label.SaveToFile,
                    Func: function () {
                        try {
                            if (!fs.FolderExists(folder))
                                createFolder(fs, folder);
                            writeTextFile(text, file, prop.Save.CharacterCode);
                            StatusBar.showText(Messages.Saved.ret(file));
                            playSoundSimple(commondir + "finished.wav");
                            FuncCommands(prop.Save.RunAfterSave, meta);
                        } catch (e) {
                            Messages.FailedToSaveLyricsToFile.popup("\n" + e.message);
                        }
                    }
                }
            ]
        });
        Menu.show(x || 0, y || 0);

        meta.Dispose();
        Menu.build();
    };

    this.deleteFile = function (file) {

        if (!file || Messages.Delete.popup(file) !== 6)
            return;
        try {
            sendToRecycleBin(file);
            Menu.build();
            StatusBar.showText(Messages.Deleted.ret());
        } catch (e) {
            Messages.FailedToDelete.popup();
        }
    };

    this.start = function () {

        LyricShow.pauseTimer(true);
        Buttons.buildButton();
        Style.Color = Style.C_E[Style.CS_E];
        this.isStarted = true;
        filetype === "txt" && putTime(0, 0);

        p.setLineList();
        p.setWordbreakList();
        p.buildDrawStyle();
        this.init();

        if (filetype === "lrc")
            this.View.start();
        else {
            this.calcRGBdiff();
            window.Repaint();
            Menu.build();
        }

    };

    this.end = function () {

        this.isStarted = false;
        this.View.isStarted && this.View.end();
        Style.Color = Style.C_LS[Style.CS_LS];

    };

    this.View = new function () {

        this.searchLine = function (time) {
            this.pauseTimer(true);

            time = Math.round(time * 100); // time *= 100 この計算になぜか微量の誤差が生じてapplyTimeDiffに影響が出るので対策する

            for (var i = 0; i < p.lineList.length; i++)
                if (p.lineList[i] > time) break;

            lyric.i = i;
            offsetY = edit_fixY + Math.round(Style.LPadding / 2) - DrawStyle[lyric.i - 1].y;
            window.Repaint();
            this.pauseTimer(fb.IsPaused);
        };

        this.watchLineChange = function () {
            if (Math.round(fb.PlaybackTime * 100) >= p.lineList[lyric.i]) {
                offsetY -= p.DrawStyle[lyric.i - 1].height;
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
            this.isStarted = true;
            this.i = lyric.i; // ビューモード解除時に元に戻れるように値を退避
            if (lyric.i !== lyric.text.length) {
                p.setLineList();
                p.setWordbreakList();
                p.buildDrawStyle();
                DrawStyle = p.DrawStyle;
            }
            Edit.calcRGBdiff();
            this.searchLine(fb.PlaybackTime);
            Menu.build();
        };

        this.end = function () {
            this.isStarted = false;
            this.pauseTimer(true);
            lyric.i = this.i; // ビューモードに入る前の状態に戻す
            offsetY = edit_fixY + Math.round(Style.LPadding / 2) - DrawStyle[lyric.i - 1].y;
            lyric.i === lyric.text.length && Edit.undo();
            Edit.calcRGBdiff();
        };
    }();

    this.switchView = function () {

        this.View.isStarted = !this.View.isStarted;
        if (this.View.isStarted) this.View.start();
        else {
            this.View.end();
            window.Repaint();
            Menu.build();
        }
    };

    this.calcRGBdiff = function () {

        var bg = this.View.isStarted ? Style.Color.ViewBackground : Style.Color.Background;
        if (getAlpha(bg) !== 0xff)
            bg = RGBAtoRGB(bg); // parse alpha value
        var b = getRGB(Style.Color.Text); // base color
        var t = getRGB(bg); // target color
        for (var i = 0; i < 3; i++) // [R_diff, G_diff, B_diff]
            di[i] = prop.Edit.Step === 0 ? 0 : (t[i] - b[i]) / prop.Edit.Step;
    };

    this.on_mouse_move = function (x, y) {

        if (y > wh - 30 || (x > seek_width && x < ww - seek_width)) {
            if (this.CurrentArea) {
                this.CurrentArea = null;
                window.Repaint();
            }
        }
        else if (x <= seek_width && this.CurrentArea !== "LEFT") {
            this.CurrentArea = "LEFT";
            window.Repaint();
        }
        else if (x >= ww - seek_width && this.CurrentArea !== "RIGHT") {
            this.CurrentArea = "RIGHT";
            window.Repaint();
        }
    };

    this.on_paint = function (gr) {

        var ci, color;
        var p = lyric.i - 1; // playing line
        disp.top = Math.max(p - 2, 0);
        disp.bottom = lyric.text.length - 1;

        // background color
        gr.FillSolidRect(-1, -1, window.Width + 1, window.Height + 1, this.View.isStarted ? Style.Color.ViewBackground : Style.Color.Background);
        // playing line color
        try {
            gr.FillRoundRect(g_x + 1, edit_fixY, ww - 2, DrawStyle[p].height, 5, 5, Style.Color.Line);
        } catch (e) { }

        // lyrics
        for (var i = disp.top; i < lyric.text.length; i++) {
            if (offsetY + DrawStyle[i].y > g_y + wh) { disp.bottom = i - 1; break; }
            else {
                ci = Math.abs(i - p);
                ci = Math.min(ci, prop.Edit.Step);
                color = setRGBdiff(Style.Color.Text, di[0] * ci, di[1] * ci, di[2] * ci);
                // fb.trace(lyric.text[i] + "::" + getRGB(color));
                DrawStyle[i].draw_Edit(gr, color);
            }
        }

        if (prop.Edit.Rule) // rule
            for (i = 1; i <= disp.bottom - disp.top + 2; i++)
                gr.DrawLine(g_x + 4, g_y + textHeight * i, g_x + ww - 4, g_y + textHeight * i, 1, Style.Color.Rule);

        // length
        gr.gdiDrawText("[" + lyric.i + " / " + lyric.text.length + "]", Style.Font, Style.Color.Length, g_x, window.Height - textHeight + prop.Style.LPadding, window.Width, textHeight, 0);

        if (this.CurrentArea === "LEFT") { // seek
            gr.FillRoundRect(0, textHeight, seek_width, Math.max(wh - 50, 0), arc_w, arc_h, Style.Color.Seek);
            gr.DrawPolygon(Style.Color.SeekArrow, 1,
                [
                    (seek_width / 2 + seek_width / 12), (wh / 2 - wh / 20),
                    (seek_width / 2 - seek_width / 12), (wh / 2),
                    (seek_width / 2 + seek_width / 12), (wh / 2 + wh / 20)
                ]);
        }
        if (this.CurrentArea === "RIGHT") {
            gr.FillRoundRect(ww - seek_width, textHeight, seek_width, Math.max(wh - 50, 0), arc_w, arc_h, Style.Color.Seek);
            gr.DrawPolygon(Style.Color.SeekArrow, 1,
                [
                    ww - (seek_width / 2 + seek_width / 12), (wh / 2 - wh / 20),
                    ww - (seek_width / 2 - seek_width / 12), (wh / 2),
                    ww - (seek_width / 2 + seek_width / 12), (wh / 2 + wh / 20)
                ]);
        }
    };
}(prop.Style, LyricShow.Properties);


//===========================================
//== Create "Buttons" Object ================
//===========================================

var Buttons = new function () {

    var icon_space = 4;
    var button = [];
    var tooltip = window.CreateTooltip();

    var buttonlist = [
        {
            Img: gdi.Image(scriptdir + "clear2.png"),
            X: function () { return window.Width - 4 - (icon_space * 0) - (16 * 1); },
            Y: function () { return window.Height - 19; },
            Tiptext: Label.Reload,
            Func: function () {
                main(lyric.path || "");
                (function () { lyric && Edit.start(); }).timeout(400);
            }
        },
        {
            Img: gdi.Image(scriptdir + "clear.png"),
            X: function () { return window.Width - 4 - (icon_space * 1) - (16 * 2); },
            Y: function () { return window.Height - 19; },
            Tiptext: Label.Clear,
            Func: function () {
                Edit.View.isStarted && Edit.View.end();
                Edit.undo(true);
                Menu.build();
            }
        },
        {
            Img: gdi.Image(scriptdir + "align.png"),
            X: function () { return window.Width - 4 - (icon_space * 3) - (16 * 3); },
            Y: function () { return window.Height - 19; },
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
            Img: gdi.Image(scriptdir + "offset-.png"),
            X: function () { return window.Width - 4 - (icon_space * 5) - (16 * 4); },
            Y: function () { return window.Height - 19; },
            Tiptext: Label.OffsetM,
            Func: function () {
                Edit.offsetTime(-5);
            }
        },
        {
            Img: gdi.Image(scriptdir + "offset+.png"),
            X: function () { return window.Width - 4 - (icon_space * 6) - (16 * 5); },
            Y: function () { return window.Height - 19; },
            Tiptext: Label.OffsetP,
            Func: function () {
                Edit.offsetTime(5);
            }
        }
    ];

    this.buildButton = function () {
        for (var i = 0; i < buttonlist.length; i++) {
            button[i] = new Button(buttonlist[i]);
        }
    };

    this.on_mouse_move = function (x, y) {
        for (var i = 0; i < button.length; i++)
            if (button[i].isMouseOver(x, y)) {
                if (this.CurrentButton !== button[i]) {
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

    this.on_paint = function (gr) {
        for (var i = 0; i < button.length; i++)
            button[i].Draw(gr);
    };

    // Constructor
    function Button(obj) {
        this.img = obj.Img;
        this.x = obj.X();
        this.y = obj.Y();
        this.width = obj.Img.width;
        this.height = obj.Img.height;
        this.tiptext = obj.Tiptext;
        this.Func = obj.Func;
    }
    Button.prototype.isMouseOver = function (x, y) {
        return (x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height);
    };
    Button.prototype.Draw = function (gr) {
        gr.DrawImage(this.img, this.x, this.y, this.width, this.height, 0, 0, this.width, this.height, 0, 160);
    };
    Button.prototype.ActivateTooltip = function () {
        tooltip.Deactivate();
        tooltip.Text = this.tiptext;
        tooltip.Activate();
    };
    Button.prototype.DeactivateTooltip = function () {
        tooltip.Deactivate();
    };
    // Constructor END
}();


//===========================================
//== Create "StatusBar" Object ==============
//===========================================

var StatusBar = new function (Style) {

    this.setText = function (Text) {
        this.Text = Text;

        var width, wordbreak;
        var temp_bmp = gdi.CreateImage(1, 1);
        var temp_gr = temp_bmp.GetGraphics();

        Text = Text.split("\n");
        wordbreak = Text.length - 1;
        for (var i = 0; i < Text.length; i++) {
            width = temp_gr.CalcTextWidth(Text[i], Style.StatusBarFont);
            wordbreak += Math.floor(width / (ww - 3));
        }

        this.Height = temp_gr.CalcTextHeight(Text, Style.StatusBarFont) * (wordbreak + 1);
        this.Y = g_y + wh - this.Height;

        temp_bmp.ReleaseGraphics(temp_gr);
        temp_bmp.Dispose();
        temp_gr = temp_bmp = null;
    };

    this.show = function (time) {
        this.hide.clearTimeout();
        this.TIMER = true;
        window.Repaint();
        this.hide.timeout(time || 8000);
    };

    this.hide = function () { // mainly for timer
        StatusBar.TIMER = false;
        window.Repaint();
    };

    this.showText = function (Text, time) {
        this.setText(Text);
        this.show(time);
    };

    this.on_paint = function (gr) {
        if (this.TIMER && this.Text) {
            gr.FillSolidRect(g_x, this.Y, ww, this.Height, Style.StatusBarBackground);
            gr.DrawRect(g_x - 1, this.Y - 1, ww + 2, this.Height + 2, 1, Style.StatusBarRect);
            gr.GdiDrawText(this.Text, Style.StatusBarFont, Style.StatusBarColor, g_x + 3, this.Y + 1, ww - 3, this.Height, DT_LEFT | DT_WORDBREAK | DT_WORD_ELLIPSIS | DT_NOPREFIX);
        }
    };
}(prop.Style);


//===========================================
//== Create "Keybind" Object ================
//===========================================

var Keybind = new function () {

    var commands = {
        SeekToNextLine: function () { seekLineTo(1); },
        SeekToPlayingLine: function () { seekLineTo(0); },
        SeekToPreviousLine: function () { seekLineTo(-1); },
        SeekToTop: function () {
            if (Edit.View.isStarted || (!Edit.isStarted && filetype === "lrc"))
                LyricShow.Properties.DrawStyle[1].doCommand();
            else fb.PlaybackTime = 0;
        },
        SwitchAutoScroll: function () {
            if (lyric) {
                window.SetProperty("Panel.AutoScroll", prop.Panel.AutoScroll = !prop.Panel.AutoScroll);
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

        this[38] = function () { lyric && applyDelta(prop.Panel.MouseWheelDelta); }; // Up
        this[40] = function () { lyric && applyDelta(-prop.Panel.MouseWheelDelta); }; // Down
        this[67] = function () { // C
            utils.IsKeyPressed(VK_CONTROL) && copyLyric(); // (+Ctrl)
        };
        this[86] = function () { // V
            if (utils.IsKeyPressed(VK_CONTROL) && fb.IsPlaying) { // (+Ctrl)
                getLyricFromClipboard();
                if (prop.Save.ClipbordAutoSaveTo) {
                    if (/^Tag$/i.test(prop.Save.ClipbordAutoSaveTo))
                        saveToTag(getFieldName());
                    else if (/^File$/i.test(prop.Save.ClipbordAutoSaveTo))
                        saveToFile(parse_path + "." + filetype);
                }
            }
        };
    }();

    this.LyricShow_keyup = new function () {

        this[49] = this[97] = function () { // 1
            window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 1);
            setDrawingMethod();
            Menu.build();
        };
        this[50] = this[98] = function () { // 2
            window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 2);
            setDrawingMethod();
            Menu.build();
        };
        this[51] = this[99] = function () { // 3
            window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 3);
            setDrawingMethod();
            Menu.build();
        };
        this[52] = this[100] = function () { // 4
            window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 4);
            setDrawingMethod();
            Menu.build();
        };
        this[53] = this[101] = function () { // 5
            window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 5);
            setDrawingMethod();
            Menu.build();
        };
        this[93] = function () { Menu.show(0, 0); }; // Menu key
    }();

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

        keynum = prop.Edit.Keybind["AheadBy3Seconds"];
        this[keynum] = function () { fb.PlaybackTime += 3; };
        keynum = prop.Edit.Keybind["BackBy3Seconds"];
        this[keynum] = function () { fb.PlaybackTime -= 3; };

        this[13] = function () { !Edit.View.isStarted && Edit.moveNextLine(); }; // Enter
        this[33] = function () { !Edit.View.isStarted && Edit.undo(); }; // Page Up
        this[38] = function () { // Up
            if (utils.IsKeyPressed(VK_SHIFT)) Edit.offsetTime(5); // (+Shift)
            else Edit.adjustTime(-5);
        };
        this[40] = function () { // Down
            if (utils.IsKeyPressed(VK_SHIFT)) Edit.offsetTime(-5); // (+Shift)
            else Edit.adjustTime(5);
        };
    }();

    this.Edit_keyup = new function () {
        this[93] = function () { Menu.show(0, 0); }; // Menu key
    }();
}();


//===========================================
//== Create "Menu" Object ===================
//===========================================

var Menu = new function () {

    var _menu, _item_list;

    //============
    //  sub menu items
    //============
    var submenu_Copy = [ // normal item
        {
            Flag: function () { return lyric ? MF_STRING : MF_GRAYED; },
            Caption: Label.CopyWith + "\tCtrl+C",
            Func: function () {
                copyLyric();
            }
        },
        {
            Flag: function () { return lyric ? MF_STRING : MF_GRAYED; },
            Caption: Label.CopyWithout,
            Func: function () {
                copyLyric(true);
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: MF_GRAYED,
            Caption: "[Previous]"
        },
        {
            Flag: function () { return !lyric && backupLyric[0] ? MF_STRING : null; },
            Caption: function () { return (backupLyric[0] && backupLyric[0].replace(alltagsRE, "").replace(/\[\w+?:.+?\]|\s/g, " ").trim().slice(0, 20)) + "..."; },
            Func: function () {
                setClipboard(backupLyric[0]);
            }
        },
        {
            Flag: function () { return backupLyric[1] ? MF_STRING : null; },
            Caption: function () { return ">" + (backupLyric[1] && backupLyric[1].replace(alltagsRE, "").replace(/\[\w+?:.+?\]|\s/g, " ").trim().slice(0, 20)) + "..."; },
            Func: function () {
                setClipboard(backupLyric[1]);
            }
        },
        {
            Flag: function () { return backupLyric[2] ? MF_STRING : null; },
            Caption: function () { return ">>" + (backupLyric[2] && backupLyric[2].replace(alltagsRE, "").replace(/\[\w+?:.+?\]|\s/g, " ").trim().slice(0, 19)) + "..."; },
            Func: function () {
                setClipboard(backupLyric[2]);
            }
        },
        {
            Flag: function () { return backupLyric[3] ? MF_STRING : null; },
            Caption: function () { return ">>>" + (backupLyric[3] && backupLyric[3].replace(alltagsRE, "").replace(/\[\w+?:.+?\]|\s/g, " ").trim().slice(0, 19)) + "..."; },
            Func: function () {
                setClipboard(backupLyric[3]);
            }
        },
        {
            Flag: function () { return backupLyric[4] ? MF_STRING : null; },
            Caption: function () { return ">>>>" + (backupLyric[4] && backupLyric[4].replace(alltagsRE, "").replace(/\[\w+?:.+?\]|\s/g, " ").trim().slice(0, 18)) + "..."; },
            Func: function () {
                setClipboard(backupLyric[4]);
            }
        },
        {
            Flag: function () { return backupLyric[5] ? MF_STRING : null; },
            Caption: function () { return ">>>>>" + (backupLyric[5] && backupLyric[5].replace(alltagsRE, "").replace(/\[\w+?:.+?\]|\s/g, " ").trim().slice(0, 18)) + "..."; },
            Func: function () {
                setClipboard(backupLyric[5]);
            }
        }
    ];

    var submenu_Align = [ // radio item
        {
            Caption: Label.Align_Left,
            Func: function () {
                window.SetProperty("Style.Align", DT_LEFT);
                setAlign();
                window.Repaint();
                Menu.build();
            }
        },
        {
            Caption: Label.Align_Left_Center,
            Func: function () {
                window.SetProperty("Style.Align", 0x00000003);
                setAlign();
                window.Repaint();
                Menu.build();
            }
        },
        {
            Caption: Label.Align_Center_Left,
            Func: function () {
                window.SetProperty("Style.Align", 0x00000004);
                setAlign();
                window.Repaint();
                Menu.build();
            }
        },
        {
            Caption: Label.Align_Center,
            Func: function () {
                window.SetProperty("Style.Align", DT_CENTER);
                setAlign();
                window.Repaint();
                Menu.build();
            }
        },
        {
            Caption: Label.Align_Center_Right,
            Func: function () {
                window.SetProperty("Style.Align", 0x00000005);
                setAlign();
                window.Repaint();
                Menu.build();
            }
        },
        {
            Caption: Label.Align_Right_Center,
            Func: function () {
                window.SetProperty("Style.Align", 0x00000006);
                setAlign();
                window.Repaint();
                Menu.build();
            }
        },
        {
            Caption: Label.Align_Right,
            Func: function () {
                window.SetProperty("Style.Align", DT_RIGHT);
                setAlign();
                window.Repaint();
                Menu.build();
            }
        }
    ];

    var submenu_Display = [ // check/uncheck item
        {
            Flag: function () { return prop.Style.EnableStyleTextRender ? MF_CHECKED : MF_UNCHECKED; },
            Caption: Label.StyleTextRender,
            Func: function () {
                window.SetProperty("Style.EnableStyleTextRender", prop.Style.EnableStyleTextRender = !prop.Style.EnableStyleTextRender);
                setDrawingMethod();
                !lyric && window.Repaint();
                Menu.build();
            }
        },
        {
            Flag: function () { return prop.Style.Font_Bold ? MF_CHECKED : MF_UNCHECKED; },
            Caption: Label.Bold,
            Func: function () {
                window.SetProperty("Style.Font-Bold", prop.Style.Font_Bold = !prop.Style.Font_Bold);
                prop.Style.Font = gdi.Font(prop.Style.Font_Family, prop.Style.Font_Size, (prop.Style.Font_Bold ? 1 : 0) + (prop.Style.Font_Italic ? 2 : 0));
                lyric && prop.Style.DrawingMethod === 2 && (prop.Panel.ScrollType <= 3 || filetype === "txt") && LyricShow.Properties.buildDrawStyle(); // テキスト画像の再作成
                window.Repaint();
                Menu.build();
            }
        },
        {
            Flag: function () { return prop.Style.Shadow ? MF_CHECKED : MF_UNCHECKED; },
            Caption: Label.Shadow,
            Func: function () {
                window.SetProperty("Style.Text-Shadow", prop.Style.Shadow = !prop.Style.Shadow);
                lyric && prop.Style.DrawingMethod === 2 && (prop.Panel.ScrollType <= 3 || filetype === "txt") && LyricShow.Properties.buildDrawStyle(); // テキスト画像の再作成
                window.Repaint();
                Menu.build();
            }
        },
        {
            Flag: function () { return prop.Style.Font_Italic ? MF_CHECKED : MF_UNCHECKED; },
            Caption: Label.Italic,
            Func: function () {
                window.SetProperty("Style.Font-Italic", prop.Style.Font_Italic = !prop.Style.Font_Italic);
                prop.Style.Font = gdi.Font(prop.Style.Font_Family, prop.Style.Font_Size, (prop.Style.Font_Bold ? 1 : 0) + (prop.Style.Font_Italic ? 2 : 0));
                lyric && prop.Style.DrawingMethod === 2 && (prop.Panel.ScrollType <= 3 || filetype === "txt") && LyricShow.Properties.buildDrawStyle(); // テキスト画像の再作成
                window.Repaint();
                Menu.build();
            }
        },
        {
            Flag: function () { return prop.Panel.BackgroundEnable ? MF_CHECKED : MF_UNCHECKED; },
            Caption: Label.BEnable,
            Func: function () {
                window.SetProperty("Panel.Background.Enable", prop.Panel.BackgroundEnable = !prop.Panel.BackgroundEnable);
                Menu.build();
                if (prop.Panel.BackgroundEnable) {
                    if (LyricShow.BackgroundImage.isSet())
                        LyricShow.BackgroundImage.fadeTimer();
                    else
                        LyricShow.BackgroundImage.build();
                }
                else
                    LyricShow.BackgroundImage.fadeTimer(true);
            }
        },
        {
            Flag: function () { return prop.Panel.BackgroundBlur ? MF_CHECKED : MF_UNCHECKED; },
            Caption: Label.BBlur,
            Func: function () {
                window.SetProperty("Panel.Background.Blur", prop.Panel.BackgroundBlur = !prop.Panel.BackgroundBlur);
                Menu.build();
                if (prop.Panel.BackgroundEnable) {
                    LyricShow.BackgroundImage.build();
                    LyricShow.BackgroundImage.fadeTimer();
                }
                else
                    LyricShow.BackgroundImage.releaseGlaphic();
            }
        },
        {
            Flag: function () { return prop.Panel.MouseWheelSmoothing ? MF_CHECKED : MF_UNCHECKED; },
            Caption: Label.WheelSmoothing,
            Func: function () {
                window.SetProperty("Panel.MouseWheelSmoothing", prop.Panel.MouseWheelSmoothing = !prop.Panel.MouseWheelSmoothing);
                Menu.build();
            }
        },
        {
            Flag: function () { return prop.Style.Fading ? MF_CHECKED : MF_UNCHECKED; },
            Caption: Label.Fading,
            Func: function () {
                window.SetProperty("Style.Fading", prop.Style.Fading = !prop.Style.Fading);
                setDrawingMethod();
                Menu.build();
            }
        },
        {
            Flag: function () { return prop.Panel.FollowExternalSeek ? MF_CHECKED : MF_UNCHECKED; },
            Caption: Label.FollowExternalSeek,
            Func: function () {
                window.SetProperty("Panel.FollowExternalSeek", prop.Panel.FollowExternalSeek = !prop.Panel.FollowExternalSeek);
                Menu.build();
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: function () { return prop.Style.Highline ? MF_CHECKED : MF_UNCHECKED; },
            Caption: Label.Highline,
            Func: function () {
                window.SetProperty("Style.HighlineColor for unsynced lyrics", prop.Style.Highline = !prop.Style.Highline);
                window.Repaint();
                Menu.build();
            }
        },
        {
            Flag: function () { return prop.Panel.ExpandRepetition ? MF_CHECKED : MF_UNCHECKED; },
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
            Flag: function () { return prop.Panel.Contain ? MF_CHECKED : MF_UNCHECKED; },
            Caption: Label.Contain,
            Func: function () {
                window.SetProperty("Panel.LRC.ContainNormalLines", prop.Panel.Contain = !prop.Panel.Contain);
                main();
            }
        },
        {
            Flag: function () { return prop.Panel.ScrollToCenter ? MF_CHECKED : MF_UNCHECKED; },
            Caption: Label.ScrollToCenter,
            Func: function () {
                window.SetProperty("Panel.LRC.ScrollToCenter", prop.Panel.ScrollToCenter = !prop.Panel.ScrollToCenter);
                Menu.build();
            }
        },
        {
            Flag: function () { return prop.Style.FadeInPlayingColor ? MF_CHECKED : MF_UNCHECKED; },
            Caption: Label.FadeInPlayingColor,
            Func: function () {
                window.SetProperty("Style.FadeInPlayingColor", prop.Style.FadeInPlayingColor = !prop.Style.FadeInPlayingColor);
                window.Repaint();
                Menu.build();
            }
        },
        {
            Flag: function () { return prop.Style.KeepPlayingColor ? MF_CHECKED : MF_UNCHECKED; },
            Caption: Label.KeepPlayingColor,
            Func: function () {
                window.SetProperty("Style.KeepPlayingColor", prop.Style.KeepPlayingColor = !prop.Style.KeepPlayingColor);
                window.Repaint();
                Menu.build();
            }
        }
    ];

    var submenu_ScrollType = [ // radio item
        {
            Caption: Label.ScrollType1 + "\t1",
            Func: function () {
                window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 1);
                setDrawingMethod();
                Menu.build();
            }
        },
        {
            Caption: Label.ScrollType2 + "\t2",
            Func: function () {
                window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 2);
                setDrawingMethod();
                Menu.build();
            }
        },
        {
            Caption: Label.ScrollType3 + "\t3",
            Func: function () {
                window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 3);
                setDrawingMethod();
                Menu.build();
            }
        },
        {
            Caption: Label.ScrollType4 + "\t4",
            Func: function () {
                window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 4);
                setDrawingMethod();
                Menu.build();
            }
        },
        {
            Caption: Label.ScrollType5 + "\t5",
            Func: function () {
                window.SetProperty("Panel.LRC.ScrollType", prop.Panel.ScrollType = 5);
                setDrawingMethod();
                Menu.build();
            }
        }
    ];

    var submenu_Color_LyricShow = createColorMenuItems(prop.Style.C_LS, "Style.ColorStyle.LyricShow", "CS_LS"); // radio item
    var submenu_Color_Edit = createColorMenuItems(prop.Style.C_E, "Style.ColorStyle.Edit", "CS_E"); // radio item

    function createColorMenuItems(Color, SettingName, PropName) {
        var items = [], item;
        for (var name in Color) {
            item = {};
            item["Caption"] = name;
            item["Func"] = function () {
                window.SetProperty(SettingName, prop.Style[PropName] = this.Caption);
                prop.Style.Color = Color[this.Caption];
                if (Edit.isStarted)
                    Edit.calcRGBdiff();
                else {
                    LyricShow.Properties.setPaintInfo();
                    lyric && prop.Style.DrawingMethod === 2 && (prop.Panel.ScrollType <= 3 || filetype === "txt") && LyricShow.Properties.buildDrawStyle(); // テキスト画像の再作成
                }
                window.Repaint();
                Menu.build();
            };
            items.push(item);
        }

        return items;
    }

    var submenu_Plugins = createPluginMenuItems(plugins); // normal item

    function createPluginMenuItems(plugins) {
        var items = [], item;
        for (var name in plugins) {
            if (!plugins[name].label) // Do not build to menu item if label is not set.
                continue;
            item = {};
            item["Flag"] = MF_STRING;
            item["Caption"] = plugins[name].label;
            item["Func"] = function () { if (plugins[arguments.callee.name].onCommand instanceof Function) plugins[arguments.callee.name].onCommand(); };
            item.Func.name = name;
            plugins[name].menuitem = item;
            items.push(item);

            for (var i = 0; i < prop.Plugin.FunctionKey.length; i++) { // Set Keybind_up (F1～F9) 
                if (prop.Plugin.FunctionKey[i].trim() === name) {
                    item.Caption += "\tF" + (i + 1);
                    Keybind.LyricShow_keyup[112 + i] = item.Func;
                }
            }
        }
        items.push(
            {
                Flag: MF_SEPARATOR
            },
            {
                Flag: MF_STRING,
                Caption: Label.OpenPluginsFolder,
                Func: function () { FuncCommand(scriptdir + "plugins\\"); }
            }
        );
        return items;
    }

    //=============
    //  main menu items
    //=============
    var menu_LyricShow = [
        {
            Flag: function () { return fb.IsPlaying ? MF_STRING : MF_GRAYED; },
            Caption: Label.Refresh,
            Func: function () {
                main();
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: function () { return lyric ? MF_STRING : MF_GRAYED; },
            Caption: Label.Edit,
            Func: function () {
                Edit.start();
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: function () { return lyric ? MF_STRING : MF_GRAYED; },
            Caption: function () { return prop.Panel.AutoScroll ? Label.ForbidAutoScroll : Label.AllowAutoScroll; },
            Func: function () {
                window.SetProperty("Panel.AutoScroll", prop.Panel.AutoScroll = !prop.Panel.AutoScroll);
                movable = prop.Panel.AutoScroll;
                ignore_remainder = true;
                window.Repaint();
                Menu.build();
            }
        },
        {
            Flag: function () { return filetype === "lrc" ? MF_STRING : MF_GRAYED; },
            Caption: Label.ChangeScroll,
            Sub: submenu_ScrollType,
            Radio: function () { return prop.Panel.ScrollType - 1; } // radio number begin with 0
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: MF_STRING,
            Caption: Label.Display,
            Sub: submenu_Display
        },
        {
            Flag: MF_STRING,
            Caption: Label.Align,
            Sub: submenu_Align,
            Radio: function () { // radio number begin with 0
                switch (Number(window.GetProperty("Style.Align"))) {
                    case 0: return 0; // Left
                    case 1: return 3; // Center
                    case 2: return 6; // Right
                    case 3: return 1; // Left_Center
                    case 4: return 2; // Center_Left
                    case 5: return 4; // Center_Right
                    case 6: return 5; // Right_Center
                }
            }
        },
        {
            Flag: MF_STRING,
            Caption: Label.Color,
            Sub: submenu_Color_LyricShow,
            Radio: function () { // radio number begin with 0
                for (var i = 0; i < submenu_Color_LyricShow.length; i++) {
                    if (submenu_Color_LyricShow[i].Caption === prop.Style.CS_LS)
                        return i;
                }
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: function () { return lyric ? MF_STRING : MF_GRAYED; },
            Caption: Label.About,
            Func: function () {
                if (!lyric) return;
                var LineFeedCode = prop.Save.LineFeedCode;
                var text = (lyric.info.length ? lyric.info.join(LineFeedCode) + LineFeedCode : "") + lyric.text.join(LineFeedCode).trim();
                var lineNum = lyric.text.length - (filetype === "lrc" ? 0 : 2);
                var strCount = text.replace(new RegExp(LineFeedCode, "g"), "").length;

                if (lyric.path)
                    var mes = lyric.path + "\nType: " + filetype.toUpperCase() + "\n"
                        + "Lyrics: " + lineNum + " lines, " + strCount + " length, " + lyric.dataSize / 1000 + " KB, read as " + lyric.charset + "\n"
                        + (filetype === "lrc" ? "Applied offset: " + (lyric.offset || 0) + " ms\n" : "")
                        + "------------------------------\n"
                        + text;
                else
                    mes = "Field: " + lyric.fieldname + "\nType: " + filetype.toUpperCase() + "\n"
                        + "Lyrics: " + lineNum + " lines, " + strCount + " length\n"
                        + (filetype === "lrc" ? "Applied offset: " + (lyric.offset || 0) + " ms\n" : "")
                        + "------------------------------\n"
                        + text;

                fb.ShowPopupMessage(mes, scriptName);
            }
        },
        {
            Flag: function () { return lyric || backupLyric[0] ? MF_STRING : MF_GRAYED; },
            Caption: Label.Copy,
            Sub: submenu_Copy
        },
        {
            Flag: function () { return lyric ? MF_STRING : MF_GRAYED; },
            Caption: Label.SaveToTag,
            Func: function () {
                saveToTag(getFieldName());
            }
        },
        {
            Flag: function () { return lyric ? MF_STRING : MF_GRAYED; },
            Caption: Label.SaveToFile,
            Func: function () {
                saveToFile(parse_path + "." + filetype);
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: function () { return fb.IsPlaying ? MF_STRING : MF_GRAYED; },
            Caption: Label.GetClipboard + "\tCtrl+V",
            Func: function () {
                getLyricFromClipboard();
                if (prop.Save.ClipbordAutoSaveTo) {
                    if (/^Tag$/i.test(prop.Save.ClipbordAutoSaveTo))
                        saveToTag(getFieldName());
                    else if (/^File$/i.test(prop.Save.ClipbordAutoSaveTo))
                        saveToFile(parse_path + "." + filetype);
                }
            }
        },
        {
            Flag: function () { return fb.IsPlaying ? MF_STRING : MF_GRAYED; },
            Caption: Label.Open,
            Func: function () {
                var filter = "Lyric Files(*.lrc;*.txt)|*.txt;*.lrc|LRC Files(*.lrc)|*.lrc|Text Files(*.txt)|*.txt";
                var fd = new FileDialog(commondir + 'FileDialog.exe -o "' + filter + '" txt');
                fd.setOnReady(function (file) { file && main(file); });
                fd.open();
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: function () { return lyric && lyric.path ? MF_STRING : MF_GRAYED; },
            Caption: Label.OpenIn,
            Func: function () {
                if (prop.Panel.Editor)
                    FuncCommand(prop.Panel.Editor + " " + lyric.path);
                else
                    FuncCommand(lyric.path);
            }
        },
        {
            Flag: function () { return fb.IsPlaying ? MF_STRING : MF_GRAYED; },
            Caption: Label.OpenFolder,
            Func: function () {
                if (lyric && lyric.path)
                    FuncCommand("explorer.exe /select,\"" + lyric.path + "\"");
                else if (directory)
                    FuncCommand(directory);
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: MF_STRING,
            Caption: Label.Plugins,
            Sub: submenu_Plugins
        }
    ];


    var menu_Edit = [
        {
            Flag: function () { return Edit.View.isStarted ? MF_CHECKED : MF_UNCHECKED; },
            Caption: Label.View,
            Func: function () {
                Edit.switchView();
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: MF_STRING,
            Caption: Label.LyricShow,
            Func: function () {
                main();
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: function () { return (Edit.View.isStarted && Edit.View.i === lyric.text.length) ? MF_STRING : MF_GRAYED; },
            Caption: Label.SaveToTag,
            Func: function () {
                saveToTag(getFieldName());
            }
        },
        {
            Flag: function () { return (Edit.View.isStarted && Edit.View.i === lyric.text.length) ? MF_STRING : MF_GRAYED; },
            Caption: Label.SaveToFile,
            Func: function () {
                saveToFile(parse_path + ".lrc");
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: MF_STRING,
            Caption: Label.EditLine,
            Func: function () {
                Edit.controlLine(2);
            }
        },
        {
            Flag: function () { return Edit.View.isStarted ? MF_GRAYED : MF_STRING; },
            Caption: Label.InsertLine,
            Func: function () {
                Edit.controlLine(1);
            }
        },
        {
            Flag: function () { return Edit.View.isStarted ? MF_GRAYED : MF_STRING; },
            Caption: Label.DeleteLine,
            Func: function () {
                Edit.controlLine(-1);
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: MF_STRING,
            Caption: Label.Color,
            Sub: submenu_Color_Edit,
            Radio: function () { // radio number begin with 0
                for (var i = 0; i < submenu_Color_Edit.length; i++) {
                    if (submenu_Color_Edit[i].Caption === prop.Style.CS_E)
                        return i;
                }
            }
        },
        {
            Flag: function () { return prop.Edit.Rule ? MF_CHECKED : MF_UNCHECKED; },
            Caption: Label.Rule,
            Func: function () {
                window.SetProperty("Edit.ShowRuledLine", prop.Edit.Rule = !prop.Edit.Rule);
                window.Repaint();
                Menu.build();
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: function () { return fs.FileExists(parse_path + ".txt") ? MF_STRING : MF_GRAYED; },
            Caption: Label.DeleteFile,
            Func: function () {
                Edit.deleteFile(parse_path + ".txt");
            }
        }
    ];


    var common = [
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: MF_STRING,
            Caption: Label.Prop,
            Func: function () {
                window.ShowProperties();
            }
        },
        {
            Flag: MF_STRING,
            Caption: Label.Help,
            Func: function () {
                FuncCommand("http://ashiato1.blog62.fc2.com/blog-entry-64.html");
            }
        },
        {
            Flag: function () { return prop.Panel.HideConf ? null : MF_STRING; },
            Caption: Label.Conf,
            Func: function () {
                window.ShowConfigure();
            }
        },
        {
            Flag: MF_SEPARATOR
        },
        {
            Flag: function () { return fb.IsPlaying ? MF_STRING : MF_GRAYED; },
            Caption: "Now Playing",
            Sub: function (IMenuObj) {
                var base_id = 1000; // このメニューではidに1000番台を使うようにする
                var _context = fb.CreateContextMenuManager();
                _context.InitNowPlaying();
                _context.BuildMenu(IMenuObj, base_id, -1);

                buildMenu.item_list._context = _context;
                buildMenu.item_list._contextIdx = base_id;
            }
        }
    ];

    menu_LyricShow = menu_LyricShow.concat(common); // Insert common menuitems
    menu_Edit = menu_Edit.concat(common);


    //========
    //  menu_obj
    //========
    // Make id equal to property name
    this.LyricShow = {
        id: "LyricShow",
        items: menu_LyricShow
    };

    this.Edit = {
        id: "Edit",
        items: menu_Edit
    };

    this.Plugins = {
        id: "Plugins",
        items: submenu_Plugins
    };

    //=====
    //  build
    //=====
    this.build = function (mobj) {
        _menu && _menu.Dispose();

        mobj = mobj || (Edit.isStarted ? this.Edit : this.LyricShow);
        _menu = buildMenu(mobj.items);
        _item_list = buildMenu.item_list;
        this.id = mobj.id;
    };

    this.show = function (x, y) {
        Menu.isShown = true;
        var item_list = _item_list; // メニュー表示中に_item_listの参照先が変わる可能性があるので参照を保持しておく
        var ret = _menu.TrackPopupMenu(x, y);
        //console(ret);
        if (ret !== 0) {
            if (item_list[ret])
                item_list[ret].Func();
            else
                item_list._context.ExecuteByID(ret - item_list._contextIdx);
        }
        (function () { Menu.isShown = false; }).timeout(10);
    };

    this.insertItems = function (id, index, items) {
        var target = Menu[id];
        var list, temp;
        if (target instanceof Object && target.items instanceof Array) {
            list = target.items;
            if (index < 0)
                index = Math.max(list.length + index + 1, 0);
            else
                index = Math.min(index, list.length);

            temp = list.splice(index, list.length - index);
            list.push.apply(list, items.concat(temp));
        }
    };
}();


//========================================
//== onLoad ==============================
//========================================

window.DlgCode = 0x0004;
setDrawingMethod();
on_size();
for (var pname in plugins) {
    if (plugins[pname].onStartUp instanceof Function)
        plugins[pname].onStartUp();
}
main();

function main(text) {

    if (main.IsVisible !== window.IsVisible)
        main.IsVisible = window.IsVisible || prop.Panel.RunInTheBackground;

    if (main.IsVisible && fb.IsPlaying) {
        var parse_paths = fb.TitleFormat(prop.Panel.Path).Eval().split("||");
        //Trace.start("Read Lyrics");
        LyricShow.start(parse_paths, text);
        //Trace.stop();
    }
    else
        LyricShow.init();

    window.Repaint();
    Menu.build();

    //(function () { if (lyric) { Edit.start(); } }).timeout(400);
}


//========================================
//== Callback function ===================
//========================================
function on_paint(gr) {
    gr.SetTextRenderingHint(5);
    gr.SetSmoothingMode(2);
    //gr.SetInterpolationMode(7);

    if (!Edit.isStarted) // Normal
        LyricShow.on_paint(gr);
    else { // Edit
        Edit.on_paint(gr);
        Buttons.on_paint(gr);
    }

    StatusBar.on_paint(gr); // Status Bar

    for (var pname in plugins) { // Plugin
        if (plugins[pname].onPaint instanceof Function)
            plugins[pname].onPaint(gr);
    }
}

function on_size() {
    var _re_search = Boolean(ww === 0 || wh === 0); // 真なら行検索をやり直す
    g_x = prop.Style.HPadding;
    g_y = prop.Style.VPadding[0];
    ww = Math.max(window.Width - g_x * 2, 0); // window.Width と window.Height を 0 に設定してくるコンポ（foo_uie_tabs等）があるので、Math.maxメソッドで負数を回避
    wh = Math.max(window.Height - (g_y + prop.Style.VPadding[1]), 0);
    centerleftX = Math.round(ww / 5 + g_x);
    fixY = g_y + Math.round(wh * (prop.Style.CenterPosition / 100));

    seek_width = Math.max(Math.floor(ww * 15 / 100), 0);
    arc_w = (seek_width >= 30) * 15;
    arc_h = (wh - 50 >= 30) * 15;

    if (Edit.isStarted) {
        Buttons.buildButton();
    }
    else {
        prop.Panel.RefreshOnPanelResize && ww && wh && refreshDrawStyle();
        prop.Panel.RefreshOnPanelResize && LyricShow.BackgroundImage.isSet() && LyricShow.BackgroundImage.build();
        _re_search && lyric && LyricShow.searchLine(fb.PlaybackTime);
    }

    for (var pname in plugins) {
        if (plugins[pname].onSize instanceof Function)
            plugins[pname].onSize();
    }
}

function on_focus(is_focused) {
    !main.IsVisible && main();
}

function on_playback_new_track(metadb) {
    if (Menu.isShown && Menu.id !== "Save")
        ws.SendKeys("%"); // close context menu
    infoPath = null;
    main();

    for (var pname in plugins) {
        if (plugins[pname].onPlay instanceof Function)
            plugins[pname].onPlay(metadb);
    }
}

function on_playback_seek(time) {
    if (prop.Panel.GuessPlaybackTempo)
        LyricShow.guessPlaybackTempo.time = time;

    isExternalSeek = (fromY === null); // fromYが設定されていないならmodoki以外によるシークと判断する
    if (isExternalSeek)
        fromY = offsetY;

    if (!Edit.isStarted && lyric)
        LyricShow.searchLine(time);
    else if (Edit.View.isStarted)
        Edit.View.searchLine(time);

    isExternalSeek = false;
}

function on_playback_stop(reason) {
    if (Menu.isShown && Menu.id !== "Save")
        ws.SendKeys("%"); // close context menu
    if (reason === 0 || reason === 1)
        main();

    for (var pname in plugins) {
        if (plugins[pname].onStop instanceof Function)
            plugins[pname].onStop(reason);
    }
}

function on_playback_pause(state) {
    if (!Edit.isStarted && lyric)
        LyricShow.pauseTimer(state);
    else if (Edit.View.isStarted)
        Edit.View.pauseTimer(state);

    for (var pname in plugins) {
        if (plugins[pname].onPause instanceof Function)
            plugins[pname].onPause(state);
    }
}

function on_mouse_move(x, y) {
    if (mouse.isDrag) {
        applyDelta(y - mouse.drag_y, true);
        mouse.drag_y = y;
    }
    else if (Edit.isStarted) {
        Buttons.on_mouse_move(x, y);
        if (!Buttons.CurrentButton)
            Edit.on_mouse_move(x, y);
    }

    for (var pname in plugins) {
        if (plugins[pname].onMove instanceof Function)
            plugins[pname].onMove(x, y);
    }
}

function on_mouse_leave() {
    if (Buttons.CurrentButton) {
        Buttons.CurrentButton.DeactivateTooltip();
        Buttons.CurrentButton = null;
    }

    if (Edit.CurrentArea) {
        Edit.CurrentArea = null;
        window.Repaint();
    }

    for (var pname in plugins) {
        if (plugins[pname].onLeave instanceof Function)
            plugins[pname].onLeave();
    }
}

function on_mouse_lbtn_down(x, y, mask) {
    if (Menu.isShown)
        return;

    for (var pname in plugins) {
        if (plugins[pname].onClick instanceof Function)
            if (plugins[pname].onClick(x, y, mask))
                return;
    }

    if (!Edit.isStarted) {
        if (utils.IsKeyPressed(VK_SHIFT)) {
            if (fb.IsPlaying && prop.Panel.InfoPath) {
                if (!infoPath) {
                    infoPath = fb.TitleFormat(prop.Panel.InfoPath).Eval().split("||");
                    infoPath.push("");
                }
                main(infoPath[0]);
                StatusBar.showText(infoPath[0], 3000);
                infoPath.push(infoPath.shift());
            }
        }
        else if (lyric) {
            !isAnim && (mouse.isDrag = true);
            mouse.down_y = mouse.drag_y = y;
            mouse.down_x = x;
        }
    }
    else {
        if (Buttons.CurrentButton)
            /*none*/;
        else if (Edit.CurrentArea === "LEFT")
            fb.PlaybackTime -= 3;
        else if (Edit.CurrentArea === "RIGHT")
            fb.PlaybackTime += 3;
        else if (utils.IsKeyPressed(VK_CONTROL))
            fs.FileExists(parse_path + ".txt") && Edit.deleteFile(parse_path + ".txt");
        else if (!Edit.View.isStarted) {
            if (utils.IsKeyPressed(VK_SHIFT))
                Edit.controlLine(0);
            else if (y < textHeight * 2 + g_y)
                Edit.undo();
            else
                Edit.moveNextLine(x, y);
        }
        else
            for (var i = disp.top, j = disp.bottom; i <= j; i++) {
                if (LyricShow.Properties.DrawStyle[i].onclick(x, y))
                    break;
            }
    }
}

function on_mouse_lbtn_up(x, y, mask) {
    if (!Edit.isStarted) {
        mouse.isDrag = false;
        if (prop.Panel.ScrollType !== 4 && prop.Panel.ScrollType !== 5 && prop.Panel.SingleClickSeek && filetype === "lrc" && x === mouse.down_x && y === mouse.down_y) {
            for (var i = disp.top, j = disp.bottom; i <= j; i++) {
                if (LyricShow.Properties.DrawStyle[i].onclick(x, y))
                    break;
            }
        }
    }
    else if (Buttons.CurrentButton && Buttons.CurrentButton.isMouseOver(x, y))
        Buttons.CurrentButton.Func();
}

function on_mouse_lbtn_dblclk(x, y, mask) {
    if (Edit.isStarted) on_mouse_lbtn_down(x, y, mask);
    else if (filetype !== "lrc") main();
    else if (prop.Panel.ScrollType !== 4 && prop.Panel.ScrollType !== 5 && !prop.Panel.SingleClickSeek) {
        for (var i = disp.top, j = disp.bottom; i <= j; i++) {
            if (LyricShow.Properties.DrawStyle[i].onclick(x, y))
                break;
        }
    }
}

function on_mouse_mbtn_down(x, y, mask) {
    if (Menu.isShown) ws.SendKeys("%"); // close context menu
    else if (Edit.isStarted) Edit.switchView();
    else if (lyric) !isAnim && Edit.start();
    else {
        Menu.build(Menu.Plugins);
        Menu.show(x, y);
        Menu.build();
    }
}

function on_mouse_mbtn_dblclk(x, y, mask) {
    on_mouse_mbtn_down(x, y, mask);
}

function on_mouse_wheel(step) {
    if (!Edit.isStarted) {
        if (utils.IsKeyPressed(VK_CONTROL)) {
            if (step === 1 && prop.Style.Font_Size >= 48 || step === -1 && prop.Style.Font_Size <= 10)
                return;
            window.SetProperty("Style.Font-Size", prop.Style.Font_Size += step);
            prop.Style.Font = gdi.Font(prop.Style.Font_Family, prop.Style.Font_Size, (prop.Style.Font_Bold ? 1 : 0) + (prop.Style.Font_Italic ? 2 : 0));
            if (prop.Style.EnableStyleTextRender) {
                refreshDrawStyle.clearTimeout();
                refreshDrawStyle.timeout(400);
            }
            else
                refreshDrawStyle();
            StatusBar.showText("Font Size : " + prop.Style.Font_Size, 3000);
        }
        else
            lyric && applyDelta(step * prop.Panel.MouseWheelDelta);
    }
    else {
        if (!Edit.View.isStarted) {
            if (step === 1) // wheel up
                Edit.undo();
            else if (step === -1) // wheel down
                Edit.moveNextLine();
        }
        else {
            var i = lyric.i - 1 - step;
            if (i < lyric.text.length && i >= 0)
                LyricShow.Properties.DrawStyle[i].doCommand();
        }
    }
}

function on_mouse_rbtn_up(x, y, mask) {
    if (utils.IsKeyPressed(VK_SHIFT))
        return;
    else {
        Menu.show(x, y);
        return true; // prevent default menu
    }
}

function on_key_down(vkey) {
    //console(vkey);
    var prevent_shortcuts;
    if (!Edit.isStarted) {
        Keybind.LyricShow_keydown[vkey] && Keybind.LyricShow_keydown[vkey]();
        prevent_shortcuts = Boolean(Keybind.LyricShow_keydown[vkey] || Keybind.LyricShow_keyup[vkey]);
    }
    else {
        Keybind.Edit_keydown[vkey] && Keybind.Edit_keydown[vkey]();
        prevent_shortcuts = Boolean(Keybind.Edit_keydown[vkey] || Keybind.Edit_keyup[vkey]);
    }

    return prevent_shortcuts;
}

function on_key_up(vkey) {
    if (!Edit.isStarted)
        Keybind.LyricShow_keyup[vkey] && Keybind.LyricShow_keyup[vkey]();
    else
        Keybind.Edit_keyup[vkey] && Keybind.Edit_keyup[vkey]();
}

function on_notify_data(name, info) {
    if (name === scriptName)
        main(typeof info === "string" ? info : null);
}

//EOF