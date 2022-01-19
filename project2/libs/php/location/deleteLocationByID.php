<?php

	$executionStartTime = microtime(true);

	include("../config.php");

	header('Content-Type: application/json; charset=UTF-8');

	$connCheckDep = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);
	$queryDep = 'SELECT * FROM department WHERE locationID = ' . $_POST['id'];
	$resultDep = $connCheckDep->query($queryDep);
	$DepCheck = [];
	if($resultDep) {
		while ($row = mysqli_fetch_assoc($resultDep)) {
			array_push($DepCheck, $row);
		}
	}

	mysqli_close($connCheckDep);

	if(count($DepCheck) > 0) {
		$output['status']['code'] = "300";
		$output['status']['name'] = 'error';
		$output['status']['description'] = 'Location can\'t be deleted! Assigned departments: ' . count($DepCheck);
		
		echo json_encode($output);
		
		exit;

	} else {
		$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

		if (mysqli_connect_errno()) {
			
			$output['status']['code'] = "300";
			$output['status']['name'] = "failure";
			$output['status']['description'] = "database unavailable";
			$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
			$output['data'] = [];

			mysqli_close($conn);

			echo json_encode($output);

			exit;

		}	

		// SQL statement accepts parameters and so is prepared to avoid SQL injection.

		$query = $conn->prepare('DELETE FROM location WHERE id = ?');
		
		$query->bind_param("i", $_POST['id']);

		$query->execute();
		
		if (false === $query) {

			$output['status']['code'] = "400";
			$output['status']['name'] = "executed";
			$output['status']['description'] = "query failed";	
			$output['data'] = [];

			mysqli_close($conn);

			echo json_encode($output); 

			exit;

		}

		$output['status']['code'] = "200";
		$output['status']['name'] = "ok";
		$output['status']['description'] = "Location deleted successfully";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];
		
		mysqli_close($conn);

		echo json_encode($output); 
	}
?>