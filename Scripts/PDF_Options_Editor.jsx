﻿//PDFoptions editor - 2010-02
//Ce script pour InDesign permet de revenir sur toutes les options de placement des PDF importés
//il suffit de sélectionner le bloc conteneur et de double-cliquer sur le script dans la palette des scripts de InDesign
//Fonctionne avec versions CS, CS2, CS3 & CS4

//Script gratuit offert par abracadabraPDF.net
//support en ligne : http://forums.abracadabrapdf.net/
//on-line support: http:/forums.abracadabrapdf.net/

//JR Boulay - Fevrier 2010 - http://abracadabraPDF.net

myDoc = app.activeDocument;

if( myDoc.selection.length == 0 ){err("PDFoptions editor - offert par abracadabraPDF.net\r\r\rThere's no selection!\r\rIl n'y a pas de s\u00E9lection active !");}

if( myDoc.selection[0].constructor.name != "PDF" ){
//Teste si selection existante
try {
	if (myDoc.selection[0].contentType == ContentType.graphicType){
		//Teste si contenu est PDF ou non
			try {
					if (0==0){
						placePDF(myDoc.selection[0].allGraphics[0]);
					} else {
						err("PDFoptions editor - offert par abracadabraPDF.net\r\r\rNo PDF content embedded.\r\rIl n'y a pas de PDF incorpor\u00E9.");
					}
			} catch (e){
						err("PDFoptions editor - offert par abracadabraPDF.net\r\r\rNo PDF content embedded.\r\rIl n'y a pas de PDF incorpor\u00E9.");
					}
	} else {
		err("PDFoptions editor - offert par abracadabraPDF.net\r\r\rSelect an imported PDF content.\r\rS\u00E9lectionnez un objet contenant un PDF import\u00E9.");
	}
} catch (e){
	err("PDFoptions editor - offert par abracadabraPDF.net\r\r\rSelect an imported PDF content.\r\rS\u00E9lectionnez un objet contenant un PDF import\u00E9.");
}


} else {
	placePDF(myDoc.selection[0]);
}

exit();


function placePDF(n){
	try {
	if (app.version == 3){
		//cs1
		myDoc.selection[0].place(n.itemLink.filePath,1,1,1,1, undefined);
	} else if (String(app.version).split(".")[0] == 4){ 
		//cs2
		myDoc.selection[0].place(n.itemLink.filePath,1, undefined);
	}else if (String(app.version).split(".")[0] == 5){ 
		//cs3
		myDoc.selection[0].place(n.itemLink.filePath,1, undefined);
	}else if (String(app.version).split(".")[0] == 6){ 
		//cs4
		myDoc.selection[0].place(n.itemLink.filePath,1, undefined);
	}else { 
		//versions ulterieures
		myDoc.selection[0].place(n.itemLink.filePath,1, undefined);
	}
	
	} catch (e){
		//err("Unknown error!");
	}
}



function err(e){
	alert(e);
	exit();
}
