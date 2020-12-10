d3.json("/data/shapeGroups.json").then(data => {
    createShapeFilters("shape_filter", data);
});

// global data and global filters
let processedData = [];
let shapeFilter = null;
let dateFilter = null;
d3.csv("/data/complete.csv").then(data => {
    data.forEach(row => {
        const duration = parseInt(row["duration (seconds)"]);
        const shape = row.shape;
        const [date, time] = row.datetime.split(" ");
        processedData.push({
            duration,
            shape,
            date,
            time
        });
    })
    histogramEncounterDuration(6, [0, 300]);
    plotSightYear();
    histogramSightHour();
});


function histogramEncounterDuration(binsCount, rangeFilter = null) {
    // apply global filters
    let data = applyGobalFilters(processedData);

    // apply local filters
    if (rangeFilter) {
        const [start, end] = rangeFilter;
        data = data.filter(d => d.duration >= start && d.duration <= end);
    }

    // process data for plot
    const durations = data.map(d => d.duration);

    // create plot
    bins = d3.histogram().thresholds(binsCount)(durations);

    const [width, height, margin] = createPlotBox("plot_encounter_duration");

    let svg = createSVG("plot_encounter_duration", width, height);

    const [xAxis, yAxis] = createXYAxis(
        width, height, margin,
        d3.extent(durations),
        [0, d3.max(bins, d => d.length)],
        "durations",
        "sightings",
        {xTicks:12}
    );

    // append to SVG
    svg.append("g")
        .attr("fill", "#625656")
        .selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("x", d => x(d.x0) + 1)
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("y", d => y(d.length))
        .attr("height", d => y(0) - y(d.length));

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);
}

function plotSightYear() {
    // apply global filters
    let data = applyGobalFilters(processedData);

    // process data for plot
    years = new Map();
    data.forEach(d => {
        const year = parseInt(d.date.split("/")[2]);
        if (years.has(year)) {
            years.set(year, years.get(year) + 1);
        } else {
            years.set(year, 1);
        }
    })
    years = Array.from(years);
    years.sort();

    // create plot
    line = d3.line()
        .x(d => x(d[0]))
        .y(d => y(d[1]))

    const [width, height, margin] = createPlotBox("plot_sight_year", {right:32});

    let svg = createSVG("plot_sight_year", width, height);

    const [xAxis, yAxis] = createXYAxis(
        width, height, margin,
        d3.extent(years.map(d => d[0])),
        [0, d3.max(years.map(d => d[1]))],
        "years",
        "sightings",
    );

    // append to SVG
    svg.append("path")
        .datum(years)
        .attr("fill", "none")
        .attr("stroke", "#F07C83")
        .attr("stroke-width", 2.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);
}

function histogramSightHour() {
    // apply global filters
    let data = applyGobalFilters(processedData);
    const binsCount = 24;

    // process data for plot
    const hours = data.map(d => parseInt(d.time.split(":")[0]));

    // create plot
    bins = d3.histogram().thresholds(binsCount)(hours);

    const [width, height, margin] = createPlotBox("plot_sight_hour");

    let svg = createSVG("plot_sight_hour", width, height);

    const [xAxis, yAxis] = createXYAxis(
        width, height, margin,
        [0, binsCount],
        [0, d3.max(bins, d => d.length)],
        "hours",
        "sightings",
        {xTicks:24}
    );

    // append to SVG
    svg.append("g")
        .attr("fill", "#B7A8C1")
        .selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("x", d => x(d.x0) + 1)
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("y", d => y(d.length))
        .attr("height", d => y(0) - y(d.length));

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);
}


document.getElementById("shape_filter").addEventListener("change", (e) => {
    shapeFilter = e.target.value;
    d3.selectAll("svg").remove();
    histogramEncounterDuration(6, [0, 300]);
    plotSightYear();
    histogramSightHour();
});