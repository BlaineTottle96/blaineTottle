<?php

	$executionStartTime = microtime(true);
	
	// this includes the login details
	
	include("../config.php");

	header('Content-Type: application/json; charset=UTF-8');

	if($_POST['department']) {
		$connDep = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);
		$queryDep = 'SELECT * FROM department WHERE name = "' . $_POST["department"] . '" AND locationID = ' . $_POST["location"] . ' AND id != ' . $_POST["departmentId"];
		$resultDep = $connDep->query($queryDep);
		$DepCheck = [];

		if($resultDep) {
			while ($row = mysqli_fetch_assoc($resultDep)) {
				array_push($DepCheck, $row);
			}
		}

	mysqli_close($connDep);

	}

	$emptyDep = 'Please provide the name of the Department';
	$emptyLoc = 'Please select the location.';
	$alreadyExists = 'The department with that name already exists at this location.';
	
	if(!$_POST['department'] || !$_POST["location"] || count($DepCheck) > 0) {
		if(!$_POST['department']) {
			$description = $emptyDep;
		} else if(count($DepCheck) > 0) {
			$description = $alreadyExists;
		} else if(!$_POST["location"]) {
			$description = $emptyLoc;
		}

		$output['status']['code'] = "300";
		$output['status']['name'] = 'error';
		$output['status']['description'] = $description;

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

		$query = $conn->prepare('UPDATE department SET name = ?, locationID = ? WHERE id = ?');

		$query->bind_param("sii", $_POST['department'], $_POST['location'], $_POST["departmentId"]);

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
		$output['status']['description'] = "Successfully updated Department";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];
		
		mysqli_close($conn);

		echo json_encode($output); 

	}	
?>