//start a new epoch
//1. archive old epoch(if have)
//2. create epoch data
//3. create puzzle objects
//4. create unsolved puzzle list
//5. create solved puzzle list
//6. create solving puzzle list
//7. create solved-count player rank list
//8. create hard-puzzle rank list

var EpochData = Parse.Object.extend("EpochData");
var testepochdata = {
	"epochcode": "e202201",
	"endtime": ""
};

Parse.Cloud.define('startepoch', ()=>
{
	//console.log("startepoch called!");
	//var promise = new Parse.Promise();
	//var promises = [];
	var epochdata = new EpochData();
	epochdata.save(testepochdata).then(function() {
		return 'startepoch succeeded!';
	});
	//promises.push(epochdata.save(testepochdata));

	//Parse.Promise.when(promises).then(function() {
	//	promise.resolve();
	//});
	return 'startepoch called!';
});