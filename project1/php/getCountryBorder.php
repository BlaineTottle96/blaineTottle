<?php

    $executionStartTime = microtime(true) / 1000;
    
    $result = file_get_contents('../data/countryBorders.geo.json');

    $countryInfo = json_decode($result,true);
    
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    $output['data'] = null;
    
    foreach($countryInfo['features'] as $data) {
        if($data['properties']['iso_a2'] == $_REQUEST['iso']) {
          $output['data'] = $data;
          break; 
        };
    };
    

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);

?>