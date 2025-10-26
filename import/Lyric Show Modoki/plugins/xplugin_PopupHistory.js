pl = {
    name: 'xplugin_PopupHistory',
    label: 'Popup History Modoki',
    author: 'tomato111',
    onStartUp: function () { // 最初に一度だけ呼び出される
        this.menuitem.Flag = MF_DISABLED;
        var _this = this;

        this.prop = {
            x: 0,
            y: 0,
            width: 10,
            height: 10,
            Menu: {
                ItemName: window.GetProperty('Plugin.PopupHistory.ItemName', '%title%'),
                MaxSize: window.GetProperty('Plugin.PopupHistory.MaxSize', 25)
            },
            Color: {
                Ellipse_normal: setAlpha(prop.Style.Color.Text, 40),
                Ellipse_hover: setAlpha(prop.Style.Color.PlayingText, 96)
            }
        };


        //============================================
        //== Popup History Modoki Object =============
        //============================================
        this.PHM = new function () {
            var history_items, history_index_data, restoreHistory, buildHistoryMenu, _menu;

            this.onPaint = function (gr) {
                gr.FillEllipse(_this.prop.x, _this.prop.y, _this.prop.width, _this.prop.height, this.hover ? _this.prop.Color.Ellipse_hover : _this.prop.Color.Ellipse_normal);
            };

            this.repaint = function () {
                window.RepaintRect(_this.prop.x - 1, _this.prop.y - 1, _this.prop.width + 2, _this.prop.height + 2);
            };

            this.init = function () {
                history_items = [];
                history_index_data = [];
                restoreHistory();
                buildHistoryMenu(fb.IsPlaying && fb.GetNowPlaying());
            };

            this.add = function (metadb) {

                for (var i = 0; i < history_items.length; i++) {
                    if (metadb.Compare(history_items[i].metadb)) {
                        buildHistoryMenu(metadb);
                        return;
                    }
                }

                history_items.unshift(new Info(metadb, plman.PlayingPlaylist));
                history_index_data.unshift(
                    [
                        history_items[0].playlistIndex,
                        Math.floor(history_items[0].metadb.Length * 1000)
                    ]
                );

                history_items.length = Math.min(history_items.length, _this.prop.Menu.MaxSize);
                history_index_data.length = history_items.length;

                window.SetProperty('Plugin.PopupHistory.SystemData', history_index_data.join('^'));
                buildHistoryMenu(metadb);
            };

            this.clear = function (x, y) {
                var ret =
                    buildMenu([
                        { Flag: MF_GRAYED, Caption: 'Clear list?' },
                        { Flag: MF_SEPARATOR },
                        { Flag: MF_STRING, Caption: 'OK' },
                        { Flag: MF_STRING, Caption: 'Cancel' }
                    ]).TrackPopupMenu(x, y);
                if (ret === 3) {
                    history_items = [];
                    history_index_data = [];
                    window.SetProperty('Plugin.PopupHistory.SystemData', '');
                    buildHistoryMenu();
                }
            };

            this.popup = function (x, y) {
                Menu.isShown = true;
                var ret = _menu.TrackPopupMenu(x, y);
                if (ret === history_items.length + 2)
                    this.clear(x, y);
                else if (ret !== 0)
                    history_items[ret - 1].doCommand();
                (function () { Menu.isShown = false; }).timeout(10);
            };


            restoreHistory = function () {
                var str = window.GetProperty('Plugin.PopupHistory.SystemData');
                if (!str) {
                    return;
                }

                var playlistIndex, playbackLength, HandleList;

                history_index_data = str.split('^');
                for (var i = 0; i < history_index_data.length;) {
                    history_index_data[i] = eval('[' + history_index_data[i] + ']');

                    playlistIndex = history_index_data[i][0];
                    playbackLength = history_index_data[i][1];

                    HandleList = plman.GetPlaylistItems(playlistIndex);
                    for (var j = 0; j < HandleList.Count; j++) {
                        if (Math.floor(HandleList.Item(j).Length * 1000) === playbackLength)
                            break;
                    }

                    if (j !== HandleList.Count) {
                        history_items.push(new Info(HandleList.Item(j), playlistIndex));
                        i++;
                    }
                    else
                        history_index_data.splice(i, 1);
                }

                history_items.length = Math.min(history_items.length, _this.prop.Menu.MaxSize);
                history_index_data.length = history_items.length;

                window.SetProperty('Plugin.PopupHistory.SystemData', history_index_data.join('^'));
            };

            buildHistoryMenu = function (metadb) {

                var menu_items = [];
                if (history_items.length) {
                    for (var i = 0; i < history_items.length; i++) {
                        menu_items.push(
                            {
                                Flag: metadb ? (metadb.Compare(history_items[i].metadb) ? MF_CHECKED : MF_STRING) : MF_STRING,
                                Caption: history_items[i].name
                            }
                        );
                    }
                    menu_items.push(
                        {
                            Flag: MF_SEPARATOR
                        },
                        {
                            Flag: MF_STRING,
                            Caption: '(Clear)'
                        }
                    );
                }
                else {
                    menu_items.push(
                        {
                            Flag: MF_GRAYED,
                            Caption: '(Empty)'
                        }
                    );
                }

                _menu = buildMenu(menu_items);
            };

            function buildMenu(items) {
                var idx = 1;
                var _menu = window.CreatePopupMenu();
                for (var i = 0; i < items.length; i++) {
                    _menu.AppendMenuItem(items[i].Flag, idx++, items[i].Caption);
                }
                return _menu;
            }

            // Constructor
            function Info(metadb, playlistIndex) {
                this.metadb = metadb;
                this.name = fb.TitleFormat(_this.prop.Menu.ItemName).EvalWithMetadb(metadb);
                this.playlistIndex = playlistIndex;
            }
            Info.prototype.doCommand = function () {
                var metadb = this.metadb;
                var playlistIndex = this.playlistIndex;

                plman.SetPlaylistFocusItemByHandle(playlistIndex, metadb);

                var itemIndex = plman.GetPlaylistFocusItemIndex(playlistIndex);
                if (itemIndex !== -1) {
                    plman.ActivePlaylist = playlistIndex;
                    plman.ClearPlaylistSelection(playlistIndex);
                    plman.SetPlaylistSelectionSingle(playlistIndex, itemIndex, true);
                    plman.ExecutePlaylistDefaultAction(playlistIndex, itemIndex);
                }
                else
                    fb.ShowPopupMessage('The item is not found in playlist.', 'Popup History Modoki', 0);
            };
            // End Constructor

            this.init();
        };

    },
    onPlay: function (metadb) { // 新たに曲が再生される度に呼び出される
        this.PHM.add(metadb);
    },
    onClick: function (x, y, mask) { // パネルクリック時に呼び出される // trueを返すと本体のクリックイベントをキャンセル
        if (this.PHM.hover) {
            this.PHM.popup(x + 1, y);
            this.PHM.hover = false;
            this.PHM.repaint();
            return true;
        }
    },
    onMove: function (x, y) { // パネルにマウスポインタを置くと呼び出され続ける
        if (!Edit.isStarted) {
            var p = this.prop;
            if (!this.PHM.hover && x >= p.x && y >= p.y && x <= p.x + p.width && y <= p.y + p.height) {
                this.PHM.hover = true;
                this.PHM.repaint();
            }
            if (this.PHM.hover && (x < p.x || y < p.y || x > p.x + p.width || y > p.y + p.height)) {
                this.PHM.hover = false;
                this.PHM.repaint();
            }
        }
    },
    onLeave: function () { // パネルからマウスポインタが離れた時に呼び出される
        if (!Menu.isShown) {
            this.PHM.hover = false;
            this.PHM.repaint();
        }
    },
    onPaint: function (gr) { // 描画イベントが発生した時に呼び出される
        if (!Edit.isStarted)
            this.PHM.onPaint(gr);
    }
};
