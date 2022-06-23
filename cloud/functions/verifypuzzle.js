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
	const currentgameid = await player.get("currentgame");
	const epochcode = await player.get("playerEpochId");
	const currentgame = await querycurrentgame.get(currentgameid);
	
	const puzzleid = await currentgame.get("puzzleid");
	const currenpuzzle = await querypuzzledata.get(puzzleid);
	const endtime = await currenpuzzle.get("endgame");
	const epochdata = await queryepochdata.get(epochcode);
	const now = Date();
	if(now < endtime) //complete challenge
	{
		//check if it is right todo 
		var isright = checkanswer(puzzlesolvingsteps, currenpuzzle.get("elements"));
		if(!isright)
			return false;
		if(puzzletype == "challenge")
		{			
			currenpuzzle.set("hero", playerid);			
			epochdata.increment("totalsolved");
			const totalunsolvednumber = epochdata.get("totalunsolved") - 1;
			epochdata.set("totalunsolved", totalunsolvednumber);
		}
		else if(puzzletype == "practice")
		{

		}
		player.increment("solvedtimes");
		currentgame.set("solution",puzzlesolvingsteps);
		currenpuzzle.increment("solvedtimes");
		//currenpuzzle.set("state", 0);
		await currentgame.save();
		await currenpuzzle.save();
		await player.save();
		await epochdata.save();


		return true;
	}
	return false;

});

function checkanswer(actionsteps, puzzle)
{
	return true;
}