//created by Tomato
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

    for (var i = 0; i < arguments.length; i += 2) {
        var re = new RegExp(arguments[i], flag);
        str = str.replace(re, arguments[i + 1]);
    }
    return str;
};

//-- Trim --
String.prototype.trim = function (s) {
    return this.replace(/^\s*|\s*$/g, "");
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
    return this
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
    var id = window.setTimeout(function () {
        __method.apply(this, arguments);
        __callback.apply(this, arguments);
        window.clearTimeout(id);
    }, time);
};

Function.prototype.clearInterval = function () {
    window.clearInterval(this.$$timerid$$);
};

//============================================
//== Constructor ================================
//============================================

//-- Message --
function Message(text, title, type) {
    this.text = text;
    this.title = title;
    this.type = type;
}
Message.prototype.popup = function (s) {
    return new ActiveXObject("WScript.Shell").popup(this.text + (s ? s : ""), 0, this.title, this.type);
};
Message.prototype.trace = function (s) {
    fb.trace(this.text + (s ? s : ""));
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
        }).interval(100);
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
function writeTextFile(text, file, charset) {
    var bin, buf;
    var UTF8N = /^UTF-8N$/i.test(charset);
    var stm = new ActiveXObject('ADODB.Stream');
    stm.type = 2;
    stm.charset = UTF8N ? "UTF-8" : charset;
    stm.open();
    stm.writeText(text); // この地点でBOMが付加され、textにBOM(BOMの削除漏れ)があると重複する
    try {
        stm.Position = 0;
        stm.type = 1;

        if (/^UTF-8|Unicode$/i.test(charset)) { // BOMが重複しているなら既存のBOMをスキップ
            bin = new Binary(stm.read(6)); // stm.Position -> 6
            bin.getArray();
            if (bin[3] == 0xEF && bin[4] == 0xBB && bin[5] == 0xBF) { // UTF-8
                buf = stm.Read(-1);
                stm.Position = 3;
                stm.SetEOS();
                stm.write(buf);
            }
            else if (bin[2] == 0xFF && bin[3] == 0xFE || bin[2] == 0xFE && bin[3] == 0xFF) { // UTF-16LE & UTF-16BE
                stm.Position = 4;
                buf = stm.Read(-1);
                stm.Position = 2;
                stm.SetEOS();
                stm.write(buf);
            }
        }
        else { // 設定した文字コードには不要であるBOMが付いているなら削除
            bin = new Binary(stm.read(3)); // stm.Position -> 3
            bin.getArray();
            if (bin[0] == 0xEF && bin[1] == 0xBB && bin[2] == 0xBF) { // UTF-8
                buf = stm.Read(-1);
                stm.Position = 0;
                stm.SetEOS();
                stm.write(buf);
            }
            else if (bin[0] == 0xFF && bin[1] == 0xFE || bin[0] == 0xFE && bin[1] == 0xFF) { // UTF-16LE & UTF-16BE
                stm.Position = 2;
                buf = stm.Read(-1);
                stm.Position = 0;
                stm.SetEOS();
                stm.write(buf);
            }
        }

        if (UTF8N) { // UTF-8Nの保存に対応
            stm.Position = 0;
            bin = new Binary(stm.read(3)); // stm.Position -> 3
            bin.getArray();
            if (bin[0] == 0xEF && bin[1] == 0xBB && bin[2] == 0xBF) {
                buf = stm.Read(-1);
                stm.Position = 0;
                stm.SetEOS();
                stm.write(buf);
            }
        }

        stm.Position = 0;
        stm.saveToFile(file, 2);
    } catch (e) {
        throw new Error("Couldn't save text to a file.");
    } finally {
        stm.close();
        stm = null;
    }

    return file;
}

function readTextFile(file) {
    var bin, buf, charset, str;
    var stm = new ActiveXObject('ADODB.Stream');
    stm.type = 1;
    stm.open();
    try {
        stm.loadFromFile(file); // stm.position -> 0

        charset = GetCharacterEncoding(stm.read(-1));
        arguments.callee.lastCharset = charset;

        stm.position = 0;
        stm.type = 2;
        stm.charset = charset;
        str = stm.readText(-1); //_autodetect_allでの一行ごとの取得はまともに動かない
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

function getHTML(data, method, file, async, depth, onLoaded) {
    var request = new ActiveXObject("Msxml2.XMLHTTP");
    getHTML.PRESENT = { file: file, depth: depth };

    request.open(method, file, async);

    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            onLoaded(request, depth);
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
    new ActiveXObject("htmlfile").parentWindow.clipboardData.getData("text");
}

//-- Send to recycle bin --
function sendToRecycleBin(path) {
    var sa = new ActiveXObject("Shell.Application");
    var recycle_bin_folder = sa.Namespace(10);
    recycle_bin_folder.MoveHere(path);
}

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

//-- Get Character Encoding -- reference http://dobon.net/vb/dotnet/string/detectcode.html
function GetCharacterEncoding(stream) {
    var reader = new Binary(stream);
    var len = reader.size;

    var bEscape = 0x1B;
    var bAt = 0x40;
    var bDollar = 0x24;
    var bAnd = 0x26;
    var bOpen = 0x28; //'('
    var bB = 0x42;
    var bD = 0x44;
    var bJ = 0x4A;
    var bI = 0x49;

    var b1, b2, b3, b4;
    reader.getArray();

    //Encode::is_utf8 は無視

    var isBinary = false;
    for (var i = 0; i < len; i++) {
        b1 = reader[i];
        if (b1 <= 0x06 || b1 == 0x7F || b1 == 0xFF) {
            //'binary'
            isBinary = true;
            if (b1 == 0x00 && i < len - 1 && reader[i + 1] <= 0x7F) {
                //smells like raw unicode
                return "Unicode";
            }
        }
    }
    if (isBinary) {
        return null;
    }

    //not Japanese
    var notJapanese = true;
    for (i = 0; i < len; i++) {
        b1 = reader[i];
        if (b1 == bEscape || 0x80 <= b1) {
            notJapanese = false;
            break;
        }
    }
    if (notJapanese) {
        return "_autodetect_all"; // ASCII?
    }

    for (i = 0; i < len - 2; i++) {
        b1 = reader[i];
        b2 = reader[i + 1];
        b3 = reader[i + 2];

        if (b1 == bEscape) {
            if (b2 == bDollar && b3 == bAt) {
                //JIS_0208 1978
                //JIS
                return "ISO-2022-JP";
            }
            else if (b2 == bDollar && b3 == bB) {
                //JIS_0208 1983
                //JIS
                return "ISO-2022-JP";
            }
            else if (b2 == bOpen && (b3 == bB || b3 == bJ)) {
                //JIS_ASC
                //JIS
                return "ISO-2022-JP";
            }
            else if (b2 == bOpen && b3 == bI) {
                //JIS_KANA
                //JIS
                return "ISO-2022-JP";
            }
            if (i < len - 3) {
                b4 = reader[i + 3];
                if (b2 == bDollar && b3 == bOpen && b4 == bD) {
                    //JIS_0212
                    //JIS
                    return "ISO-2022-JP";
                }
                if (i < len - 5 &&
                    b2 == bAnd && b3 == bAt && b4 == bEscape &&
                    reader[i + 4] == bDollar && reader[i + 5] == bB) {
                    //JIS_0208 1990
                    //JIS
                    return "ISO-2022-JP";
                }
            }
        }
    }

    //should be euc|sjis|utf8
    //use of (?:) by Hiroki Ohzaki <ohzaki@iod.ricoh.co.jp>
    var sjis = 0;
    var euc = 0;
    var utf8 = 0;
    for (i = 0; i < len - 1; i++) {
        b1 = reader[i];
        b2 = reader[i + 1];
        if (((0x81 <= b1 && b1 <= 0x9F) || (0xE0 <= b1 && b1 <= 0xFC)) &&
            ((0x40 <= b2 && b2 <= 0x7E) || (0x80 <= b2 && b2 <= 0xFC))) {
            //SJIS_C
            sjis += 2;
            i++;
        }
    }
    for (i = 0; i < len - 1; i++) {
        b1 = reader[i];
        b2 = reader[i + 1];
        if (((0xA1 <= b1 && b1 <= 0xFE) && (0xA1 <= b2 && b2 <= 0xFE)) ||
            (b1 == 0x8E && (0xA1 <= b2 && b2 <= 0xDF))) {
            //EUC_C
            //EUC_KANA
            euc += 2;
            i++;
        }
        else if (i < len - 2) {
            b3 = reader[i + 2];
            if (b1 == 0x8F && (0xA1 <= b2 && b2 <= 0xFE) &&
                (0xA1 <= b3 && b3 <= 0xFE)) {
                //EUC_0212
                euc += 3;
                i += 2;
            }
        }
    }
    for (i = 0; i < len - 1; i++) {
        b1 = reader[i];
        b2 = reader[i + 1];
        if ((0xC0 <= b1 && b1 <= 0xDF) && (0x80 <= b2 && b2 <= 0xBF)) {
            //UTF8
            utf8 += 2;
            i++;
        }
        else if (i < len - 2) {
            b3 = reader[i + 2];
            if ((0xE0 <= b1 && b1 <= 0xEF) && (0x80 <= b2 && b2 <= 0xBF) &&
                (0x80 <= b3 && b3 <= 0xBF)) {
                //UTF8
                utf8 += 3;
                i += 2;
            }
        }
    }
    //M. Takahashi's suggestion
    //utf8 += utf8 / 2;

    //    fb.trace("sjis = " + sjis + ", euc = " + euc + ", utf8 = " + utf8);
    if (euc > sjis && euc > utf8) {
        // EUC-JP // 51932
        return "EUC-JP";
    }
    else if (sjis > euc && sjis > utf8) {
        // Shift_JIS
        return "Shift_JIS";
    }
    else if (utf8 > euc && utf8 > sjis) {
        // UTF-8
        return "UTF-8";
    }

    return "_autodetect_all"; // null

}
//EOF