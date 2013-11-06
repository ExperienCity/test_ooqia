function puzzleServices() {
	
	var that = this;
	this.utilities = {};
	this.servicesCrossDomain = {};
	
	/* this.urlCrossDomain = {
		"getInfo":"../../../php/puzzle/puzzle.php"		
	}; */
	
	this.urlCrossDomain = {
		/*"getInfo":"http://uat.experiencity.co/php/puzzle/puzzle.php"*/		
		"getInfo":"http://experiencity.co/php/puzzle/puzzle.php"		
	};
	
	this.servicesCrossDomain.LoadPuzzleInfo = function(idExp_) {
		$.mobile.showPageLoadingMsg();
		var parameters = {
			'action':'GetPuzzleInfo',
			'parameters': {
				'idExp': idExp_,
				'callBack': 'puzzleGame.LoadPuzzleInfoSuccess'
			}			
		};
		that.utilities.MakeRequestCrossDomain(that.urlCrossDomain.getInfo + '?' + $.param(parameters));		
	};
	
	this.servicesCrossDomain.ResetProgress = function(idExp_) {
		$.mobile.showPageLoadingMsg();
		var parameters = {
			'action':'ResetProgress',
			'parameters': {
				'idExp': idExp_,
				'callBack': 'puzzleGame.puzzleServices.servicesCrossDomain.LoadPuzzleInfo'
			}			
		};
		that.utilities.MakeRequestCrossDomain(that.urlCrossDomain.getInfo + '?' + $.param(parameters));		
	};
	
	this.servicesCrossDomain.ValidateClaimCode = function(data) {
		$.mobile.showPageLoadingMsg();
		data.callBack = 'puzzleGame.ValidateClaimCodeSuccess';
		var parameters = {
			'action':'ValidateClaimCode',
			'parameters': data			
		};
		that.utilities.MakeRequestCrossDomain(that.urlCrossDomain.getInfo + '?' + $.param(parameters));		
	};
	
	this.servicesCrossDomain.SaveProgressUser = function(data) {		
		data.callBack = '';
		var parameters = {
			'action':'UpdateProgress',
			'parameters': data			
		};
		that.utilities.MakeRequestCrossDomain(that.urlCrossDomain.getInfo + '?' + $.param(parameters));		
	};
	
}

puzzleServices.prototype.GetPuzzleInfo =  function (paramters) {	
	var promise = $.get('php/puzzle/puzzle.php',{"action":"GetPuzzleInfo","parameters": paramters});	
	return promise;	
};

puzzleServices.prototype.SavePuzzleInfo =  function (paramters) {	
	var promise = $.get('php/puzzle/puzzle.php',{"action":"SavePuzzleInfo","parameters": paramters});	
	return promise;	
};

puzzleServices.prototype.ValidateClaimCode =  function (paramters) {	
	var promise = $.get('php/puzzle/puzzle.php',{"action":"ValidateClaimCode","parameters": paramters});	
	return promise;	
};

puzzleServices.prototype.UpdateProgress =  function (paramters) {	
	var promise = $.get('php/puzzle/puzzle.php',{"action":"UpdateProgress","parameters": paramters});	
	return promise;	
};

puzzleServices.prototype.ResetProgress =  function (paramters) {	
	var promise = $.get('php/puzzle/puzzle.php',{"action":"ResetProgress","parameters": paramters});	
	return promise;	
};