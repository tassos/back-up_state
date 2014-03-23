const Version = "0.1";
const Applet = imports.ui.applet;
const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Cinnamon = imports.gi.Cinnamon;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;
const Gettext = imports.gettext.domain("cinnamon-applets");
const _ = Gettext.gettext;

const UUID = "back-up_state@natsakis.com";
const logFile = GLib.build_filenamev(['/home/nakano/scripts/sync_with_venus.log']);
const refresh_interval = 10 // In seconds

function logError(error) {
    global.logError(UUID + '#' + logError.caller.name + ': ' + error);
}


// Applet
// ----------
function MyApplet(orientation) {
    this._init(orientation);
}

MyApplet.prototype = {
    __proto__: Applet.TextIconApplet.prototype,

    _init: function (orientation) {
        Applet.IconApplet.prototype._init.call(this, orientation);
        
        try{
          this._status = this._findDate();
          this.set_applet_tooltip(this._findDate());
        }
        catch(e){
          logError(e);
        }
        this.refreshState();
    },

    refreshState: function refreshLocation() {
          shortDate = new Date(this._findDate());
          longDate = new Date(this._findDate());
          shortDate.setDate(shortDate.getDate() + 5);
          longDate.setDate(longDate.getDate() + 10);
          if (longDate < new Date()) {
            this.set_applet_icon_name("dialog-error-symbolic");
          }
          else if (shortDate < new Date()) {
            this.set_applet_icon_name("dialog-warning-symbolic");
          }
          else {
            this.set_applet_icon_name("object-select-symbolic");
          }
          this.set_applet_tooltip("Last successful back-up completed on " + this._findDate());

            Mainloop.timeout_add_seconds(REFRESH_INTERVAL, Lang.bind(this, function refreshTimeout() {
                this.refreshState();
            }));
    },
    
    _searchStringInArray: function (str, strArray) {
      for (var j=0; j<strArray.length; j++) {
          if (strArray[j].match(str)) k = j;
      }
      return k;
    },
    
    _findDate: function () {
        let logs = Cinnamon.get_file_contents_utf8_sync(logFile);
        let lines = logs.split('\n');
        index = this._searchStringInArray('total size is',lines);

        return String(lines[index]).substring(0,19);
    }
};

function main(metadata, orientation) {
    let myapplet = new MyApplet(orientation);
    return myapplet;
}