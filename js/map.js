class Sighting {
  datetime;
  country;
  shape;
  duration;
  comments;
  lat;
  long;
  constructor(datetime, country, shape, duration, comments, lat, long) {
    this.datetime = datetime;
    this.country = country;
    this.shape = shape;
    this.duration = duration;
    this.comments = comments;
    this.lat = lat;
    this.long = long;
  }
  // Getter
  get datetime() {
    return this.datetime;
  }
  get country() {
    return this.country;
  }
  get shape() {
    return this.shape;
  }
  get duration() {
    return this.duration;
  }
  get comments() {
    return this.commens;
  }
  get lat() {
    return this.lat;
  }
  get long() {
    return this.long;
  }
}

let encounters = [];

let shape = "All";
let startDate = 1906;
let endDate = 2014;
let startTime = 00;
let endTime = 24;
// Clustering
let markers = L.markerClusterGroup();
var pruneCluster = new PruneClusterForLeaflet();
var markersList = [];
let countries = new Map();
var mymap;

 // Get country corresponding name by codename (e.g. US)

 d3.json("/data/shapeGroups.json").then(data => {
  createShapeFilters("shape_filter", data);
});


d3.csv("/data/countries.csv").then(function (data) {
    data.forEach(function (d) {
    countries.set(d.Code.toLowerCase(), d.Name);
  });
});


window.onload = function() {

  // Create map instance
  mymap = L.map('mapid').setView([30, 0], 1.5);
  // Add tile layer to the map
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    minZoom: 1,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZnJhbmNpc2NvbGJzaWx2ZWlyYSIsImEiOiJjam9oazk0OXIwMWVlM2twcTRqa3R1azBpIn0.Mr8lC9YaoSi0Vx7YuPFJUg'
  }).addTo(mymap);

  // Map spin loading
  mymap.spin(true);
  d3.csv("/data/data.csv").then(function (data) {   
    data.forEach(function (d) {
      // Create sighting object
      let s = new Sighting(d.datetime, d.country, d.shape, d['duration (seconds)'], d.comments, d.latitude, d.longitude);
      // Save object in encounters array
      encounters.push(s);     
      // Add markers 
      let marker = createMarker(s);
      pruneCluster.RegisterMarker(marker);
      mymap.spin(false);
    });
    mymap.addLayer(pruneCluster);
  });
  // Add markers to layer
  mymap.addLayer(markers);
  
  // Listener for shape filter
  document.getElementById("shape_filter").addEventListener("change", (e) => {
    mymap.spin(true);
    setTimeout(function () {
      shape = e.target.value;
      applyFilter();  
      mymap.spin(false);
      }, 0);
  });

  // Create range slider for date
  $( function() {
    $( "#slider-date" ).slider({
      range: true,
      min: 1906,
      max: 2014,
      values: [ 1906, 2014 ],
      slide: function( event, ui ) {
        $( "#amount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
      },
      change: function(event, ui) {
        startDate = ui.values[ 0 ];
        endDate = ui.values[ 1 ];
        applyFilter()
      }
    });
    $( "#amount" ).val($( "#slider-date" ).slider( "values", 0 ) +
      " - " + $( "#slider-date" ).slider( "values", 1 ) );
  } );

  $( function() {
    $( "#slider-time" ).slider({
      range: true,
      min: 00,
      max: 24,
      values: [ 00, 24 ],
      create: function( event, ui ) {
        let start = 00;
        let end = 24;
        if (start < 10) {
          start = '0'+start;
        }
        if (end<10) {
          end = '0'+end;
        }
        $( "#amountTime" ).val( start  + "h - " + end + "h");
      },
      slide: function( event, ui ) {
        let start = ui.values[ 0 ];
        let end = ui.values[ 1 ];
        if (start < 10) {
          start = '0'+start;
        }
        if (end<10) {
          end = '0'+end;
        }
        $( "#amountTime" ).val( start  + "h - " + end + "h");
      },
      change: function(event, ui) {
        startTime = ui.values[ 0 ];
        endTime = ui.values[ 1 ];
        applyFilter()
      }
    });
  } );



};

// Create marker
function createMarker(d) {
  var myIcon = L.icon({
    iconUrl: './images/ufo-icon.png',
    iconSize: [38, 38]
  });
  let marker = new PruneCluster.Marker(d.lat, d.long);
  marker.data.popup =
  "<b>Date: </b>" + d.datetime.split(' ')[0] + "<br>" +
  "<b>Hour: </b>" + d.datetime.split(' ')[1] + "<br>" +
  "<b>Country: </b>" + countries.get(d.country) + "<br>" +
  "<b>Shape: </b>" + d.shape + "<br>" +
  "<b>Duration(s): </b>" + d.duration + "<br>" +
  "<b>Description: </b>" + d.comments + "<br>"
  ;
  marker.data.icon = myIcon;
  return marker;
} 

// Shape filter
function applyFilter() {
  
  pruneCluster.RemoveMarkers();
  filtered = filter_data();
  
  // Add markers
    filtered.forEach(function (d) {
      let marker = createMarker(d);
      marker.filtered = false;
      pruneCluster.RegisterMarker(marker);
    });
    mymap.addLayer(pruneCluster);
    pruneCluster.ProcessView();
}

function filter_data() {
  var filtered = [];
  encounters.forEach(function (d) {
    let year = d.datetime.split(' ')[0].split('/')[2];
    let hour = d.datetime.split(' ')[1].split(':')[0];
    if (shape === "All") {
      if (year >= startDate && year <= endDate && hour >= startTime && hour <= endTime) {
        filtered.push(d);
      }
    }
   else {
    if (d.shape == shape && year >= startDate && year <= endDate && hour >= startTime && hour <= endTime) {
      filtered.push(d);
    }
  }
  
  });
  return filtered;
}


