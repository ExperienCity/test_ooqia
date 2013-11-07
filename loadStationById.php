<?php	
	require_once('db_connect.php');
	require_once('functions.php');
	
	$resp = array();
	
	@ $mysqli = conect_db();
		
	if (mysqli_connect_errno()) {
		
		$resp['status'] = "error"; 
		$resp['msg'] = "Imposible conect to DB"; 
		echo json_encode($resp);		
		/* echo ( $mysqli->connect_errno); */
		
		return;			
	}
	
	$id =  check_input($_GET['idSt']);
	
	$query = 'CALL Sp_StationsGetInfoToEdit('.$id.')';
	
	if ($result = $mysqli->query($query)){
		
		if ($result->num_rows > 0){ 			
			$arrayData = db_to_array ($result);	
			$arrayData = DecodeHtmlEntity ($arrayData);	
			SendResult(utf8json($arrayData),'ok','');			
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