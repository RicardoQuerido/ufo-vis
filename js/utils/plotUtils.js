// plot creation functions
function applyGobalFilters(data) {
    // TODO: Number limit filter

    if (shapeFilter) {
        data = data.filter(d => d.shape === shapeFilter);
    }

    // TODO: Date Filter

    return data;
}

function createPlotBox(id, {
    top = 16,
    right = 16,
    bottom = 26,
    left = 64
} = {}) {
    const plotArea = document.getElementById(id);

    const width = plotArea.offsetWidth;
    const height = plotArea.offsetHeight;

    // 1rem = 16px
    const margin = {
        top: top,
        right: right,
        bottom: bottom,
        left: left
    };

    return [width, height, margin];
}


function createSVG(id, width, height) {
    return d3.select(`#${id}`)
        .append("svg")
        .attr("height", "100%")
        .attr("preserveAspectRatio", "none")
        .attr("viewBox", `0 0 ${width} ${height}`);
}

function createNoDataText(svg, width, height) {
    return svg
        .append('text')
        .text("No data.")
        .attr("x", function () {
            return (width / 2)
        })
        .attr("y", function () {
            return (height / 2)
        })
        .style("text-anchor", "middle")
        .style("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;")
        .style("font-size", "1.5rem");
}


function createXYAxis(width, height, margin, xDomain, yDomain, xLabel, yLabel, {
    xScale = d3.scaleLinear(),
    yScale = d3.scaleLinear(),
    xTicks = null,
    yTicks = null
} = {}) {
    x = xScale
        .domain(xDomain)
        .range([margin.left, width - margin.right])
        .nice();

    y = yScale
        .domain(yDomain)
        .range([height - margin.bottom, margin.top])
        .nice();

    xTicks = xTicks ? x.ticks(xTicks) : x.ticks().filter(tick => Number.isInteger(tick));

    yTicks = yTicks ? y.ticks(yTicks) : y.ticks().filter(tick => Number.isInteger(tick));

    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickValues(xTicks).tickFormat(d3.format('d')).tickSizeOuter(0))
        .attr("font-size", "1rem")
        .call(g => g.append("text")
            .attr("x", width - margin.right)
            .attr("y", -4)
            .attr("fill", "currentColor")
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .attr("font-size", "1rem")
            .text(xLabel));

    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickValues(yTicks).tickFormat(d3.format('d')))
        .attr("font-size", "1rem")
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("font-size", "1rem")
            .text(yLabel));

    return [xAxis, yAxis];
}