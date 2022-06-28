var HardPuzzleRankList = Parse.Object.extend("HardPuzzleRankList");

Parse.Cloud.define("gethardpuzzleranklist", async() => {
	const queryhpranklist = new Parse.Query(HardPuzzleRankList);
	const queryplayer = new Parse.Query(Parse.User);
	queryhpranklist.descending("succeedrate");
	var results = [];
	var hpranklist = await queryhpranklist.find();
	for(let i = 0; i < hpranklist.length; i++){
		const obj = hpranklist[i];
		await obj.fetch();
		var resultjson = {};
		resultjson.puzzleid = await obj.get("puzzleid");
		resultjson.puzzlesolvedtimes = await obj.get("solvedtimes");
		resultjson.puzzleplayedtimes = await obj.get("playedtimes");
		const heroid = await obj.get("hero");;
		const puzzlehero = await queryplayer.get(heroid);
		const puzzleheroname = await puzzlehero.get("nickname");
		resultjson.heronickname = puzzleheroname;
		results.push(resultjson);
	}
	return results;
});