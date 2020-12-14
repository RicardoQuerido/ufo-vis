d3.json("/data/shapeGroups.json").then(data => {
    createShapeFilters("shape_filter", data);
});

// global data and global filters
let encounters = [];
let shapeFilter = "All";
let dateFilter = [1906, 2014];
let timeFilter = [0, 24];


d3.csv("/data/data_with_countries.csv").then(data => {
    data.forEach(row => {
        const duration = parseInt(row["duration (seconds)"]);
        const shape = row.shape;
        const [date, time] = row.datetime.split(" ");
        const comments = row.comments;
        let s = new Sighting(date, time, row.city, row.country, shape, duration, comments, row.latitude, row.longitude);
        encounters.push(s);
    })
    showInfo(encounters);
});

// For hover effects
const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "svg-tooltip");


function histogramEncounterDuration(data, binsCount, rangeFilter = null) {
    // apply local filters
    if (rangeFilter) {
        const [start, end] = rangeFilter;
        data = data.filter(d => d.duration >= start && d.duration <= end);
    }

    // process data for plot
    const durations = data.map(d => d.duration);


    const [width, height, margin] = createPlotBox("plot_encounter_duration");

    let svg = createSVG("plot_encounter_duration", width, height);

    if (durations.length === 0) {
        createNoDataText(svg, width, height);
        return;
    }

    // create plot
    let bins = d3.histogram().thresholds(binsCount)(durations);


    if (durations.length === 1) {
        bins[0].x0 = 0;
    }

    const [xAxis, yAxis] = createXYAxis(
        width, height, margin,
        d3.extent(durations),
        [0, d3.max(bins, d => d.length)],
        "durations",
        "sightings", {
            xTicks: 12,
        }
    );

    // append to SVG
    svg.append("g")
        .attr("fill", "#cc9c59")
        .selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("x", d => {
            if (durations.length === 1) {
                return margin.left;
            }
            return x(d.x0) + 1;
        })
        .attr("width", d => {
            if (durations.length === 1) {
                return x(d.x1) - margin.left;
            }
            return Math.max(0, x(d.x1) - x(d.x0) - 1);
        })
        .attr("y", d => y(d.length))
        .attr("height", d => y(0) - y(d.length));

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    svg.selectAll("rect")
        .on("mouseover", function (d) {
            d3.select(this)
                .style("opacity", "0.7");
            tooltip
                .style("visibility", "visible")
                .text(`Number of sightings: ${d.length}\nInterval: from ${d.x0} to ${d.x1} seconds`);
        })
        .on("mousemove", function () {
            const leftMargin = (d3.event.pageX + 250 < window.innerWidth) ? d3.event.pageX + 10 : d3.event.pageX - 220;
            tooltip
                .style("top", d3.event.pageY + 20 + "px")
                .style("left", leftMargin + "px");
        })
        .on("mouseout", function () {
            d3.select(this).style("opacity", "1");
            tooltip.style("visibility", "hidden");
        });
}

function donutShapes(data) {

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
            return d.data[1] / data.length > 0.05 ? d.data[0] : "";
        })
        .attr("transform", function (d) {
            return "translate(" + arc.centroid(d) + ")";
        })
        .style("text-anchor", "middle")
        .style("font-size", 17)


    svg.selectAll("path")
        .on("mouseover", function (d) {
            d3.select(this)
                .style("opacity", "0.7");
            tooltip
                .style("visibility", "visible")
                .text(`Number of sightings: ${d.data[1]}\nShape: ${d.data[0].charAt(0).toUpperCase() + d.data[0].slice(1)}`);
        })
        .on("mousemove", function () {
            const leftMargin = (d3.event.pageX + 210 < window.innerWidth) ? d3.event.pageX + 10 : d3.event.pageX - 190;
            tooltip
                .style("top", d3.event.pageY + 20 + "px")
                .style("left", leftMargin + "px");
        })
        .on("mouseout", function () {
            d3.select(this).style("opacity", "1");
            tooltip.style("visibility", "hidden");
        });

}

function wordCloudDescription(data) {

    let allWords = new Map();

    d3.json("/data/stopwords.json").then(d0 => {
        const stopWords = new Set(d0);

        data.forEach(d => {
            const tokens = d.comments.trim().split(" ")
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

function plotSightYear(data) {

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

    const [startYear, endYear] = dateFilter;
    for(let y = startYear; y <= endYear; y++) {
        if (!years.has(y)) {
            years.set(y, 0);
        }
    }

    years = Array.from(years);
    years.sort();

    // create plot
    line = d3.line()
        .x(d => x(d[0]))
        .y(d => y(d[1]))
        .curve(d3.curveMonotoneX)

    const [width, height, margin] = createPlotBox("plot_sight_year", {
        right: 32
    });

    let svg = createSVG("plot_sight_year", width, height);

    const [xAxis, yAxis, xScale, yScale] = createXYAxis(
        width, height, margin,
        d3.extent(years.map(d => d[0])),
        [0, d3.max(years.map(d => d[1]))],
        "years",
        "sightings",
        {returnScale: true}
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

    svg.selectAll(".dot")
        .data(years)
        .enter().append("circle")
        .attr("fill", "#F07C83")
        .attr("cx", function (d, i) {
            return xScale(d[0])
        })
        .attr("cy", function (d) {
            return yScale(d[1])
        })
        .attr("r", 5)
        .on("mouseover", function (d) {
            d3.select(this)
                .style("opacity", "0.7")
                .attr("r", 10);
            tooltip
                .style("visibility", "visible")
                .text(`Number of sightings: ${d[1]}\nYear: ${d[0]}`);
        })
        .on("mousemove", function () {
            const leftMargin = (d3.event.pageX + 250 < window.innerWidth) ? d3.event.pageX + 10 : d3.event.pageX - 220;
            tooltip
                .style("top", d3.event.pageY + 20 + "px")
                .style("left", leftMargin + "px");
        })
        .on("mouseout", function () {
            d3.select(this).style("opacity", "1").attr("r", 5);
            tooltip.style("visibility", "hidden");
        });;
}

function histogramSightHour(data) {
    const binsCount = 24;

    // process data for plot
    const hours = data.map(d => parseInt(d.time.split(":")[0]));

    const [width, height, margin] = createPlotBox("plot_sight_hour");

    let svg = createSVG("plot_sight_hour", width, height);

    if (hours.length === 0) {
        createNoDataText(svg, width, height);
        return;
    }

    // create plot
    bins = d3.histogram().thresholds(binsCount)(hours);

    if (hours.length === 1) {
        bins[0].x0 -= 1;
        if (bins[0].x0 === -1) {
            bins[0].x0 = 23
            bins[0].x1 = 24
        }
    }

    const [xAxis, yAxis] = createXYAxis(
        width, height, margin,
        [0, binsCount],
        [0, d3.max(bins, d => d.length)],
        "hours",
        "sightings"
    );

    // append to SVG
    svg.append("g")
        .attr("fill", "#B7A8C1")
        .selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("x", d => {
            return x(d.x0) + 1;
        })
        .attr("width", d => {
            return Math.max(0, x(d.x1) - x(d.x0) - 1);
        })
        .attr("y", d => y(d.length))
        .attr("height", d => y(0) - y(d.length));

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    svg.selectAll("rect")
        .on("mouseover", function (d) {
            d3.select(this)
                .style("opacity", "0.7");
            tooltip
                .style("visibility", "visible")
                .text(`Number of sightings: ${d.length}\nInterval: from ${d.x0}h00 to ${d.x1}h00`);
        })
        .on("mousemove", function () {
            const leftMargin = (d3.event.pageX + 250 < window.innerWidth) ? d3.event.pageX + 10 : d3.event.pageX - 220;
            tooltip
                .style("top", d3.event.pageY + 20 + "px")
                .style("left", leftMargin + "px");
        })
        .on("mouseout", function () {
            d3.select(this).style("opacity", "1");
            tooltip.style("visibility", "hidden");
        });

}


document.getElementById("shape_filter").addEventListener("change", (e) => {
    shapeFilter = e.target.value;
    const data = applyGobalFilters(encounters);
    showInfo(data);
});

function showInfo(data) {
    d3.selectAll("svg").remove();
    histogramEncounterDuration(data, 6, [0, 300]);
    donutShapes(data);
    wordCloudDescription(data);
    plotSightYear(data);
    histogramSightHour(data);
}