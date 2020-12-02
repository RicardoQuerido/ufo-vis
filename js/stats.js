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
            newGroup.appendChild(shapeOption);
        });
        shapeFilter.appendChild(newGroup);
    });
}


//TODO: Organizar código.
//TODO: limpar dados antes de meter no histograma.
let data = [];
d3.csv("/data/complete.csv").then(meh => {
    meh.forEach(d => {
        const nice = parseInt(d["duration (seconds)"]);
        if(nice < 300)
        data.push(nice);
    })
    console.log(data);
    wow();
});

function wow() {
    const c = document.getElementById("a");

    let width = c.offsetWidth;
    let height = c.offsetHeight;
    
    let svg = d3.select("#my-chart").append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`);
    
    // 1rem = 16px
    margin = ({
        top: 16,
        right: 32,
        bottom: 26,
        left: 64
    });
    
    bins = d3.histogram().thresholds(6)(data);
    
    console.log(d3.extent(data))

    x = d3.scaleLinear()
        .domain(d3.extent(data))
        .range([margin.left, width - margin.right])
        .nice();
    
    y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)]).nice()
        .range([height - margin.bottom, margin.top]);
    
    xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(t => {if(t%6) return; return t;}).tickSizeOuter(0))
        .attr("font-size", "1rem")
        .call(g => g.append("text")
            .attr("x", width - margin.right)
            .attr("y", -4)
            .attr("fill", "currentColor")
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .attr("font-size", "1rem")
            .text("lmao"))
    
    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(height / 40))
        .attr("font-size", "1rem")
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("font-size", "1rem")
            .text("nice"))
    
    svg.append("g")
        .attr("fill", "purple")
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
