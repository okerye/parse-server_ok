var LevelData = Parse.Object.extend("LevelData");
Parse.Cloud.define("getpuzzle", async(requestpara) => {
	const query = new Parse.Query(LevelData);
	var puzzletype = requestpara.params.para1;
	var puzzleid = requestpara.params.para2;
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