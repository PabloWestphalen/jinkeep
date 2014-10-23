var Strings = {
	'en-us': {
		DEFAULT_TITLE: "Title",
		ADD_NOTE: "Add a note",
		SEARCH_PLACEHOLDER: "Search Jin's Keep"
	}
};

var Lang = Strings['en-us'];

var Keys = {
	ENTER: 10
}

var notes;



function Note(title, content, id) {
	Note.numInstances = (Note.numInstances || 0) + 1;
	this.id = id ? id : Note.numInstances
	this.title = title;
	this.content = content;
}

Note.prototype.render = function(index) {
		var elem = $('<article class="note" data-index="' + index + '"><h1 class="note-title">' + this.title + '</h1><p class="note-content">' + this.content + '</p></article>');
		$(".add-note").after(elem);
}

Note.prototype.toJSON = function() { 
	return {
		id: this.id,
		title: this.title,
		content: this.content
	};
}

function createNote() {
	var elem = $(".add-note");
	var title = elem.find(".note-title");
	var content = elem.find(".note-content");

	elem.removeClass("active");
	title.hide();

	if(title.text() != Lang.DEFAULT_TITLE || content.text() != Lang.ADD_NOTE) {
		var id = notes ? notes.length+1 : 1;
		var note = new Note(title.text(), content.text(), id);
		notes.push(note);
		note.render(notes.length-1);
		
		title.text(Lang.DEFAULT_TITLE);
		content.text(Lang.ADD_NOTE);
		saveNotes();
	}
}


function activateNote(note) {
	var title = note.find(".note-title");
	note.addClass("active");
	title.show();
	if(isEmpty(title.text())) {
		title.text(Lang.DEFAULT_TITLE);
	}
}

function saveCurrentNote() {
	var noteElement = $(".note.active");
	if(noteElement) {
		console.log("will save this element: ", noteElement[0]);
		var noteIndex = noteElement.attr("data-index");

		var note = notes[noteIndex];
		note.title = noteElement.find(".note-title").text();
		note.content = noteElement.find(".note-content").text();

		saveNotes();

		deactivateCurrentNote(noteElement);
	}
}

function deactivateCurrentNote(note) {
	note.removeClass("active");
	var title = note.find(".note-title");
	if(isEmpty(title.text()) || title.text() == Lang.DEFAULT_TITLE) {
		title.hide();
	}

	$(":focus").blur();
}

function isEmpty(string) {
	return string.replace(/\s|&nbsp;/g, '').length == 0;
}

function addTabIndex() {
	tabIndex = 3;
	$(".note .note-content, .note .note-title").each(function() {
		var el = $(this);
		el.attr("tabindex", tabIndex++);
	});
}


function loadNotes() {
	var rawObjects = JSON.parse(localStorage.getItem("notes"));
	if(rawObjects && rawObjects.length) {
		rawObjects.forEach(function(obj, index) {
			obj.__proto__ = Note.prototype;
			obj.render(index);
		});
		return rawObjects;	
	} else {
		console.warn("Couldn't load any note because local storage is empty.");
		return [];
	}
}

function saveNotes() {
	localStorage.setItem("notes", JSON.stringify(notes))
}


$(document).ready(function() {
	notes = loadNotes();
	addTabIndex();

	$(".note").each(function() {
		var note = $(this);
		var title = note.find(".note-title");
		if(isEmpty(title.text()) || title.text() == Lang.DEFAULT_TITLE	) {
			title.hide();
		}
	});

	$(".main-section").on("click", ".note .note-content, .note .note-title", function(evt) {
		var note = $(this).parent();
		activateNote(note);
		//console.log('2 - Setting content editable to true', evt);
		var noteSection = $(this);
		noteSection.prop("contentEditable", true);
	});

	$(".main-section").on("click", ".note .note-title", function(evt) {
		//console.log("3 - Clearing TITLE's text");
		var title = $(this);
		if(title.text() == Lang.DEFAULT_TITLE) {
			title.text("");
		}
	});

	$(".main-section").on("click", ".note .note-content", function(evt) {
		//console.log('4 - Clearing CONTENT text', evt);
		var content = $(this);
		if(content.text() == Lang.ADD_NOTE) {
			content.text("");
			content.focus();
		}
	});

	$(".main-section").on("click", function(evt) {
		if(evt.target == this) {
			//console.log('5', evt);
			var currentNote = $(".note.active");
			if(currentNote.length) {
				//console.log('5.a');
				if(currentNote.hasClass("add-note")) {
					console.log('5 - Creating a new note');
					createNote();
				} else {
					console.log('5 - Saving current note');
					saveCurrentNote();	
				}

				if(currentNote.find(".note-title").text() == Lang.DEFAULT_TITLE) {
					currentNote.find(".note-title").hide();
				}
			}
		} 
	});

	$(".main-section").on("keypress", ".note .note-content, .note .note-title", function(evt) {
		var currentNote = $(".note.active");
		console.log('6');
		if(evt.which == Keys.ENTER && evt.ctrlKey) {
			console.log('2');
			if(currentNote.hasClass("add-note")) {
				createNote();
			} else {
				saveCurrentNote();	
			}
		}
	});
});