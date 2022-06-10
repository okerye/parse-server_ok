//start a new epoch
//1. archive old epoch(if have)
//2. create epoch data
//3. create puzzle objects
//4. create unsolved puzzle list
//5. create solved puzzle list
//6. create solving puzzle list
//7. create solved-count player rank list
//8. create hard-puzzle rank list

var EpochData = Parse.Object.extend("EpochData");
var testepochdata = {
	"epochcode": "e202201",
	"endtime": ""
};

Parse.Cloud.define('startepoch', ()=>
{
	//console.log("startepoch called!");
	//var promise = new Parse.Promise();
	//var promises = [];
	var epochdata = new EpochData();
	epochdata.save(testepochdata).then(function() {
		return 'startepoch succeeded!';
	});
	//promises.push(epochdata.save(testepochdata));

	//Parse.Promise.when(promises).then(function() {
	//	promise.resolve();
	//});
	return 'startepoch called!';
});

Parse.Cloud.define("averageStars", async (request) => {
  const query = new Parse.Query("Review");
  query.equalTo("movie", request.params.movie);
  const results = await query.find();
  let sum = 0;
  for (let i = 0; i < results.length; ++i) {
    sum += results[i].get("stars");
  }
  return sum / results.length;
});

var TEAMS_JSON_URL = "https://gist.githubusercontent.com/jawache/0be7f073eb27762d97cac34972ea3468/raw/e8b4f92e7ca677da38700e43e506971d9d592a2a/premier_teams.json";


Parse.Cloud.define("createTeams", () => {	
  var promise = new Parse.Promise();		
	console.log("Creating teams...");		
	var promises = [];
	$.getJSON( TEAMS_JSON_URL, function( data ) {
    for (var i = 0; i < data.length; i++) {
			var item = data[i];
			console.log("Saving team " + item.name);
			if (item.squadMarketValue) {
  			item.squadMarketValue = parseFloat(item.squadMarketValue.slice(0, -1).replace(',',''));				
			}
			var team = new Team();
			promises.push(team.save(item));
			TEAMS_MAP[item.code] = team;
		};
		
		
		Parse.Promise.when(promises).then(function() {
			console.log("All teams created");
			promise.resolve();		
		}, function error(err) {
			console.error(err);
		});			
	});


	return promise;	
});