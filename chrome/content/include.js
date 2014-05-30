// Only create main object once
if (!Zotero.ZoterNote) {
	var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
					.getService(Components.interfaces.mozIJSSubScriptLoader);
	loader.loadSubScript("chrome://ZoterNote/content/zoternote.js");
}
window.addEventListener('load', function(e) {
	Zotero.ZoterNote.init();
}, false);