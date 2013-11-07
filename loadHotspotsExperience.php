<?php	
	require_once('db_connect.php');
	require_once('functions.php');
	
	@ $mysqli = conect_db();
	$resp = array();
	$where = '';
		
	if (mysqli_connect_errno()) {
	
		$resp['status'] = "error"; 
		$resp['msg'] = "Imposible conect to DB"; 
		echo json_encode($resp);		
		return;			
	}	
	$id =  check_input($_GET['id']);	
	$query = 'CALL Sp_HotspotGetByidExp ('.$id.')';
				
	if ($result = $mysqli->query($query)){
		
		if ($result->num_rows > 0) {		
			$arrayData = db_to_array ($result);	
			$arrayData = DecodeHtmlEntity ($arrayData);						
			SendResult($arrayData,'ok','');
		} else {
			SendResult(array(),'ok','');			
		}
	
	} else {		
		SendResult(array(),'error',$mysqli->error);	
	}
	
	function SendResult($data,$status,$msg) {
		$resultData = array();
		$resultData['status'] = $status; 
		$resultData['data'] = $data;
		$resultData['msg'] = $msg;
		
		if(!isset($_GET['callBack'])) {
			echo json_encode($resultData);
		} else {
			echo $_GET['callBack'].'('.json_encode($resultData).');';	
		}
	}
?>