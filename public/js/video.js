function handleClick(subject, body, url, fullurl, approve, pushgroup) {
	
    //"use strict";
    
    event.preventDefault();

	var dt = new Date();


	if (subject.value === "") {
		alert("ERROR \nSubject cannot be blank");
		event.preventDefault();
		return;
	}
	if (body.value === "") {
		alert("ERROR \nNews Item cannot be blank");
		event.preventDefault();
		return;
	}
    if (url.value === "") {
		alert("ERROR \nURL cannot be blank");
		event.preventDefault();
		return;
	}
	if (!approve.checked) {
		alert("Please check the approved checkbox to save to entry.");
		return;
	}
	
	//Test 
	if (pushgroup.value === "Test") {
        console.log("Sending to Test")
	}
	
    var bodyText = body.value;
    
	var Video = Parse.Object.extend("VideoArchive");
	var video = new Video();

	video.set("youTubeURL", url.value);
    video.set("fullUrl", fullurl.value);
	video.set("title", subject.value);
	video.set("description", bodyText);
	
	video.set("date", dt);
	video.set("pushGroup", pushgroup.value);
    video.set("numberOfViews", 1);

	video.save(null, {
		success: function (blog) {
			// Execute any logic that should take place after the object is saved.
			alert("Successfully uploaded Video Item: \n" + subject.value + "\n ID :" + video.id + "\n\n To Push Group : " + pushgroup.value);
			subject.value = null;
			body.value = null;
            url.value = null;
            fullurl.value = null;
			approve.checked = null;
			event.preventDefault();
			return;
		},
		error: function (news, error) {
			// Execute any logic that should take place if the save fails.
			// error is a Parse.Error with an error code and message.
			alert("Failed to add video article, with error code: " + error.message);
			event.preventDefault();
			return;
		}
	});
}

function getDate(field) {
	field.value = (new Date()).toString();
	//field.value = (new Date()).format("ddd dd-mmm-yy");
}


function correctURL() {
        var x = document.getElementById("url");
        
        if (x.value === "") {
            alert("Invalid URL - Please re enter");
            event.preventDefault();
            return;
        }
        x.value = x.value.replace("https://www.youtube.com/watch?v=","http://www.youtube.com/embed/");    
        x.value = x.value.replace("youtu.be","www.youtube.com/embed");        
}

function getSelectionBold() {
    
    
}
    
    
    
    