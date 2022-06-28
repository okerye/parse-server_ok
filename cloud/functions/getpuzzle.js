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

	console.log("epoch Id: " + epochcode);
	var epochdata = await queryepochdata.get(epochcode);
	var today = new Date(new Date().setHours(0,0,0,0));

	if(epochdata.get("todaydate") != today)
	{
		epochdata.set('lastdaysolved', epochdata.get('todaysolved'));
		epochdata.set('lastdaysolvedplayercount', epochdata.get('todaysolved'));
		epochdata.set('lastdaydate',epochdata.get('todaydate'));
		epochdata.set('todaysolved', 0);
		epochdata.set('todaysolvedplayercount', 0);
		epochdata.set('todaydate',today);
		epochdata.save();
	}

	var puzzleidchosen;
	if(puzzleid != "")
	{
		puzzleidchosen = puzzleid;
	}
	else
	{
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
			//puzzlestate = await puzzleidchosen.get("state")
			//if(puzzlestate == 1)
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
			// else
			// {
			// 	idlepuzzle = true;
			// 	console.log("puzzleidchosen.state == 0");
			// }	
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
	const puzzleheroid = await puzzledataobj.get("hero");
	const puzzlehero = await queryplayer.get(puzzleheroid);
	const puzzleheroname = await puzzlehero.get("nickname");

	const record = await generateplayrecord(puzzledataobj, player);
	console.log("generateplayrecord: " + record);
	await updatepuzzledata(puzzledataobj, puzzletype);
	await updatePlayerInfo(puzzletype, player, record);
	await updateHardPuzzleRankList(puzzledataobj)
	var resultjson = {};
	 resultjson.level_w = puzzlewidth;	 
	 resultjson.level_h = puzzleheight;
	 resultjson.singuility_pos = puzzlesinpos;
	 resultjson.elements = puzzledata;
	 resultjson.puzzleid = puzzledataobj;
	 resultjson.puzzlesolvedtimes = puzzlesolvedtimes;
	 resultjson.puzzleplayedtimes = puzzleplayedtimes;
	 resultjson.puzzlehero = puzzleheroname;
	return resultjson;
});


function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}


var PlayeRecord = Parse.Object.extend("PlayeRecord");
//var DailyChallengePuzzlelist = Parse.Object.extend("DailyChallengePuzzlelist");


async function generateplayrecord(puzzleid, playerid)
{
	var playrecord = new PlayeRecord();
	playrecord.set("puzzleid", puzzleid);
	playrecord.set("playerid", playerid);
	playrecord.set("solution", []);
	//const querydailychallengelist = new Parse.Query(DailyChallengePuzzlelist);
	// var today = new Date().toLocaleDateString();
	//querydailychallengelist.equalTo("today", today);
	// var dailychallengelist = await querydailychallengelist.first();
	// if(dailychallengelist == null)
	// {
	// 	dailychallengelist = await createDailyChallengePuzzlelist(today);
	// }

	// playrecord.set("dailylist", dailychallengelist);
	await playrecord.save();
	//updateDailyChallengPuzzleList(dailychallengelist, playrecord);
	return playrecord;
}

async function updatepuzzledata(puzzleid, puzzletype)
{
	const querylevel = new Parse.Query(LevelData);
	const puzzledataobj = puzzleid;//await querylevel.get(puzzleid);
	puzzledataobj.increment("playedtimes");
	//puzzledataobj.set("state", 1);//1: solving
	if(puzzletype == "Challenge")
	{const endtime = new Date((new Date()).getTime()+1*60000);}
	puzzledataobj.set("endtime", endtime);
	puzzledataobj.save();
}


// function createDailyChallengePuzzlelist(today)
// {
// 	var dailychallengepuzzlelist = new DailyChallengePuzzlelist();

// 	dailychallengepuzzlelist.set("today", today);
// 	dailychallengepuzzlelist.set("challengetimes", 0);
// 	dailychallengepuzzlelist.set("challengesucceeded", 0);
// 	dailychallengepuzzlelist.set("challengesucceededplayers", 0);
// 	return dailychallengepuzzlelist.save();
// }

// async function updateDailyChallengPuzzleList(dailychallengelist, playrecord){
// 	await dailychallengelist.fetch();
// 	var dailychallenges = dailychallengelist.relation("dailychallengelist");
// 	dailychallenges.add(playrecord);
// 	dailychallengelist.increment("challengetimes");
// 	return dailychallengelist.save();
// }

async function updatePlayerInfo(puzzletype, player, playrecord)
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
	player.set("currentgame", playrecord);
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
		await obj.fetch();
		if(obj.get("puzzleid") == puzzle.id)
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
	var sameratepuzzle = [];
	for(let i = 0; i < hpranklist.length; i++){
		const obj = hpranklist[i];
		await obj.fetch();
		if(obj.get("succeedrate") > puzzle.get("solvedtimes")/puzzle.get("playedtimes"))
		{
			obj.destroy();
			addtoHardPuzzleRankList(puzzle);
			return;
		}
		else if(obj.get("succeedrate") == puzzle.get("solvedtimes")/puzzle.get("playedtimes"))
		{
			sameratepuzzle.push(obj);
		}
		else
		{
			return;
		}
	}	
	var targetobj = null;
	//console.log("sameratepuzzle:" + sameratepuzzle);
	for(let j = 0; j< sameratepuzzle.length; j++){
		var leasttimes = puzzle.get("playedtimes");
		var obj = sameratepuzzle[j]; 
		await obj.fetch();
		if(obj.get("playedtimes") < leasttimes)
		{
			leasttimes = obj.get("playedtimes");
			targetobj = obj;			
		}
	}
	if(targetobj != null)
	{
		targetobj.destroy();
		addtoHardPuzzleRankList(puzzle);	
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
	await puzzle.fetch();
	var hpranklist = new HardPuzzleRankList();
	hpranklist.set('puzzleid', puzzle.id);
	hpranklist.set('puzzleepoch', puzzle.get("epochcode"));
	//var playedtimes = await puzzle.get("playedtimes");
	hpranklist.set('playedtimes', puzzle.get("playedtimes"));
	//var solvedtimes = await puzzle.get("solvedtimes");
	hpranklist.set('solvedtimes', puzzle.get("solvedtimes"));
	hpranklist.set('succeedrate', puzzle.get("solvedtimes")/puzzle.get("playedtimes"));
	//var hero = await puzzle.get("hero");
	hpranklist.set('hero', puzzle.get("hero"));
	return hpranklist.save();
}
