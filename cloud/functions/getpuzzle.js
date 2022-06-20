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
	const puzzlelistid = await epochdata.get("UnsolvedPuzzleList");
	console.log("puzzlelistid Id: " + puzzlelistid);

	if(puzzletype == "Challenge")
	{
		const querypuzzlelist = new Parse.Query(UnsolvedPuzzleList);

	} 
	else if(puzzletype == "Practice")
	{
		const querypuzzlelist = new Parse.Query(SolvedPuzzleList);
	}
	else if(puzzleid != "")
	{
		const querypuzzle = new Parse.Query(LevelData);
	}

	// await query.first().then((seed)=>{
	// 	if(seed === undefined)
	// 	{
	// 		var signupseed = new SignUpSeed();
	// 		var oseed = "helloworld2048";
	// 		var date = new Date();
	// 		const milliseconds = date.getMilliseconds();
	// 		console.log("seed milliseconds:" + milliseconds);
	// 		var hash = md5(oseed + milliseconds);
	// 		signupseed.set('seed',hash);
	// 		signupseed.set('count', 1);
	// 		signupseed.save();
	// 		username = md5(hash+'name');
	// 		password = md5(hash+'pwsd');
	// 	}
	// 	else
	// 	{
	// 		var oseed = seed.get('seed');
	// 		var date = new Date();
	// 		const milliseconds = date.getMilliseconds();
	// 		console.log("seed milliseconds:" + milliseconds);
	// 		var hash = md5(oseed + milliseconds);
	// 		seed.set('seed',hash);
	// 		seed.increment('count', 1);
	// 		seed.save();
	// 		username = md5(hash+'name');
	// 		password = md5(hash+'pwsd');
	// 	}	
		
	// });
	var resultjson = {};
	// resultjson.username = username;
	// resultjson.password = password;
	return resultjson;
});