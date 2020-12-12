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
// Number of results to retrieve
let nrResults = 5000;
// Clustering
let markers = L.markerClusterGroup();
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
  mymap = L.map('mapid').setView([51.505, -0.09], 1.5);
  // Add tile layer to the map
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
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
        if (encounters.length < nrResults) {
            markers.addLayer(L.marker([s.lat, s.long]).bindPopup(
              "<b>Datetime: </b>" + s.datetime + "<br>" +
              "<b>Country: </b>" + countries.get(s.country) + "<br>" +
              "<b>Shape: </b>" + s.shape + "<br>" +
              "<b>Duration(s): </b>" + s['duration (seconds)'] + "<br>" +
              "<b>Description: </b>" + s.comments + "<br>"
            ));
          };
        mymap.spin(false);
    });

  });
  
  
  mymap.addLayer(markers);
  
  document.getElementById("shape_filter").addEventListener("change", (e) => {
    mymap.spin(true);
    setTimeout(function () {
      shape = e.target.value;
      applyFilter();  
      mymap.spin(false);
      }, 0);
    
     
  });

  document.getElementById("nr_results").addEventListener("change", (e) => {
    mymap.spin(true);
    setTimeout(function () {
      nrResults = e.target.value;
      applyFilter();  
      mymap.spin(false);
      }, 0);
 });
};

// Shape filter
function applyFilter() {
  markers.clearLayers();
  filtered = filter_data();

  
  // Add markers
    filtered.forEach(function (d) {
      let marker;
      marker = L.marker([d.lat, d.long]).bindPopup(
      "<b>Datetime: </b>" + d.datetime + "<br>" +
      "<b>Country: </b>" + countries.get(d.country) + "<br>" +
      "<b>Shape: </b>" + d.shape + "<br>" +
      "<b>Duration(s): </b>" + d['duration (seconds)'] + "<br>" +
      "<b>Description: </b>" + d.comments + "<br>"
      );
      markers.addLayer(marker);
    });
    
  //});
  //mymap.spin(false);
}

function filter_data() {
  let i = 0;
  var filtered = [];
  if (shape === "All") {
    encounters.forEach(function (d) {
      if (i < nrResults) {
        filtered.push(d);
        i++;
      }
  });
  } else {
      encounters.forEach(function (d) {
        if (d.shape == shape && i < nrResults) {
          filtered.push(d);
          i++;
        }
    });
  }
  return filtered;
}

