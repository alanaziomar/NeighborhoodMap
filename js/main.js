/** Set up object array to be used later by map, markers, and list
 */
var locations = [{name: 'Al-Hilal FC',
  lat:24.605675,
  lng:46.624572,
  foursquare:'4f268b9de4b0dc27bb7e465b',
  info:''
}, {
    name: 'Al-Nassr FC',
    lat:24.580205,
    lng:46.558291,
    foursquare:'4f37fbb7e4b099ca94f8196c'
}, {
  name: 'Al Shabab FC',
  lat:24.802999,
  lng:46.6277,
  foursquare:'4fa299bde4b0857bbd894678'
}, {
  name: 'Al-Riyadh SC',
  lat:24.647689,
  lng:46.550882,
  foursquare:'4f58cc0ae4b0db97b75b7836'
},
{
  name: 'Al-Shoulla FC',
  lat: 24.165818,
  lng:47.347354,
  foursquare:'4fb26721e4b00dd091c57878'
},
{
  name: 'Al-Faisaly FC',
  lat:25.928626,
  lng:45.33401,
  foursquare:'4efc7e9ff9ab0847fa0e1a7e'
}
];

var Location = function(data) {
    this.name = ko.observable(data.name);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
};

/** Considering how 'this' changes in every scope, 'self' will preserve
 * 'this' value throughout viewModel.  Since we want our array of objects to be
 * able to detect changes as well as respond to changes we use knockout's
 * observableArray and pass our array of objects (locations) through it.
 * It will now be referred to self.places.
 */
var viewModel = function() {
    var self = this;
    self.places = ko.observableArray(locations);

    /** Set currentLocation to first object in object array.
     * When particular object is clicked from list, change currentLocation
     * value to the clicked location.  Also trigger a click on the marker.
     */
    this.currentLocation = ko.observable(self.places()[0]);
    this.setLocation = function(clickedLocation) {
        self.currentLocation(clickedLocation);
        google.maps.event.trigger(clickedLocation.marker, 'click');
    };

    /** Setting up search so it filters through object array or locations
     * while allowing lowercase typing to bring back relevant results.
     */
    self.query = ko.observable('');
    self.search = ko.computed(function() {
        return ko.utils.arrayFilter(self.places(), function(place) {
            return place.name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
        });
    });

    /** Display list of locations in a list view
     */
    self.search = ko.computed(function() {
        for (var i = 0; i < locations.length; i++) {
            locations[i].marker.setVisible(true);
        }
        /** If what's typed in input lowercase or not matches a location in object array
         * display the results, however many there are.  If there are objects that don't contain
         * what's typed in the input then hide those objects.
         */
        return ko.utils.arrayFilter(locations, function(place) {
            if (place.name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0) {
                return true;
            }

            place.marker.setVisible(false);
            return false;
        });
    });

};


var map, bounds,address;

/** Main map function that zooms in and centers it at specific location due to the given
 * coordinates.  Also displays the map in the respective div.
 */
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: new google.maps.LatLng(24.713552, 46.675296)
    });
    bounds = new google.maps.LatLngBounds();
    var infowindow = new google.maps.InfoWindow();


    for (var i = 0; i < locations.length; i++) {
      $.ajax({url: "https://api.foursquare.com/v2/venues/"+locations[i].foursquare+"?oauth_token=1BPFNYSBF5HJST03ZWMNHYWD0B302DP31KIJICVKNOSZGPBW&v=20170606", success: function(result){
                     address = result.response.venue.location.address;
                     //get the rating and set it on the infowindow content
                     infowindow.setContent( address );
                  },
                  error: function () {
                      infowindow.setContent('<h5>Error when loading google maps, please try later </h5>');
                  }
                });
                 // add each infowindow in the locations array
                  locations[i].info = infowindow;

    }

    /** Marker gets created on map with a falling animation and positioned in respective coordinates from locations array up top.
     */
    function createMarker(location) {
        latlng = new google.maps.LatLng(location.lat, location.lng);
        var marker = new google.maps.Marker({
            map: map,
            animation: google.maps.Animation.DROP,
            position: latlng
        });

        bounds.extend(marker.position);

        /** When marker gets clicked on, it toggles bouncing animation and info window pops up
         */
        google.maps.event.addListener(marker, 'click', function() {
            html = '<h3>' + location.name + '</h3>';

            html +='address : '+ address;

            infowindow.setContent(html);
            infowindow.open(map, this);
            toggleBounce(marker);
        });


        return marker;


    }


    /** Set's bounce animation to marker with a timer on it so it doesn't
     * keep bouncing forever
     */
    function toggleBounce(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() { marker.setAnimation(null); }, 650);
        }
    }

    /** Loop that iterates through each object in the locations array.  Marker property stores coordinates
     * for exact location for each object.  Because createMarker function is called it will display each
     * and every marker in locations on the map.
     */
    for (var i = 0; i < locations.length; i++) {
        locations[i].marker = createMarker(locations[i]);
    }
    map.fitBounds(bounds);

    /** Activate knockout bindings
     */
    ko.applyBindings(new viewModel());





}

/** Open the drawer when the menu ison is clicked.
 */
var menu = document.querySelector('#burgMenu');
var main = document.querySelector('main');
var drawer = document.querySelector('#drawer');

menu.addEventListener('click', function(e) {
    drawer.classList.toggle('open');
    e.stopPropagation();
});
main.addEventListener('click', function() {
    drawer.classList.remove('open');
});
