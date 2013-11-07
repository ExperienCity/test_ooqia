<?php
	error_reporting(E_ALL);
	ini_set('display_errors', '1');
	
	require_once('db_connect.php');
	require_once('functions.php');
	
	$resp = array();
	$query = '';
	
	@ $mysqli = conect_db();
		
	if (mysqli_connect_errno()) {
		$resp['status'] = "error"; 
		$resp['msg'] = "Imposible conect to DB"; 
		echo json_encode($resp);		
		//echo ( $mysqli->connect_errno);		
		return;			
	}
	
    list($lat_lo,$lng_lo,$lat_hi,$lng_hi) = explode (',', $_GET['bounds']);

    /*Experiences that does not required Q&A and all users*/
	if ($_GET['email'] == '' && $_GET["questionFeedback"] == 'false') {
		$query = 'CALL Sp_StationsGetByBounds ('.$lat_hi.','.$lat_lo.','.$lng_hi.','.$lng_lo.')';
	}

	/*Experiences that does not required Q&A and by user*/
	if ($_GET['email'] != '' && $_GET["questionFeedback"] == 'false') {
		$query = 'CALL Sp_StationsGetByBoundsByUser ('.$lat_hi.','.$lat_lo.','.$lng_hi.','.$lng_lo.',"'.$_GET['email'].'")';
	}

	/*Experiences that required Q&A and all users*/
	if ($_GET['email'] == '' && $_GET["questionFeedback"] == 'true') {
		$query = 'CALL Sp_StationsGetOnlyWithQuestionAndFeedback ('.$lat_hi.','.$lat_lo.','.$lng_hi.','.$lng_lo.')';
	}

	/*Experiences that required Q&A and by user*/
	if ($_GET['email'] != '' && $_GET["questionFeedback"] == 'true') {
		$query = 'CALL Sp_StationsGetOnlyWithQuestionAndFeedbackByUser ('.$lat_hi.','.$lat_lo.','.$lng_hi.','.$lng_lo.',"'.$_GET['email'].'")';
	}

	if($query == '') {
		$resp['status'] = "error"; 
		$resp['msg'] = 'There is not criterion of search'; 
		echo json_encode($resp);
		exit;
	}	

	if ($result = $mysqli->query($query)){
		
		if ($result->num_rows > 0){
			
			$arrayData = db_to_array ($result);	
			$arrayData = DecodeHtmlEntity ($arrayData);
			$resp['status'] = "ok"; 
			$resp['data'] = $arrayData; 
			echo json_encode(utf8json($resp));
			
		} else {

			$resp['status'] = "ok";
			$resp['data'] = array();
			echo json_encode($resp);
		}
	
	} else {
		$resp['status'] = "error"; 
		$resp['msg'] = $mysqli->error; 
		echo json_encode($resp);
	}
	
?>