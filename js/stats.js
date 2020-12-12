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
        const description = row.comments;
        processedData.push({
            duration,
            shape,
            date,
            time,
            description
        });
    })
    histogramEncounterDuration(6, [0, 300]);
    donutShapes();
    wordCloudDescription();
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
        "sightings", {
            xTicks: 12,
            yTicks: 8
        }
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

function donutShapes() {
    // apply global filters
    let data = applyGobalFilters(processedData);

    // process data for plot
    let shapes = new Map();
    data.forEach(d => {
        const shape = d.shape;
        if (shapes.has(shape)) {
            shapes.set(shape, shapes.get(shape) + 1);
        } else {
            shapes.set(shape, 1);
        }
    })
    shapes = Array.from(shapes);

    const [width, height, margin] = createPlotBox("plot_shapes");

    let svg = d3.select(`#plot_shapes`)
        .append("svg")
        .attr("height", "100%")
        .attr("preserveAspectRatio", "none")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


        let radius = Math.min(width, height) / 2 - margin.top

    // Compute the position of each group on the pie:
    let pie = d3.pie()
        .value(function (d) {
            return d[1];
        })
        let data_ready = pie(shapes)

    let arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.8)

    svg
        .selectAll('allSlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', () => '#' + (Math.random() * 0xFFFFFF << 0).toString(16))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)

    svg
        .selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function (d) {
            return d.data[1]/data.length > 0.05 ? d.data[0] : "";
        })
        .attr("transform", function (d) {
            return "translate(" + arc.centroid(d) + ")";
        })
        .style("text-anchor", "middle")
        .style("font-size", 17)


}

function wordCloudDescription() {
    // apply global filters
    let data = applyGobalFilters(processedData);

    let allWords = new Map();

    d3.json("/data/stopwords.json").then(d0 => {
        const stopWords = new Set(d0);

        data.forEach(d => {
            const tokens = d.description.trim().split(" ")
                .map(w => w.toLowerCase())
                .filter(w => w && !stopWords.has(w))

            tokens.forEach(word => {
                if (allWords.has(word)) {
                    allWords.set(word, allWords.get(word) + 1);
                } else {
                    allWords.set(word, 1);
                }
            })
        })

        allWords = Array.from(allWords).map(d => {
            return {
                text: d[0],
                value: d[1]
            };
        }).filter(d => {
            return d.value > 1000;
        });

        const [width, height, margin] = createPlotBox("plot_description");

        let svg = createSVG("plot_description", width, height);

        const layout = d3.layout.cloud()
            .size([width, height])
            .words(allWords)
            .rotate(function () {
                return ~~(Math.random() * 2) * 90;
            })
            .on("end", (words) => {
                svg.append("g")
                    .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                    .selectAll("text")
                    .data(words)
                    .enter()
                    .append("text")
                    .text((d) => d.text)
                    .style("font-size", (d) => d.size + "px")
                    .style("font-family", (d) => d.font)
                    .style("fill", () => '#' + (Math.random() * 0xFFFFFF << 0).toString(16))
                    .attr("text-anchor", "middle")
                    .attr("transform", (d) => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")");
            });

        layout.start();

    })



}

function plotSightYear() {
    // apply global filters
    let data = applyGobalFilters(processedData);

    // process data for plot
    let years = new Map();
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

    const [width, height, margin] = createPlotBox("plot_sight_year", {
        right: 32
    });

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
        "sightings", {
            xTicks: 24
        }
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
    donutShapes();
    wordCloudDescription();
    plotSightYear();
    histogramSightHour();
});