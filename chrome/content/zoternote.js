Zotero.ZoterNote = {
	wm: null,
	Zotero: null,
	d: {},
	messages_warning:[],
    messages_report:[],
    messages_error:[],
    messages_fatalError:[],
	
	init: function(){
		this.Zotero = Components.classes["@zotero.org/Zotero;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
		this.wm =  Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);

	},
	
	exportSelectedCollections : function(){
		this.d = {};
		var ZoteroPane = this.wm.getMostRecentWindow("navigator:browser").ZoteroPane;
		var s_collect = ZoteroPane.getSelectedCollection();

		
		//var item = selected_items[0];
		var currentCollection = s_collect.name;
		this.d = {"name":currentCollection, "items":[]};
		
		var selected_items = s_collect.getChildItems();
		
		for (var i = 0; i < selected_items.length; i++){
			var item = selected_items[i];

			if (item.isRegularItem()){
				// var collection = this.Zotero.Collections.get(item.id);
				// currentCollection = collection.name;
				// alert(currentCollection);
				// this.d["collections"][currentCollection] = [];
				// var c_items = collection.getChildItems();
				// for (var x=0;x<c_items.length;x++) {
					// var c_item = c_items[x];
				this.d["items"].push(this.buildItem(item));
				//}
			}			
		}
		this.sendCommunication();		
	},
	
	exportSelectedItems: function(){
		
		var ZoteroPane = this.wm.getMostRecentWindow("navigator:browser").ZoteroPane;
		var selected_items = ZoteroPane.getSelectedItems();

		var currentCollection = "Zotero";
		this.d = {};
		this.d = {"name":currentCollection, "items":[]};
		for (var i = 0; i < selected_items.length; i++){
			var item = selected_items[i];
			// alert(item.isCollection());
			// if (item.isCollection()){
				
				// var collection = this.Zotero.Collections.get(item.id);
				// currentCollection = collection.name;
				// alert(currentCollection);
				// this.d["collections"][currentCollection] = [];
				// var c_items = collection.getChildItems();
				// for (var x=0;x<c_items.length;x++) {
					// var c_item = c_items[x];
					// this.d["collections"][currentCollection].push(this.buildItem(c_item));
				// }
			// }
			
			if (item.isRegularItem()){
				this.d["items"].push(this.buildItem(item));
	
				
			}
		}
		
		this.sendCommunication();

	},

	buildItem: function(item){
		var qc = this.Zotero.QuickCopy;
		var cite = qc.getContentFromItems(new Array(item), this.Zotero.Prefs.get("export.quickCopy.setting"));
		var biblio_html_format = cite.html;

		var f = {"id":item.id,"title":item.getField('title'),"abstract": item.getField('abstractNote'),"notesHTML":[],"citation":biblio_html_format};
		var notes = item.getNotes(); 

		for (var j=0;j<notes.length.length;j++) {
			var note = this.Zotero.Items.get(notes[j]);
			var note_html = note.getNote();
			f["notesHTML"].push(note_html);
		} 
		return f;
	},
	
	sendCommunication: function(){
		alert(this.d["name"]);
		if (handleCommunication){
			handleCommunication = null;
		}
		var handleCommunication = {
			listen_request: function(callback,data) { // analogue of chrome.extension.onRequest.addListener
				document.addEventListener("ZoterNote-query", function(event) {
					var node = event.target;
					if (!node || node.nodeType != Node.TEXT_NODE){
						return;
					}
					var doc = node.ownerDocument;
					callback(data,JSON.parse(node.nodeValue), doc, function(response) {
						node.nodeValue = JSON.stringify(response);

						var event = doc.createEvent("HTMLEvents");
						event.initEvent("ZoterNote-response", true, false);
						newTabBrowser.removeEventListener("load", handleCommunication.listen_request, true);
						return node.dispatchEvent(event);
					});
				}, false, true);
			},
			callback: function(data, request, sender, callback) {
				if (request.ready) {
					return setTimeout(function() {
						alert(data.name)
						callback(data);
					}, 1000);
				}

				return callback(null);
			}
		}
		var browser = this.wm.getMostRecentWindow("navigator:browser").gBrowser;
		//var newTabBrowser = browser.getBrowserForTab(browser.addTab("http:\\davidlamb.github.io\ZoterNote.html");
		var newTabBrowser = gBrowser.getBrowserForTab(gBrowser.addTab("chrome://ZoterNote/content/ZoterNote.html"));
		newTabBrowser.addEventListener("load", handleCommunication.listen_request(handleCommunication.callback,this.d), false);
		
	}

 

	
		
};