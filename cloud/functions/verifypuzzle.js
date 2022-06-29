var LevelData = Parse.Object.extend("LevelData");
var EpochData = Parse.Object.extend("EpochData");
var PlayeRecord = Parse.Object.extend("PlayeRecord");

Parse.Cloud.define("verifypuzzle", async(requestpara) => {
	const queryplayer = new Parse.Query(Parse.User);
	const querycurrentgame = new Parse.Query(PlayeRecord);
	const querypuzzledata = new Parse.Query(LevelData);
	const queryepochdata = new Parse.Query(EpochData);

	var playerid = requestpara.user.id;
	var puzzlesolvingsteps = requestpara.params.para1;
	var puzzletype = requestpara.params.para2;
	console.log("playerid: " + playerid);
	console.log("puzzlesolvingsteps: " + puzzlesolvingsteps);
	const player = await queryplayer.get(playerid);
	console.log("state: " + 1);
	const currentgameid = await player.get("currentgame");
	console.log("state: " + 2);
	const epochcode = await player.get("playerEpochId");
	console.log("currentgameid.id: " + currentgameid.id);
	const currentgame = await querycurrentgame.get(currentgameid.id);
	console.log("currentgame: " + currentgame);
	const puzzleid = await currentgame.get("puzzleid");
	const currenpuzzle = await querypuzzledata.get(puzzleid.id);
	const endtime = await currenpuzzle.get("endtime");
	const epochdata = await queryepochdata.get(epochcode);
	console.log("epochdata: " + epochdata);
	const now = new Date();
	console.log("now < endtime: " + (now < endtime) + "puzzletype == \"practice\"" + (puzzletype == "practice"));
	if(now < endtime || puzzletype == "practice") //complete challenge
	{
		//todo: check if it is right  
		var isright = checkanswer(puzzlesolvingsteps, currenpuzzle.get("elements"));
		if(!isright)
			return false;
		if(puzzletype == "challenge")
		{			
			console.log("currenpuzzle: " + currenpuzzle.id);
			currenpuzzle.set("hero", playerid);			
			epochdata.increment("totalsolved");
			const totalunsolvednumber = epochdata.get("totalunsolved") - 1;
			epochdata.set("totalunsolved", totalunsolvednumber);
			const playersolved = player.get("challengesuccess");
			if(playersolved == 0)
			{
				epochdata.increment("totalsolvedplayercount");
			}
			player.increment("challengesuccess");
			const playersolvedlastdate = player.get("solvedlastdate");
			var today = new Date(new Date().setHours(0,0,0,0));
			if(playersolvedlastdate != today)
			{
				player.set("solvedlastdate", today);

			}
			if(epochdata.get("todaydate") != today)
			{
				epochdata.set('lastdaysolved', epochdata.get('todaysolved'));
				epochdata.set('lastdaysolvedplayercount', epochdata.get('todaysolved'));
				epochdata.set('lastdaydate',epochdata.get('todaydate'));
				epochdata.set('todaysolved', 1);
				epochdata.set('todaysolvedplayercount', 1);
				epochdata.set('todaydate',today);
			}
			else
			{
				epochdata.increment("todaysolved");
				if(playersolvedlastdate != today)
				{
					epochdata.increment("todaysolvedplayercount");
				}
			}
			currentgame.set("solution",puzzlesolvingsteps);
		}
		else if(puzzletype == "practice")
		{
			player.increment("practicesuccess");
		}
		console.log("currentgame: " + currentgame.id);
		
		currenpuzzle.increment("solvedtimes");
		//currenpuzzle.set("state", 0);
		await currentgame.save();
		await currenpuzzle.save();
		await player.save(null, { useMasterKey: true});
		await epochdata.save();
		await updateHardPuzzleRankList(puzzleid)
		await updateHeroRankList(player);

		return true;
	}
	return false;

});

function checkanswer(actionsteps, puzzle)
{
	return true;
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


var HeroRankList = Parse.Object.extend("HeroRankList");
async function updateHeroRankList(player){
	const queryheroranklist = new Parse.Query(HeroRankList);
	queryheroranklist.ascending("challengesuccess");

	var heroranklist = await queryheroranklist.find();
	await player.fetch();

	for(let i = 0; i < heroranklist.length; i++){
		const obj = heroranklist[i];
		await obj.fetch();
		if(obj.get("playerid") == player.id)
		{
			obj.destroy();
			addtoHeroRankList(player);
			return;
		}
	}

	if(heroranklist.length < 5)
	{
		await addtoHeroRankList(player);
		return;
	}
	var samesolvedplayer = [];
	for(let i = 0; i < heroranklist.length; i++){
		const obj = heroranklist[i];
		await obj.fetch();
		if(obj.get("challengesuccess") < player.get("challengesuccess"))
		{
			obj.destroy();
			addtoHeroRankList(player);
			return;
		}
		else if(obj.get("challengesuccess") == player.get("challengesuccess"))
		{
			samesolvedplayer.push(obj);
		}
		else
		{
			return;
		}
	}	
	var targetobj = null;
	//console.log("sameratepuzzle:" + sameratepuzzle);
	for(let j = 0; j< samesolvedplayer.length; j++){
		var mosttimes = player.get("challengetimes");
		var obj = samesolvedplayer[j]; 
		await obj.fetch();
		if(obj.get("challengetimes") > mosttimes)
		{
			mosttimes = obj.get("challengetimes");
			targetobj = obj;			
		}
	}
	if(targetobj != null)
	{
		targetobj.destroy();
		addtoHeroRankList(player);	
	}

	return;
}

async function addtoHeroRankList(player)
{
	await player.fetch();
	var heroranklist = new HeroRankList();
	heroranklist.set('playerid', player.id);
	heroranklist.set('nickname', player.get("nickname"));
	heroranklist.set('challengesuccess', player.get("challengesuccess"));
	heroranklist.set('challengetimes', player.get("challengetimes"));
	return heroranklist.save();
}
