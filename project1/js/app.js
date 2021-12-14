// Global Variables
let countryBorder;
let marker = {};
let wikiMarker = {};
let polygon = {};
let markers = [];
let markersLayer;
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

L.easyButton( 'bi bi-cursor-fill', function(){
    mymap.locate({setView: true, maxZoom: 12});
}, {position: 'bottomright'}).addTo(mymap);

let baseMaps = {
    "Grayscale": Esri_WorldGrayCanvas,
    "World Imagery": Esri_WorldImagery,
    "Street Map": Esri_NatGeoWorldMap,
};

let overlays = {
    "Railways": OpenRailwayMap
};

L.control.layers(baseMaps, overlays).addTo(mymap);

L.control.rainviewer({ 
    position: 'topright',
    nextButtonText: '>',
    playStopButtonText: 'Play/Stop',
    prevButtonText: '<',
    positionSliderLabelText: "Time:",
    opacitySliderLabelText: "Opacity:",
    animationInterval: 400,
    opacity: 0.8
}).addTo(mymap);

// Location functions
let popup = L.popup();

// function onMapClick(e) {
//     popup
//         .setLatLng(e.latlng)
//         .setContent("You clicked the map at " + e.latlng.toString())
//         .openOn(mymap);
// }
// mymap.on('click', onMapClick);

// function getLocation() {
//   if (navigator.geolocation) {
//     console.log(navigator.geolocation.getCurrentPosition(showPosition));
//   } else {
//     alert("Geolocation is not supported by this browser.");
//   }
// };

// function showPosition(position) {
//   console.log("Latitude: " + position.coords.latitude + 
//   "<br>Longitude: " + position.coords.longitude);
// };

// Ajax Functions
$(document).ready(function() {
    $.ajax({
      url: "../php/getCountryBorders.php",
      type: 'POST',
      dataType: "json",
    
      success: function(result) {
        for (let i = 0; i < result.data.countryInfo.features.length; i++) {
            $('#selCountry').append($('<option>', {
                value: result.data.countryInfo.features[i].properties.iso_n3,
                text: result.data.countryInfo.features[i].properties.name,
            }));
        }
      }
    });
});

$('#btnCountry').on('click', function(event) {
    event.preventDefault();
    let iso = $('#selCountry').val();
    let name = $('#selCountry option:selected').text();
    $.ajax({
        url: "../php/getCountryBorders.php",
        type: 'POST',
        dataType: 'json',
        success: function(result) {
            let latLngs; 
            const filterData = result.data.countryInfo.features.filter((a) => (a.properties.iso_n3 === iso));
            let coords = filterData[0].geometry.coordinates;
            $('#countryName').html(name);
            // coordinates to latlng
            if(filterData[0].geometry.type === 'Polygon') {
              latLngs = L.GeoJSON.coordsToLatLngs(coords, 1, false);
            } else {
              latLngs = L.GeoJSON.coordsToLatLngs(coords, 2, false);
            };
            // country polygon to map
            if (polygon != undefined) {
              mymap.removeLayer(polygon);
            };
            polygon = L.polygon(latLngs).addTo(mymap);
            // fit bounds to map
            countryBorder = L.geoJSON(filterData[0]).getBounds();
            mymap.fitBounds(countryBorder);
            // bounding box coords
            let north = countryBorder.getNorth();
            let south = countryBorder.getSouth();
            let east = countryBorder.getEast();
            let west = countryBorder.getWest();
            // nested wikipedia bounding box api
            $.ajax({
                url: '../php/getWikipediaLinks.php',
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
                            mymap.removeLayer(markersLayer);
                        };

                        let icon = L.icon({
                            iconUrl: '../data/images/wikipedia-icon.png',                        
                            iconSize:     [40, 40], // size of the icon
                            iconAnchor:   [20, 0], // point of the icon which will correspond to marker's location
                            popupAnchor:  [0, 10] // point from which the popup should open relative to the iconAnchor
                        });

                        for(let i = 0; i < result.data.geonames.length; i++) {
                            let wikiLat = result.data.geonames[i].lat;
                            let wikiLng = result.data.geonames[i].lng;
                            let url = result.data.geonames[i].wikipediaUrl;
                            let title = result.data.geonames[i].title;
                            wikiMarker = L.marker([wikiLat, wikiLng], {icon: icon}).bindPopup(`<a href="${url}" target="_blank">${title}</a>`);
                            markers.push(wikiMarker);
                        }

                        markersLayer = L.layerGroup(markers);
                        markersLayer.addTo(mymap);    
                    }; 
                },
                error: function(jqXHR) {
                    console.log(jqXHR.responseText);
                }
            });
            // nested restcountries api
            $.ajax({
                url: '../php/getRestCountries.php',
                type: 'POST',
                dataType: 'json',
                data: {
                  iso: iso
                },
                success: function(result) {
                    let capitalLat = result.data['0'].capitalInfo.latlng['0'];
                    let capitalLng = result.data['0'].capitalInfo.latlng['1'];
                    let capital = result['data']['0']['capital']['0'];                  
                    if (result.status.name == "ok") {
                        // info to general modal
                        $('#city').html(result['data']['0']['capital']['0']);
                        $('#cCode').html(result['data']['0']['cca3']);
                        $('#pop').html(result['data']['0']['population']);
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
                        marker = L.marker({lat: capitalLat, lng: capitalLng}).addTo(mymap).bindPopup(capital + ', ' + name).openPopup();
                    };
                    // nested opencage api
                    $.ajax({
                        url: '../php/getOpenCageData.php',
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
                                url: '../php/getOpenExchangeRate.php',
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
                                              $('#xRate').html("1 US Dollar equals " + rateValue + ' ' + rateKey);
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
                        url: '../php/getTimezone.php',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            lat: capitalLat,
                            lng: capitalLng
                          
                        },
                        success: function(result) {
                            if (result.status.name == "ok") {
                                $('#timezoneId').html(result['data']['timezoneId']);
                                $('#localTime').html(result['data']['time']);
                                $('#sunrise').html(result['data']['sunrise']);
                                $('#sunset').html(result['data']['sunset']);
                            } 
                        },
                        error: function(jqXHR) {
                            console.log(jqXHR.responseText);
                        }
                    }); // timezone api end     
                    // nested weather api
                    $.ajax({
                        url: '../php/getOpenWeather.php',
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
                            console.log(jqXHR.responseText);
                        }
                    }); // weather api end
                },
                error: function(jqXHR) {
                    console.log(jqXHR.responseText);
                }
            }); // restcountries ajax end
        },
        error: function(jqXHR) {
          console.log(jqXHR.responseText);
        }
    }) // getborder ajax end
}); // btncountry onclick end






