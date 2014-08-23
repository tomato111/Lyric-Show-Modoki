//created by tomato111
//e.g.) @import "%fb2k_path%import\common\lib.js"

//============================================
//== Prototype ==================================
//============================================

//-- Replace --
String.prototype.replaceEach = function () { //e.g.) "abc*Bc".replaceEach("b", "e", "c", "f", "\\*", "_", "ig")  /* aef_ef */
    var str = this;
    var flag = arguments[arguments.length - 1];
    if (!(arguments.length % 2))
        throw new Error("Wrong number of arguments");
    if (/[^igm]/.test(flag))
        throw new Error("Unknown flag: \"" + flag + "\"");

    for (var i = 0; i < arguments.length - 1; i += 2) {
        var re = new RegExp(arguments[i], flag);
        str = str.replace(re, arguments[i + 1]);
    }
    return str;
};

String.prototype.toHalfWidthNum = function () { //-- Replace full-width number with half-width number --
    return this.replace(/[０１２３４５６７８９]/g, function (s) { return "０１２３４５６７８９".indexOf(s); });
};

String.prototype.hexNumRefToString = function () { //-- 数値文字参照(16進数, 10進数)を文字列に変換 -- reference https://gist.github.com/myaumyau/4975024
    return this.replace(/&#x([0-9a-f]+);/ig, function (match, $1, idx, all) {
        return String.fromCharCode('0x' + $1);
    });
};

String.prototype.decNumRefToString = function () {
    return this.replace(/&#(\d+);/ig, function (match, $1, idx, all) {
        return String.fromCharCode($1);
    });
};

String.prototype.stringTodecNumRef = function () {
    var ref = "";
    for (var i = 0; i < this.length; i++)
        ref += "&#" + this.charCodeAt(i) + ";";
    return ref;
};

//-- Trim --
String.prototype.trim = function (s) {
    return this.replace(/^[\s　]*|[\s　]*$/g, "");
};

//-- Print --
String.prototype.console = function (s) {
    fb.trace(this + (s ? s : ""));
    return this;
};

Number.prototype.console = function (s) {
    fb.trace(this.toString() + (s ? s : ""));
    return this;
};

Boolean.prototype.console = function (s) {
    fb.trace(this + (s ? s : ""));
    return this;
};

//-- Timer --
Function.prototype.interval = function (time, callback) {
    var __method = this;
    var __callback = callback || function () { };
    this.$$timerid$$ = window.setInterval(function () {
        __method.apply(this, arguments);
        __callback.apply(this, arguments);
    }, time);
};

Function.prototype.timeout = function (time, callback) {
    var __method = this;
    var __callback = callback || function () { };
    this.$$timerid$$ = window.setTimeout(function () {
        __method.apply(this, arguments);
        __callback.apply(this, arguments);
    }, time);
};

Function.prototype.clearInterval = function () {
    window.clearInterval(this.$$timerid$$);
};

Function.prototype.clearTimeout = function () {
    window.clearTimeout(this.$$timerid$$);
};

//============================================
//== Constructor ================================
//============================================

//-- Message --
function Message(text, title, type) {
    this.text = text.replace(/\\n/g, "\n");
    this.title = title;
    this.type = type;
}
Message.prototype.popup = function (s) {
    return new ActiveXObject("WScript.Shell").popup(this.text + (s ? s : ""), 0, this.title, this.type);
};
Message.prototype.trace = function (s) {
    fb.trace(this.text + (s ? s : ""));
};
Message.prototype.ret = function (s) {
    return (this.text + (s ? s : ""));
};
Message.prototype.fbpopup = function (s) {
    fb.ShowPopupMessage(this.text + (s ? s : ""), this.title);
};

//-- Time Logger --
function TraceLog() {
    this.startTime = -1;
}
TraceLog.prototype = {
    start: function (message) {
        this.message = message;
        this.startTime = new Date().getTime();
        fb.trace('[' + message + '] has started');
    },
    stop: function () {
        var current = new Date().getTime();
        var endTime = current - this.startTime;
        fb.trace('[' + this.message + '] has finished at ' + endTime + ' ms');
    }
};

//-- File Dialog --
function FileDialog(exe) {
    var file;
    var ws = new ActiveXObject("WScript.Shell");

    var onReady = function () { };

    this.open = function () {
        var proc = ws.Exec(exe);
        (function () {
            file = proc.StdOut.ReadAll();

            if (!file && proc.Status == 0) {
                return;
            }
            arguments.callee.clearInterval();
            onReady(file);
        }).interval(1000);
    };

    this.setOnReady = function (f) { onReady = f; };
}

//-- Binary Access -- reference http://www2.wbs.ne.jp/~kanegon/doc/code.txt
var scVB = new ActiveXObject("ScriptControl"); // VBScript でサイズ取得と要素アクセスの関数を用意
scVB.Language = "VBScript";
scVB.AddCode("Function vbBinary_getSize(text) : vbBinary_getSize = LenB(text) : End Function");
scVB.AddCode("Function vbBinary_At(text, index) : vbBinary_At = AscB(MidB(text, index + 1, 1)) : End Function");

function Binary(data) { // Binary クラスで VBScript を隠蔽
    this.data = data;
    this.size = scVB.Run("vbBinary_getSize", this.data);
}
Binary.prototype.At = function (index) {
    if (index < 0 || index >= this.size) return 0;
    return scVB.Run("vbBinary_At", this.data, index);
};
Binary.prototype.charAt = function (index) {
    if (index < 0 || index >= this.size) return "";
    return String.fromCharCode(scVB.Run("vbBinary_At", this.data, index));
};
Binary.prototype.getArray = function (n) {
    if (!n || n < 0)
        n = this.size;
    for (var i = 0; i < n; i++)
        this[i] = this.At(i);
};


//-- ini file reader (UTF-8 with BOM)-- reference http://shoji.blog1.fc2.com/blog-entry-130.html
function Ini() {
    this.initialize.apply(this, arguments);
}
Ini.prototype = {
    initialize: function (file, charset) {
        this.clear();
        if (file != null) this.open(file, charset);
    },

    // clearメソッド - 全削除
    clear: function () {
        try { delete this.items; } catch (e) { }
        this.items = new Array();  // 項目
        this.filename = null;    // ファイル名
    },

    // openメソッド - Iniファイルの読込
    open: function (filename, charset) {
        try {
            var stm = new ActiveXObject('ADODB.Stream');
            stm.type = 2;
            stm.charset = charset || GetCharsetFromCodepage(utils.FileTest(file, "chardet"));
            stm.open();
            stm.loadFromFile(filename); // stm.position -> 0

            this.clear();
            var sectionname = null;
            var p = -1;

            while (!stm.EOS) {
                var line = stm.readText(-2);

                line = line.replace(/^[ \t]+/, "");  // 先頭の空白は削除
                if (!line.match(/^(?:;|[ \t]*$)/))    // ;で開始しない, 空行ではない
                {
                    if (line.match(/^\[(.+)\][ \t]*$/))  // セクション行
                    {
                        sectionname = RegExp.$1;
                        this.items[sectionname] = new Array();  // セクション行を追加
                    }
                    else if (sectionname != null && (p = line.indexOf('=')) >= 0) {
                        var keyname = line.substr(0, p).trim();
                        var value = line.substr(p + 1, line.length - p - 1).trim();

                        this.items[sectionname][keyname] = value;
                    }
                }
            }

            this.filename = filename;

            stm.close();
            stm = null; delete stm;
            fso = null; delete fso;

            return true;
        }
        catch (e) {
            this.filename = filename;
            return false;
        }
    },

    // updateメソッド - iniファイルの更新
    update: function (filename) {
        if (filename != null) this.filename = filename;

        try {
            var fso = new ActiveXObject("Scripting.FileSystemObject");  // FileSystemObjectを作成
            var ini = fso.OpenTextFile(this.filename, 2, true)

            for (var sectionname in this.items) {
                ini.WriteLine('[' + sectionname + ']');
                for (var keyname in this.items[sectionname])
                    ini.WriteLine(keyname + '=' + this.items[sectionname][keyname]);
                ini.WriteLine('');
            }
            ini = null; delete ini;
            fso = null; delete fso;

            this.open(this.filename);
            return true;
        }
        catch (e) {
            return false;
        }
    },

    // setItemメソッド - 項目の値設定
    setItem: function (sectionname, keyname, value, updateflag) {
        if (updateflag == null) updateflag = true;

        if (!(sectionname in this.items))
            this.items[sectionname] = new Array();

        this.items[sectionname][keyname] = value;

        if (updateflag && this.filename != null) this.update();
    }
};


//============================================
//== Function ===================================
//============================================

/*インターセプトした関数ではプロトタイプメソッドをnopにすれば出力しない*/
//TraceLog.prototype.start = TraceLog.prototype.stop = function () { /* nop */ }; };

//-- Profiler --
function traceInterceptor(target) {
    var log = new TraceLog;
    for (var property in target) {
        if (typeof target[property] == 'function') {
            var __method = target[property];
            target[property] = function () {
                log.start(property);
                var returnValue = __method.apply(this, arguments);
                log.stop();
                return returnValue;
            };
        }
    }
};

//-- Print --
function console(s) {
    fb.trace(s);
    return s;
}

//-- Color --
function RGBA(r, g, b, a) {
    var res = 0xff000000 | (r << 16) | (g << 8) | (b);
    if (a != undefined) res = (res & 0x00ffffff) | (a << 24);
    return res;
}
function RGB(r, g, b) { return (0xff000000 | (r << 16) | (g << 8) | (b)); }
function getRGB(color) { return [getRed(color), getGreen(color), getBlue(color)]; }
function getRGBA(color) { return [getRed(color), getGreen(color), getBlue(color), getAlpha(color)]; }
function getAlpha(color) { return ((color >> 24) & 0xff); }
function getRed(color) { return ((color >> 16) & 0xff); }
function getGreen(color) { return ((color >> 8) & 0xff); }
function getBlue(color) { return (color & 0xff); }
function RGBAtoRGB(color) { // reference http://stackoverflow.com/questions/2049230/convert-rgba-color-to-rgb

    var TargetR, TargetG, TargetB;
    var BGColorR = 255; // option
    var BGColorG = 255;
    var BGColorB = 255;

    var rgba = getRGBA(color);
    rgba[3] = rgba[3] / 255;

    TargetR = (((1 - rgba[3]) * BGColorR) + Math.round(rgba[3] * rgba[0]));
    TargetG = (((1 - rgba[3]) * BGColorG) + Math.round(rgba[3] * rgba[1]));
    TargetB = (((1 - rgba[3]) * BGColorB) + Math.round(rgba[3] * rgba[2]));

    return RGB(TargetR, TargetG, TargetB);
}

//-- Input Prompt --
function prompt(text, title, defaultText) {
    var sc = new ActiveXObject("ScriptControl");
    var code = 'Function fn(text, title, defaultText)\n'
    + 'fn = InputBox(text, title, defaultText)\n'
    + 'End Function'
    sc.Language = "VBScript";
    sc.AddCode(code);
    return sc.Run("fn", text, title, defaultText);
}

//-- Play Sound --
function playSoundSimple(url) {
    var mp = arguments.callee.mp;
    try {
        if (!mp)
            mp = arguments.callee.mp = new ActiveXObject("WMPlayer.OCX");
        mp.URL = url;
        mp.Controls.Play();
    } catch (e) { }
}

//-- Execute Command --
function FuncCommand(path) {
    var sa = new ActiveXObject("Shell.Application");
    if (!/(?:\\|:\/\/)/.test(path))
        fb.RunMainMenuCommand(path);
    else {
        var ar, arg = null;
        if (path.match(/(.*?\.\w{2,4}) (.*)/)) {
            path = RegExp.$1;
            ar = RegExp.$2.charAt(0);
            arg = (ar != '"' && ar != "/") ? '"' + RegExp.$2 + '"' : RegExp.$2;
        }
        sa.ShellExecute(path, arg, "", "open", 1);
    }
}

function FuncCommands(c, MetadbHandle) { // c= a command string or commands array
    if (c)
        if (c instanceof Array)
            for (var i = 0; i < c.length; i++)
                ex(c[i]);
        else
            ex(c);

    function ex(c) {
        if (c.charAt(0) == "<")
            window.NotifyOthers(c.slice(1, -1), "");
        else
            FuncCommand(fb.TitleFormat(c).EvalWithMetadb(MetadbHandle));
    }
}

//-- IOFunc --
function createFolder(objFSO, strFolder) {
    try {
        var strParent = objFSO.GetParentFolderName(strFolder)
        if (!objFSO.FolderExists(strParent))
            arguments.callee(objFSO, strParent);
        objFSO.CreateFolder(strFolder);
    } catch (e) { throw new Error("Couldn't create a folder.") }
}

function writeTextFile(text, file, charset) {
    var bin;
    var UTF8N = /^UTF-8N$/i.test(charset);
    var setEOS = function (pos, buf) {
        stm.Position = pos;
        stm.SetEOS();
        stm.Write(buf);
    }
    var stm = new ActiveXObject('ADODB.Stream');
    stm.type = 2;
    stm.charset = UTF8N ? "UTF-8" : charset;
    stm.open();
    stm.writeText(text); // この地点でBOMが付加される。まず問題ないが、読み取ったファイルがBOMの重複を起こしていた場合を考えて重複チェックを入れる
    try {
        stm.position = 0;
        stm.type = 1;

        if (/^UTF-8|Unicode$/i.test(charset)) { // BOMが重複しているなら既存のBOMをスキップ
            bin = new Binary(stm.read(6)); // stm.Position -> 6
            bin.getArray();
            if (bin[3] == 0xEF && bin[4] == 0xBB && bin[5] == 0xBF) // UTF-8
                setEOS(3, stm.Read(-1));
            else if (bin[2] == 0xFF && bin[3] == 0xFE || bin[2] == 0xFE && bin[3] == 0xFF) { // UTF-16LE & UTF-16BE
                stm.Position = 4;
                setEOS(2, stm.Read(-1));
            }
        }
        else { // 設定した文字コードには不要であるBOMが付いているなら削除
            bin = new Binary(stm.read(3)); // stm.Position -> 3
            bin.getArray();
            if (bin[0] == 0xEF && bin[1] == 0xBB && bin[2] == 0xBF) // UTF-8
                setEOS(0, stm.Read(-1));
            else if (bin[0] == 0xFF && bin[1] == 0xFE || bin[0] == 0xFE && bin[1] == 0xFF) { // UTF-16LE & UTF-16BE
                stm.Position = 2;
                setEOS(0, stm.Read(-1));
            }
        }

        if (UTF8N) { // UTF-8Nの保存に対応
            stm.Position = 3;
            setEOS(0, stm.Read(-1));
        }

        stm.position = 0;
        stm.saveToFile(file, 2);
    } catch (e) {
        throw new Error("Couldn't save text to a file.");
    } finally {
        stm.close();
        stm = null;
    }

    return file;
}

// バイナリモードでstreamへ流して_autodetect_allでテキスト取得した際に、BOMが文字として取り込まれるバグがある
// そのようにADODB.Streamを扱う場合は、Unicode体系において_autodetect_allを回避する必要がある
function readTextFile(file, charset) {
    var str;
    var stm = new ActiveXObject('ADODB.Stream');
    stm.type = 2;
    stm.charset = arguments.callee.lastCharset = charset || GetCharsetFromCodepage(utils.FileTest(file, "chardet"));
    stm.open();
    try {
        stm.loadFromFile(file); // stm.position -> 0
        str = stm.readText(-1); // _autodetect_allでの一行ごとの取得はまともに動かない
    } catch (e) {
        throw new Error("Couldn't open a file.\nIt has most likely been moved, renamed, or deleted.");
    } finally {
        stm.close();
        stm = null;
    }

    return str;
}

function responseBodyToCharset(bin, charset) { // Mozilla: overrideMimeType, IE: convert by ADODB.Stream (from Binary to UTF-8)
    var str;
    var stm = new ActiveXObject("ADODB.Stream");
    try {
        stm.open();
        stm.type = 1; // write once in binary mode
        stm.write(bin); // stm.position -> eos
        stm.position = 0;
        stm.type = 2; // change the mode to text mode
        stm.charset = charset;
        str = stm.readText(-1);
    } finally {
        stm.close();
    }

    return str;
}

function responseBodyToFile(bin, file) {
    var str;
    var stm = new ActiveXObject("ADODB.Stream");
    try {
        stm.open();
        stm.type = 1; // write once in binary mode
        stm.write(bin); // stm.position -> eos
        stm.position = 0;
        stm.saveToFile(file, 2);
    } finally {
        stm.close();
    }

    return file;
}

function getHTML(data, method, file, async, depth, onLoaded) {
    var request = new ActiveXObject("Msxml2.XMLHTTP");
    getHTML.PRESENT = { file: file, depth: depth };

    request.open(method, file, async);

    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            onLoaded(request, depth, file);
        }
    }

    request.setRequestHeader("content-type", "application/x-www-form-urlencoded");
    request.send(data);
}

//-- Metadb --
function writeTagField(text, field, MetadbHandle) {
    var a = new ActiveXObject("Scripting.FileSystemObject").getFile(MetadbHandle.Path).Attributes;
    if (a & 1) // 1 means ReadOnly
        throw new Error("The file is read-only");
    MetadbHandle.UpdateFileInfoSimple(field, text);
}

//-- Clipboad --
function setClipboard(text) {
    new ActiveXObject("htmlfile").parentWindow.clipboardData.setData("text", text);
}

function getClipboard() {
    return new ActiveXObject("htmlfile").parentWindow.clipboardData.getData("text");
}

//-- Send to recycle bin --
function sendToRecycleBin(path) {
    var sa = new ActiveXObject("Shell.Application");
    var recycle_bin_folder = sa.Namespace(10);
    recycle_bin_folder.MoveHere(path);
}

//-- Shuffle for Array--
function shuffleArray(arr, from) { // arrの配列番号from以降をシャッフルする
    var i = arr.length;
    if (i - from < 2) return;
    while (i - from) {
        var j = Math.floor(Math.random() * (i - from)) + Number(from);
        var t = arr[--i];
        arr[i] = arr[j];
        arr[j] = t;
    }
    return arr;
};

//-- Line Feed Code --
function getLineFeedCode(str) {
    var CR_LF, CR, LF;

    CR_LF = /\r\n/.test(str);
    CR = /\r(?!\n)/.test(str);
    LF = /[^\r](?=\n)/.test(str);

    if (CR_LF)
        if (CR && LF) return /\r\n|\r|\n/;
        else if (CR) return /\r\n|\r/;
        else if (LF) return /\r\n|\n/;
        else return "\r\n";
    else
        if (CR && LF) return /\r|\n/;
        else if (CR) return "\r";
        else if (LF) return "\n";
        else return;
}

//-- Build Menu --
function buildMenu(items, parentMenu, flag, text, radio) {
    var _menu = window.CreatePopupMenu();
    var start_idx = idx;
    if (parentMenu)
        _menu.AppendTo(parentMenu, flag, text);
    if (typeof items === "function") {
        items(_menu);
        return;
    }
    for (var i = 0; i < items.length; i++) {
        if (items[i].Sub) {
            arguments.callee(items[i].Sub, _menu, items[i].Flag, items[i].Caption, items[i].Radio);
            continue;
        }
        _menu.AppendMenuItem(items[i].Flag, idx, items[i].Caption);
        item_list[idx++] = items[i];
    }

    (typeof radio == "number") && _menu.CheckMenuRadioItem(start_idx, idx - 1, start_idx + radio);
    return _menu;
}

//-- Get Charset From Codepage --
function GetCharsetFromCodepage(codepage) {
    switch (codepage) {
        case 37: return "IBM037"; // IBM EBCDIC (US - カナダ)
        case 437: return "IBM437"; // OEM アメリカ合衆国
        case 500: return "IBM500"; // IBM EBCDIC (インターナショナル)
        case 708: return "ASMO-708"; // アラビア語 (ASMO 708)
        case 720: return "DOS-720"; // アラビア語 (DOS)
        case 737: return "IBM737"; // ギリシャ語 (DOS)
        case 775: return "IBM775"; // バルト言語 (DOS)
        case 850: return "IBM850"; // 西ヨーロッパ言語 (DOS)
        case 852: return "IBM852"; // 中央ヨーロッパ言語 (DOS)
        case 855: return "IBM855"; // OEM キリル
        case 857: return "IBM857"; // トルコ語 (DOS)
        case 858: return "IBM00858"; // OEM マルチリンガル ラテン I
        case 860: return "IBM860"; // ポルトガル語  (DOS)
        case 861: return "IBM861"; // アイスランド語 (DOS)
        case 862: return "DOS-862"; // ヘブライ語 (DOS)
        case 863: return "IBM863"; // フランス語 (カナダ) (DOS)
        case 864: return "IBM864"; // アラビア語 (864)
        case 865: return "IBM865"; // 北欧 (DOS)
        case 866: return "CP866"; // キリル言語 (DOS)
        case 869: return "IBM869"; // ギリシャ語, Modern (DOS)
        case 870: return "IBM870"; // IBM EBCDIC (多国語ラテン 2)
        case 874: return "windows-874"; // タイ語 (Windows)
        case 875: return "CP875"; // IBM EBCDIC (ギリシャ語 Modern)
        case 932: return "Shift_JIS"; // 日本語 (シフト JIS)
        case 936: return "GBK"; // 簡体字中国語 (GB2312拡張)
        case 949: return "KS_C_5601-1987"; // 韓国語
        case 950: return "Big5"; // 繁体字中国語 (Big5)
        case 1026: return "IBM1026"; // IBM EBCDIC (トルコ語ラテン 5)
        case 1047: return "IBM01047"; // IBM ラテン-1
        case 1140: return "IBM01140"; // IBM EBCDIC (US - カナダ - ヨーロッパ)
        case 1141: return "IBM01141"; // IBM EBCDIC (ドイツ - ヨーロッパ)
        case 1142: return "IBM01142"; // IBM EBCDIC (デンマーク - ノルウェー - ヨーロッパ)
        case 1143: return "IBM01143"; // IBM EBCDIC (フィンランド - スウェーデン - ヨーロッパ)
        case 1144: return "IBM01144"; // IBM EBCDIC (イタリア - ヨーロッパ)
        case 1145: return "IBM01145"; // IBM EBCDIC (スペイン - ヨーロッパ)
        case 1146: return "IBM01146"; // IBM EBCDIC (UK - ヨーロッパ)
        case 1147: return "IBM01147"; // IBM EBCDIC (フランス - ヨーロッパ)
        case 1148: return "IBM01148"; // IBM EBCDIC (インターナショナル - ヨーロッパ)
        case 1149: return "IBM01149"; // IBM EBCDIC (アイスランド語 - ヨーロッパ)
        case 1200: return "UTF-16LE"; // Unicode (Little-Endian)
        case 1201: return "UTF-16BE"; // Unicode (Big-Endian)(UnicodeFFFE)
        case 1250: return "windows-1250"; // 中央ヨーロッパ言語 (Windows)
        case 1251: return "windows-1251"; // キリル言語 (Windows)
        case 1252: return "Windows-1252"; // 西ヨーロッパ言語 (Windows)
        case 1253: return "windows-1253"; // ギリシャ語 (Windows)
        case 1254: return "windows-1254"; // トルコ語 (Windows)
        case 1255: return "windows-1255"; // ヘブライ語 (Windows)
        case 1256: return "windows-1256"; // アラビア語 (Windows)
        case 1257: return "windows-1257"; // バルト言語 (Windows)
        case 1258: return "windows-1258"; // ベトナム語 (Windows)
        case 1361: return "Johab"; // 韓国語 (Johab)
        case 10000: return "macintosh"; // 西ヨーロッパ言語 (Mac)
        case 10001: return "x-mac-japanese"; // 日本語 (Mac)
        case 10002: return "x-mac-chinesetrad"; // 繁体字中国語 (Mac)
        case 10003: return "x-mac-korean"; // 韓国語 (Mac)
        case 10004: return "x-mac-arabic"; // アラビア語 (Mac)
        case 10005: return "x-mac-hebrew"; // ヘブライ語 (Mac)
        case 10006: return "x-mac-greek"; // ギリシャ語 (Mac)
        case 10007: return "x-mac-cyrillic"; // キリル言語 (Mac)
        case 10008: return "x-mac-chinesesimp"; // 簡体字中国語 (Mac)
        case 10010: return "x-mac-romanian"; // ルーマニア語 (Mac)
        case 10017: return "x-mac-ukrainian"; // ウクライナ語 (Mac)
        case 10021: return "x-mac-thai"; // タイ語 (Mac)
        case 10029: return "x-mac-ce"; // 中央ヨーロッパ言語 (Mac)
        case 10079: return "x-mac-icelandic"; // アイスランド語 (Mac)
        case 10081: return "x-mac-turkish"; // トルコ語 (Mac)
        case 10082: return "x-mac-croatian"; // クロアチア語 (Mac)
        case 12000: return "UTF-32"; // Unicode (UTF-32)
        case 12001: return "UTF-32BE"; // Unicode (UTF-32 ビッグ エンディアン)
        case 20000: return "x-Chinese-CNS"; // 繁体字中国語 (CNS)
        case 20001: return "x-cp20001"; // TCA 台湾
        case 20002: return "x-Chinese-Eten"; // 繁体字中国語 (Eten)
        case 20003: return "x-cp20003"; // IBM5550 台湾
        case 20004: return "x-cp20004"; // TeleText 台湾
        case 20005: return "x-cp20005"; // Wang 台湾 
        case 20105: return "x-IA5"; // 西ヨーロッパ言語 (IA5)
        case 20106: return "x-IA5-German"; // ドイツ語 (IA5)
        case 20107: return "x-IA5-Swedish"; // スウェーデン語 (IA5)
        case 20108: return "x-IA5-Norwegian"; // ノルウェー語 (IA5)
        case 20127: return "US-ASCII"; // US-ASCII
        case 20261: return "x-cp20261"; // T.61
        case 20269: return "x-cp20269"; // ISO-6937
        case 20273: return "IBM273"; // IBM EBCDIC (ドイツ)
        case 20277: return "IBM277"; // IBM EBCDIC (デンマーク - ノルウェー)
        case 20278: return "IBM278"; // IBM EBCDIC (フィンランド - スウェーデン)
        case 20280: return "IBM280"; // IBM EBCDIC (イタリア)
        case 20284: return "IBM284"; // IBM EBCDIC (スペイン)
        case 20285: return "IBM285"; // IBM EBCDIC (UK)
        case 20290: return "IBM290"; // IBM EBCDIC (日本語カタカナ)
        case 20297: return "IBM297"; // IBM EBCDIC (フランス)
        case 20420: return "IBM420"; // IBM EBCDIC (アラビア語)
        case 20423: return "IBM423"; // IBM EBCDIC (ギリシャ語)
        case 20424: return "IBM424"; // IBM EBCDIC (ヘブライ語)
        case 20833: return "x-EBCDIC-KoreanExtended"; // IBM EBCDIC (韓国語 Extended)
        case 20838: return "IBM-Thai"; // IBM EBCDIC (タイ語)
        case 20866: return "koi8-r"; // キリル言語 (KOI8-R)
        case 20871: return "IBM871"; // IBM EBCDIC (アイスランド語)
        case 20880: return "IBM880"; // IBM EBCDIC (キリル言語 - ロシア語)
        case 20905: return "IBM905"; // IBM EBCDIC (トルコ語)
        case 20924: return "IBM00924"; // IBM ラテン-1
        case 20932: return "EUC-JP"; // 日本語 (JIS 0208-1990 および 0212-1990)
        case 20936: return "x-cp20936"; // 簡体字中国語 (GB2312-80)
        case 20949: return "x-cp20949"; // 韓国語 Wansung
        case 21025: return "CP1025"; // IBM EBCDIC (キリル言語 セルビア - ブルガリア)
        case 21866: return "KOI8-U"; // キリル言語 (KOI8-U)
        case 28591: return "ISO-8859-1"; // 西ヨーロッパ言語 (ISO)
        case 28592: return "ISO-8859-2"; // 中央ヨーロッパ言語 (ISO)
        case 28593: return "ISO-8859-3"; // ラテン 3 (ISO)
        case 28594: return "ISO-8859-4"; // バルト言語 (ISO) 
        case 28595: return "ISO-8859-5"; // キリル言語 (ISO)
        case 28596: return "ISO-8859-6"; // アラビア語 (ISO)
        case 28597: return "ISO-8859-7"; // ギリシャ語 (ISO)
        case 28598: return "ISO-8859-8"; // ヘブライ語 (ISO-Visual)
        case 28599: return "ISO-8859-9"; // トルコ語 (ISO)
        case 28603: return "ISO-8859-13"; // エストニア語 (ISO)
        case 28605: return "ISO-8859-15"; // ラテン 9 (ISO)
        case 29001: return "x-Europa"; // ヨーロッパ
        case 38598: return "ISO-8859-8-i"; // ヘブライ語 (ISO-Logical)
        case 50220: return "ISO-2022-jp"; // 日本語 (JIS)
        case 50221: return "csISO2022JP"; // 日本語 (JIS 1 バイト カタカナ可)
        case 50222: return "ISO-2022-jp"; // 日本語 (JIS 1 バイト カタカナ可 - SO/SI)
        case 50225: return "ISO-2022-kr"; // 韓国語 (ISO)
        case 50227: return "x-cp50227"; // 簡体字中国語 (ISO-2022)
        case 51932: return "EUC-JP"; // 日本語 (EUC)
        case 51936: return "EUC-CN"; // 簡体字中国語 (EUC)
        case 51949: return "EUC-KR"; // 韓国語 (EUC)
        case 52936: return "HZ-GB-2312"; // 簡体字中国語 (HZ)
        case 54936: return "GB18030"; // 簡体字中国語 (GB18030)
        case 57002: return "x-iscii-de"; // ISCII デバナガリ文字
        case 57003: return "x-iscii-be"; // ISCII ベンガル語
        case 57004: return "x-iscii-ta"; // ISCII タミール語
        case 57005: return "x-iscii-te"; // ISCII テルグ語
        case 57006: return "x-iscii-as"; // ISCII アッサム語
        case 57007: return "x-iscii-or"; // ISCII オリヤー語
        case 57008: return "x-iscii-ka"; // ISCII カナラ語
        case 57009: return "x-iscii-ma"; // ISCII マラヤラム語
        case 57010: return "x-iscii-gu"; // ISCII グジャラート語
        case 57011: return "x-iscii-pa"; // ISCII パンジャブ語
        case 65000: return "UTF-7"; // Unicode (UTF-7)
        case 65001: return "UTF-8"; // Unicode (UTF-8)
        default: return "_autodetect_all";
    }
}

//EOF