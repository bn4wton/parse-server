/*
WT NEWTON
PRODUCTION RELEASE    8 APRIL 2015

VERSION 287

289  fixed Blog Channel and added hyphen to Alert Title
290 
291  Added after save function to set hasbeenviewed to false on new alert
469  Added push send for VideoArchive
532  Added content-available param to APN JSON object
*/
var oauth = require('./oauth.js');
var sha = require('./sha1.js');

/*Trigger to set some default values for new User alerts
	set hasbeenviewed = false
	Check the number of active alerts is less than 10
*/
Parse.Cloud.beforeSave('Alerts',function(request, response){
	
	if(request.object.isNew()){
		var alert = Parse.Object.extend("Alerts");
		var query = new Parse.Query(alert);
		
		//291
		//set has been viewed to false as default value for new alerts
		request.object.set('hasbeenviewed', false);
	
		//var token = request.params
	
		//console.log("request new alert for device : " + request.object.get('deviceToken'))
		query.equalTo('alertsentdate', null);
		query.equalTo("deviceToken", request.object.get('deviceToken'));
			query.count({
	  
	  		  success: function(results) {
			  if (results < 10){
				  response.success();
			  }
			  else{
				  response.error("Sorry, you can only place 10 Alerts")
			  }
	  	},
	  
	  	error: function(error) {
	    	console.log("Error: " + error.code + " " + error.message);
			response.error('Sorry you can only monitor 10 Alerts');
	  	}
		});	
	}
	else{
		response.success();
	}
});

//Promises Re-write
Parse.Cloud.beforeSave('Alerts',function(request, response){
	
	if(request.object.isNew()){
		var alert = Parse.Object.extend("Alerts");
		var query = new Parse.Query(alert);
		
		//set has been viewed to false as default value for new alerts
		request.object.set('hasbeenviewed', false);
	
		query.equalTo('alertsentdate', null);
		query.equalTo("deviceToken", request.object.get('deviceToken'));
			query.count({
	  
	  		  success: function(results) {
			  if (results < 10){
				  response.success();
			  }
			  else{
				  response.error("Sorry, you can only place 10 Alerts")
			  }
	  	},
	  
	  	error: function(error) {
	    	console.log("Error: " + error.code + " " + error.message);
			response.error('Sorry you can only monitor 10 Alerts');
	  	}
		});	
	}
	else{
		response.success();
	}
});




//Called from the getRates to send Individual limit alerts via parse PUSH
PushAlertToUserDevice = function( Data, DeviceToken) {
	
	var query = new Parse.Query(Parse.Installation);
	query.equalTo('deviceToken', DeviceToken);
	
	console.log('In Push Alert ' + Data + ' ' + DeviceToken);

	Parse.Push.send({
	  where: query, 
	  data: {
		  alert: Data,
		  badge: 'Increment',
		  sound: 'default',
          channel: 'Limit',
          'content-available':'1'
	  }
  }, { useMasterKey: true }).then(function() {
		console.log('Data Pushed to Device : ' + DeviceToken);
	}, function(error) {
		throw 'FAILED to Send Push ' + error.code + " " + error.message;
	});
};

//Send Blog Alert as JSON payload
Parse.Cloud.beforeSave("WeeklyBlog", function(request, response) {
    if(request.object.isNew()) {
		
		var push = request.object.get('pushGroup');
		var title = request.object.get('title');
		var alertTitle = '';
		
        console.log('Sending Push to Group : ' + push + " : " + title);
		
		if(push == 'News'){
			alertTitle = 'FX News - ';
		}
		if(push == 'Blog'){
			alertTitle = 'Weekly Blog - ';
		}
        return Parse.Push.send({
			channels : [push],         //rev 453 Change to field driven Push channel
			data: {
				alert: alertTitle + request.object.get('title'),   //rev 289 added hyphen
				badge: 'Increment',
				sound: 'default',
				channel: push,
                'content-available':'1'
			}
        }).then(function() {
		console.log('Blog Push Successful')
        response.success();
    }, response.error);
  }
  //CHANGED 9th April 2015 22:15
  else{
	  console.log("This is an update not a new data row");
	  response.success();
  }
});

//Post to twitter AFTER Save
Parse.Cloud.afterSave("WeeklyBlog", function(request) {
            
            if (!request.object.existed()){
                var thisID = request.object.id;
                var msg =  request.object.get('title');
                
                var tweetArray = {};
                tweetArray.status = 'News : ' + msg + "\nwww.plutusfx.com/news";
                tweetArray.url = 'www.plutusfx.com/news';

				Parse.Cloud.run("TwitterPost", tweetArray).then(function(result){});

            }
            else{
                console.log("Not sent to Twitter as this is an existing Object ref : " + thisID);
            }
            
});

//Added 13 Aug 2015  WTN
//Send Video Alert as JSON payload
Parse.Cloud.beforeSave("VideoArchive", function(request, response) {
    if(request.object.isNew()) {
		
		var push = request.object.get('pushGroup');
		var title = request.object.get('title');
		var alertTitle = '';
		var objectID = request.object.id;
		
//		request.object.set("url","http://push.plutusfx.com/story.html?storyID=" + objectID);
		
        console.log('Sending Push to Group : ' + push + " : " + title);
		
		if(push == 'Video'){
			alertTitle = 'Analysis - ';
		}
		if(push == 'Test'){
			alertTitle = 'Test - Video - ';
		}
        return Parse.Push.send({
			channels : [push],         //rev 453 Change to field driven Push channel
			data: {
				alert: alertTitle + request.object.get('title'),   //rev 289 added hyphen
				badge: 'Increment',
				sound: 'default',
				channel: push,
                'content-available':'1'
			}
        }).then(function() {   //New Promise instead of afterSave()
			console.log("Trying to tweet new Video Blog");
			//Now post it to twitter
			var url = "Depricated - Not in use";
			var tweetArray = {};
            tweetArray.status = 'Analysis : ' + title + "\nwww.plutusfx.com/analysis";
            tweetArray.url = url;
			Parse.Cloud.run("TwitterPost", tweetArray)
		}).then(function(result){				   
			console.log('Video Push and Tweet Successful');
        	response.success();
    	}, response.error);
  }
  
  else{
	  response.success();
  }
});

//Update the URL with the new Object ID
Parse.Cloud.afterSave("VideoArchive", function(request) {
            
            if (!request.object.existed()){
                var tmp = request.object.id;
				request.object.set("url","http://push.plutusfx.com/story.html?storyID=" + tmp);
				alert("Video Archive ULR updated : http://push.plutusfx.com/story.html?storyID=" + tmp);
				request.object.save();
            }
            else{
                console.log("****** Video Archive - URL NOT Updated *******");
            }
		
});

//News is just a test table
Parse.Cloud.afterSave("News",function(request){

	//var state = request.object.existed();
	if (!request.object.existed()) {	
		var newID = request.object.id;
		var title = "http://www.plutusfx.com/id=" + newID;
		var test = "Test with " + newID
		request.object.set("title",title);
		request.object.set("text",test);
		request.object.save();  
		//request.success;
	}
	else{
		alert("This is NOT a new entry - Increment viewCount");
		var views = request.object.get("ViewCount");
		var newViews = views + 1;
		request.object.set("ViewCount", newViews);
		console.log("ViewCount from " + views + " to " + newViews);
	}
})



//General Cloud function to post to Twitter via Twitter API
// Takes JSON payload with {"status":"Message to tweet", "url":"URL to main story"}
Parse.Cloud.define("TwitterPost", function (request, response) {
    var urlLink = "https://api.twitter.com/1.1/statuses/update.json";
    var postLink = request.params.url;
    var postSummary = request.params.status;
    var status = oauth.percentEncode(postSummary);
    var consumerSecret = "ga3snfpqJ1GVvsaYi9vd5OZ6bmYedDhGS5VrZXOaBxLhqDuddf";
    var tokenSecret = "wbZUcFU7Ahly1nPJVJv4YU00LWI0srsZtm4dARHo8CRlX";
    var oauth_consumer_key = "X40NPN2XTooyP1E6tWJBan5Un";
    var oauth_token = "1122598639-arQMPXa5glAd34d0zfEQdtg8EtlT9rwxfnIutj8";

    var nonce = oauth.nonce(32);
    var ts = Math.floor(new Date().getTime() / 1000);
    var timestamp = ts.toString();

    var accessor = {
        "consumerSecret": consumerSecret,
        "tokenSecret": tokenSecret
    };

    console.log("Start : @@@@@@@@@@@@@@@@@@@@@@@@@@");
    //console.log(postLink)
    //console.log(encodeURIComponent(postLink))
    //var tweet = postSummary.concat(" more");
    console.log("postSummary : " + postSummary + "\nLength : " + postSummary.length);
    console.log("Tweeting  " + postSummary);
    //console.log("urlEncoded Tweet : " + encodeURIComponent(tweet));
    console.log("End : @@@@@@@@@@@@@@@@@@@@@@@@@@");
    

    var params = {
        "status":postSummary,//postSummary + "-" + webLink,
        "oauth_version": "1.0",
        "oauth_consumer_key": oauth_consumer_key,
        "oauth_token": oauth_token,
        "oauth_timestamp": timestamp,
        "oauth_nonce": nonce,
        "oauth_signature_method": "HMAC-SHA1"
    };
    
    var message = {
        "method": "POST",
        "action": urlLink,
        "parameters": params
    };
    
    //lets create signature
    oauth.SignatureMethod.sign(message, accessor);
    var normPar = oauth.SignatureMethod.normalizeParameters(message.parameters);
    console.log("Normalized Parameters: " + normPar);
    var baseString = oauth.SignatureMethod.getBaseString(message);
    console.log("BaseString: " + baseString);
    var sig = oauth.getParameter(message.parameters, "oauth_signature") + "=";
    console.log("Non-Encode Signature: " + sig);
    var encodedSig = oauth.percentEncode(sig); //finally you got oauth signature
    console.log("Encoded Signature: " + encodedSig);

    Parse.Cloud.httpRequest({
        method: 'POST',
        url: urlLink,
        headers: {
            "Authorization": 'OAuth oauth_consumer_key="'+oauth_consumer_key+'", oauth_nonce=' + nonce + ', oauth_signature=' + encodedSig + ', oauth_signature_method="HMAC-SHA1", oauth_timestamp=' + timestamp + ',oauth_token="'+oauth_token+'", oauth_version="1.0"'
        },
        body: "status="+status,
        success: function(httpResponse) {
            response.success(httpResponse.text);
        },
        error: function(httpResponse) {
            response.error("Request failed with response " + httpResponse.error);
        }
    });
});
