var puzzleGame = new function() {	
	"use strict";
	//private variable
	var that = this;	
	var puzzleData = '';
	var LOGOSITE = "images/logo2.png"
	
	this.msgGlobal = {
		'ERRORGETINFO':'*Error Trying get puzzle info.',
		'ERRORSAVEINFO':'*Error Saving puzzle info.'
	};
	
	this.templates = {		
		'listStations' : _.template('<% _.each(stations, function(station){ %>' +
											'<li><%= station.StationName %></li>' +
										'<% }) %>')
	};
	
	//private method
	function initPuzzle () {
		that.utilitys = new utilitys();
		that.gameClass = new GameClass();
		that.templatesCreateExperience = new TemplateCreateExperience();
	}
	
	this.LoadPuzzleInfo = function() {
		var paramters = {'idExp':this.utilitys.GetParamterUrl('idExp')};
		var puzzle = new puzzleServices ();
		var promise = puzzle.GetPuzzleInfo(paramters);
		
		$.mobile.showPageLoadingMsg();
		promise.done(function(data) {
			data = jQuery.parseJSON(data);
			if(data.status == 'true') {
				puzzleData = data.data;
				
				if(puzzleData.options != ""){
					puzzleData.options = JSON.parse(puzzleData.options);				
					puzzleData.stations = that.ArrangeStationsOrder(puzzleData.options,puzzleData.stations);				
					that.UpdateDefaultImage(puzzleData.options.puzzleDefaultImg);					
				} else {
					puzzleData.options.puzzleDefaultImg = 'logo';
				}
				
				that.PopulateUIWithData(puzzleData);			
				that.CreateGrid(puzzleData);
				if (that.utilitys.GetParamterUrl('new')=="1") {
					that.UpdateDefaultImage('logo');
				}else{
					that.UpdateDefaultImage(puzzleData.options.puzzleDefaultImg);
				}
			} else {
				$('#StatusMsg').html(that.msgGlobal.ERRORGETINFO);
			}
			$.mobile.hidePageLoadingMsg();			
		}).error(function(er){ console.log(er);});
	}
	
	this.SavePuzzleConfig = function(formData) {
		formData.position = that.gameClass.GetCurrrentPositionOfStations('gridBoardGame').toString();		
		var paramters = {
			'idexp':this.utilitys.GetParamterUrl('idExp'),
			'puzzleRowsGrid':puzzleData.rows,
			'puzzleColumnsGrid':puzzleData.col,
			'puzzleImageGrid':puzzleData.img,
			'options':formData
		};
		var puzzle = new puzzleServices ();
		var promise = puzzle.SavePuzzleInfo(paramters);
		
		$.mobile.showPageLoadingMsg();
		promise.done(function(data) {
			data = jQuery.parseJSON(data);
			if(data.status == 'true') {
				window.location.href = 'viewExperienceDetailsUser.php?idexp=' + that.utilitys.GetParamterUrl('idExp') + 
				'&saved';
			} else {
				$('#StatusMsg').html(that.msgGlobal.ERRORSAVEINFO);
			}
			$.mobile.hidePageLoadingMsg();			
		}).error(function(er){ console.log(er);});
	}
	
	this.PopulateUIWithData = function(data) {
		var list = $('#listStationsOnBoard');
		var itemsHTML = this.templates.listStations(data);
		list.append($(itemsHTML));

		if (data.options.puzzleDefaultImg == 'station') {
			$('.optionDefaultImg-js:eq(0)').attr('checked',true);
			$('.optionDefaultImg-js').checkboxradio("refresh");
		}
	}
	
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
	}
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
	}
	
	this.UpdatePositionStations = function(tdElement) {
		that.gameClass.ArrangeStationOnBoard(tdElement, true);
	}
	
	this.UpdateDefaultImage = function(type) {	
		function SetElementStyle (elment) {
			$(elment).css('background-repeat','no-repeat');
			$(elment).css('background-size','100% 100%');			
		}
		
		var tdsArray = $("#gridBoardGame td");
		if(type == "logo")	{
			tdsArray.each(function( index ) {
				$(this).css('background-image','url('+ LOGOSITE +')');
				SetElementStyle(this);
			});
		} else {
			tdsArray.each(function( index ) {			
				var image =  $('<img src=""/>');
				var tdCurrent = this;
				SetElementStyle(this);

				/* we need to find the correct station to asign the background-image of the td */
				var currentStation = _.where(puzzleData.stations, {idStations: $(tdCurrent).find('img').attr('data-idstation')});

				//if image failed in load
				image.load(function(){
					$(tdCurrent).css('background-image','url('+ currentStation[0].PicasaImage +')');
				}).error(function(){
					$(tdCurrent).css('background-image','url(images/noimg80.jpg)');
				}).attr('src',currentStation[0].PicasaImage);
					
			});
		}		
	}
	
	$(document).ready(function(){		
		initPuzzle();
		that.LoadPuzzleInfo();
		that.templatesCreateExperience.SetTypeExperienceAndTypeGame("10", "");
		that.templatesCreateExperience.UpdatePanelInfoContent("6",6);
		
		$("#gridBoardGame tbody").on("click", "tr td", function() {
			var tdElement = $(this);
			// validate the change of the position of the marker in the grid. If there is a blank space , then the change is not done
			if (tdElement.children("img").attr("data-idstation")!='noId') {	    	
				that.UpdatePositionStations(tdElement);
			}
		});	
		
		$('#ContentArrangeStations').on('change','.optionDefaultImg-js',function() {		
			that.UpdateDefaultImage($(this).val());
		});
		
		$('#formArrangeStationPuzzle').submit(function(){
			var formData = that.utilitys.ArrayObjToObjSimple($(this).serializeArray());
			that.SavePuzzleConfig(formData);
			return false;
		});
		
		$('.puzzle-submit').on('click',function() {			
			$('#formArrangeStationPuzzle').submit();
		});
		
		$(".showInfoSteps").on("click", function(evt){
			evt.stopPropagation();
			var step = $(this).data("numberstep");
			that.templatesCreateExperience.UpdatePanelInfoContent(step.toString(), step);
		});
	
	});
}