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
// var testepochdata = {
// 	"epochcode": "e202201",
// 	"endtime": ""
// };



Parse.Cloud.define("startepoch", () => {	
	initEpochData().then((epochdata)=>{
		return initLevelDatas(epochdata);
	}).then((leveldata)=>{
		return initUnsolvedPuzzleList(leveldata);
	});

	// var edata = new EpochData();
	// edata.epochcode = null;
	// edata.endtime = new Date();
	// edata.save().then(function(epochdata){
	// 	var promises = []
	// 	for(var i = 1; i <= 5; i++)
	// 	{
	// 			const leveldata = require("../../levels/s" + i + ".json");
	// 			leveldata.epochcode = epochdata.id;
	// 			leveldata.hero = "";
	// 			leveldata.playedtimes = 0;
	// 			leveldata.solvedtimes = 0;

	// 			var leveld = new LevelData();
	// 			promises.push(leveld.save(leveldata));
	// 	};
	// 	return Promise.all(promises);
	// });
	return 'Done';


  //var promise = new Parse.Promise();		
	//console.log("Creating teams...");		
	// var promises = [];

	// const leveldata = require("../../levels/s1.json");

	// var leveld = new LevelData();
	// 	leveld.save(leveldata);

	// for (var i = 0; i < leveldata.length; i++) {
	// 	var item = leveldata[i];
		
	// 	var leveld = new LevelData();
	// 	leveld.save(item);
	// 	//TEAMS_MAP[item.code] = team;
	// };
	
	
	// Parse.Promise.when(promises).then(function() {
	// 	console.log("All teams created");
	// 	//promise.resolve();		
	// }, function error(err) {
	// 	console.error(err);
	// });	

	// loadJSON( TEAMS_JSON_URL, function( data ) {
 //    for (var i = 0; i < data.length; i++) {
	// 		var item = data[i];
	// 		console.log("Saving team " + item.name);
	// 		if (item.squadMarketValue) {
 //  			item.squadMarketValue = parseFloat(item.squadMarketValue.slice(0, -1).replace(',',''));				
	// 		}
	// 		var team = new Team();
	// 		promises.push(team.save(item));
	// 		TEAMS_MAP[item.code] = team;
	// 	};
		
		
	// 	Parse.Promise.when(promises).then(function() {
	// 		console.log("All teams created");
	// 		//promise.resolve();		
	// 	}, function error(err) {
	// 		console.error(err);
	// 	});			
	// });
});

var EpochData = Parse.Object.extend("EpochData");
var LevelData = Parse.Object.extend("LevelData");
var UnsolvedPuzzleList = Parse.Object.extend("UnsolvedPuzzleList");
var SolvedPuzzleList = Parse.Object.extend("SolvedPuzzleList");
var SolvingPuzzleList = Parse.Object.extend("SolvingPuzzleList");
var SolvedCountPlayerRankList = Parse.Object.extend("SolvedCountPlayerRankList");
var HardPuzzleRankList = Parse.Object.extend("HardPuzzleRankList");

function initLevelDatas(edata){
	var promises = [];
	for(var i = 1; i <= 5; i++)
	{
			const leveldata = require("../../levels/s" + i + ".json");
			leveldata.epochcode = edata.id;
			leveldata.hero = null;
			leveldata.playedtimes = 0;
			leveldata.solvedtimes = 0;

			var leveld = new LevelData();
			promises.push(leveld.save(leveldata));
	};
	return Promise.allSettled(promises);
};

function initEpochData(){

		var edata = new EpochData();
		edata.epochcode = null;
		edata.endtime = new Date();
		// edata.unsolvedpuzzlelist = new UnsolvedPuzzleList();
		// edata.unsolvedpuzzlelist.save();
		// edata.solvedpuzzlelist = new SolvedPuzzleList();
		// edata.solvedpuzzlelist.save();
		// edata.solvingpuzzlelist = new SolvingPuzzleList();
		// edata.solvingpuzzlelist.save();
		// edata.solvedcountplayerrankList = new SolvedCountPlayerRankList();
		// edata.solvedcountplayerrankList.save();
		// edata.hardpuzzleranklist = new HardPuzzleRankList();
		// edata.hardpuzzleranklist.save();
		return edata.save();
};

function initUnsolvedPuzzleList(leveldatas){
	var unsolvedpuzzlelist = new UnsolvedPuzzleList();
	unsolvedpuzzlelist.levels = [];
	leveldatas.forEach((leveldata) => {
		unsolvedpuzzlelist.levels.push(leveldata.id);
	});
	return unsolvedpuzzlelist.save();
};

