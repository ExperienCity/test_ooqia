var idExperience, idSession, idCurrentPlayer, utilitys,
gameClassObject, gameRoomObject, objStationsOnBoard,isAppExported;

/********services cross domain*****/
/* var servicesCrossDomain = {
	"urlCrossDomain": {
		"GetGameInfo":"../../../php/loadExperienceGameInfo.php"
	}
}; */

var servicesCrossDomain = {
	"urlCrossDomain": {
		"GetGameInfo":"http://uat.experiencity.co/php/loadExperienceGameInfo.php"
	}
};


servicesCrossDomain.GetGameInfo = function(idExp_) {
	var parameters = {
		'idExp': idExp_,
		'callBack': 'GetGameInfoSuccess'
	};
	utilitys.MakeRequestCrossDomain(servicesCrossDomain.urlCrossDomain.GetGameInfo + '?' + $.param(parameters));
}

/**********end cross domain*****/

$(document).ready(function(){

	utilitys = new utilitys();
	gameClassObject = new GameClass();
	gameRoomObject = new GameRoom();

	idExperience = utilitys.GetParamterUrl('exp');
	idSession = utilitys.GetParamterUrl('sess');
	idCurrentPlayer = utilitys.GetParamterUrl('player');
	isAppExported = utilitys.AvailableParamterInUrl('app');

	if (!isAppExported) {
		GetGameInfo(idExperience);
	} else {
		servicesCrossDomain.GetGameInfo(idExperience);
	}
	gameClassObject.SetRealTimeUpdateGame(RealtimeUpdate);

	$("#popupClaimStation").popup({
		afterclose: function(event, ui){
			$("#inputClaimingCode").val("");
			$("#containerErrorClaiming").hide();
		}
	});

	$("#tableGameBody").on("click", ".actionClaimStation", function(){
		UpdateInfoPopupClaimStation($(this));
	});

	$("#formClaimStation").submit(function(){
		var idStToClaim = $("#inputHiddenIdStation").val();
		var inputCode = $("#inputClaimingCode");

		// if the user wrote the correct claiming code for the selected station
		if (gameClassObject.AttachEventValidateClaimStation(objStationsOnBoard, idStToClaim, inputCode.val())){
			$("#containerErrorClaiming").hide();
			/* update global array of the current player(set the claimed station) */
			gameRoomObject.currentPlayer.SetStationClaimed(idStToClaim);
			
			var paramtersClaimStation = {
				"idExp": idExperience,
				"idSession": idSession,
				"idUser": idCurrentPlayer,
				"claimedStations": gameRoomObject.currentPlayer.stationsClaimed.toString()
			};
			
			if (!isAppExported) {
				var promiseClaimedStation = gameRoomObject.PlayerManager.InsertClaimedStations(paramtersClaimStation);
				promiseClaimedStation.done(function(respond) {
					respond = $.parseJSON(respond);
					gameRoomObject.SuccessInsertClaimedStation(respond);
				});			
			} else {
				gameRoomObject.PlayerManager.servicesCrossDomain.InsertClaimedStations(paramtersClaimStation);
			}			
		}else{
			$("#containerErrorClaiming").html('Incorrect claiming code').show();
			inputCode.val("");
		}
		return false;
	});

	/*$(".btnRefreshBoard").on("click", function(){
		LoadCurrentSession();
	});*/

});

// get all the info for the current game
function GetGameInfo(idExp){
	$.mobile.showPageLoadingMsg();
	$.get('php/loadExperienceGameInfo.php', { "idExp": idExp }, function(respond){	
		respond = $.parseJSON(respond);
		GetGameInfoSuccess(respond);
		$.mobile.hidePageLoadingMsg();		
	}).error(function() { console.log("error ajax loading stations"); });
}

function GetGameInfoSuccess(data) {
	if (data.status == 'ok') {		
		if(data.data.length > 0){				
			objStationsOnBoard = data.data;
			UpdateGameInfoOnLoadStations(objStationsOnBoard);
		} else {
			utilitys.ShowMsgStatus ($('#msgStatus') , "There aren't stations in this game." ,'informative');
			$(".containerSessionGame .hide-nostations").hide();
		}			
	} else {
		console.log(data.msg);
	}
}

// update the info on the game when load the stations
function UpdateGameInfoOnLoadStations(objStations) {
	// fill the board game with the stations
	gameClassObject.CreateBoardInGameSession(parseInt(objStations[0].gridRows), parseInt(objStations[0].gridColumns), $("#tableGameBody"), objStations);

	// load session info
	LoadCurrentSession();
	
	var paramtersCurrentPlayer = { 
		"idExp": idExperience,
		"idSession": idSession,
		"idUser": idCurrentPlayer 
	};
	
	if (!isAppExported) {
		// load current user
		var promiseGetPlayerById = gameRoomObject.PlayerManager.GetById(paramtersCurrentPlayer);
		promiseGetPlayerById.done(function(respond){
			respond = $.parseJSON(respond);
			gameRoomObject.SuccessGetPlayerById(respond);
		});
	} else {
		gameRoomObject.PlayerManager.servicesCrossDomain.GetById(paramtersCurrentPlayer);
	}

	$("#titleExperience").html(objStations[0].NameExp);
	$("#spanGameName").html(objStations[0].gameName);
	$("#textGameRules").html(objStations[0].gameRules);
}

// update the info on the popup for claiming stations
function UpdateInfoPopupClaimStation(selectedStation){
	var idStSelected = selectedStation.attr("data-idstation");

	$("#inputHiddenIdStation").val(idStSelected);
	$("#inputHiddenCellIndex").val(selectedStation.parent().attr("data-cellindex"));
	$("#spanStationName").html(selectedStation.attr("data-namestation"));
	$("#btnGoCompleteStation").attr("href","http://thewandering.net/site/?idStation="+idStSelected).attr("target","_blank");

	$("#popupClaimStation").popup("open");
}

// load all the info of the current session
function LoadCurrentSession() {
	if (!isAppExported) {
		var promiseLoadSessionById = gameRoomObject.GameSessionManager.LoadById(idSession,idExperience);
		promiseLoadSessionById.done(function(respond){
			respond = $.parseJSON(respond);
			gameRoomObject.SuccesLoadSessionById(respond);
		});
	} else {
		gameRoomObject.GameSessionManager.servicesCrossDomain.LoadById(idSession,idExperience);
	}	
}

/* callback to execute in realtime update (load session, load new players, claim stations and reset timer) */
function RealtimeUpdate(timer){
	LoadCurrentSession();
	clearInterval(timer);
}