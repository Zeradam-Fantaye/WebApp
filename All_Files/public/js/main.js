/**
  * Team-22 main.js
  */

//var firebaseRef = new Firebase('http://.......');

//wrapper objects
refObj = {};
tutorialObj = {};

refObj.searchFireBase = function searchFireBase(searchString) {
    var tagToFind = searchString;
    var tagData = null;

    refObj.tagList.forEach(function (childSnapshot) {
        var tagString = childSnapshot.val().tag;
        if (tagToFind == tagString) {
            tagData = childSnapshot;
        }
    });
    return tagData;
}

refObj.updateFields = function updateFields(firebaseResponse) {
    console.log(firebaseResponse.val());
    console.log(document.getElementById("elementSyntax"));
    //update text on screen
    document.getElementById("elementTitle").innerHTML = "Element: &lt;" + firebaseResponse.val().tag + "&gt;";

    //replace tag characters
    document.getElementById("elementDefinition").innerHTML = firebaseResponse.val().description.replace(/</g,"&lt;").replace(/>/g,"&gt;");
    //xmp element is deprecated. we should use <code><pre> block instead and escape < with &lt; and > with &gt; 
    document.getElementById("elementSyntax").innerHTML = "<xmp>" + firebaseResponse.val().standard_syntax + "</xmp>";
    document.getElementById("elementExample").innerHTML = "<xmp>" + firebaseResponse.val().demo + "</xmp>";
    document.getElementById("goToTutorialBtn").innerHTML = "Go to tutorial for &lt;" + firebaseResponse.val().tag + "&gt;";
}

refObj.trimSpecialChars  = function trimSpecialChars(str) {
    str = str.replace("<", "");
    str = str.replace(">", "");  
    return str;
}

/*
Use JQuery to get the search button and form field text
*/
var searchBtn = $("#searchBtnRef");
var searchForm = $("#searchFormField")
searchBtn.click(function () {
    searchForm.focus();
    var searchString = searchForm.val();
    if (searchString.length == 0) {
        alert("Please enter an element/attribute to search for");
    } else {
        var firebaseResponse = refObj.searchFireBase(searchString);
        if (firebaseResponse != null) {
            refObj.updateFields(firebaseResponse);
        } else {
            alert("No element matching '" + searchForm.val() + "' found.");
        }
    }   
});


refObj.refTagClicked = function refTagClicked(newActiveTag) {
    //Remove the active class from whatever was previously active
    var currActive = document.getElementsByClassName("active");
    $(currActive).removeClass("active");

    //Get the parent element's tag-id value to be used for query
    parentItem = newActiveTag.parentElement;
    $(parentItem).addClass("active");
    var elementInnerText = $(newActiveTag).text();
    var tagNameToFind = refObj.trimSpecialChars(elementInnerText);
    
    //query firebase for tag
    var firebaseSearchResponse = refObj.searchFireBase(tagNameToFind);
    if (firebaseSearchResponse != null) {
        refObj.updateFields(firebaseSearchResponse);
    }
    else {
        alert("No data for this element yet");
    }
}


var firebaseConn = new Firebase('https://flickering-fire-1881.firebaseio.com/tags');
refObj.firebaseConn = firebaseConn;
refObj.tagList = null;

//upon page load, grab firebase data while user looks at page to speed up search times
firebaseConn.once('value', function (tagList) {
    refObj.tagList = tagList;
});