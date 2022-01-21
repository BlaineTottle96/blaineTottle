<?php

	$executionStartTime = microtime(true);
	
	// this includes the login details
	
	include("../config.php");

	header('Content-Type: application/json; charset=UTF-8');

    $connEmail = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);	

    $queryEmail = 'SELECT id FROM personnel WHERE email = "' . $_POST['email']. '"';
    $resultEmail = $connEmail->query($queryEmail);
    $EmailCheck = [];

    if($resultEmail) {
        while ($row = mysqli_fetch_assoc($resultEmail)) {
            array_push($EmailCheck, $row);
        }
    }
        
    mysqli_close($connEmail);

    $connFirstLastName = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);	

    $queryFirstLastName = 'SELECT id FROM personnel WHERE firstName = "' . $_POST['first'] . '" AND lastName = "' . $_POST['last'] . '"';
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

    if(!$_POST['first'] || !$_POST['last'] || !$_POST['email'] || !$_POST['department'] || count($EmailCheck) > 0 || count($FirstLastNameCheck) > 0)  { 
        if(!$_POST['first']) {
            $description = 'First name ' . $empty;
        } else if(count($FirstLastNameCheck) > 0) {
            $description = 'This name is already in the database.';
        } else if(!$_POST['last']) {
            $description = 'Last name ' . $empty;
        } else if(!$_POST['email']) {
            $description = 'Email ' .  $empty;
        } else if(count($EmailCheck) > 0) {
            $description = 'This email address is already in use.';
        } else if(!$_POST['department']) {
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

		$query = $conn->prepare('INSERT INTO personnel (firstName, lastName, jobTitle, email, departmentID) VALUES(?,?,?,?,?)');

		$query->bind_param("ssssi", $_POST['first'], $_POST['last'], $_POST['title'], $_POST['email'], $_POST['department']);

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
		$output['status']['description'] = "Successfully added new Personnel";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];
		
		mysqli_close($conn);

		echo json_encode($output); 

    }
?>