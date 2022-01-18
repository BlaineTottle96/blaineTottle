<?php

	$executionStartTime = microtime(true);

	include("../config.php");

	header('Content-Type: application/json; charset=UTF-8');

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

	$departments = explode( ',', $_PORT['departments']);
    $locations = explode( ',', $_PORT['locations']);
    $depSearch = '';
    $locSearch = '';

    if($_PORT['departments'] != '') {
        if(count($departments) == 1) {
            $depSearch .=  ' ( d.name = "' . $departments[0] . '")';
        } else if(count($departments) > 1) {
            $depSearch .= ' ( ';
            for($i=0; $i < count($departments); $i++) {
                if($i == count($departments) - 1) {
                    $depSearch .= ' d.name = "' . $departments[$i] . '") ';
                } else {
                    $depSearch .= ' d.name = "' . $departments[$i] . '" OR ';
                }  
            }
        } 
    }  else {
        $depSearch = '';
    } 

    if($_PORT['locations'] != '') {
		if(count($locations) == 1) {
			$locSearch .= ' ( l.name = "' . $locations[0] . '")';
		} else {
			$locSearch .= ' ( ';
			for($i = 0; $i < count($locations); $i++) {
				if($i == count($locations) - 1) {
					$locSearch .= ' l.name = "' . $locations[$i] . '") ';
				} else {
					$locSearch .= ' l.name = "' . $locations[$i] . '" OR ';
				}	
			}
		}
	}  else {
	    $locSearch = '';
	} 

	if($_PORT['departments'] != '' && $_PORT['locations'] != '') {
		$query = 'SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, l.name as location FROM personnel p LEFT JOIN department d ON (d.id = p.departmentID) LEFT JOIN location l ON (l.id = d.locationID) WHERE ' . $depSearch . ' OR ' . $locSearch . ' ORDER BY d.name, p.lastName, p.firstName, l.name';
	} else if ($_PORT['departments'] != '' && $_PORT['locations'] == '') {
		$query = 'SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, l.name as location FROM personnel p LEFT JOIN department d ON (d.id = p.departmentID) LEFT JOIN location l ON (l.id = d.locationID) WHERE ' . $depSearch . ' ORDER BY d.name, p.lastName, p.firstName, l.name';
	} else if ($_PORT['departments'] == '' && $_PORT['locations'] != '') {
        $query = 'SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, l.name as location FROM personnel p LEFT JOIN department d ON (d.id = p.departmentID) LEFT JOIN location l ON (l.id = d.locationID) WHERE ' . $locSearch . ' ORDER BY d.name, p.lastName, p.firstName, l.name';
    } else {
        $query = 'SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, l.name as location FROM personnel p LEFT JOIN department d ON (d.id = p.departmentID) LEFT JOIN location l ON (l.id = d.locationID) ORDER BY p.lastName, p.firstName, d.name, l.name';
    }

	$result = $conn->query($query);

	if (!$result) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output); 

		exit;

	}
   
   	$data = [];

	while ($row = mysqli_fetch_assoc($result)) {

		array_push($data, $row);

	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $data;
	
	mysqli_close($conn);

	echo json_encode($output); 

?>