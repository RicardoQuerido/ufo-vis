d3.json("/data/shapeGroups.json").then(data => {
    createShapeFilters(data);
});

function createShapeFilters(shapeGroups) {
    let shapeFilter = document.getElementById('shape_filter');

    Object.entries(shapeGroups).forEach(groups => {
        let newGroup = document.createElement("optgroup");
        const [shapeGroup, shapeList] = groups;
        newGroup.label = shapeGroup;
        shapeList.forEach(shape => {
            let shapeOption = document.createElement("option");
            shapeOption.textContent = shape.charAt(0).toUpperCase() + shape.slice(1);
            shapeOption.value = shape.toLowerCase();
            newGroup.appendChild(shapeOption);
        });
        shapeFilter.appendChild(newGroup);
    });
}

let processedData = [];
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
    histogramEncounterDuration(processedData, 6, [0, 300]);
    histogramSightHour(processedData, 24, [0, 24]);
});

//data should come like this: [{duration, shape, date}, ...] (at least)
//probably filters, data and range will be global in the future
function histogramEncounterDuration(data, binsCount, rangeFilter = null, shapeFilter = null, dateFilter = null) {
    if (rangeFilter) {
        const [start, end] = rangeFilter;
        data = data.filter(d => d.duration >= start && d.duration <= end);
    }
    if (shapeFilter) {
        data = data.filter(d => d.shape === shapeFilter);
    }

    const durations = data.map(d => d.duration);

    const plotArea = document.getElementById("plot_encounter_duration");

    const width = plotArea.offsetWidth;
    const height = plotArea.offsetHeight;

    // 1rem = 16px
    margin = ({
        top: 16,
        right: 16,
        bottom: 26,
        left: 64
    });

    let svg = d3.select("#plot_encounter_duration")
        .append("svg")
        .attr("height","100%")
        .attr("preserveAspectRatio","none")
        .attr("viewBox", `0 0 ${width} ${height}`);

    bins = d3.histogram().thresholds(binsCount)(durations);

    x = d3.scaleLinear()
        .domain(d3.extent(durations))
        .range([margin.left, width - margin.right])
        .nice();

    y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height - margin.bottom, margin.top])
        .nice();

    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(t => {
            if (t % 6) return;
            return t;
        }).tickSizeOuter(0))
        .attr("font-size", "1rem")
        .call(g => g.append("text")
            .attr("x", width - margin.right)
            .attr("y", -4)
            .attr("fill", "currentColor")
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .attr("font-size", "1rem")
            .text("durations"));

    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(height / 40))
        .attr("font-size", "1rem")
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("font-size", "1rem")
            .text("sightings"));

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

function histogramSightHour(data, binsCount, rangeFilter = null, shapeFilter = null, dateFilter = null) {
    if (shapeFilter) {
        data = data.filter(d => d.shape === shapeFilter);
    }

    const hours = data.map(d => parseInt(d.time.split(":")[0]));

    const plotArea = document.getElementById("plot_sight_hour");

    const width = plotArea.offsetWidth;
    const height = plotArea.offsetHeight;

    // 1rem = 16px
    margin = ({
        top: 16,
        right: 16,
        bottom: 26,
        left: 64
    });

    let svg = d3.select("#plot_sight_hour")
        .append("svg")
        .attr("height","100%")
        .attr("preserveAspectRatio","none")
        .attr("viewBox", `0 0 ${width} ${height}`);


    bins = d3.histogram().thresholds(binsCount)(hours);

    x = d3.scaleLinear()
        .domain(rangeFilter)
        .range([margin.left, width - margin.right])
        .nice();

    y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height - margin.bottom, margin.top])
        .nice();

    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(24).tickSizeOuter(0))
        .attr("font-size", "1rem")
        .call(g => g.append("text")
            .attr("x", width - margin.right)
            .attr("y", -4)
            .attr("fill", "currentColor")
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .attr("font-size", "1rem")
            .text("hours"));

    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(height / 40))
        .attr("font-size", "1rem")
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("font-size", "1rem")
            .text("sightings"));

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
    d3.selectAll("svg").remove();
    histogramEncounterDuration(processedData, 6, [0, 300], shapeFilter = e.target.value);
    histogramSightHour(processedData, 24, [0, 24], shapeFilter = e.target.value);
    //this might change to histogramEncounterDuration(6);
});