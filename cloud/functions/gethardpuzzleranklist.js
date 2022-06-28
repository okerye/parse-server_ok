var HardPuzzleRankList = Parse.Object.extend("HardPuzzleRankList");

Parse.Cloud.define("gethardpuzzleranklist", async() => {
	const queryhpranklist = new Parse.Query(HardPuzzleRankList);
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
		resultjson.puzzlehero = await obj.get("hero");;
		results.add(resultjson);
	}
	return results;
});