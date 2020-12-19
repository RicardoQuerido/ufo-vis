let encounters = [];

let shapeFilter = "All";
let dateFilter = [1906, 2014];
let timeFilter = [0, 24];
let countryFilter = "All";

// Clustering
var pruneCluster = new PruneClusterForLeaflet();
var markersList = [];
let countries = new Map();
var mymap;

// Get country corresponding name by codename (e.g. US)
d3.json("/data/shapeGroups.json").then(data => {
  createShapeFilters("shape_filter", data);
});


d3.csv("/data/countries.csv").then(function (data) {
  let filter = document.getElementById('country_filter');
  data.forEach(function (d) {
    countries.set(d.Code.toLowerCase(), d.Name);
    // Add options to select on html
    let countryOption = document.createElement("option");
    countryOption.textContent = d.Name;
    countryOption.value = d.Code.toLowerCase();
    filter.appendChild(countryOption);
  });
});

var geojsonLayer = new L.GeoJSON.AJAX("data/custom.geo.json", {
  onEachFeature: forEachFeature
});

function forEachFeature(feature, layer) {
  // Tagging each state poly with their name for the search cont
  layer._leaflet_id = feature.properties.iso_a2.toLowerCase();
  // console.log(feature.properties.ISO_A2.toLowerCase());
}
window.onload = function () {



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

  // Add legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (mymap) {

      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 100, 4000],
          labels = [];
      div.innerHTML += 'Number of sightings:<br>';
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] + '<br>' : '+');
      }

      return div;
  };

  legend.addTo(mymap);

  // Map spin loading
  mymap.spin(true);
  d3.csv("/data/data_with_countries.csv").then(function (data) {
    data.forEach(function (d) {
      // Create sighting object
      const [date, time] = d.datetime.split(" ")
      let s = new Sighting(date, time, d.city, d.country, d.shape, d['duration (hours/min)'], d.comments, d.latitude, d.longitude);
      // Save object in encounters array
      encounters.push(s);
      // Add markers 
      let marker = createMarker(s);
      pruneCluster.RegisterMarker(marker);
      mymap.spin(false);
    });
    filtered = applyGobalFilters(encounters);
    showInfo(filtered);
    mymap.addLayer(pruneCluster);
  });

  // Listener for shape filter
  $('#shape_filter').on('change', function () {
    mymap.spin(true);
    shapeFilter = this.value;
    setTimeout(function () {
      filtered = applyGobalFilters(encounters);
      showInfo(filtered);
      mymap.spin(false);
    }, 0);
  });

};

// Create marker
function createMarker(d) {
  var myIcon = L.icon({
    iconUrl: './images/ufo-icon.png',
    iconSize: [38, 38]
  });
  let marker = new PruneCluster.Marker(d.lat, d.long);
  marker.data.popup =
    "<b>Date: </b>" + d.date + "<br>" +
    "<b>Hour: </b>" + d.time + "<br>" +
    "<b>City: </b>" + d.city + "<br>" +
    "<b>Country: </b>" + countries.get(d.country) + "<br>" +
    "<b>Shape: </b>" + d.shape + "<br>" +
    "<b>Duration(s): </b>" + d.duration + "<br>" +
    "<b>Description: </b>" + d.comments + "<br>";
  marker.data.icon = myIcon;
  return marker;
}

// Shape filter
function showInfo(filtered) {
  pruneCluster.RemoveMarkers();

  // Add markers
  filtered.forEach(function (d) {
    let marker = createMarker(d);
    marker.filtered = false;
    pruneCluster.RegisterMarker(marker);
  });
  mymap.addLayer(pruneCluster);
  pruneCluster.ProcessView();
}


$(function () {
  $('#country_filter').on('change', function () {
    if (this.value === 'All') {

      mymap.setView([30, 0], 1.5);
    } else {
      try {
        var layer = geojsonLayer._layers[this.value];
        mymap.fitBounds(layer.getBounds());
      } catch (e) {
        mymap.setView([30, 0], 1.5);
      }
    }
  });
});

function processCountryFilter(country) {
  if (country === 'All') {
    mymap.setView([30, 0], 1.5);
  } else {
    try {
      var layer = geojsonLayer._layers[country];
      mymap.fitBounds(layer.getBounds());
    } catch (e) {
      mymap.setView([30, 0], 1.5);
    }
  }
}

function getColor(d) {
  return d > 4000 ? 'rgba(241, 128, 23, 0.6)' :
         d > 100  ? 'rgba(240, 194, 12, 0.6)' :
                    'rgba(110, 204, 57, 0.6)';
}