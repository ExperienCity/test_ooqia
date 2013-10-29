'use strict';
function Player() {
	this.ID;
	this.token;
	this.name;
	this.password;	
	this.stationsClaimed = [];
}

Player.prototype.GetStationClaimed =  function () {	
	return this.stationsClaimed.length;
}

Player.prototype.SetStationClaimed =  function (station) {	
	return this.stationsClaimed.push(station);  
}

Player.prototype.GetPlayerToken =  function () {
	return this.token;
}

Player.prototype.Init =  function (obj) {
	this.ID = obj.id;
	this.token = obj.token;
	this.name = obj.name;
	this.password = '';	
	
	if(obj.stationsClaimed != ""){
		this.stationsClaimed = obj.stationsClaimed.split(",");	
	}
}