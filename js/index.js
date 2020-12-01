let topCountries = new Map();
let topShapes = new Map();
let totalSightings = 0;

d3.csv("/data/complete.csv").then(function (data) {
    data.forEach(function (d) {
        if (topCountries.has(d.country)) {
            topCountries.set(d.country, topCountries.get(d.country) + 1);
        } else {
            topCountries.set(d.country, 1);
        }
        if (topShapes.has(d.shape)) {
            topShapes.set(d.shape, topShapes.get(d.shape) + 1);
        } else {
            topShapes.set(d.shape, 1);
        }
        totalSightings += 1;
    });


    // Sort by value
    topCountries = new Map([...topCountries.entries()].sort((a, b) => b[1] - a[1]))
    topShapes = new Map([...topShapes.entries()].sort((a, b) => b[1] - a[1]));

    // Bind to html
    document.getElementById('top_country').innerHTML = topCountries.entries().next().value[0];
    document.getElementById('top_shape').innerHTML = topShapes.entries().next().value[0];
    document.getElementById('total_sightings').innerHTML = totalSightings;
});