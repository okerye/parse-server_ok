var LevelData = Parse.Object.extend("LevelData");
var EpochData = Parse.Object.extend("EpochData");

Parse.Cloud.define("getpuzzle", async(requestpara) => {
	const querylevel = new Parse.Query(LevelData);
	const queryepochdata = new Parse.Query(EpochData);
	const queryplayer = new Parse.Query(Parse.User);
	var playerid = requestpara.user.id;
	var puzzletype = requestpara.params.para1;
	var puzzleid = requestpara.params.para2;
	//var playerepochid = requestpara.params.para3;
	console.log("Player Id: " + playerid);
	const player = await queryplayer.get(playerid);
	const epochcode = await player.get("playerEpochId");
	var puzzleidchosen;
	if(puzzleid != "")
	{
		puzzleidchosen = puzzleid;
	}
	else
	{
		console.log("epoch Id: " + epochcode);
		epochdata = await queryepochdata.get(epochcode);
		
		var puzzlecount = 0;
		querylevel.equalTo("epochcode", epochcode);
		if(puzzletype == "Challenge")
		{
			querylevel.equalTo("solvedtimes", 0);//0: unsolved puzzle
			puzzlecount = await epochdata.get("totalunsolved");
		}
		else if(puzzletype == "Practice")
		{
			querylevel.greaterThan("solvedtimes", 0);//>0: solved puzzle
			puzzlecount = await epochdata.get("totalsolved");
		}
		console.log("puzzlecount: " + puzzlecount);
		var idlepuzzle = false;
		var counter = 0;
		while(!idlepuzzle && counter < puzzlecount*2)
		{
			counter++;
			var skipcount = getRandomInt(puzzlecount);
			console.log("skipcount: " + skipcount);
			querylevel.skip(skipcount);

		    puzzleidchosen = await querylevel.first();
			console.log("puzzlelistid Id: " + puzzleidchosen.id);
			puzzlestate = await puzzleidchosen.get("state")
			if(puzzlestate == 1)
			{
				endtime = await puzzleidchosen.get("endtime");
				const now = new Date();
				if(endtime > now)
				{
					idlepuzzle = false;
					console.log("endtime > now! ");
				}
				else
				{
					idlepuzzle = true;
					console.log("endtime < now! ");
				}	
			}
			else
			{
				idlepuzzle = true;
				console.log("puzzleidchosen.state == 0");
			}	
		}
		if(!idlepuzzle){
			console.log("no availibel puzzle!");
			return null;	
		}
	}
	
	
	//console.log("puzzleidchosen Id: " + puzzleidchosen);
	const puzzledataobj = puzzleidchosen;//await querylevel.get(puzzleidchosen);
	const puzzledata = await puzzleidchosen.get("elements");
	//console.log("puzzledata: " + puzzledata);
	const puzzlewidth = await puzzledataobj.get("level_w");
	const puzzleheight = await puzzledataobj.get("level_h");
	const puzzlesinpos = await puzzledataobj.get("singuility_pos");
	const puzzlesolvedtimes = await puzzledataobj.get("solvedtimes");
	const puzzleplayedtimes = await puzzledataobj.get("playedtimes");
	const puzzlehero = await puzzledataobj.get("hero");

	generateplayrecord(puzzledataobj, player);
	updatepuzzledata(puzzledataobj);
	updatePlayerInfo(puzzletype, player);
	updateHardPuzzleRankList(puzzledataobj)
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
	const puzzledataobj = puzzleid;//await querylevel.get(puzzleid);
	puzzledataobj.increment("playedtimes");
	puzzledataobj.set("state", 1);//1: solving
	const endtime = new Date((new Date()).getTime()+5*60000);
	puzzledataobj.set("endtime", endtime);
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
	return player.save(null, { useMasterKey: true});
}
var HardPuzzleRankList = Parse.Object.extend("HardPuzzleRankList");
async function updateHardPuzzleRankList(puzzle){
	const queryhpranklist = new Parse.Query(HardPuzzleRankList);
	queryhpranklist.descending("succeedrate");
	// var today = new Date().toLocaleDateString();
	// querydailychallengelist.equalTo("today", today);
	var hpranklist = await queryhpranklist.find();
	await puzzle.fetch();

	for(let i = 0; i < hpranklist.length; i++){
		const obj = hpranklist[i];
		if(obj.puzzleid == puzzle.id)
		{
			obj.destroy();
			addtoHardPuzzleRankList(puzzle);
			return;
		}
	}

	if(hpranklist.length < 3)
	{
		await addtoHardPuzzleRankList(puzzle);
		return;
	}
	var sameratepuzzle = [puzzle];
	for(let i = 0; i < hpranklist.length; i++){
		const obj = hpranklist[i];
		if(obj.succeedrate > puzzle.solvedtimes/puzzle.playedtimes)
		{
			obj.destroy();
			addtoHardPuzzleRankList(puzzle);
			return;
		}
		else if(obj.succeedrate == puzzle.solvedtimes/puzzle.playedtimes)
		{
			sameratepuzzle.push(obj);
		}
		else
		{
			return;
		}
	}	
	var targetobj = null;
	for(let j = 0; j< sameratepuzzle.length; j++){
		var leasttimes = puzzle.playedtimes;
		var obj = sameratepuzzle[i];
		if(obj.playedtimes < leasttimes)
		{
			leasttimes = obj.playedtimes;
			targetobj = obj;			
		}
	}
	if(targetobj != null)
	{
		addtoHardPuzzleRankList(puzzle);
		obj.destroy();
	}
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
	return;
}

async function addtoHardPuzzleRankList(puzzle)
{
	await puzzle.fetch()
	var hpranklist = new HardPuzzleRankList();
	hpranklist.set('puzzleid', puzzle.id);
	hpranklist.set('puzzleepoch', puzzle.epochcode);
	//var playedtimes = await puzzle.get("playedtimes");
	hpranklist.set('playedtimes', puzzle.get("playedtimes"));
	//var solvedtimes = await puzzle.get("solvedtimes");
	hpranklist.set('solvedtimes', puzzle.get("solvedtimes"));
	hpranklist.set('succeedrate', puzzle.get("playedtimes")/puzzle.get("solvedtimes"));
	//var hero = await puzzle.get("hero");
	hpranklist.set('hero', puzzle.get("hero"));
	return hpranklist.save();
}