﻿/*

Export_Book.jsx
An InDesign CS3/4 JavaScript
Bruno Herfst 2010

Exports all stories in an InDesign document or book
It will only run the book script if no InDesign documents are open
Based on ExportAllText.jsx from Olav Kvern

*/

#target indesign;


// static global variables
var book, myExportFormat, myExportSize, myIgnoreMasterSpread, myAddSeparator, myTextToBlack, myFilePath, myActiveFileName,
myActiveStory, myReadFrame, myActiveDoc, myTempStory, myTempFolder, myTempFile, myTempDocument, myTempTextFrame, myRemoveDropCap, myLeftAlign;

var myTextFrames = new Array;

function myGetBounds(myActiveDocument, myPage){
	var myPageWidth = myActiveDocument.documentPreferences.pageWidth;
	var myPageHeight = myActiveDocument.documentPreferences.pageHeight;
	if(myPage.side == PageSideOptions.leftHand){
		var myX2 = myPage.marginPreferences.left;
		var myX1 = myPage.marginPreferences.right;
	} else {
		var myX1 = myPage.marginPreferences.left;
		var myX2 = myPage.marginPreferences.right;
	}
	var myY1 = myPage.marginPreferences.top;
	var myX2 = myPageWidth - myX2;
	var myY2 = myPageHeight - myPage.marginPreferences.bottom;
	return [myY1, myX1, myY2, myX2];
}

function createTempFile(){
	myTempFolder = Folder.temp;
	myTempFile = File(myTempFolder + "/tempTextFile.txt");
	myTempDocument = app.documents.add();
	if (myExportSize == "Original"){
		//Save current mesurement units, and change them to millimeters
		var myOldXUnits = myActiveDoc.viewPreferences.horizontalMeasurementUnits;
		var myOldYUnits = myActiveDoc.viewPreferences.verticalMeasurementUnits;
		myActiveDoc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.millimeters;
		myActiveDoc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.millimeters;
		//Set original mesurement units
		var myOw = myActiveDoc.documentPreferences.pageWidth;
		var myOh = myActiveDoc.documentPreferences.pageHeight;
		myTempDocument.documentPreferences.pageWidth = myOw;
		myTempDocument.documentPreferences.pageHeight = myOh;
		// set units back
		myActiveDoc.viewPreferences.horizontalMeasurementUnits = myOldXUnits;
		myActiveDoc.viewPreferences.verticalMeasurementUnits = myOldYUnits;
	} else {
		myTempDocument.documentPreferences.pageHeight = "297 mm";
		myTempDocument.documentPreferences.pageHeight = "297 mm";
	}
	myTempTextFrame = myTempDocument.pages.item(0).textFrames.add({geometricBounds:myGetBounds(myTempDocument, myTempDocument.pages.item(0))});
}

function mySplitStory(myStory){
	var mTF;
	//Duplicate each text frame in the story.
	for(var myCounter = myStory.textContainers.length-1; myCounter >= 0; myCounter --){
		mTF = myStory.textContainers[myCounter];
		mTF.duplicate();
	}
}
function myRemoveFrames(myStory){
	//Remove each text frame in the story. Iterate backwards to avoid invalid references.
	for(var myCounter = myStory.textContainers.length-1; myCounter >= 0; myCounter --){
		myStory.textContainers[myCounter].remove();
	}
}

function removePagebreaks(myTempDocument){
	var myBreakCharacters = new Array("^P", "^R", "^M", "^E", "^L");
	app.findTextPreferences = app.changeTextPreferences = null;
	for(var myCounter = 0; myCounter < myBreakCharacters.length; myCounter++){
		var myBreakCharacter = myBreakCharacters[myCounter];
		app.findTextPreferences.findWhat = myBreakCharacter;
		app.changeTextPreferences.changeTo = "\r\n";
		myTempDocument.changeText ();
	}
}

function removeDoubles(myTempDocument){
	var findCharacters = new Array("\r\r\r", "------------------------------\r\r------------------------------",);
	var replaceCharacters = new Array("\r\r", "------------------------------",);
	app.findTextPreferences = app.changeTextPreferences = null;
	for(var myCounter=0; myCounter < findCharacters.length; myCounter++){
		var i=0;
		while (i<=5){
			var findCharacter = findCharacters[myCounter];
			var replaceCharacter = replaceCharacters[myCounter];
			app.findTextPreferences.findWhat = findCharacter;
			app.changeTextPreferences.changeTo = replaceCharacter;
			myTempDocument.changeText ();
			i++;
		}
	}
}

function RemoveDropCaps(myNewStory){
	// Check all paragraphs
	for(var myCounter=0; myCounter < myNewStory.paragraphs.length; myCounter++){
		myParagraph = myNewStory.paragraphs[myCounter];
		if(myRemoveDropCap == true){
			myParagraph.dropCapCharacters = 0;
		}
		if(myLeftAlign == true){
			//left aligns the text
			myParagraph.justification = 1818584692;
		}
	}
}

function exportTempFile(myTempDocument, myNewStory, myTempFile){
	//since it can’t export pagebreaks, we find and replace pagebreaks with a return
	//to keep the chapters from running together.
	removePagebreaks(myTempDocument);
	//find and replace double lines and returns
	removeDoubles(myTempDocument);
	//set all text to black so you can read white text in your texteditor
	if(myTextToBlack == true){
		myNewStory.fillColor = "Black";
		myNewStory.fillTint = 100;
	}
	
	if(myRemoveDropCap == true || myLeftAlign == true){
		RemoveDropCaps(myNewStory);
	}
	
	switch(myExportFormat){
		case "MS Word":
		myFormat = ExportFormat.RTF;
		myExtension = ".doc"
		break;
		case "Text Only":
		myFormat = ExportFormat.textType;
		myExtension = ".txt"
		break;
		case "RTF":
		myFormat = ExportFormat.RTF;
		myExtension = ".rtf"
		break;
		case "Tagged Text":
		myFormat = ExportFormat.taggedText;
		myExtension = ".txt"
		break;
	}
	myNewStory.exportFile(myFormat, File(myFilePath+myExtension));
	myTempDocument.close(SaveOptions.no);
	myTempFile.remove();
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
}

//Export the story as tagged text.
function exportStory(){
	myActiveStory.exportFile(ExportFormat.taggedText, myTempFile);
	//Import (place) the file at the end of the temporary story.
	myTempStory.insertionPoints.item(-1).place(myTempFile);
	//If the imported text did not end with a return, enter a return
	//to keep the stories from running together.
	if(myTempStory.characters.item(-1).contents != "\r"){
		myTempStory.insertionPoints.item(-1).contents = "\r";
	}
	if(myAddSeparator == true){
		myTempStory.insertionPoints.item(-1).contents = "------------------------------\r";
	}
}

function by(item,direction) {
	// if direction == 1 A-Z sorted
	// if direction == -1 Z-A sorted
	return function(first,second){
		first = first[item];
		second = second[item];
		return first == second ? 0 : (first < second ? -1*direction : direction);
	}
}

function exportFrameToTempfile(){
	myActiveDoc.viewPreferences.rulerOrigin = RulerOrigin.pageOrigin;
	myTempStory = myTempTextFrame.parentStory;
	for (var myCounter=0; myCounter < myActiveDoc.textFrames.length; myCounter++) {
		myActiveTextFrame = myActiveDoc.textFrames[myCounter];
		if(myActiveTextFrame.parentStory.length > 1){
			mySplitStory(myActiveTextFrame.parentStory);
			myRemoveFrames(myActiveTextFrame.parentStory);
		}
	}
	
	for(var pageCounter = 0; pageCounter < myActiveDoc.pages.length; pageCounter++ ) {
		for (var txtFrameCounter=0; txtFrameCounter < myActiveDoc.pages[pageCounter].textFrames.length; txtFrameCounter++) {
			var Y = parseInt( myActiveDoc.pages[pageCounter].textFrames[txtFrameCounter].geometricBounds[0] );
			var X = parseInt( myActiveDoc.pages[pageCounter].textFrames[txtFrameCounter].geometricBounds[1] );
			var myTextFrame = new Array(myActiveDoc.pages[pageCounter].textFrames[txtFrameCounter].parentStory, Y, X);
			myTextFrames.push(myTextFrame);
		}
		// sort X (Read from top to bottom)
		myTextFrames.sort(by(1,1));
		for (var pC = 0; pC < myTextFrames.length; pC++){
			myActiveStory = myTextFrames[pC][0];
			exportStory();
		}
		myTextFrames=[];
	}
}

function exportStoryToTempfile(){
	myTempStory = myTempTextFrame.parentStory;
	for(myCounter = 0; myCounter < myActiveDoc.stories.length; myCounter++){
		myActiveStory = myActiveDoc.stories.item(myCounter);
		if(myIgnoreMasterSpread == true){
			if(myActiveStory.textContainers[0].parent.parent instanceof MasterSpread){
				//do nothing
			} else {
				exportStory();
			}
		} else {
			exportStory();
		}
	}
}

function exportAllBookText(myBook){
	myActiveDoc = app.open(myBook.bookContents.item(0).fullName);
	createTempFile();
	myActiveDoc.close(SaveOptions.no);
	for(var myCounter=0; myCounter < myBook.bookContents.length; myCounter++){
		myActiveDoc = app.open(myBook.bookContents.item(myCounter).fullName);
		if(myReadFrame == true){
			exportFrameToTempfile();
		} else {
			exportStoryToTempfile();
		}
		myActiveDoc.close(SaveOptions.no);
	}
	exportTempFile(myTempDocument, myTempStory, myTempFile);
}

function exportAllDocText(){
	createTempFile();
	if(myReadFrame == true){
		exportFrameToTempfile();
	} else {
		exportStoryToTempfile();
	}
	exportTempFile(myTempDocument, myTempStory, myTempFile);
}

function myDisplayDialog(){
	//Need to get export format, story separator.
	var myExportFormats = ["MS Word", "RTF", "Tagged Text", "Text Only"];
	var myExportSizes = ["A4", "Original"];
	var myDialog = app.dialogs.add({name:"ExportAllStories"});
	with(myDialog.dialogColumns.add()){
		with(dialogRows.add()){
			with(dialogColumns.add()){
				var myExportFormatDropdown = dropdowns.add({stringList:myExportFormats, selectedIndex:0});
				var myExportSizesDropdown = dropdowns.add({stringList:myExportSizes, selectedIndex:0});
			}
		}
	}
	with(myDialog.dialogColumns.add()){
		with(dialogRows.add()){
			with(dialogColumns.add()){
				var myAddSeparatorCheckbox = checkboxControls.add({staticLabel:"Add separator line", checkedState:true});
				var myTextToBlackCheckbox = checkboxControls.add({staticLabel:"All text to black", checkedState:true});
				var myMasterSpreadCheckbox = checkboxControls.add({staticLabel:"Ignore Masterspreads", checkedState:true});
				var myReadFramesCheckbox = checkboxControls.add({staticLabel:"Read frames i.s.o stories", checkedState:true});
				var myRemoveDropCapsCheckbox = checkboxControls.add({staticLabel:"Remove Dropcaps", checkedState:true});
				var myLeftAlignCheckbox = checkboxControls.add({staticLabel:"Align Left", checkedState:true});
			}
		}
	}
	var myResult = myDialog.show();

	if(myResult == true){
		myExportFormat = myExportFormats[myExportFormatDropdown.selectedIndex];
		myExportSize = myExportSizes[myExportSizesDropdown.selectedIndex];
		myAddSeparator = myAddSeparatorCheckbox.checkedState;
		myTextToBlack = myTextToBlackCheckbox.checkedState;
		myIgnoreMasterSpread = myMasterSpreadCheckbox.checkedState;
		myReadFrame = myReadFramesCheckbox.checkedState;
		myRemoveDropCap = myRemoveDropCapsCheckbox.checkedState;
		myLeftAlign = myLeftAlignCheckbox.checkedState;
		app.scriptPreferences.userInteractionLevel = UserInteractionLevels.neverInteract;
		if(book == 1){
			var myBook = app.activeBook;
			exportAllBookText(myBook);
		}else{
			myActiveDoc = app.activeDocument;
			exportAllDocText();
		}
		myDialog.destroy();
	} else {
		myDialog.destroy();
	}
}

function myGetFilePath(){
	myFilePath = File.saveDialog("Save Exported File As:");
	if(myFilePath != null){
		myDisplayDialog();
	}
}


if(app.documents.length != 0){
	if(app.documents.item(0).stories.length != 0){
		app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
		myActiveFileName=app.documents.item(0).name;
		myGetFilePath();
	} else {
		alert("Couldn’t find any text");
	}
} else {
	if(app.books.length != 0){
		// InDesign can't figure out which book is active so we make sure there is only one book open
		// This functionality can be removed as soon as this issue is resolved
		if(app.books.length == 1){
			book=1;
			myActiveFileName=app.books.item(0).name;
			myGetFilePath();
		} else {
			alert("Please only have one book open");
		}
	} else {
		// see if there is a indb open otherwise open one
		alert("Open an inDesign document or book");
	}
}