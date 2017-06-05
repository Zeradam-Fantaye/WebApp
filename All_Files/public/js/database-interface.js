//HELPER FUNCTIONS

/*
function: handles the edit click button
*/
function editTagClick() {
	//remove the viewTag display and display the edit form
	document.getElementById('viewTag').style.display ='none';
	document.getElementById('editForm').style.display ='block';

	//grab the current tag data and insert it into the form
	document.getElementById('tagName').value = currTagData.val().tag;
	document.getElementById('tagDescription').value = currTagData.val().description;
	document.getElementById('standardSyntax').value = currTagData.val().standard_syntax;
	document.getElementById('tagDemo').value = currTagData.val().demo;

	//reset the attribute list to be filled with current tag data
	document.getElementById('attributeList').innerHTML='';

	//grab the attributes of the current tag
	var attributesToFill = currTagData.val().attributes;
	attributesToFillLength = attributesToFill.length;

	//iterating through the tag's attribute array insert an attribute row for each attribute dictionary
	for(var n=0; n< attributesToFillLength; n++)
	{
		$('#attributeList').append('<div class="row attribute-row">' +
  		'<div class="col-xs-2">' + 
    		'<input type="text" class="form-control col-xs-2" placeholder="attribute name" value="'+ attributesToFill[n].attribute +'">' +
  		'</div>' + 
		  '<div class="col-xs-10">'  +
		    '<input type="text" class="form-control col-xs-8" placeholder="attribute definition" value="'+ attributesToFill[n].definition +'">' +
		  '</div>' +
		'</div>');
	}
}

//use jquery to find the div id=attributeList and append markup
function addAttribute() {
	$('#attributeList').append('<div class="row attribute-row">' +
  '<div class="col-xs-2">' + 
    '<input type="text" class="form-control col-xs-2" placeholder="attribute name">' +
  '</div>' + 
  '<div class="col-xs-10">'  +
    '<input type="text" class="form-control col-xs-8" placeholder="attribute definition">' +
  '</div>' +
	'</div>');
}

//tag submission handler
function tagSubmit() {

	//initialize variables, grab the attributes
	var submittedAttributes = [];
	var attributesToSubmit = document.getElementsByClassName('attribute-row');
	var attributeInputArray, attrDict;
	var attributesLength = attributesToSubmit.length;

	//for all the attributes create a new dictionary entry into the submitted attributes array
	for(var m=0;m<attributesLength;m++)
	{
		attributeInputArray = attributesToSubmit[m].getElementsByClassName('form-control');
		attrDict = {attribute: attributeInputArray[0].value, definition: attributeInputArray[1].value};
		submittedAttributes.push(attrDict);
	}

	//create the dictionary for submission data
	var submissionData = {
		tag: document.getElementById('tagName').value,
		description: document.getElementById('tagDescription').value,
		standard_syntax: document.getElementById('standardSyntax').value,
		demo: document.getElementById('tagDemo').value,
		attributes: submittedAttributes
	};

	//check if the tag exists
	var currActive = document.getElementsByClassName("active");
	if(currActive.length==1){
		var tagData = checkIfTagExists(currActive[0].id.substring(4));
	}

	//if tag exists we update
	if(tagData!=null){
		myDataRef.child(currTagData.key()).update(submissionData);
	}
	//otherwise we create a new tag
	else
	{
		myDataRef.push(submissionData);
	}
}

//delete tag function
function deleteTag() {
	if(currTagData!=null){
		//if there is a current tag loaded in the variable send the delete method to myDataRef
		var keyToDelete = currTagData.key();
		myDataRef.child(keyToDelete).remove();
	}
	$('#deleteModal').modal('hide');
}

//check if the tag exists within the firebase
function checkIfTagExists(tagId) {
  var tagToFind = tagId;
  var tagData = null;
  //check for a match in the database
  myDataRef.once('value', function(tagList) {
    tagList.forEach(function(childSnapshot) {
    	var tagString = childSnapshot.val().tag;
      if(tagToFind==tagString) {
      	//if true return the tag's data
      	tagData = childSnapshot;
      }
    });
	});
	return tagData;
}

//obsolete functionality
function addTagIds() {
	var tagsArray = document.getElementsByClassName("left-col-tag-item");
	for(var i=0;i<tagsArray.length;i++) {
	}
	console.log(tagsArray[0]);
}



function tagClick(tagClicked) {
	//Remove the active class from whatever was previously active
	var currActive = document.getElementsByClassName("active");
	$(currActive).removeClass("active");

	//Get the parent element's tag-id value to be used for query
	parentItem = tagClicked.parentElement;
	$(parentItem).addClass("active");
	var activeTagString = parentItem.id.substring(4);
	console.log(activeTagString);

	//Check if the tag already exists in the database
	currTagData = checkIfTagExists(activeTagString);

	//If it doesn't exist, display a form to edit a new tag
	if(currTagData==null){
		document.getElementById('editForm').style.display ='block';
		document.getElementById('viewTag').style.display ='none';
		document.getElementById('attributeList').innerHTML='';
		addAttribute();
		var formsToReset = document.getElementsByTagName('input');
		for (var j=0; j< formsToReset.length; j++)
		{
			formsToReset[j].value='';
		}
		document.getElementById('tagDemo').value = '';
		document.getElementById('tagName').value = activeTagString;
	}
	//If it does exist, create a way to view the data and give allowed actions to that data
	else{
		document.getElementById('editForm').style.display ='none';
		document.getElementById('viewTag').style.display ='block';

		var currVals = currTagData.val();
		//variable setting based on currVals
		attributesTableHTML = '<table class="table"><tr><th>attribute</th><th>definition</th></tr>';
		for(var i=0; i< currVals.attributes.length; i++)
		{
			attributesTableHTML += '<tr><td>'+currVals.attributes[i].attribute+'</td><td>'+currVals.attributes[i].definition+'</td></tr>'
		}
		attributesTableHTML +='</table>'

		htmlToInsert = '<div class="panel panel-default">' +
  		'<div class="panel-heading">tag</div>' + 
  		'<div class="panel-body">' + currVals.tag + 
  		'</div>' +
		'</div>' + 
		'<div class="panel panel-default">' +
		  '<div class="panel-heading">description</div>' + 
		  '<div class="panel-body">' + currVals.description + 
		  '</div>' +
		'</div>' + 
		'<div class="panel panel-default">' +
		  '<div class="panel-heading">standard_syntax</div>' + 
		  '<div class="panel-body">' + '<textarea>' + currVals.standard_syntax + '</textarea>' + 
		  '</div>' +
		'</div>' + 
		'<div class="panel panel-default">' +
		  '<div class="panel-heading">attributes</div>' + 
		  '<div class="panel-body">' + attributesTableHTML + 
		  '</div>' +
		'</div>' + 
		'<div class="panel panel-default">' +
		  '<div class="panel-heading">demo</div>' + 
		  '<div class="panel-body">' + '<textarea>' + currVals.demo + '</textarea>' + 
		  '</div>' +
		'</div>';

		//insert the panel into viewtag
		document.getElementById('viewTag-display').innerHTML=htmlToInsert;
	}
}

//END FUNCTIONS


//Execution
//Connect to the database
var myDataRef = new Firebase('https://flickering-fire-1881.firebaseio.com/tags');

//handle a tag being added into the database
myDataRef.on('child_added', function(snapshot) {
  var addedTag = snapshot.val();
  var addedTagElement = $(document.getElementById("tag-"+addedTag.tag));
  //remove the red coloring
  addedTagElement.removeClass("incomplete");
  var currentTagViewed = document.getElementsByClassName('active')
  if(currentTagViewed.length>0)
  {
  	currentTagViewed=currentTagViewed[0];
  	//if the current tag being viewed by the client is the changed tag then do a display reset
  	if(currentTagViewed.id=='tag-'+addedTag.tag)
	  {
	  	$('#deleteModal').modal('hide');
	  	$('#updatedModal').modal('show');
	  	document.getElementById('viewTag').style.display ='none';
	  	document.getElementById('editForm').style.display ='none';
			var currActive = document.getElementsByClassName("active");
			$(currActive).removeClass("active");
	  }
  }
});

//handle a tag being updated
//logic follows from the child_added for the most part.
myDataRef.on('child_changed', function(snapshot) {
  var changedTag = snapshot.val();
  var changedTagElement = $(document.getElementById("tag-"+changedTag.tag));
  changedTagElement.removeClass("incomplete");
  var currentTagViewed = document.getElementsByClassName('active')
  if(currentTagViewed.length>0)
  {
  	currentTagViewed=currentTagViewed[0];
  	if(currentTagViewed.id=='tag-'+changedTag.tag)
	  {
	  	$('#deleteModal').modal('hide');
	  	$('#updatedModal').modal('show');
	  	document.getElementById('viewTag').style.display ='none';
	  	document.getElementById('editForm').style.display ='none';
			var currActive = document.getElementsByClassName("active");
			$(currActive).removeClass("active");
	  }
  }
});

myDataRef.on('child_removed', function(snapshot) {
  //when a child is removed add the red coloring and if the current tag viewed by client is the deleted tag do a display reset.
  var removedTag = snapshot.val();
  var removedTagElement = $(document.getElementById("tag-"+removedTag.tag));
  removedTagElement.addClass("incomplete");
  var currentTagViewed = document.getElementsByClassName('active')[0].id;
  if(currentTagViewed.id==removedTagElement.id)
  {
  	$('#deleteModal').modal('hide');
  	$('#deletedModal').modal('show');
  	document.getElementById('viewTag').style.display ='none';
  	document.getElementById('editForm').style.display ='none';
		var currActive = document.getElementsByClassName("active");
		$(currActive).removeClass("active");
  }
});