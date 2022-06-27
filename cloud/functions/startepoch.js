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
var LevelData = Parse.Object.extend("LevelData");
var UnsolvedPuzzleList = Parse.Object.extend("UnsolvedPuzzleList");
var SolvedPuzzleList = Parse.Object.extend("SolvedPuzzleList");
var SolvingPuzzleList = Parse.Object.extend("SolvingPuzzleList");
var SolvedCountPlayerRankList = Parse.Object.extend("SolvedCountPlayerRankList");
var HardPuzzleRankList = Parse.Object.extend("HardPuzzleRankList");

var puzzlecount = 5;
Parse.Cloud.define("startepoch", () => {	
	initEpochData().then((epochdata)=>{

	// return initSolvedPuzzleList(epochdata).then(async(solvedpuzzlelist)=>{

	// 	var epochdata = solvedpuzzlelist.get("epochcode");
	// 	await epochdata.fetch();
	//   epochdata.set('SolvedPuzzleList', solvedpuzzlelist);
	//   return epochdata.save();
	// })}).then((epochdata)=>{

	// return initSolvingPuzzleList(epochdata).then(async(solvingpuzzlelist)=>{

	// 	var epochdata = solvingpuzzlelist.get("epochcode");
	// 	await epochdata.fetch();
	//   epochdata.set('SolvingPuzzleList', solvingpuzzlelist);
	//   return epochdata.save();

	// })}).then((epochdata)=>{

	// return initSolvedCountPlayerRankList(epochdata).then(async(solvedcountplayerranklist)=>{

	// 	var epochdata = solvedcountplayerranklist.get("epochcode");
	// 	await epochdata.fetch();
	//   epochdata.set('SolvedCountPlayerRankList', solvedcountplayerranklist);
	//   return epochdata.save();
	// })}).then((epochdata)=>{

	// return initHardPuzzleRankList(epochdata).then(async(hardpuzzleranklist)=>{

	// 	var epochdata = hardpuzzleranklist.get("epochcode");
	// 	await epochdata.fetch();
	//   epochdata.set('HardPuzzleRankList', hardpuzzleranklist);
	//   return epochdata.save();
	// })}).then((epochdata)=>{

		return initLevelDatas(epochdata);
		
	// }).then((puzzlelist)=>{
	// 	return initUnsolvedPuzzleList(puzzlelist).then(async(puzzlelist)=>{

	// 	var epochdata = puzzlelist.get("epochcode");
	// 	await epochdata.fetch();
	//   epochdata.set('UnsolvedPuzzleList', puzzlelist);
	//   epochdata.set('totalunsolved', puzzlelist.get('puzzlecount'));
	//   return epochdata.save();
	// });
	});


	return 'Done';

});

function initEpochData(){
	const query = new Parse.Query(EpochData);
	query.equalTo("isend", false);
	var promises = []
	return query.find().then((results)=>{
		for(let i = 0; i < results.length; i++){
			const obj = results[i];
			obj.set('isend', true);
			obj.set('endtime', Date());
			promises.push(obj.save());
		}
		return Promise.all(promises);
	}).then(()=>{
		var edata = new EpochData();
		edata.set('endtime', Date());
		edata.set('isend', false);
		edata.set('totalsolved', 0);
		edata.set('totalunsolved', puzzlecount);
		edata.set('totalsolvedplayercount', 0);
		edata.set('todaysolved', 0);
		edata.set('todaysolvedplayercount', 0);
		const todaydate = new Date();
		edata.set('todaydate', todaydate);
		edata.set('lastdaysolved', 0);
		edata.set('lastdaysolvedplayercount', 0);
		edata.set('lastdaydate', todaydate);
		return edata.save();
	});
};

// function initSolvedPuzzleList(edata){
// 	var solvedpuzzlelist = new SolvedPuzzleList();
// 	var puzzles = null;//this is a parse relation, use add/remove to maintain. should use add always as logic design.
// 	var puzzlecount = 0;
// 	solvedpuzzlelist.set('puzzles', puzzles);
// 	solvedpuzzlelist.set('puzzlecount', puzzlecount);
// 	solvedpuzzlelist.set('epochcode', edata);
// 	var players = null;//this is a parse relation, use add/remove to maintain. should use add always as logic design.
// 	var playercount = 0;
// 	solvedpuzzlelist.set('players', players);
// 	solvedpuzzlelist.set('playercount', playercount);
// 	return solvedpuzzlelist.save();
// };

// function initSolvingPuzzleList(epochdata){
// 	var solvingpuzzlelist = new SolvingPuzzleList();
// 	var puzzle = null;
// 	var player = null;
// 	var solvingendtime = null;
// 	solvingpuzzlelist.set('epochcode', epochdata);
// 	solvingpuzzlelist.set('puzzle', puzzle);
// 	solvingpuzzlelist.set('player', player);
// 	solvingpuzzlelist.set('solvingendtime', solvingendtime);
// 	return solvingpuzzlelist.save();
// };

// function initSolvedCountPlayerRankList(epochdata){
// 	var solvedcountplayerrankList = new SolvedCountPlayerRankList();
// 	var player = null;
// 	var solvedcount = 0;
// 	solvedcountplayerrankList.set('epochcode', epochdata);
// 	solvedcountplayerrankList.set('players', players);
// 	solvedcountplayerrankList.set('solvedcount', solvedcount);
// 	return solvedcountplayerrankList.save();
// };

// function initHardPuzzleRankList(epochdata){
// 	var hardpuzzleranklist = new HardPuzzleRankList();
// 	var puzzle = null;
// 	var playedtimes = 0;
// 	var solvedtimes = 0;
// 	hardpuzzleranklist.set('epochcode', epochdata);
// 	hardpuzzleranklist.set('puzzles', puzzles);
// 	hardpuzzleranklist.set('playedtimes', playedtimes);
// 	hardpuzzleranklist.set('solvedtimes', solvedtimes);
// 	return hardpuzzleranklist.save();
// };

function initLevelDatas(epochdata){
	var promises = [];
	for(var i = 1; i <= puzzlecount; i++)
	{
			const leveldata = require("../../levels/s" + i + ".json");
			leveldata.epochcode = epochdata.id;
			leveldata.hero = null;
			leveldata.playedtimes = 0;
			leveldata.solvedtimes = 0;
			//leveldata.state = 0; //0: idel; 1: playing;
			leveldata.endtime = new Date();
			var leveld = new LevelData();
			promises.push(leveld.save(leveldata));
	};
	return Promise.all(promises);
};


// function initUnsolvedPuzzleList(puzzlelist){
// 	var unsolvedpuzzlelist = new UnsolvedPuzzleList();
// 	var puzzles = [];
// 	var epochdata = puzzlelist[0].get("epochcode");
// 	puzzlelist.forEach((puzzle) => {
// 		puzzles.push(puzzle.id);
// 	});
// 	var puzzlecount = puzzles.length;
// 	unsolvedpuzzlelist.set('epochcode', epochdata);
// 	unsolvedpuzzlelist.set('puzzles', puzzles);
// 	unsolvedpuzzlelist.set('puzzlecount', puzzlecount);
// 	return unsolvedpuzzlelist.save();
// };




