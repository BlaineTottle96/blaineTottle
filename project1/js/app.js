// Global Variables
let countryBorder;
let marker = {};
let wikiMarker = {};
let polygon = {};
let markers = [];
let markersLayer;
let markerCluster = L.markerClusterGroup();
let isoa2;
let wikiIcon = L.ExtraMarkers.icon({
    icon: 'fa-book-open',
    markerColor: 'purple',
    shape: 'circle',
    prefix: 'fa'
});

let capitalIcon = L.ExtraMarkers.icon({
    icon: 'fa-city',
    markerColor: 'blue',
    shape: 'square',
    prefix: 'fa'
});

function getDate(dateObj) {
    let date = new Date(dateObj);
    const [month, day, year, hour, minutes] = [date.getMonth(), date.getDate(), date.getFullYear(), date.getHours().toString().padStart(2, "0"), date.getMinutes().toString().padStart(2, "0")];
    return `${day}/${month}/${year} ${hour}:${minutes}`;
};

// Preloader

$(window).on('load', function () {
    if ($('#preloader').length) {
        $('#preloader').delay(1000).fadeOut('slow',function () {
            $(this).remove();
        });
    }
});

// Map Layers
let Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
	maxZoom: 16
});

let Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 16
});

let Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
});

// Overlays
let OpenRailwayMap = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

let mymap = L.map('map', {
    zoomControl: false,
    attributionControl: false,
    layers: [Esri_NatGeoWorldMap, Esri_WorldImagery, Esri_WorldGrayCanvas]
}).locate({setView: true, maxZoom: 6});

// Attribution control
let zoomControl = L.control.zoom({
    position: "bottomright"
  });
zoomControl.addTo(mymap);

L.easyButton( 'fa-location-arrow', function(){
    navigator.geolocation.getCurrentPosition(getUserLocation);
}, {position: 'bottomright'}).addTo(mymap);

L.easyButton({
    states: [
        {
            icon:'fa-info-circle',
            stateName: 'general-btn',
            onClick: function(){ $('#generalModal').modal('show');}
        }
    ]
}).addTo(mymap);

L.easyButton({
    states: [
        {
            icon:'fa-hand-holding-usd',
            stateName: 'currency-btn',
            onClick: function(){  $('#currencyModal').modal('show');}
        }
    ]
}).addTo(mymap);

L.easyButton({
    states: [
        {
            icon:'fa-road',
            stateName: 'travel-btn',
            onClick: function(){  $('#travelModal').modal('show');}
        }
    ]
}).addTo(mymap);

L.easyButton({
    states: [
        {
            icon:'fa-cloud-sun',
            stateName: 'weather-btn',
            onClick: function(){  $('#weatherModal').modal('show');}
        }
    ]
}).addTo(mymap);

L.easyButton({
    states: [
        {
            icon:'fa-virus',
            stateName: 'covid-btn',
            onClick: function(){  $('#covidModal').modal('show');}
        }
    ]
}).addTo(mymap);

let baseMaps = {
    "Grayscale": Esri_WorldGrayCanvas,
    "World Imagery": Esri_WorldImagery,
    "Street Map": Esri_NatGeoWorldMap,
};

let overlays = {
    "Railways": OpenRailwayMap
};

L.control.layers(baseMaps, overlays).addTo(mymap);

// Ajax Functions
$(document).ready(function() {
    $.ajax({
        url: "php/getCountries.php",
        type: 'POST',
        dataType: "json",
        
        success: function(result) {
            for (let i = 0; i < result.data.length; i++) {
                $('#selCountry').append($('<option>', {
                    value: result.data[i].iso_a2,
                    text: result.data[i].name,
                }));
            }
        }
    });
    navigator.geolocation.getCurrentPosition(getUserLocation);
});

function getUserLocation(position) {
    let userPositionlat = position.coords.latitude;
    let userPositionlng = position.coords.longitude;
    
    $.ajax({
        url: 'php/getCountryCode.php',
        type: 'POST',
        dataType: 'json',
        data: {
            lat: userPositionlat,
            lng: userPositionlng
        },

        success: function(result) {
            isoa2 = result.data.countryCode;
            $('#selCountry option[value=' +isoa2+']').prop("selected", true).change();
        },

        error: function(jqXHR) {
            console.log(jqXHR);
        }
    })
};

$('#selCountry').change(function(event) {
    event.preventDefault();
    let iso = $('#selCountry option:selected').val();
    let name = $('#selCountry option:selected').text();
    $.ajax({
        url: "php/getCountryBorder.php",
        type: 'POST',
        dataType: 'json',
        data: {
            iso: iso
        },
        success: function(result) {
            // iso3 for covid api
            let iso3 = result.data.properties.iso_a3;
            iso3 = iso3.toLowerCase();
            let latLngs; 
            let coords = result.data.geometry.coordinates;
            // coordinates to latlng
            if(result.data.geometry.type === 'Polygon') {
              latLngs = L.GeoJSON.coordsToLatLngs(coords, 1, false);
            } else {
              latLngs = L.GeoJSON.coordsToLatLngs(coords, 2, false);
            };
            // country polygon to map
            if (polygon != undefined) {
              mymap.removeLayer(polygon);
            };
            polygon = L.polygon(latLngs, {color: '#303030'}).addTo(mymap);
            // fit bounds to map
            countryBorder = L.geoJSON(result.data).getBounds();
            mymap.fitBounds(countryBorder);
            // bounding box coords
            let north = countryBorder.getNorth();
            let south = countryBorder.getSouth();
            let east = countryBorder.getEast();
            let west = countryBorder.getWest();
            // nested wikipedia bounding box api
            $.ajax({
                url: 'php/getWikipediaLinks.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    north: north,
                    south: south,
                    east: east,
                    west: west
                },
                success: function(result) {
                    if (result.status.name == "ok") {

                        if(markersLayer != undefined && markers != undefined) {
                            markers = [];
                            markerCluster.removeLayer(markersLayer);
                            mymap.removeLayer(markerCluster);
                        };

                        let wikiArray = result.data.geonames;
                        for(let i = 0; i < wikiArray.length; i++) {
                            let wikiLat = result.data.geonames[i].lat;
                            let wikiLng = result.data.geonames[i].lng;
                            let url = result.data.geonames[i].wikipediaUrl;
                            let title = result.data.geonames[i].title;
                            wikiMarker = L.marker([wikiLat, wikiLng], {icon: wikiIcon}).bindPopup(`<a href="https://${url}" target="_blank">${title}</a>`).openPopup();
                            markers.push(wikiMarker);
                        }

                        markersLayer = L.layerGroup(markers);
                        markerCluster.addLayer(markersLayer);
                        mymap.addLayer(markerCluster);    
                    }; 
                },
                error: function(jqXHR) {
                    console.log(jqXHR.responseText);
                }
            });
            // nested restcountries api
            $.ajax({
                url: 'php/getRestCountries.php',
                type: 'POST',
                dataType: 'json',
                data: {
                  iso: iso
                },
                success: function(result) {
                    let capitalLat = result.data['0'].capitalInfo.latlng['0'];
                    let capitalLng = result.data['0'].capitalInfo.latlng['1'];
                    let capital = result['data']['0']['capital']['0']; 
                    let population = result['data']['0']['population'].toLocaleString();
                    if (result.status.name == "ok") {
                        // info to general modal
                        $('#city').html(result['data']['0']['capital']['0']);
                        $('#cCode').html(result['data']['0']['cca3']);
                        $('#pop').html(population);
                        $('#continent').html(result['data']['0']['continents']['0']);
                        // timezone to travel modal
                        $('#timezone').html(result['data']['0']['timezones']['0']);
                        // flag and coat of Arms to sidebar
                        $('#flag').empty().append($('<img>', {
                          src: result['data']['0']['flags']['png'],
                          alt: 'Country Flag',
                        }));
                        $('#cOArms').empty().append($('<img>', {
                          src: result['data']['0']['coatOfArms']['png'],
                          alt: 'Coat Of Arms',
                        }));
                        // capital popup
                        if (marker != undefined) {
                            mymap.removeLayer(marker);
                        };  
                        marker = L.marker({lat: capitalLat, lng: capitalLng}, {icon: capitalIcon}).addTo(mymap).bindPopup('Capital: ' + capital + '<br>' + name, {className: 'capital-popup'}).openPopup();
                    };

                    // nested opencage api
                    $.ajax({
                        url: 'php/getOpenCageData.php',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                          lat: capitalLat,
                          lng: capitalLng
                        },
                        success: function(result) {
                            let currencyCode = result.data.results['0'].annotations.currency.iso_code;         
                            // Currency info
                            $('#currencyName').html(result['data']['results']['0']['annotations']['currency']['name']);
                            $('#symbol').html(result['data']['results']['0']['annotations']['currency']['symbol']);
                            $('#denom').html(result['data']['results']['0']['annotations']['currency']['smallest_denomination']);
                            $('#subunit').html(result['data']['results']['0']['annotations']['currency']['subunit']);
                            // Road info
                            $('#road').html(result['data']['results']['0']['annotations']['roadinfo']['drive_on']);
                            $('#speed').html(result['data']['results']['0']['annotations']['roadinfo']['speed_in']);
                            // nested openexchange api
                            $.ajax({
                                url: 'php/getOpenExchangeRate.php',
                                type: 'POST',
                                dataType: 'json',
                                data: {
                                    code: currencyCode 
                                },
                                success: function(result) {            
                                    if (result.status.name == "ok") {                                       
                                          if(result.data.rates.length != 0) {
                                              let rateObject = result.data.rates;
                                              let rateKey = Object.keys(rateObject)[0];
                                              let rateValue = rateObject[rateKey]
                                              $('#xRate').html("1 USD = " + rateValue + ' ' + rateKey);
                                          } else {
                                              $('#xRate').html("No Exchange Rate for this Country");
                                          }
                                    }; 
                                },
                                error: function(jqXHR) {
                                    console.log(jqXHR.responseText);
                                }
                            }); // openexchange api end                
                        },
                        error: function(jqXHR) {
                            console.log(jqXHR.responseText);
                        }
                    }); // opencage api end
                    // nested timezone api
                        $.ajax({
                            url: 'php/getTimezone.php',
                            type: 'POST',
                            dataType: 'json',
                            data: {
                                lat: capitalLat,
                                lng: capitalLng
                            
                            },
                            success: function(result) {
                                if (result.status.name == "ok") {                           
                                    $('#timezoneId').html(result['data']['timezoneId']);
                                    $('#localTime').html(getDate(result['data']['time']));
                                    $('#sunrise').html(getDate(result['data']['sunrise']));
                                    $('#sunset').html(getDate(result['data']['sunset']));
                                } 
                            },
                            error: function(jqXHR) {
                                console.log(jqXHR.responseText);
                            }
                        }); // timezone api end     
                    // nested weather api
                    $.ajax({
                        url: 'php/getOpenWeather.php',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            lat: capitalLat,
                            lng: capitalLng
                        },
                        success: function(result) {
                            // current weather
                            let icon = result.data.current.weather['0'].icon;
                            let temp = Math.round(result.data.current.temp * 10) / 10;
                            let feelsLike = Math.round(result.data.current.feels_like * 10) / 10;
                            $('#weatherCurrent').html(result.data.current.weather['0'].description);
                            $('#weatherIcon').empty().append($('<img>', {
                                src: 'http://openweathermap.org/img/wn/' + icon + '@2x.png',
                                alt: 'Weather Icon',
                            }));
                            $('#currentTemp').html(temp);
                            $('#feelsLike').html(feelsLike);
                            $('#humidity').html(result.data.current.humidity);
                            $('#currentWind').html(result.data.current.wind_speed);
                            // next day forecast
                            let iconNext = result.data.daily['1'].weather['0'].icon;
                            let maxTemp = Math.round(result.data.daily['1'].temp.max * 10) / 10;
                            let minTemp = Math.round(result.data.daily['1'].temp.min * 10) / 10;
                            $('#weatherNext').html(result.data.daily['1'].weather['0'].description);
                            $('#nextDayIcon').empty().append($('<img>', {
                                src: 'http://openweathermap.org/img/wn/' + iconNext + '@2x.png',
                                alt: 'Weather Icon',
                            }));
                            $('#maxTemp').html(maxTemp);
                            $('#minTemp').html(minTemp);
                            $('#humidityNext').html(result.data.daily['1'].humidity);
                            $('#rainChance').html(result.data.daily['1'].pop);
                            $('#nextWind').html(result.data.daily['1'].wind_speed);
                        },
                        error: function(jqXHR) {
                            console.log(jqXHR);
                        }
                    }); // weather api end
                },
                error: function(jqXHR) {
                    console.log(jqXHR.responseText);
                }
            }); // restcountries ajax end
            // Covid api
            $.ajax({
                url: 'php/getCovid.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    iso: iso3
                },
                success: function(result) {
                    $('#newCase').html(result['0']['NewCases']);
                    $('#newDeath').html(result['0']['NewDeaths']);
                    $('#serious').html(result['0']['Serious_Critical'].toLocaleString());
                    $('#newRecovered').html(result['0']['NewRecovered']);
                    $('#totalCase').html(result['0']['TotalCases'].toLocaleString());
                    $('#totalDeath').html(result['0']['TotalDeaths'].toLocaleString());
                    $('#totalRecovered').html(result['0']['TotalRecovered'].toLocaleString());
                },
                error: function(jqXHR) {
                    console.log(jqXHR.responseText);
                }
            }); // Covid api end
        },
        error: function(jqXHR) {
          console.log(jqXHR.responseText);
        }
    }) // getborder ajax end
    $('#sidebar').show();   
}); // btncountry onclick end

$('#sidebarToggleBtn, #infoToggle').click(function(){
    $('#sidebar').toggle();
});





