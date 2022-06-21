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
		const puzzlelistid = await epochdata.get("UnsolvedPuzzleList");
		console.log("puzzlelistid Id: " + puzzlelistid);
		await puzzlelistid.fetch();
		const puzzlelistlength = puzzlelistid.get("puzzlecount");
		const puzzlelist = puzzlelistid.get("puzzles");
		puzzleidchosen = puzzlelist[getRandomInt(puzzlelistlength)];
	} 
	else if(puzzletype == "Practice")
	{
		//const querypuzzlelist = new Parse.Query(SolvedPuzzleList);
		const puzzlelistid = await epochdata.get("SolvedPuzzleList");
		console.log("puzzlelistid Id: " + puzzlelistid);
		await puzzlelistid.fetch();
		const puzzlelistlength = puzzlelistid.get("puzzlecount");
		const puzzlelist = puzzlelistid.get("puzzles");
		puzzleidchosen = puzzlelist[getRandomInt(puzzlelistlength)];
	}
	else if(puzzleid != "")
	{
		const querypuzzle = new Parse.Query(LevelData);
		puzzleidchosen = puzzleid;
	}
	console.log("puzzleidchosen Id: " + puzzleidchosen);
	const puzzledataobj = await querylevel.get(puzzleidchosen);
	const puzzledata = await puzzledataobj.get("elements");
	console.log("puzzledata: " + puzzledata);
	const puzzlewidth = await puzzledataobj.get("level_w");
	const puzzleheight = await puzzledataobj.get("level_h");
	const puzzlesinpos = await puzzledataobj.get("singuility_pos");
	const puzzlesolvedtimes = await puzzledataobj.get("solvedtimes");
	const puzzleplayedtimes = await puzzledataobj.get("playedtimes");
	const puzzlehero = await puzzledataobj.get("hero");

	generateplayrecord(puzzledataobj, player);
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

function updatepuzzledata()
{

}

function updateSolvingPuzzleList()
{}

function createDailyChallengePuzzlelist(today)
{
	var dailychallengepuzzlelist = new DailyChallengePuzzlelist();

	dailychallengepuzzlelist.set("today", today);
	dailychallengepuzzlelist.set("challengetimes", 0);
	dailychallengepuzzlelist.set("challengesucceeded", 0);
	dailychallengepuzzlelist.set("challengesucceededplayers", 0);
	return dailychallengepuzzlelist.save();
}

function updateDailyChallengPuzzleList(dailychallengelist, playrecord){

}

function updatePlayerInfo()
{

}

function updateHardPuzzleList(){

}