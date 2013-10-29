var homePage = new function() {
	"use strict";
	var that =  this;
	this.services = {};
	this.templates = {
		"experiences_old": _.template('<li>' + 
						'<div class="exp-home-list-containerImg">' + 
						'<img src="<%= image %>" />' + 
						'</div>' + 
						'<div><a href="viewExperienceDetailsUser.php?idexp=<%= id %>" target="_blank">' + 
						 '<%= Name %></a></div>' + 
						'</li>'),
						
		"experiences": _.template('<li>' + 
						'<div class="large-6 columns exp-featuredExp">' +
							'<div class="small-4 columns">' + 
							  '<a href="viewExperienceDetails.php?idexp=<%= id %>" target="_blank">' + 
								'<img src="<%= image %>" width="160" height="115" alt="<%= Name %>">' + 
								'</a>' + 
							'</div>' + 
							'<div class="small-8 columns">' + 
								'<h5>' + 
									'<a href="viewExperienceDetails.php?idexp=<%= id %>" target="_blank">' +
										'<%= Name %>' + 
									'</a>' + 
								'</h5>' + 
								'<span><%= Description %></span>' +  
							'</div>' + 
						'</div>' + 
						'</li>')						
	}	
	
	this.services.GetLastExperiences =  function () {	
		var promise = $.getJSON('php/home/home.php',{"action":"GetLastExperiences","parameters":""});	
		return promise;	
	}
	
	this.LoadExperiences = function() {	
		var promise = this.services.GetLastExperiences();
		promise.done(function(respond){
			if(respond.status == 'true') {	
				if(respond.data.length > 0) {
					that.PopulateExperiences(respond.data);
					$('.bxslider').bxSlider({
						responsive:true
					});
					//$('.exp-home-list-container').slideToggle('slow');
				}
			} else {
				//msg when there are not experience
			}
						
		}).error(function(er){ console.log(er); });		
	}
	
	this.PopulateExperiences = function (experiences) {
		var listUl = $('#exp-home-experiences');
		var html = '';
		var amountItems = 6;
		
		var listsGrouped = _.groupBy(experiences, function(element,index) {
			return Math.floor(index/amountItems);
		});		
		
		_.each(listsGrouped,function(list) {/*li*/
			var elementLi = document.createElement('li');
			var experiencesUl = document.createElement('ul');
			var experiencesLi = '';
			
			_.each(list,function(element) {/*ul*/
				element.Description = element.Description.substring(0, 75);
				experiencesLi = experiencesLi + that.templates.experiences(element);
			});
			
			$(experiencesUl).append($(experiencesLi));
			$(elementLi).append(experiencesUl);
			listUl.append(elementLi);
		});
	}
	/*code template*/
	this.ToggleList = function(IDS) {
		var ContentObj = document.getElementById("all");
		var AllContentDivs = ContentObj.getElementsByTagName("section");
		for (var i=0; i < AllContentDivs.length; i++) {
			if (IDS != AllContentDivs[i].id) {
				AllContentDivs[i].style.display="none"; 
				$('#video-container').empty();
			}
		} 
		var CState = document.getElementById(IDS);
		if (CState.style.display != "block") {
			//CState.style.display = "block"; 
			$(CState).slideDown('slow');
		} else { 
			//CState.style.display = "none"; 
			$(CState).slideUp();
		}	 
		if(IDS == 'c') { 
			var video = '<iframe width="640" height="480" ' + 
			'src="//www.youtube.com/embed/55YDyqjynqQ" frameborder="0" ' + 
			'allowfullscreen>' + 
			'</iframe>';
			$('#video-container').html(video);
		}
	}
	
	$(document).ready(function() {
		that.LoadExperiences();
		
		/*show form login*/
		if($('.exp-loginStatus').length > 0) {
			that.ToggleList('b');
		}
		/*show reset form*/
		if($('.exp-resetStatus').length > 0) {
			$('#formReset').hide();
			that.ToggleList('a');
		}
		
		$('#exp-resetPass').on('click',function(){
			that.ToggleList('a');
		});
		 
		// Listen for resize changes
		//window.addEventListener("resize", function() {
		//	var slider = $('.bxslider').bxSlider();
		//	slider.reloadSlider({
		//		mode: 'fade',
		//		auto: true,
		//		pause: 1000,
		//		speed: 500
		//	});
		//}, false);		
	});
}