//Scheduled Jobs

getRatesTest = function() {
	//Parse.initialize('myAppId', 'masterID');
	//Parse.serverURL  = 'http://localhost:1337/parse';
	console.log('RunninggetRatesTest');
	var logger = new Parse.Object('Logger');
	logger.set('last', Date());
	logger.set('count', 52);
	logger.set('SourceApp', process.env.APP_ID || 'PlutusFX_TEST');
	console.log('Saved ' + Date() + ' ' + Date().timeStamp);
	//logger.save();
	logger.save().then(function(){
		console.log('SAVED');
	},
		{ 
			function(error) {
			console.log('NOT SAVED');
	    	}
		});
}


/*
Cloud function to get rates from OpenExchangeRates.org and update the
current rate field. Job is run from Parse every 5 mins
*/
getRates = function(request, response){
		
	Parse.Cloud.httpRequest({	
	  url: 'http://openexchangerates.org/api/latest.json?app_id=9d6b0ff7c26a41d59c6ccd7e9db8325d',
	  success: function(httpResponse) {
		  var jsonObj = JSON.parse(httpResponse.text);
		  //console.log(jsonObj.rates);
		  
		  //console.log(httpResponse.headers);
		  
		  //console.log(jsonObj['timestamp']);
		  //console.log(jsonObj['base']);
		  //console.log(jsonObj['disclamer']);
		  //console.log(jsonObj['rates']);
		  
		  var ratesArray = jsonObj['rates'];
		  var alertsArray = [];
		  
		  var alert = Parse.Object.extend("Alerts");
		  var query = new Parse.Query(alert);
		
		  query.equalTo('alertsentdate', null);
		  query.find({
			success: function(results){
				console.log('got Alerts : ' + results.length);
				
				//console.log('Processing Array !');
			    
				for (var i = 0; i < results.length; i++) { 
				  //console.log('Array Item : ' + i);
			      var thisAlert = results[i];
			      //console.log(object.id + ' - ' + object.get('major') + '/' + object.get('minor'));
				  var maj = thisAlert.get('major');
				  var min = thisAlert.get('minor');
				  var thisPair = thisAlert.get('major') + thisAlert.get('minor');
				  var thisRate = Number(ratesArray[min] / ratesArray[maj]).toFixed(5);
				  var thisDeviceToken = thisAlert.get('deviceToken');
				  var thisDirection = '';
				  if(thisAlert.get('above')){
					  thisDirection = 'Above';
				  }
				  else{
					  thisDirection = 'Below';
				  }
				  
				  thisAlert.set('currentrate', Number(thisRate));
				  				  
				  //Ignore Simulator entries
				  if(thisDeviceToken != 'Bills Macbook Air'){
					  
					  var dateNow = new Date;

					  //Check Above / Below Alerts
					  if(thisDirection == 'Above' && thisRate > thisAlert.get('rate')){
						  var alertString = 'Limit Alert : ' + thisPair + ' ' + 'above' + ' ' + thisAlert.get('rate') + '\n' + '(Latest : ' + thisRate + ')';
						  console.log('dir is Above ' + alertString + ' ' + thisDirection);
						  thisAlert.set('alertsentdate', dateNow);
					  	  PushAlertToUserDevice(alertString, thisDeviceToken);
						}
					  if(thisDirection == 'Below' && thisRate < thisAlert.get('rate')){
						 var alertString = 'Limit Alert : ' + thisPair + ' ' + 'below' + ' ' + thisAlert.get('rate') + '\n' + '(Latest : ' + thisRate + ')';
						 console.log('dir is Below ' + alertString + ' ' + thisDirection);
					  	 thisAlert.set('alertsentdate', dateNow);
						 PushAlertToUserDevice(alertString, thisDeviceToken);							
						}
				  }
				  alertsArray.push(thisAlert);   //Add the updated Alert to the Array !!
			    }
				
			    // save all the newly created objects in a single hit
				//console.log('Saving Array')
			    Parse.Object.saveAll(alertsArray, {
			        success: function(savedArray) {
			            // objects have been saved...
						console.log('Job Concluded - Alert Array Saved : ' + alertsArray.length);
						console.log(Date());
						response.success('success');
			        },
			        error: function(error) { 
			            // an error occurred...
						console.log('Error saving Alerts Array');
						condole.log(error.toJson);
						response.error(error);
			        }
			    });
				//response.success('Rates Update - Success');  
			},
			error: function(error){
				console.log('Could not get alerts');
				console.log(query.error);
				response.error(error);
			}
			
		});  
	  },
	  
	  error: function(httpResponse) {
		  
	    console.error('Request failed with response code ' + httpResponse.status);
		request.error('Request failed with response code ' + httpResponse.status);
	  }
	});	
};