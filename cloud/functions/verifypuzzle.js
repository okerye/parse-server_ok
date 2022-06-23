var LevelData = Parse.Object.extend("LevelData");
var EpochData = Parse.Object.extend("EpochData");

Parse.Cloud.define("verifypuzzle", async(requestpara) => {
	var playerid = requestpara.user.id;
	var puzzlesolvingsteps = requestpara.params.para1;
	console.log("playerid: " + playerid);
	console.log("puzzlesolvingsteps: " + puzzlesolvingsteps);





});