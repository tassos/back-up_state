const Version = "0.1";
const Applet = imports.ui.applet;
const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Cinnamon = imports.gi.Cinnamon;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;
const Settings = imports.ui.settings;
const Gettext = imports.gettext.domain("cinnamon-applets");
const _ = Gettext.gettext;

const UUID = "back-up_state@natsakis.com";
const refresh_interval = 10; // In seconds

function logError(error) {
    global.logError(UUID + '#' + logError.caller.name + ': ' + error);
}

function main(metadata, orientation, instance_id) {
    let myapplet = new MyApplet(metadata, orientation, instance_id);
    return myapplet;
}

// Applet
// ----------
function MyApplet(metadata, orientation, instance_id) {
    this._init(metadata, orientation, instance_id);
}

MyApplet.prototype = {
    __proto__: Applet.TextIconApplet.prototype,

    _init: function (metadata, orientation, instance_id) {
        Applet.IconApplet.prototype._init.call(this, orientation);
      
      this._opt_warningDays = null;
      this._opt_errorDays = null;
      this._opt_logFile = null;
        
    	this.metadata = metadata;
    	this._settingsProvider = new Settings.AppletSettings(this, metadata.uuid, instance_id);
    	this._bindSettings();
    	
    	
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
          shortDate.setDate(shortDate.getDate() + this._opt_warningDays);
          longDate.setDate(longDate.getDate() + this._opt_errorDays);
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

            Mainloop.timeout_add_seconds(refresh_interval, Lang.bind(this, function refreshTimeout() {
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
        let logs = Cinnamon.get_file_contents_utf8_sync(this._opt_logFile);
        let lines = logs.split('\n');
        index = this._searchStringInArray(this._opt_idString,lines);

        return String(lines[index]).substring(0,19);
    },
    
    _bindSettings: function() {
        let emptyCallback = function() {}; // for cinnamon 1.8

        this._settingsProvider.bindProperty(
            Settings.BindingDirection.IN,
            "warning_days",
            "_opt_warningDays",
            emptyCallback
        );

        this._settingsProvider.bindProperty(
            Settings.BindingDirection.IN,
            "error_days",
            "_opt_errorDays",
            emptyCallback
        );

        this._settingsProvider.bindProperty(
            Settings.BindingDirection.IN,
            "log_file",
            "_opt_logFile",
            emptyCallback
        );
        
        this._settingsProvider.bindProperty(
            Settings.BindingDirection.IN,
            "id_string",
            "_opt_idString",
            emptyCallback
        );
    }
};
