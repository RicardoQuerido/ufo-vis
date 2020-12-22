let topCountries = new Map();
let topShapes = new Map();
let countries = new Map();
let totalSightings = 0;

d3.csv("data/complete.csv").then(function (data) {
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

    // Get country corresponding name by codename (e.g. US)
    d3.csv("data/countries.csv").then(function (data) {
        data.forEach(function (d) {
            countries.set(d.Code.toLowerCase(), d.Name);
        });

        // Sort by value
        topCountries = new Map([...topCountries.entries()].sort((a, b) => b[1] - a[1]))
        topShapes = new Map([...topShapes.entries()].sort((a, b) => b[1] - a[1]));

        // Bind to html
        document.getElementById('top_country').innerHTML = countries.get(topCountries.entries().next().value[0]);
        document.getElementById('top_shape').innerHTML = topShapes.entries().next().value[0];
        document.getElementById('total_sightings').innerHTML = totalSightings;

    });
});

window.onload = () => {
    document.getElementById("icon_top_country").addEventListener("mouseenter", wiggle);
    document.getElementById("icon_top_shape").addEventListener("mouseenter", wiggle);
    document.getElementById("icon_total_sightings").addEventListener("mouseenter", wiggle);
}

function wiggle(e) {
    const elem_style = document.getElementById(e.target.id.substring(5)).style;
    elem_style.transition = "var(--transition-speed)";
    elem_style.color = "var(--accent)";
    elem_style.fontWeight = "bold";
    setTimeout(function () {
        elem_style.color = "black";
        elem_style.fontWeight = "normal";
    }, 500);
}