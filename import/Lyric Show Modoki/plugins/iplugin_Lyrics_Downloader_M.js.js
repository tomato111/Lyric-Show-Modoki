iplugin_Lyrics_Downloader_M = {
    name: "iplugin_Lyrics_Downloader_M",
    commandName: 'Instructions_Lyrics_Downloader_M',
    label: prop.Panel.Lang == 'ja' ? '検索指示: Lyrics Downloader (Miku Hatsune wiki)' : 'Instructions: Lyrics Downloader (Miku Hatsune wiki)',
    author: 'Tomato',
    onCommand: function () {
        window.NotifyOthers("Lyrics Downloader (Miku Hatsune wiki)", "");
    }
};
