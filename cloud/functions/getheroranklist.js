var HeroRankList = Parse.Object.extend("HeroRankList");

Parse.Cloud.define("getheroranklist", async(requestpara) => {
	const queryheroranklist = new Parse.Query(HeroRankList);
	const queryplayer = new Parse.Query(Parse.User);
	var playerid = requestpara.user.id;
	const player = await queryplayer.get(playerid);
	const epochcode = await player.get("playerEpochId");
	queryheroranklist.descending("challengesuccess");
	var results = [];
	var heroranklist = await queryheroranklist.find();
	for(let i = 0; i < heroranklist.length; i++){
		const obj = heroranklist[i];
		await obj.fetch();
		const heroid = await obj.get("playerid");
		const hero = await queryplayer.get(heroid);
		const heroepochcode = await hero.get("playerEpochId");
		if(epochcode != heroepochcode)
			continue;
		var resultjson = {};
		resultjson.nickname = await obj.get("nickname");
		resultjson.challengesuccess = await obj.get("challengesuccess");
		resultjson.challengetimes = await obj.get("challengetimes");
		results.push(resultjson);
	}
	return results;
});