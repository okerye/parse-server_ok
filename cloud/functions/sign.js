md5 = require('js-md5');

var SignUpSeed = Parse.Object.extend("SignUpSeed");
Parse.Cloud.define("getausername", () => {
	const query = new Parse.Query(SignUpSeed);
	var username;
	var password;
	query.first().then((seed)=>{
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
	}, (err)=>{
		
	});
	return [username, password];
});