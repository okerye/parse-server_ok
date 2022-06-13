//start a new epoch
//1. archive old epoch(if have)
//2. create epoch data
//3. create puzzle objects
//4. create unsolved puzzle list
//5. create solved puzzle list
//6. create solving puzzle list
//7. create solved-count player rank list
//8. create hard-puzzle rank list

// var testepochdata = {
// 	"epochcode": "e202201",
// 	"endtime": ""
// };


var EpochData = Parse.Object.extend("EpochData");
var LevelData = Parse.Object.extend("LevelData");
var UnsolvedPuzzleList = Parse.Object.extend("UnsolvedPuzzleList");
var SolvedPuzzleList = Parse.Object.extend("SolvedPuzzleList");
var SolvingPuzzleList = Parse.Object.extend("SolvingPuzzleList");
var SolvedCountPlayerRankList = Parse.Object.extend("SolvedCountPlayerRankList");
var HardPuzzleRankList = Parse.Object.extend("HardPuzzleRankList");


Parse.Cloud.define("startepoch", () => {	
	initEpochData().then((epochdata)=>{

	return initSolvedPuzzleList(epochdata).then(async(solvedpuzzlelist)=>{

		var epochdata = solvedpuzzlelist.get("epochcode");
		await epochdata.fetch();
	  epochdata.set('SolvedPuzzleList', solvedpuzzlelist);
	  return epochdata.save();
	})}).then((epochdata)=>{

	return initSolvingPuzzleList(epochdata).then(async(solvingpuzzlelist)=>{

		var epochdata = solvingpuzzlelist.get("epochcode");
		await epochdata.fetch();
	  epochdata.set('SolvingPuzzleList', solvingpuzzlelist);
	  return epochdata.save();

	})}).then((epochdata)=>{

	return initSolvedCountPlayerRankList(epochdata).then(async(solvedcountplayerranklist)=>{

		var epochdata = solvedcountplayerranklist.get("epochcode");
		await epochdata.fetch();
	  epochdata.set('SolvedCountPlayerRankList', solvedcountplayerranklist);
	  return epochdata.save();
	})}).then((epochdata)=>{

	return initHardPuzzleRankList(epochdata).then(async(hardpuzzleranklist)=>{

		var epochdata = hardpuzzleranklist.get("epochcode");
		await epochdata.fetch();
	  epochdata.set('HardPuzzleRankList', hardpuzzleranklist);
	  return epochdata.save();
	})}).then((epochdata)=>{
		return initLevelDatas(epochdata);
	}).then((puzzlelist)=>{
		return initUnsolvedPuzzleList(puzzlelist);
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

function initEpochData(){

		var edata = new EpochData();
		edata.set('endtime', Date());
		return edata.save();
};

function initSolvedPuzzleList(edata){
	var solvedpuzzlelist = new SolvedPuzzleList();
	var puzzles = [];
	var puzzlecount = 0;
	solvedpuzzlelist.set('puzzles', puzzles);
	solvedpuzzlelist.set('puzzlecount', puzzlecount);
	solvedpuzzlelist.set('epochcode', edata);
	var players = [];
	var playercount = 0;
	solvedpuzzlelist.set('players', players);
	solvedpuzzlelist.set('playercount', playercount);
	return solvedpuzzlelist.save();
};

function initSolvingPuzzleList(epochdata){
	var solvingpuzzlelist = new SolvingPuzzleList();
	var puzzles = [];
	var players = [];
	var solvingendtime = [];
	solvingpuzzlelist.set('epochcode', epochdata);
	solvingpuzzlelist.set('puzzles', puzzles);
	solvingpuzzlelist.set('players', players);
	solvingpuzzlelist.set('solvingendtime', solvingendtime);
	var puzzlecount = 0;
	solvingpuzzlelist.set('puzzlecount', puzzlecount);
	return solvingpuzzlelist.save();
};

function initSolvedCountPlayerRankList(epochdata){
	var solvedcountplayerrankList = new SolvedCountPlayerRankList();
	var players = [];
	var solvedcount = [];
	solvedcountplayerrankList.set('epochcode', epochdata);
	solvedcountplayerrankList.set('players', players);
	solvedcountplayerrankList.set('solvedcount', solvedcount);
	return solvedcountplayerrankList.save();
};

function initHardPuzzleRankList(epochdata){
	var hardpuzzleranklist = new HardPuzzleRankList();
	var puzzles = [];
	var playedtimes = [];
	var solvedtimes = [];
	hardpuzzleranklist.set('epochcode', epochdata);
	hardpuzzleranklist.set('puzzles', puzzles);
	hardpuzzleranklist.set('playedtimes', playedtimes);
	hardpuzzleranklist.set('solvedtimes', solvedtimes);
	return hardpuzzleranklist.save();
};

function initLevelDatas(epochdata){
	var promises = [];
	for(var i = 1; i <= 5; i++)
	{
			const leveldata = require("../../levels/s" + i + ".json");
			leveldata.epochcode = epochdata;
			leveldata.hero = null;
			leveldata.playedtimes = 0;
			leveldata.solvedtimes = 0;

			var leveld = new LevelData();
			promises.push(leveld.save(leveldata));
	};
	return Promise.all(promises);
};


function initUnsolvedPuzzleList(puzzlelist){
	var unsolvedpuzzlelist = new UnsolvedPuzzleList();
	var puzzles = [];
	var epochcode = puzzlelist[0].epochcode;
	puzzlelist.forEach((puzzle) => {
		puzzles.push(puzzle.id);
	});
	var puzzlecount = puzzles.length;
	unsolvedpuzzlelist.set('epochcode', epochcode);
	unsolvedpuzzlelist.set('puzzles', puzzles);
	unsolvedpuzzlelist.set('puzzlecount', puzzlecount);
	return unsolvedpuzzlelist.save();
};




