function handleClick(subject, body, approve, pushgroup) {
	
    "use strict";
    
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

	if (!approve.checked) {
		alert("Please check the approved checkbox to save to entry.");
		return;
	}
	
	//Test 
	if (pushgroup.value === "Test") {
		//var newBody = correctText(body.value);
		alert(body.value);		alert(body.value);

		event.preventDefault();
		return;
	}
	
    var bodyText = body.value;
    
	var News = Parse.Object.extend("WeeklyBlog");
	var news = new News();

	news.set("url", "www.plutusfx.com/news");
	news.set("title", subject.value);
	news.set("text", "\n" + bodyText + "\n\nSteven Woodcock\nSenior FX Analyst\nPlutusFX");
	//news.set("text", "\n" + newsBody + "\n\nSteven Woodcock\nSenior FX Analyst\nPlutusFX");
	news.set("date", dt);
	news.set("pushGroup", pushgroup.value);

	news.save(null, {
		success: function (blog) {
			// Execute any logic that should take place after the object is saved.
			alert("Successfully uploaded News Item: \n" + subject.value + "\n ID :" + news.id + "\n\n To Push Group : " + pushgroup.value);
			subject.value = null;
			body.value = null;
			approve.checked = null;
			event.preventDefault();
			return;
		},
		error: function (news, error) {
			// Execute any logic that should take place if the save fails.
			// error is a Parse.Error with an error code and message.
			alert("Failed to add news article, with error code: " + error.message);
			event.preventDefault();
			return;
		}
	});
}

function getDate(field) {
	field.value = (new Date()).toString();
	//field.value = (new Date()).format("ddd dd-mmm-yy");
}

