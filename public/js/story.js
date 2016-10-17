

    
//Get latest Video Page with Video iFrame and
// the HTML Title and Narrative
function getVideoPage(storyID) {
     
	console.log("PARAMETER storyID : " + storyID);
	
    var query = new Parse.Query("VideoArchive");
	query.limit(1);
	
	if (storyID == "" || storyID == null || storyID == undefined){
		query.descending("date");
	}
	else{
		query.equalTo("objectId",storyID);
	}
    query.first({
        success: function(story) {
            
            //incrementViewCount(storyID);
                        
        // story is an instance of Parse.Object.
            var url = story.get("youTubeURL");
            var title = story.get("title");
            var description = story.get("description");
            var date = story.get("date");
            var iframeurl = 
            
            document.getElementById("title").innerHTML = title;
            document.getElementById("description").innerHTML = description;
            document.getElementById("date").innerHTML = "Published : " + date;
            document.getElementById("frame").src = url;
            
            story.increment("numberOfViews");
            story.save();

        } ,

        error: function (object, error) {
        // error is an instance of Parse.Error.
            //alert(error); remove the alert
            document.getElementById("description").innerHTML = "Error - Could not get data";

        }
    });
  }        


  function processPage() {
      
      var params = location.search.substring(1).split("&");
      var tmp = params[0].split("=");
      var storyid = tmp[1];
      
      //alert("Processing Paramters : " + storyid);
      getVideoPage(storyid);
	  
  }

function getDate() {
	//field.value = (new Date()).toString();
	//field.value = (new Date()).format("ddd dd-mmm-yy");
    //document.getElementById("date").innerHTML = "Published : " + (new Date()).format("ddd dd-mmm-yy");
    //document.getElementById("date").innerHTML = "Published : " + ;

}
    
    
    