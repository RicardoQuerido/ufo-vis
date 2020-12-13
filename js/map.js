let encounters = [];

let shapeFilter = "All";
let dateFilter = [1906, 2014];
let timeFilter = [0,24];

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
  d3.csv("/data/data_with_countries.csv").then(function (data) {   
    data.forEach(function (d) {
      // Create sighting object
      const [date, time] = d.datetime.split(" ")
      let s = new Sighting(date, time, d.city, d.country, d.shape, d['duration (seconds)'], d.comments, d.latitude, d.longitude);
      // Save object in encounters array
      encounters.push(s);     
      // Add markers 
      let marker = createMarker(s);
      pruneCluster.RegisterMarker(marker);
      mymap.spin(false);
    });
    mymap.addLayer(pruneCluster);
  });
  
  // Listener for shape filter
  document.getElementById("shape_filter").addEventListener("change", (e) => {
    mymap.spin(true);
    setTimeout(function () {
      shapeFilter = e.target.value;
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
  "<b>Description: </b>" + d.comments + "<br>"
  ;
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