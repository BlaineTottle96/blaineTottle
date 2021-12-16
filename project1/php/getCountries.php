<?php

    $executionStartTime = microtime(true) / 1000;
    
    $result = file_get_contents('../data/countryBorders.geo.json');

    $countryInfo = json_decode($result,true);
    
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

    // get array of countries properties info
    $propJson = [];
    for ($i = 0; $i < count($countryInfo['features']); $i++) {
        array_push($propJson,$countryInfo['features'][$i]['properties']);
    };

    // sort countries array into alphabetical order
    function compareByName($a, $b) {
        return strcmp($a["name"], $b["name"]);
    };
    usort($propJson, 'compareByName');

    $output['data'] = $propJson;

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);

?>