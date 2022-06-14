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
		return initUnsolvedPuzzleList(puzzlelist).then(async(puzzlelist)=>{

		var epochdata = puzzlelist.get("epochcode");
		await epochdata.fetch();
	  epochdata.set('UnsolvedPuzzleList', puzzlelist);
	  return epochdata.save();
	});
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
		return Parse.all(promises);
	}).then(()=>{
		var edata = new EpochData();
		edata.set('endtime', Date());
		edata.set('isend', false);
		return edata.save();
	});
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
	var epochdata = puzzlelist[0].get("epochcode");
	puzzlelist.forEach((puzzle) => {
		puzzles.push(puzzle.id);
	});
	var puzzlecount = puzzles.length;
	unsolvedpuzzlelist.set('epochcode', epochdata);
	unsolvedpuzzlelist.set('puzzles', puzzles);
	unsolvedpuzzlelist.set('puzzlecount', puzzlecount);
	return unsolvedpuzzlelist.save();
};




