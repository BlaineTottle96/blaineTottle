$('#firstBtn').click(function() {

    $.ajax({
        url: 'php/getCountryCode.php',
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#firstLat').val(),
            lng: $('#firstLng').val()
        },
        success: function(result) {

            console.log(JSON.stringify(result));

            if (result.status.name == "ok") {
                $('#firstLat, #firstLng').val('');
                if(result.data.status) {
                    $('#resultsOne, #resultsTwo, #resultsThree').addClass('results');
                    $('#error').removeClass('results').html(result['data']['status']['message']);
                } else {
                    $('#error, #resultsTwo, #resultsThree').addClass('results');
                    $('#resultsOne').removeClass('results');
                    $('#firstLang').html(result['data']['languages']);
                    $('#firstDist').html(result['data']['distance']);
                    $('#firstCountryCode').html(result['data']['countryCode']);
                    $('#firstCountryName').html(result['data']['countryName']);
                }

            } 
        
        },
        error: function(jqXHR) {
            $('#error').removeClass('results').html(jqXHR.responseText);
        }
    }); 

});

$('#secondBtn').click(function() {

    $.ajax({
        url: 'php/getOcean.php',
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#secondLat').val(),
            lng: $('#secondLng').val(),
            radius: $('#secondRadius').val()
        },
        success: function(result) {

            console.log(JSON.stringify(result));

            if (result.status.name == "ok") {
                $('#secondLat, #secondLng, #secondRadius').val('');
                if(result.data.status) {
                    $('#resultsOne, #resultsTwo, #resultsThree').addClass('results');
                    $('#error').removeClass('results').html(result['data']['status']['message']);
                } else {
                    $('#error, #resultsOne, #resultsThree').addClass('results');
                    $('#resultsTwo').removeClass('results');
                    $('#secondDist').html(result['data']['ocean']['distance']);
                    $('#secondGeonameId').html(result['data']['ocean']['geonameId']);
                    $('#secondName').html(result['data']['ocean']['name']);
                }

            } 
        
        },
        error: function(jqXHR) {
            $('#error').removeClass('results').html(jqXHR.responseText);
        }
    }); 

});

$('#thirdBtn').click(function() {

    $.ajax({
        url: 'php/getTimezone.php',
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#thirdLat').val(),
            lng: $('#thirdLng').val(),
            radius: $('#thirdRadius').val(),
            date: $('#thirdDate').val()
        },
        success: function(result) {

            console.log(JSON.stringify(result));

            if (result.status.name == "ok") {
                $('#thirdLat, #thirdLng, #thirdRadius, #thirdDate').val('');
                if(result.data.status) {
                    $('#resultsOne, #resultsTwo, #resultsThree').addClass('results');
                    $('#error').removeClass('results').html(result['data']['status']['message']);
                } else if(!result.data.countryCode){
                    $('#resultsOne, #resultsTwo, #resultsThree').addClass('results');
                    $('#error').removeClass('results').html('No country found at this lat/lng');
                } else {
                    $('#error, #resultsOne, #resultsTwo').addClass('results');
                    $('#resultsThree').removeClass('results');
                    $('#thirdCountryName').html(result['data']['countryName']);
                    $('#thirdCountryCode').html(result['data']['countryCode']);
                    $('#thirdTimezoneId').html(result['data']['timezoneId']);
                    $('#thirdSunrise').html(result['data']['dates'][0]['sunrise']);
                    $('#thirdSunset').html(result['data']['dates'][0]['sunset']);
                    $('#thirdTime').html(result['data']['time']);
                }

            } 
        
        },
        error: function(jqXHR) {
            $('#error').removeClass('results').html(jqXHR.responseText);
        }
    }); 

});