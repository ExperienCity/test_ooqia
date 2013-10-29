var utilitys;

$(document).on('pageinit', '#page1', function (event, data) {

});

$(document).ready(function() {
	utilitys = new utilitys ();
	$('#formRegister').submit(function() {	
		var form = this;	
		if(CheckPasswords ()){		
			var dataForm = ($(form).serializeArray());			
			$.ajax({
				type: "POST", 
				data: dataForm,
				url: 'php/createUser.php',	  
				success: function(data) { 
					processResponseCreateUser (data);			
				}	  
			});			
		}		
		return false;
	});	
	$("#confirmPassword").on("keyup", function(event){
		CheckPasswords ();
	});
});

function CheckPasswords () {
	var inputPass = document.getElementById('password');
	var inputConfirmPass = document.getElementById('confirmPassword');
	
	if(inputPass.value == inputConfirmPass.value) {
		$(inputPass).css('border-color','#AAA');
		$(inputConfirmPass).css('border-color','#AAA');
		utilitys.ShowMsgStatus($('#msgStatusFormRegister'), '' ,'clean');
		return true;
	}else {
		$(inputPass).css('border-color','red');
		$(inputConfirmPass).css('border-color','red');
		
		utilitys.ShowMsgStatus($('#msgStatusFormRegister'), '*Please enter the same password.' ,'error');
		return false;
	}
}

function processResponseCreateUser (data) {	
	data = JSON.parse(data);	
	if (data.status == 'ok') {			
		window.location = "afterlogin.php";
		//window.location = location.protocol + location.hostname + "/afterlogin.php";		
	} else {
		utilitys.ShowMsgStatus($('#msgStatusFormRegister'), data.msg ,'error');
	}
}

