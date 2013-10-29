var posterEmbed = new function() {
	"use strict";
	
	//private variable
	var that = this;

	this.isotopeBox;
	this.arrayPosterFilter = [];

	//private method
	this.initPosterEmbed = function(){
		this.posterUtilitys = utilitys;
		this.idExp = this.posterUtilitys.GetParamterUrl('id');
	}

	this.CreatePosterEmbed = function(){
		that.isotopeBox = $(".isotopeBox");
		that.AddStationsToPosterGallery(objExperience,that.isotopeBox);
		$(".isotope-isotopeBox-item img").load(function(){
			that.UpdateIsotopeBox({
				itemSelector: '.isotope-isotopeBox-item',
				hiddenStyle : {
			    	opacity: 0,
			    	scale : 1
				}
			});
			$('.isotope-isotopeBox-item').css('margin-right','1px');
		}).attr("src");
	}

	this.AddStationsToPosterGallery = function(objectStations, posterBox){
		var templateItem = _.template("<div class='isotope-isotopeBox-item <%= idStations %>'>"
			+"<a href='<%= wanderingLink %>' target='_blank'>"+
				"<span class='js-isotope-show-hover isotepe-item-title'><%= StationName %></span>"+
				"<div class='js-isotope-show-hover isotope-overlay'></div>"+
				"<img src='<%= PicasaImageSt %>' alt='<%= StationName %>' onerror="+"this.setAttribute('src','images/noimg80.jpg')"+" />"+
			"</a>"+
		"</div>");

		_.each(objectStations, function(item){
			if (item.PicasaImageSt == ''){
				item.PicasaImageSt = "/images/noimg80.jpg";
			}
			item.wanderingLink = "http://thewandering.net/site/?idStation="+item.idStations;
			posterBox.append(templateItem(item));
		});
	}

	this.PreparePosterFilter = function(){
		$('#ulAllTags li input').attr('data-poster','poster');
		$('#ulAllTags li:eq(0) input').attr('data-filter','*');
	}

	this.AttachPosterFilter = function(element){
		if (element.data('filter') != '*') {
			that.arrayPosterFilter.length = 0;
			_.each(objExperience, function(station){
				for (var i=1; i<=56; i++){
					var key = station['tagSt'+i].trim();
					if($('#ulAllTags input[type="checkbox"][value="'+key+'"][data-typecheck=station]').is(":checked")){
						that.arrayPosterFilter.push('.'+station.idStations);
						break;
					}
				}
			});
			if(that.arrayPosterFilter.length > 0){
				that.UpdateIsotopeBox({ filter: that.arrayPosterFilter.join(',') });
			}else{
				that.UpdateIsotopeBox({ filter: '.none' });
			}
		}else{
			if (element.is(':checked')){
				$('#ulAllTags li input[type=checkbox]').attr('checked',true);
				that.UpdateIsotopeBox({ filter: '*' });
			}else{
				$('#ulAllTags li input[type=checkbox]').attr('checked',false);
				that.UpdateIsotopeBox({ filter: '.none' });
			}
		}
	}

	that.UpdateIsotopeBox = function(options){
		that.isotopeBox.isotope(options);
	}

	this.LoadEventsOnDOMReady = function(){
		that.CreatePosterEmbed();
		GetCustomizedTags(idExp, 'stationFilter', true);

		$('.posterStations').on('mouseover', '.isotope-isotopeBox-item', function(){
			$(this).find('.js-isotope-show-hover').fadeIn(300);
		}).on('mouseleave', '.isotope-isotopeBox-item', function(){
			$(this).find('.js-isotope-show-hover').fadeOut(300);
		});
	}
}