var LevelData = Parse.Object.extend("LevelData");
var EpochData = Parse.Object.extend("EpochData");
var UnsolvedPuzzleList = Parse.Object.extend("UnsolvedPuzzleList");
var SolvedPuzzleList = Parse.Object.extend("SolvedPuzzleList");
var SolvingPuzzleList = Parse.Object.extend("SolvingPuzzleList");
Parse.Cloud.define("getpuzzle", async(requestpara) => {
	const querylevel = new Parse.Query(LevelData);
	const queryepochdata = new Parse.Query(EpochData);
	const queryplayer = new Parse.Query(Parse.User);
	var playerid = requestpara.user.id;
	var puzzletype = requestpara.params.para1;
	var puzzleid = requestpara.params.para2;
	var playerepochid = requestpara.params.para3;
	console.log("Player Id: " + playerid);

	const player = await queryplayer.get(playerid);
	const epochcode = await player.get("playerEpochId");

	console.log("epoch Id: " + epochcode);
	epochdata = await queryepochdata.get(epochcode);
	
	
	var puzzleidchosen;
	if(puzzletype == "Challenge")
	{
		//querylevel.equalTo("epochcode", epochcode);
		querylevel.equalTo("state", 0);//0: unsolved puzzle
		const puzzleidchosen = await querylevel.first();
		// const puzzlelistid = await epochdata.get("UnsolvedPuzzleList");
		 console.log("puzzlelistid Id: " + puzzleidchosen.id);
		// await puzzlelistid.fetch();
		// const puzzlelistlength = puzzlelistid.get("puzzlecount");
		// const puzzlelist = puzzlelistid.get("puzzles");
		// puzzleidchosen = puzzlelist[getRandomInt(puzzlelistlength)];
	} 
	else if(puzzletype == "Practice")
	{
		querylevel.equalTo("epochcode", epochcode);
		querylevel.equalTo("state", 1);//1: solved puzzle
		const puzzleidchosen = await querylevel.first();
		// //const querypuzzlelist = new Parse.Query(SolvedPuzzleList);
		// const puzzlelistid = await epochdata.get("SolvedPuzzleList");
		// console.log("puzzlelistid Id: " + puzzlelistid);
		// await puzzlelistid.fetch();
		// const puzzlelistlength = puzzlelistid.get("puzzlecount");
		// const puzzlelist = puzzlelistid.get("puzzles");
		// puzzleidchosen = puzzlelist[getRandomInt(puzzlelistlength)];
	}
	else if(puzzleid != "")
	{
		const querypuzzle = new Parse.Query(LevelData);
		puzzleidchosen = puzzleid;
	}
	//console.log("puzzleidchosen Id: " + puzzleidchosen);
	const puzzledataobj = puzzleidchosen;//await querylevel.get(puzzleidchosen);
	const puzzledata =  puzzledataobj.elements;
	console.log("puzzledata: " + puzzledata);
	const puzzlewidth =  puzzledataobj.level_w;
	const puzzleheight =  puzzledataobj.level_h;
	const puzzlesinpos =  puzzledataobj.singuility_pos;
	const puzzlesolvedtimes =  puzzledataobj.solvedtimes;
	const puzzleplayedtimes =  puzzledataobj.playedtimes;
	const puzzlehero =  puzzledataobj.hero;

	//generateplayrecord(puzzledataobj, player);
	//updatepuzzledata(puzzleidchosen);
	//updatePlayerInfo(puzzletype, player);
	var resultjson = {};
	 resultjson.puzzledata = puzzledata;	 
	 resultjson.puzzlewidth = puzzlewidth;
	 resultjson.puzzleheight = puzzleheight;
	 resultjson.puzzlesinpos = puzzlesinpos;
	 resultjson.puzzlesolvedtimes = puzzlesolvedtimes;
	 resultjson.puzzleplayedtimes = puzzleplayedtimes;
	 resultjson.puzzlehero = puzzlehero;
	return resultjson;
});


function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
var PlayeRecord = Parse.Object.extend("PlayeRecord");
var DailyChallengePuzzlelist = Parse.Object.extend("DailyChallengePuzzlelist");
async function generateplayrecord(puzzleid, playerid)
{
	var playrecord = new PlayeRecord();
	playrecord.set("puzzleid", puzzleid);
	playrecord.set("playerid", playerid);
	playrecord.set("solution", "");
	const querydailychallengelist = new Parse.Query(DailyChallengePuzzlelist);
	var today = new Date().toLocaleDateString();
	querydailychallengelist.equalTo("today", today);
	var dailychallengelist = await querydailychallengelist.first();
	if(dailychallengelist == null)
	{
		dailychallengelist = await createDailyChallengePuzzlelist(today);
	}

	playrecord.set("dailylist", dailychallengelist);
	await playrecord.save();
	updateDailyChallengPuzzleList(dailychallengelist, playrecord);
}

async function updatepuzzledata(puzzleid)
{
	const querylevel = new Parse.Query(LevelData);
	const puzzledataobj = await querylevel.get(puzzleid);
	puzzledataobj.increment("playedtimes");
	puzzledataobj.save();
}


function createDailyChallengePuzzlelist(today)
{
	var dailychallengepuzzlelist = new DailyChallengePuzzlelist();

	dailychallengepuzzlelist.set("today", today);
	dailychallengepuzzlelist.set("challengetimes", 0);
	dailychallengepuzzlelist.set("challengesucceeded", 0);
	dailychallengepuzzlelist.set("challengesucceededplayers", 0);
	return dailychallengepuzzlelist.save();
}

async function updateDailyChallengPuzzleList(dailychallengelist, playrecord){
	await dailychallengelist.fetch();
	var dailychallenges = dailychallengelist.relation("dailychallengelist");
	dailychallenges.add(playrecord);
	dailychallengelist.increment("challengetimes");
	return dailychallengelist.save();
}

async function updatePlayerInfo(puzzletype, player)
{
	await player.fetch();
	if(puzzletype == "Challenge")
	{
		player.increment("challengetimes");
	}
	else if(puzzletype == "Practice")
	{ 
		player.increment("practicetimes");
	}
	return player.save();
}

async function updateHardPuzzleRandList(hardpuzzlerandlist, puzzle){
	// await hardpuzzlerandlist.fetch(); 
	// var puzzles = await hardpuzzlerandlist.get("puzzles");
	// puzzles.add(puzzle);
	// hardpuzzlerandlist.set("puzzles", puzzles);
	// var playedtimes = await hardpuzzlerandlist.get("playedtimes");
	// playedtime = await puzzle.get("playedtimes");
	// playedtimes.add(playedtime);	
	// hardpuzzlerandlist.set("playedtimes", playedtimes);
	// var solvedtimes = await hardpuzzlerandlist.get("solvedtimes");
	// solvedtime = await puzzle.get("solvedtimes");
	// solvedtimes.add(solvedtime);
	// hardpuzzlerandlist.set("solvedtimes", solvedtimes);
	// return solvingpuzzlelist.save();
}