<?php

	$executionStartTime = microtime(true);
	
	// this includes the login details
	
	include("../config.php");

	header('Content-Type: application/json; charset=UTF-8');

    $connEmail = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);	

    $queryEmail = 'SELECT * FROM personnel WHERE email = "' . $_PORT['email'] . '" AND id != "' . $_PORT['id'] . '"';
    
    $resultEmail = $connEmail->query($queryEmail);
    $EmailCheck = [];

    if($resultEmail) {
        while ($row = mysqli_fetch_assoc($resultEmail)) {
            array_push($EmailCheck, $row);
        }
    }
        
    mysqli_close($connEmail);

    $connFirstLastName = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);	

    $queryFirstLastName = 'SELECT * FROM personnel WHERE firstName = "' . $_PORT['first'] . '" AND lastName = "' . $_PORT['last'] . '" AND id != "' . $_PORT['id'] . '"';
    $resultFirstLastName = $connFirstLastName->query($queryFirstLastName);
    $FirstLastNameCheck = [];

    if($resultFirstLastName) {
        while ($row = mysqli_fetch_assoc($resultFirstLastName)) {
            array_push($FirstLastNameCheck, $row);
        }
    }
        
    mysqli_close($connFirstLastName);

    $description = '';
    $empty = 'can\'t be empty.';

    if(!$_PORT['first'] || !$_PORT['last'] || !$_PORT['email'] || !$_PORT['department'] || count($EmailCheck) > 0 || count($FirstLastNameCheck) > 0)  { 
        if(!$_PORT['first']) {
            $description = 'First name ' . $empty;
        } else if(count($FirstLastNameCheck) > 0) {
            $description = 'This name is already in the database.';
        } else if(!$_PORT['last']) {
            $description = 'Last name ' . $empty;
        } else if(!$_PORT['email']) {
            $description = 'Email ' .  $empty;
        } else if(count($EmailCheck) > 0) {
            $description = 'This email address is already in use.';
        } else if(!$_PORT['department']) {
            $description = 'Department ' . $empty;
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

		$query = $conn->prepare('UPDATE personnel SET firstName = ?, lastName = ?, jobTitle = ?, email = ?, departmentID = ? WHERE id = ?');

		$query->bind_param("ssssii", $_PORT['first'], $_PORT['last'], $_PORT['title'], $_PORT['email'], $_PORT['department'], $_PORT['id']);

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
		$output['status']['description'] = "Successfully updated Personnel data";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];
		
		mysqli_close($conn);

		echo json_encode($output); 

    }
?>