function appViewModel() {
    var self = this;
    var map;
    var infowindow;
    var mapMarkersArray = [];
 
    /*Map between values from getDayOfWeek function and string in Place's
    open hours property.*/
    var dateMap = {
        0: 'Monday',
        1: 'Tuesday',
        2: 'Wednesday',
        3: 'Thursday',
        4: 'Friday',
        5: 'Saturday',
        6: 'Sunday',
    };

    /*Creates the map and sets the center to downtoen Manhattan. Then gets popular
     restaurants, bakery, cafe and pharmacy in the area.*/
    function initMap() {
        myLatLng = {
            lat: 40.711472,
            lng: -74.009562
        };
        var mapOptions = {
            center: myLatLng,
            zoom: 15,
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_BOTTOM
            },
            scaleControl: true,
            streetViewControl: true,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.LEFT_BOTTOM
            },
            rotateControl: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        };
        map = new google.maps.Map(document.getElementById('map'), mapOptions);

        // Add the search*search bar and button) form to DOM using Map object.
        var input = document.getElementById('searchForm');
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        /*Add the button to the DOM (the map at a designated control position
        by pushing it on the position's array) using the Map object*/
        var resetButton = document.getElementById('resetButton');
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(resetButton);

        // Add the list of places to DOM using Map object.
        var list = document.getElementById('list');
        map.controls[google.maps.ControlPosition.RIGHT_TOP].push(list);

        //Add the show/hide list button to DOM using Map object.
        var listDisplay = document.getElementById('listDisplay');
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(listDisplay);

        getAllPlaces();
    }

    /*Makes a request to Google for popular bakery, restaurant, cafe and pharmacy
     in downtown Manhattan. Executes a callback function with the response data from Google.*/
    function getAllPlaces() {
        var request = {
            location: myLatLng,
            radius: 800,
            types: ['bakery', 'restaurant', 'cafe', 'bar']
        };
        infowindow = new google.maps.InfoWindow();
        service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, showAllPlacescallback);
    }

    /*Gets resulting places from getAllPlaces Google request.  Adds additional
     properties to the places and adds them to the allPlaces array.  */
    function showAllPlacescallback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            /*Create new bounds for the map.  Will be updated with each new
            location.  This will be used to make sure all markers are
            visible on the map after the search.*/
            bounds = new google.maps.LatLngBounds();
            results.forEach(function(place) {
                place.marker = createMarker(place);
                place.isInFilteredList = ko.observable(true);
                self.allPlaces.push(place);
                bounds.extend(new google.maps.LatLng(
                    place.geometry.location.lat(),
                    place.geometry.location.lng()));
            });
            map.fitBounds(bounds);
        }
        
    }
        
    /*Takes a PlaceResult object and puts a marker on the map at its location.*/
    function createMarker(place) {
        var image = {
            url: place.icon,
            scaledSize: new google.maps.Size(22, 22)
        };
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            icon: image,
            animation: google.maps.Animation.DROP
        });
        /* Push the marker to a list of markers attached to the map
        which is useful to delete all markers later.*/
        mapMarkersArray.push(marker);
    
        /* When a marker is clicked scroll the corresponding list view element
        into view and highlight it by changing its background color.
        Also animate the selected marker marker and change its icon and open its infoWindow*/
        google.maps.event.addListener(marker, 'click', function() {
            document.getElementById(place.id).scrollIntoView(true);
            $('#' + place.id).css('background-color', '#4595d6');
            marker.setAnimation(google.maps.Animation.BOUNCE);
             setTimeout(function() {
        place.marker.setAnimation(null)
    }, 3000);
            marker.setIcon("images/red.png");
            //console.log(marker.icon);
            map.panTo(marker.position);
            displayInfo(place, marker);
        });
        
         /* When infowindow is closed, stop the marker's bouncing animation and
        deselect the place in the list. */
        google.maps.event.addListener(infowindow, 'closeclick', function() {
            $('#' + place.id).css('background-color', 'white');
            marker.setAnimation(null);
            marker.setIcon(image);
            map.setCenter(myLatLng);
        });
        return marker;
    }

    
    
    /* Gets numeric value for day of week and converts it to match values
    used in the PlaceResult object opening_hours property.*/
    function getDayofWeek() {
        var date = new Date();
        var today = date.getDay();
        if (today === 0) {
            today = 6;
        } else {
            today -= 1;
        }
        return today;
    }


    /* Executes a getDetails request for the selected place.
    This information will be used for Google, Review and Photos tabs of infoWindow. */
    function getGoogleContent(place, callback) {
        var request = {
            placeId: place.place_id
        };
        service.getDetails(request, function(results, status) {
            var locName = "";
            var locAddress = "";
            var locPhone = "";
            var openNow = "";
            var openHours = "";
            var workHours = "";
            var rating = "";
            var review = "";
            var ratingTotal = "";
            var photos = "";
            var photosDiv = "";
            var gContent = "";
            var googlePlusUrl = "";
            var phoneNumber = results.formatted_phone_number;
            var callBackString = {};

            if (status == google.maps.places.PlacesServiceStatus.OK) {
                if (results.website) {
                    locName = "<h4><a href=" + results.website + ">" + place.name + "</a></h4><br>";
                } else {
                    locName = "<h4>" + place.name + "</h4><br>";
                }

                if (results.formatted_address) {
                    locAddress = "<p> <b>Address: </b> " + results.formatted_address + "</p>";
                } else {
                    locAddress = "<p> <b>Address: </b> No address! </p>";
                }

                if (results.formatted_phone_number) {
                    locPhone = "<p><b> Phone Number: </b>" + results.formatted_phone_number + "</p>";
                } else {
                    locPhone = "<p><b> Phone Number: </b> No phone number! </p>";
                }

                if (results.opening_hours) {
                    if (results.opening_hours.open_now === true) {
                        openNow = "<p><b> Open now: </b>Yes" + "</p>";
                    } else {
                        openNow = "<p><b> Open now: </b>No" + "</p>";
                    }
                } else {
                    openNow = "<p><b> Open now: </b>No information!" + "</p>";
                }

                if (results.reviews) {
                    var i;
                    var reviewList = "";
                    for (i = 0; i < results.reviews.length; i++) {
                        reviewList += "<p class='gReview'>" + results.reviews[i].text + "<br><b>" + "~" + results.reviews[i].author_name + "</b>" + "</p>";
                    }
                    review = "<p><h4><u> Reviews</u></h4><br>" + reviewList + "</p>";

                } else {
                    review = "<p><h4><u> Reviews</u></h4><br> No reviews! </p>";
                }

                var today = getDayofWeek();
                if (results.opening_hours && results.opening_hours.weekday_text) {
                    openHours = results.opening_hours.weekday_text[today];
                    openHours = openHours.replace(dateMap[today] + ':',
                        "<p><b>Today's Hours: </b>");
                    workHours = openHours + '</p>';
                } else {
                    workHours = "<p><b> Working Hours: </b> No information! </p>";
                }

                if (results.user_ratings_total) {
                    ratingTotal = " (" + results.user_ratings_total + ")";
                } else {
                    ratingTotal = " (No Data!)";
                }

                if (results.rating) {
                    rating = "<p><b> Ratings: </b>" + results.rating + ratingTotal + "</p>";
                } else {
                    rating = "<p><b> Ratings: </b> No data </p>";
                }

                if (results.url) {
                    googlePlusUrl = "<a href= " + results.url + "><img class='googlePlus' width='25' height='25' src=" + "'images/gPlus.jpg'></img>" + "</a>";
                } else {
                    googlePlusUrl = "<a href= " + results.url + "><img class='googlePlus' src=" + "'images/gPlus.jpg' alt='No link found!'></img>" + "</a>";
                }

                if (results.photos) {
                    for (var i = 0; i < results.photos.length; i++) {
                        var srcLoc = results.photos[i].getUrl({
                            'maxWidth': 150,
                            'maxHeight': 150
                        });
                        photos += '<img class="photo-loc" src="' + srcLoc + '" />';
                    }
                    photosDiv = "<div class='photos-loc'><div id='content' class='images'>" + photos + "</div><div id='buttons'><a href='#' id='left-button'><img class='back-image' src='images/back.png ' /></a><a href='#' id='right-button'><img class='next-image' src='images/right.png' /></a></div></div>";
                } else {
                    photos += '<img class="photo-loc" alt="No images!" />';
                    photosDiv = "<div class='photos-loc'><div id='content' class='images'>" + photos + "</div><div id='buttons'><a href='#' id='left-button'><img class='back-image' src='images/back.png ' /></a><a href='#' id='right-button'><img class='next-image' src='images/right.png' /></a></div></div>";
                }

                gContent = locName + locAddress + locPhone + openNow + workHours + rating + googlePlusUrl;
                callBackString.value1 = phoneNumber;
                callBackString.value2 = photosDiv;
                callBackString.value3 = gContent;
                callBackString.value4 = review;

                if (typeof callback === "function") callback(callBackString);
            } else {
                console.error(status);
                return;
            }
        });
    }

    /*Getting information from Yelp API using phoneSearch. This information will be used for
     Yelp tab of infoWindow. */
    function yelp(phoneSearch, callback) {
        var locName;
        var locAddress;
        var locPhone;
        var ratingUrl;
        var rating;
        var review;
        var locPhoto;
        var content;
        var auth = {
            consumerKey: "pkTSEV6tSNRKcfCFF4zlIQ",
            consumerSecret: "ZIP94Vzl8KFKoaiHd4ovCrSE7Mc",
            accessToken: "w3sjVmS6qgOywgQ9D9YQsKE8YDmCPG2y",
            accessTokenSecret: "G8HKoJRfAmMy5174sgGMLPW2eug",
            /*serviceProvider : {
					signatureMethod : "HMAC-SHA1"
				}*/
        };
        var accessor = {
            consumerSecret: auth.consumerSecret,
            tokenSecret: auth.accessTokenSecret
        };
        var parameters = [];
        parameters.push(['callback', 'cb']);
        parameters.push(['phone', phoneSearch]);
        parameters.push(['oauth_consumer_key', auth.consumerKey]);
        parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
        parameters.push(['oauth_token', auth.accessToken]);
        //parameters.push(['oauth_signature_method', 'HMAC-SHA1']);
        var message = {
            'action': 'http://api.yelp.com/v2/phone_search',
            'method': 'GET',
            'parameters': parameters
        };
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);
        var parameterMap = OAuth.getParameterMap(message.parameters);
        parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);
        $.ajax({
            'url': message.action,
            'data': parameterMap,
            'cache': true,
            'dataType': 'jsonp',
            'success': function(data, textStats, XMLHttpRequest) {
                if (data.businesses[0]) {
                    locName = "<h4><u><a href=" + data.businesses[0].url + ">" + data.businesses[0].name + "</u></a></h4><br>";
                    locAddress = "<p> <b>Address: </b> " + data.businesses[0].location.display_address[0] + ", " + data.businesses[0].location.display_address[2] + ", United States" + "</p>";
                    locPhone = "<p><b> Phone: </b>" + data.businesses[0].phone + "</p>";
                    ratingUrl = data.businesses[0].rating_img_url;
                    rating = '<p class="rating-img"><b>Rating: </b><img src="' + ratingUrl + '" /></p>';
                    review = "<p class='review'><b> Review: </b>" + data.businesses[0].snippet_text + "</p>";
                    locPhoto = '<img class="photo-loc"  height="150" width="150" src="' + data.businesses[0].snippet_image_url + '" />';
                    content = locName + locAddress + locPhone + rating + review;
                } else {
                    content = "<p> No information from Yelp! </p>";
                }
                if (typeof callback === "function") callback(content);
            },
            /* Code to run if the request fails*/
            'error': function(jqXHR, status, errorThrown) {
                alert("Oops! Failed to get Yelp data!");
                return;
            }
        });
    }

    /*Getting information from Wikipedia API using Latitude and Longitude to get nearby places.
     This information will be used for Nearby tab of infoWindow. */
    function wiki(locationLatLng, callback) {
          var wikiRequestTimeout = setTimeout(function() {
               alert("Failed to get wikipedia data!");
           }, 9000);
        $.ajax({
            type: "GET",
            url: "https://en.wikipedia.org/w/api.php?action=query&prop=coordinates|pageimages|pageterms&format=json&colimit=5&coprop=name&piprop=thumbnail%7Cname&pithumbsize=200&pilimit=50&generator=geosearch&ggscoord=" + locationLatLng + "&ggsradius=100&ggslimit=5",
            contentType: "application/json; charset=utf-8",
            dataType: "jsonp",
            success: function(data, textStatus, jqXHR) {
                var wikiContent = "";
                var content = "";
                var nearbyPhoto = "";
                var nearbyName = "";
                var pages = "";
                var page = "";

                if (data.query) {
                    pages = data.query.pages;
                    //getOwnPropertyNames will only retrieve "own" properties. (It will retrieve the names of non-enumerable properties.)
                    page = Object.getOwnPropertyNames(pages);
                    for (i = 0; i < page.length; i++) {
                        if (data.query.pages[page[i]].thumbnail) {
                            nearbyPhoto = '<img id="wikiImage" class="photo-loc" height="100" width="100" src="' + data.query.pages[page[i]].thumbnail.source + '" />';
                        } else {
                            nearbyPhoto = '<img id="wikiImage" class="photo-loc" height="100" width="100" alt="No Photos!"  />';
                        }
                        nearbyName = "<h4 id='wikiTitle'>" + data.query.pages[page[i]].title + "</h4>";
                        content += "<td>" + nearbyPhoto + nearbyName + "</td>";
                    }
                    wikiContent = "<div id='wikiC'><table><tr>" + content + "</tr></table></div>";
                } else {
                    wikiContent = "<div id='wikiC'><table><tr> No information from Wikipedia! </tr></table></div>";
                }
                if (typeof callback === "function") callback(wikiContent);
                /* Code to run if the request fails*/
                clearTimeout(wikiRequestTimeout);
                  

            }
        });
    }

    /* Displays the infowindow using tabs with information for selected place.*/
    function displayInfo(place, marker) {
        var lat = place.geometry.location.lat();
        var lng = place.geometry.location.lng();
        var locationLatLng;
        locationLatLng = lat + "|" + lng;

        getGoogleContent(place, function(result) {
            var phoneSearch = result.value1;
            var photosDiv = result.value2;
            var googleContent = result.value3;
            var googleReviews = result.value4;
            yelp(phoneSearch, function(yelpContent) {
                wiki(locationLatLng, function(wikiContent) {
                    var tabText = "";
                    tabText = [
                        '<div id="InfoText">',
                        '<div class="tabs">',
                        '<ul class="tab-links">',
                        '<li class="active"><a href="#tab1">Google</a></li>',
                        '<li><a href="#tab2">Reviews</a></li>',
                        '<li><a href="#tab3">Yelp</a></li>',
                        '<li><a href="#tab4">Photo</a></li>',
                        '<li><a href="#tab5">Nearby</a></li>',
                        '</ul>',
                        '<div class = "tab-content">',
                        '<div id="tab1" class="tab-active">',
                        googleContent,
                        '</div>',
                        '<div id="tab2" class="tab">',
                        googleReviews,
                        '</div>',
                        '<div id="tab3" class="tab">',
                        yelpContent,
                        '</div>',
                        '<div id="tab4" class="tab">',
                        photosDiv,
                        '</div>',
                        '<div id="tab5" class="tab">',
                        wikiContent,
                        '</div>',
                        '</div>',
                        '</div>',
                        '</div>'
                    ].join('');
                    infowindow.setContent(tabText, marker);
                    infowindow.open(map, marker);

                    /*Right arrow to replace scrollbar*/
                    $('#right-button').click(function() {
                        event.preventDefault();
                        $('#content').animate({
                            marginLeft: "-=250px"
                        }, "fast");
                    });

                    /* Left arrow to replace scrollbar. */
                    $('#left-button').click(function() {
                        event.preventDefault();
                        $('#content').animate({
                            marginLeft: "+=250px"
                        }, "fast");
                    });

                    /* Function to switch between tabs. */
                    jQuery(document).ready(function() {
                        jQuery('.tabs .tab-links a').on('click', function(e) {
                            var currentAttrValue = jQuery(this).attr('href');
                            // Show/Hide Tabs
                            jQuery('.tabs ' + currentAttrValue).slideDown(400).siblings().slideUp(400);
                            // Change/remove current tab to active
                            jQuery(this).parent('li').addClass('active').siblings().removeClass('active');
                            e.preventDefault();
                        });
                    });
                }); // end of wiki
            }); //end of yelp
        }); //end of getGoogleContent
    }

    /* Resets Map */
    self.reset = function() {
        document.getElementById("resetButton").addEventListener("click", function() {
            document.location.reload();
        });
    };

    /* Shows or hides the place list upon clicking this button*/
    self.listToggle = function() {
        var placeList = document.getElementById('list');
        if (placeList.style.display === "inline-block") {
            placeList.style.display = "none";
        } else {
            placeList.style.display = "inline-block";
        }
    };


    /* Removes the markers from the map. */
    clearMarkers = function() {
        if (mapMarkersArray) {
            for (var i = 0; i < mapMarkersArray.length; i++) {
                mapMarkersArray[i].setVisible(false);
            }
            mapMarkersArray = [];
        }
    }

    /* An array that will contain all places that are initially retrieved by
    the getAllPlaces function. */
    self.allPlaces = ko.observableArray([]);
    self.filterPlace = ko.observableArray([]);
    // var location = self.allPlaces();
    // console.log(self.allPlaces());
    // console.log(location);
    // self.places = ko.observableArray([]);
    //self.places(location.slice(0));
    //console.log(self.places());
    
    /* Array derived from allPlaces.  Contains each place that met the search
     criteria that the user entered. */
    self.filteredPlaces = ko.computed(function() {
        return self.allPlaces().filter(function(place) {
            return place.isInFilteredList();
        });
    });
       
    // Value associated with user input from search bar used to filter results.
    self.query = ko.observable('');

    /* Break the user's search query into separate words and make them lowercase
    for comparison between the places in allPlaces.*/
    self.searchTerms = ko.computed(function() {
         // return self.query().toLowerCase().split();
        var position;
        var searchString;
        if (self.query().indexOf(" ") === -1) {
            return self.query().toLowerCase().split();
        } else {
            position = self.query().indexOf(",");
            searchString = self.query().slice(0, position);
            return searchString.toLowerCase().split(' ');
        }
    });


    /*Takes user's input in search bar and compares each word against the name
    of each place in allPlaces.  Also compares against the place's type
    (bakery, restaurant, etc.).  All places are initially removed from the
    filteredPlaces array then added back if the comparison between name or
    type returns true. */
    self.search = function(allPlaces) {
        
        var location = self.allPlaces();
     console.log(self.allPlaces());
     console.log(location);
     self.places = ko.observableArray([]);
    self.places(location.slice(0));
    console.log(self.places());
        
        clearMarkers();
          self.places.removeAll();
          var filter;
          filter = self.searchTerms();
          console.log(filter);
        //var filter = self.query();
       //var location;
        console.log(location);
       
     for(var j=0; j< filter.length; j++){
        for(var i=0; i< location.length; i++){
            console.log(filter);
            console.log(location[i].name);
            
            
            if (location[i].name.toLowerCase().indexOf(filter[j]) !== -1){
                console.log("true");
                self.filterPlace().push(location[i]);
             }
             if (self.filterPlace().length === 0) {
              self.places.push(null);
            }
        }
     }
        
        self.filterPlace().forEach(function(place) {
             console.log(place.name);
                    place.marker = createMarker(place);
                });
       
        if (self.filterPlace().length === 0) {
            console.log("No match");
        }
        //self.allPlaces.removeAll();
        self.places(self.filterPlace());
        console.log(self.places());
    };

    
    

    /* Sets the chosen place's marker to bounce, change color and
    displays its infowindow. With setTimeout the marker stops
    bouncing after a while. */
    self.selectPlace = function(place) {  
        place.marker.setIcon(null);
        //place.marker.setIcon("images/red.png");
        place.marker.setAnimation(google.maps.Animation.BOUNCE);
         setTimeout(function() {
        place.marker.setAnimation(null)
    }, 3000);
        displayInfo(place, place.marker);
    };

    
    
    
    initMap();
}


function googleSucess() {
    ko.applyBindings(new appViewModel());
}


