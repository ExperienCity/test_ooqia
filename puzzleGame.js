var puzzleGame = new function() {	
	"use strict";
	//private variable
	var that = this;	
	var puzzleData = '';
	var LOGOSITE = "http://experiencity.co/images/logo2.png";
	var LOADERIMG = "http://experiencity.co/images/ajax-loader2.gif";
	
	this.COOKIENAME = 'progressAnonymous';
	this.puzzleProgress = []; 
	this.isAppExported = false;
	this.isUserGuest = false;
	
	this.msgGlobal = {
		'ERRORGETINFO':'*Error Trying get puzzle info.',
		'MSGFINISHGAME':'<h2>Congratulations !!!</h2>'
	}; 
		
	this.initPuzzle = function () {
		this.utilities = new utilitys();
		this.gameClass = new GameClass();
		this.puzzleServices = new puzzleServices ();
		this.puzzleServices.utilities = this.utilities; 
		this.isAppExported = that.utilities.AvailableParamterInUrl('app');
		this.isUserGuest = that.utilities.AvailableParamterInUrl('guest');
	}; 
	
	this.LoadPuzzleInfo = function() {
		var paramters = {'idExp':this.utilities.GetParamterUrl('idExp')};
		var promise = this.puzzleServices.GetPuzzleInfo(paramters);
		
		$.mobile.showPageLoadingMsg();
		promise.done(function(respond) {
			respond = $.parseJSON(respond);
			that.LoadPuzzleInfoSuccess(respond);
		}).error(function(er){ console.log(er);});
	};
	
	this.LoadPuzzleInfoSuccess = function (respond) {
		if(respond.status == 'true') {			
			puzzleData = respond.data;
			puzzleData.options = $.parseJSON(puzzleData.options);
			
			if (typeof puzzleData.progress.progress !== "undefined" && that.isUserGuest === false) {
				puzzleData.progress.progress = puzzleData.progress.progress.split(',');				
			}

			if (that.isUserGuest === true) {
				if (typeof $.cookie(this.COOKIENAME) === "undefined") {
					puzzleData.progress.progress = undefined;	
				} else {
					puzzleData.progress.progress =  $.cookie(this.COOKIENAME).split(',');
				}
			}			

			puzzleData.stations = that.ArrangeStationsOrder(puzzleData.options,puzzleData.stations);						
			that.CreateGrid(puzzleData);	
			that.UpdateDefaultImage(puzzleData.options.puzzleDefaultImg);
			that.RemoveMarkersFromTable();
			$('#titleExperience').html(puzzleData.Name);
			
		} else {
			$('#StatusMsg').html(that.msgGlobal.ERRORGETINFO);
		}
		$.mobile.hidePageLoadingMsg();
	};
	
	this.ValidateClaimCode = function(data) {
		var promise = this.puzzleServices.ValidateClaimCode(data);
		
		$.mobile.showPageLoadingMsg();
		promise.done(function(respond){
			respond = $.parseJSON(respond);
			that.ValidateClaimCodeSuccess(respond);
		}).error(function(er){ console.log(er); });
	};
	
	this.ValidateClaimCodeSuccess = function(respond) {	
		if(respond.status == 'true') {
			if(respond.data.claimCode == 'ok') {
				$("#popupClaimStation").popup("close");
				this.revealImagePart(respond.data);
				if(!this.IsGameFinished()) {
					this.SaveProgressUser(respond.data);
				} else {
					$('#resetPuzzleGame').show();
				}
			} else {
				$('#containerErrorClaiming').show();
			}
			
		} else {
			$('#StatusMsg').html(that.msgGlobal.ERRORGETINFO);
		}
		$.mobile.hidePageLoadingMsg();	
	}; 
	
	this.SaveProgressUser = function(data) {
		if(!that.isAppExported) {
			data.idExp = this.utilities.GetParamterUrl('idExp');		
			var promise = this.puzzleServices.UpdateProgress(data);
			promise.done(function(respond){
				respond = $.parseJSON(respond);
				/*if(data.status == 'true') {	}*/
			}).error(function(er){ console.log(er);});
		} else {
			data.idExp = this.utilities.GetParamterUrl('id');
			if(this.isUserGuest) { 
				that.SaveProgressAnonymous();				
			} else {
				that.puzzleServices.servicesCrossDomain.SaveProgressUser(data);
			}
		}		
	};

	this.SaveProgressAnonymous = function() {
		if (typeof $.cookie(this.COOKIENAME) === "undefined") {
			$.cookie(this.COOKIENAME, this.puzzleProgress.toString());
		} else {
			var currentProgress = $.cookie(this.COOKIENAME);
			currentProgress = currentProgress.split(',');
			var newProgress = _.difference(this.puzzleProgress,currentProgress);
			newProgress = currentProgress.concat(newProgress);
			$.cookie(this.COOKIENAME, newProgress.toString(),{ expires: 5 });
		}
	};
	
	this.IsGameFinished = function() {
		/*return true if image was completed*/
		if($("#gridBoardGame td[data-idstation=noId]").length >= $("#gridBoardGame td").length){
			return true;
		} else {
			return false;
		}	
	};
	
	this.revealImagePart = function(data) {
		$("#gridBoardGame td").each(function() {
			var td = $(this);
			if(td.attr('data-idstation') == data.idStations) {
				$(this).css('background-image','none');
				$(this).attr('data-idstation','noId');
				that.puzzleProgress.push(data.idStations);
			}
		});		
	};
	
	this.FinishPuzzleGame = function() {
		$('#gridBoardGame tr td').css('border','0px');
		$('.boardGrid-containerImgPuzzle').html(that.msgGlobal.MSGFINISHGAME);
	};
	
	this.CreateGrid = function(data) {
		var image =  $('<img src="" style="max-width:100%;"/>');
		/*we have ".boardGrid-containerImgPuzzle" because we need a father to image 
		to get the size*/
		$('#boardGrid .boardGrid-containerImgPuzzle').append(image);
		/*wait until image is totally load*/
		image.load(function(){	
			var table = $('#gridBoardGame');
			table.width($(this).width());
			table.height($(this).height());
			$(this).remove();
		}).attr('src',data.img);	
		
		$('#gridBoardGame').css('background-image','url('+ data.img +')');		
		that.gameClass.CreateBoardGridForStationInGame(parseInt(data.rows), parseInt(data.col), $("#gridBoardGame tbody"), data.stations);
	};
	
	/*asigned station order because it wasn't saved in the table experience_stations*/
	/* instead we use the field "options" of puzzle table to know  the order*/
	this.ArrangeStationsOrder = function (options,stations) {
		var orderArray = options.position.split(',');
		var tempArray = [];
		
		_.each(orderArray, function(idOrder,index){
			tempArray.push(_.find(stations, function(element){
				return idOrder == element.idStations;
			}));
			//add the new order
			tempArray[index].Station_order = index;
		}); 
		return tempArray;
	};
	
	this.UpdateDefaultImage = function(type) {	
		function SetElementStyle (elment) {
			$(elment).css('background-repeat','no-repeat');
			$(elment).css('background-size','100% 100%');			
		}
		
		var tdsArray = $("#gridBoardGame td");
		if(type == "logo")	{
			tdsArray.each(function( index ) {
				var reveal;
				var tdCurrent = $(this);
				
				reveal = _.find(puzzleData.progress.progress, function(id){ 
					return id  == puzzleData.stations[index].idStations; 
				});
				
				if (typeof reveal === "undefined") {
					tdCurrent.css('background-image','url('+ LOGOSITE +')');
					SetElementStyle(this);
				} else {
					tdCurrent.find('img').attr('data-idstation','noId');
				}				
			});
		} else {
			tdsArray.each(function( index ) {	
				var reveal;
				var tdCurrent = $(this);			
				var image =  $('<img src=""/>');
				SetElementStyle(this);			
				
				reveal = _.find(puzzleData.progress.progress, function(id){ 
					return id  == puzzleData.stations[index].idStations; 
				});
			
				if (typeof reveal === "undefined") {
					/*if image failed in load*/
					image.load(function(){				
						tdCurrent.css('background-image','url('+ puzzleData.stations[index].PicasaImage +')');					
						$(this).remove();
					}).error(function(){
						tdCurrent.css('background-image','url(images/noimg80.jpg)');
					}).attr('src',puzzleData.stations[index].PicasaImage);						
				} else {
					tdCurrent.find('img').attr('data-idstation','noId');
				}					
			});
		}		
	};
	
	
	this.RemoveMarkersFromTable = function() {
		$("#gridBoardGame td img").each(function( index ) {
			var image = $(this);
			image.parent().attr('data-idstation',image.attr("data-idstation"));
			image.remove();
		});
	};
	
	this.OpenPopupClaimStation = function(stationId) {
		var station = _.find(puzzleData.stations, function(element) { 
			return element.idStations==stationId; 
		});	
		$("#inputHiddenIdStation").val(stationId);
		$("#spanStationName").html(station.StationName);
		$("#btnGoCompleteStation").attr("href","http://thewandering.net/site/?idStation="+stationId).attr("target","_blank");
		$("#popupClaimStation").popup("open");
	};
	
	this.ResetPuzzle = function() {		
		$.mobile.showPageLoadingMsg();
		if(this.isAppExported) {
			if(this.isUserGuest ) {
				$.removeCookie(this.COOKIENAME);
				this.puzzleServices.servicesCrossDomain.LoadPuzzleInfo(this.utilities.GetParamterUrl('id'));
			} else {
				this.puzzleServices.servicesCrossDomain.ResetProgress(this.utilities.GetParamterUrl('id'));
			}
			$('#resetPuzzleGame').hide();
		} else {
			var paramters = {'idExp':this.utilities.GetParamterUrl('idExp')};
			var promise = this.puzzleServices.ResetProgress(paramters);
			promise.done(function(respond) {
				that.LoadPuzzleInfo();
				$('#resetPuzzleGame').hide();
				$.mobile.hidePageLoadingMsg();
			}).error(function(er){ console.log(er);});
		}	
	};
	
	$(document).ready(function(){
		that.initPuzzle();			
		if(!that.isAppExported) {
			that.LoadPuzzleInfo();		
		} else {
			that.puzzleServices.servicesCrossDomain.LoadPuzzleInfo(that.utilities.GetParamterUrl('id'));
		}
		
		$("#gridBoardGame tbody").on("click", "td", function() {
			var stationId = $(this).attr("data-idstation");
			// validate the change of the position of the marker in the grid. If there is a blank space , then the change is not done
			if (stationId != 'noId') {
				that.OpenPopupClaimStation(stationId);
			}
		});	
		
		$("#popupClaimStation").popup({
			afterclose: function(event, ui){
					$("#inputClaimingCode").val("");
					$("#inputHiddenIdStation").val("");
					$('#containerErrorClaiming').hide();
			}
		});
		
		$("#formClaimStation").submit(function(){
			var formData = that.utilities.ArrayObjToObjSimple($(this).serializeArray());
			if(!that.isAppExported) {
				that.ValidateClaimCode(formData);
			} else {
				that.puzzleServices.servicesCrossDomain.ValidateClaimCode(formData);
			}
			return false;
		});	
		
		$('#resetPuzzleGame').on('click',function(){
			that.ResetPuzzle();
		});
	});
};