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

		for (var j=0;j<notes.length;j++) {
			var note = this.Zotero.Items.get(notes[j]);
			var note_html = note.getNote();
			//alert(note_html);
			f["notesHTML"].push(note_html);
		} 
		return f;
	},
	
	sendCommunication: function(){
		var data = this.d
		var newTabBrowser = gBrowser.getBrowserForTab(gBrowser.addTab("http://davidlamb.github.io/ZoterNote.html"));
		var ld = function(){
			newTabBrowser.removeEventListener("load",ld,false);
			document.addEventListener("ZoterNote-query",listen_request,false,true);
		}
		var listen_request = function(event){
			//alert("listen request");
			document.removeEventListener("ZoterNote-query",listen_request,false);
			var node = event.target;
			if (!node || node.nodeType != Node.TEXT_NODE){
				return;
			}
			var doc = node.ownerDocument;
			
			//alert("inside zoternotequery" + data.name)
			callback(JSON.parse(node.nodeValue), doc, function(response) {
				node.nodeValue = JSON.stringify(response);

				var event = doc.createEvent("HTMLEvents");
				event.initEvent("ZoterNote-response", true, false);
				//newTabBrowser.removeEventListener("load", handleCommunication.listen_request, true);
				return node.dispatchEvent(event);
			});
			
		}
		var callback = function(request, sender, cb){
			if (request.ready) {
				
				return setTimeout(function() {
					//alert("callback " + data.name)
					cb(data);
				}, 1000);
			}
	
			return callback(null);
		}
		newTabBrowser.addEventListener("load", ld(this.d), true);

		
	}

};