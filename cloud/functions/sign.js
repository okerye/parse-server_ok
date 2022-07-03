md5 = require('js-md5');

var SignUpSeed = Parse.Object.extend("SignUpSeed");
Parse.Cloud.define("getausername", async() => {
	const query = new Parse.Query(SignUpSeed);
	var username;
	var password;
	await query.first().then((seed)=>{
		if(seed === undefined)
		{
			var signupseed = new SignUpSeed();
			var oseed = "helloworld2048";
			var date = new Date();
			const milliseconds = date.getMilliseconds();
			console.log("seed milliseconds:" + milliseconds);
			var hash = md5(oseed + milliseconds);
			signupseed.set('seed',hash);
			signupseed.set('count', 1);
			signupseed.save();
			username = md5(hash+'name');
			password = md5(hash+'pwsd');
		}
		else
		{
			var oseed = seed.get('seed');
			var date = new Date();
			const milliseconds = date.getMilliseconds();
			console.log("seed milliseconds:" + milliseconds);
			var hash = md5(oseed + milliseconds);
			seed.set('seed',hash);
			seed.increment('count', 1);
			seed.save();
			username = md5(hash+'name');
			password = md5(hash+'pwsd');
		}	
		
	});
	var resultjson = {};
	resultjson.username = username;
	resultjson.password = password;
	return resultjson;
});

Parse.Cloud.define("afterSignUp", async(requestpara) => {
	const queryplayer = new Parse.Query(Parse.User);
	const queryepochdata = new Parse.Query(EpochData);

	var playerid = requestpara.user.id;

	queryepochdata.equalTo("isend", false);
	const epochdata = await queryepochdata.first();

	const player = await queryplayer.get(playerid);
	player.set("playerEpochId", ""+epochdata);
	player.set("nickname", player.get("useranme"));
	player.set("challengetime", 0);
	player.set("challengesucceed", 0);
	player.set("practicetime", 0);
	player.set("practicetsucceed", 0);
	player.set("specialvalue", 0);
	await player.save();

	var result = {};
	result.playerEpochId = ""+epochdata;
	result.nickname = player.get("useranme");
	result.challengetime = 0;
	result.challengesucceed = 0;
	result.practicetime = 0;
	result.practicetsucceed = 0;
	result.specialvalue = 0;
	return result;
});