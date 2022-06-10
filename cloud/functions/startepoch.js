//start a new epoch
//1. archive old epoch(if have)
//2. create epoch data
//3. create puzzle objects
//4. create unsolved puzzle list
//5. create solved puzzle list
//6. create solving puzzle list
//7. create solved-count player rank list
//8. create hard-puzzle rank list
Parse.Cloud.define('startepoch', ()=>
{
	//console.log("startepoch called!");
	return 'startepoch called!';
});