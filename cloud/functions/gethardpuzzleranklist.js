var HardPuzzleRankList = Parse.Object.extend("HardPuzzleRankList");

Parse.Cloud.define("gethardpuzzleranklist", async(requestpara) => {
	const queryhpranklist = new Parse.Query(HardPuzzleRankList);
	const queryplayer = new Parse.Query(Parse.User);
	var playerid = requestpara.user.id;
	const player = await queryplayer.get(playerid);
	const epochcode = await player.get("playerEpochId");
	queryhpranklist.ascending("succeedrate");
	var results = [];
	var hpranklist = await queryhpranklist.find();
	for(let i = 0; i < hpranklist.length; i++){
		const obj = hpranklist[i];
		await obj.fetch();
		const puzzleepoch = await obj.get("puzzleepoch");
		if(epochcode != puzzleepoch)
		{
			obj.destroy();
			continue;
		}
		var resultjson = {};
		resultjson.puzzleid = await obj.get("puzzleid");
		resultjson.puzzlesolvedtimes = await obj.get("solvedtimes");
		resultjson.puzzleplayedtimes = await obj.get("playedtimes");
		const heroid = await obj.get("hero");
		var puzzleheroname = "To be decided";
		if(heroid != null)
		{
			const puzzlehero = await queryplayer.get(heroid);
			puzzleheroname = await puzzlehero.get("nickname");
		}
		resultjson.heronickname = puzzleheroname;
		results.push(resultjson);
	}
	return results;
});