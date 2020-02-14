var svgWidth = 900;
var svgHeight = 600;

var margin = {
    top: 40,
    bottom: 90,
    right: 40,
    left: 100
};

var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params.
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function used for updating x-scale variable upon click on axis label.
function xScale(paperData, chosenXAxis) {
    // Create Scales.
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(paperData, d => d[chosenXAxis]) * .8,
            d3.max(paperData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;

}

// Function used for updating y-scale variable upon click on axis label.
function yScale(paperData, chosenYAxis) {
    // Create Scales.
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(paperData, d => d[chosenYAxis]) * .8,
            d3.max(paperData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;
}

// Function used for updating xAxis var upon click on axis label.
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// Function used for updating yAxis var upon click on axis label.
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// Function used for updating circles group with a transition to new circles.
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// Function used for updating text in circles group with a transition to new text.
function renderText(circletextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circletextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));
    
    return circletextGroup;
}

// Function used for updating circles group with new tooltip.
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    // Conditional for X Axis.
    if (chosenXAxis === "poverty") {
        var xlabel = "Poverty: ";
    }
    else if (chosenXAxis === "income") {
        var xlabel = "Median Income: "
    }
    else {
        var xlabel = "Age: "
    }

    // Conditional for Y Axis.
    if (chosenYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare: ";
    }
    else if (chosenYAxis === "smokes") {
        var ylabel = "Smokers: "
    }
    else {
        var ylabel = "Obesity: "
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .style("background", "black")
        .style("color", "white")
        .offset([120, -60])
        .html(function(d) {
            if (chosenXAxis === "age") {
                // All yAxis tooltip labels presented and formated as %.
                // Display Age without format for xAxis.
                return (`${d.state}<hr>${xlabel} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
              } else if (chosenXAxis !== "poverty" && chosenXAxis !== "age") {
                // Display Income in dollars for xAxis.
                return (`${d.state}<hr>${xlabel}$${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
              } else {
                // Display Poverty as percentage for xAxis.
                return (`${d.state}<hr>${xlabel}${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}%`);
              }      
        });
    
    circlesGroup.call(toolTip);

    // Create "mouseover" event listener to display tool tip.
    circlesGroup
        // .on("mouseover", function() {
        // d3.select(this)
        //     .transition()
        //     .duration(3000)
        //     .attr("r", 20)
        //     .attr("fill", "blue");
        // })
        .on("click", function(data) {
            toolTip.show(data, this);
        })
        // .on("mouseout", function() {
        //     d3.select(this)
        //     // .transition()
        //     // .duration(1000)
        //     // .attr("r", 15)
        //     // .attr("fill", "green")
        //     toolTip.hide()
        // });
        .on("mouseout", function(data) {
            toolTip.hide(data)
        });

    return circlesGroup;
}

// Import data.
d3.csv("assets/data/data.csv")
    .then(function(paperData) {

    // Parse/Cast as numbers
    paperData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;

        console.log(data);
    });

    // Create x scale function.
    // xLinearScale function above csv import.
    var xLinearScale = xScale(paperData, chosenXAxis);

    // Create y scale function.
    // yLinearScale function above csv import.
    var yLinearScale = yScale(paperData, chosenYAxis);

    // Create axis functions.
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // Create circles.
    var circlesGroup = chartGroup.selectAll("circle")
        .data(paperData)
        .enter()
        .append("circle")
        // .transition()
        // .duration(1000)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "15")
        .attr("fill", "darkred")
        .attr("opacity", ".5");

    // Add State abbr. text to circles.
    var circletextGroup = chartGroup.selectAll()
        .data(paperData)
        .enter()
        .append("text")
        .text(d => (d.abbr))
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .style("font-size", "12px")
        .style("text-anchor", "middle")
        .style('fill', 'black');

    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener.
        .classed("active", true)
        .text("In Poverty (%)");


    var healthcareLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", (margin.left) * 2.5)
        .attr("y", 0 - (height - 60))
        .attr("value", "healthcare") // value to grab for event listener.
        .classed("active", true)
        .text("Lacks Healthcare (%)");


    // Update tool tip function above csv import.
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            
        });

