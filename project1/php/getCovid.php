<?php

    $curl = curl_init();

    curl_setopt_array($curl, [
        CURLOPT_URL => "https://vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com/api/npm-covid-data/countries",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "GET",
        CURLOPT_HTTPHEADER => [
            "x-rapidapi-host: vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com",
            "x-rapidapi-key: 52150eb52fmshea48b40159c160ep1a1b29jsn1422c14eddef"
        ],
    ]);    

    $response = curl_exec($curl);
    $err = curl_error($curl);

    curl_close($curl);

    $decode = json_decode($response,true);

    $country = [];

    for ($i = 0; $i < count($decode); $i++) {
        if($decode[$i]['ThreeLetterSymbol'] == $_REQUEST['iso']) {
            array_push($country, $decode[$i]);
        };
    };

    echo json_encode($country); 
?>