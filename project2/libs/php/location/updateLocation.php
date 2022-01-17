<?php
    
    // example use from browser
	// http://localhost/companydirectory/libs/php/insertDepartment.php?name=New%20Department&locationID=<id>

	// remove next two lines for production
	
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);
	
	// this includes the login details
	
	include("../config.php");

	header('Content-Type: application/json; charset=UTF-8');

    if($_REQUEST['location']) {
		$connLoc = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);
		$queryLoc = 'SELECT * FROM location WHERE name = "' . $_REQUEST['location'] . '" AND id != ' . $_REQUEST['locationId'];
		$resultLoc = $connLoc->query($queryLoc);
		$LocCheck = [];
		if($resultLoc) {
			while ($row = mysqli_fetch_assoc($resultLoc)) {
				array_push($LocCheck, $row);
			}
		}
	mysqli_close($connLoc);
	}

	$emptyLocation = 'Please provide the name of the Location';
	$alreadyExists = 'The location with that name already exists.';

	function errors($description) {
		$output['status']['code'] = "300";
		$output['status']['name'] = 'error';
		$output['status']['description'] = $description;

		echo json_encode($output);

		exit;

	}
	
	if(!$_REQUEST['location'] || count($LocCheck) > 0) {
        if(!$_REQUEST['location']) {
			$description = $emptyLocation;
		} else if(count($LocCheck) > 0) {
			$description = $alreadyExists;
		} 

		errors($description);

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
        // $_REQUEST used for development / debugging. Remember to change to $_POST for production

        $query = $conn->prepare('UPDATE location SET name = ? WHERE id = ?');

        $query->bind_param("si", $_REQUEST['location'], $_REQUEST['locationId']);

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
        $output['status']['description'] = "Successfully updated Location";
        $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        $output['data'] = [];
        
        mysqli_close($conn);

        echo json_encode($output);
    }
?>