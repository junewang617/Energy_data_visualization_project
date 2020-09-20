var domElement = "body";

var url="http://localhost:5000/renewables";

// Main variables
let data = null,
    margin = null,
    width = null,
    height = null,
    x = null,
    xAxis = null,
    y = null,
    yAxis = null,
    color = null,
    svg = null,
    line = null,
    timeseries2plot = null, 
    t2plot = null,
    legend = null,
    mouseG = null;

var ChosenYAxis="Production"

function setupCanvasSize() {
// Setup canvas margins and size
margin = {
top:50,
right: 220,
bottom: 100,
left: 300
},
width = 1500 - margin.left - margin.right,
height = 600 - margin.top - margin.bottom;
}

setupCanvasSize()

function setLinesColorScale() {
var color = d3.scale.category20();
console.log(color);
return color;
}

function setupScales() {
    // Set time scale for x axis
    var xscale = d3.time.scale()
    .range([0, width]);
    console.log(xscale)

    // Set linear scale for y axis
    var yscale = d3.scale.linear()
    .range([height, 0]);

    return[xscale,yscale];
}

function setupAxis(newxScale,newYScale) {
    // Set x axis
    var xAxis = d3.svg.axis()
    .scale(newxScale)
    .orient("bottom");
      
    // Set y axis
    var yAxis = d3.svg.axis()
    .scale(newYScale)
    .orient("left")
       
    return[xAxis,yAxis];
}

function transformyAxis(newYScale,yAxis) {
    // Set x axis
    // var bottomaxis = d3.svg.axis()
    // .scale(newxScale)
    // .orient("bottom");

    // xAxis.transition()
    // .duration(1000)
    // .call(bottomaxis);
    
    // Set y axis
    var leftaxis = d3.svg.axis()
    .scale(newYScale)
    .orient("left")

    yAxis.transition()
    .duration(1000)
    .call(leftaxis);
    
    return yAxis;
}

function interpolateLines(data,xScale,yScale) {
// Set line
    line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) {
        return xScale(d.date);
    })
    .y(function(d) {
        return yScale(d.price);
    });
    console.log(line)
}

function appendSvg(domElement,plotnames,color) {
    // Add SVG element to body section
    d3.selectAll("svg").remove();
    svg = d3.select(domElement).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    color.domain(d3.keys(plotnames[0]).filter(function(key) {
        return key !== "date";
        })
    );
}

function colorTransform (plotnames,color) {

    console.log(plotnames)
    color.domain(d3.keys(plotnames[0]).filter(function(key) {
        return key !== "date";
        })
    )
};

function mapLines(data,color) {
    var timeseries2plot = color.domain().map(function(name) {
        console.log(name)
        return {
            name: name,
            values: data.map(function(d) {
                return {
                    date: d.date,
                    price: +d[name]
                };
            })
        };
    });
    return timeseries2plot;
}

function setupScaleDomains(timeseries2plot,data,xScale,yScale) {
    // Set domains for each axis
    xScale.domain(d3.extent(data, function(d) {
        return d.date;
    }));

    yScale.domain([
        d3.min(timeseries2plot, function(c) {
            return d3.min(c.values, function(v) {
                return v.price;
            });
        }),
        d3.max(timeseries2plot, function(c) {
            return d3.max(c.values, function(v) {
                return v.price;
            });
        })
    ]);
}

function drawLegend(timeseries2plot, color) {
    console.log("Inside Draw Legend")
    legend = svg.selectAll('g')
    .data(timeseries2plot)
    .enter()
    .append('g')
    .attr('class', 'legend');
    console.log(timeseries2plot)
    legend.append('rect')
    .attr('x', 20)
    .attr('y', function(d, i) {
        return i * 20 - 10;
    })
    .attr('width', 20)
    .attr('height', 5)
    .style('fill', function(d) {
        return color(d.name);
    });

    legend.append('text')
    .attr('x', 50)
    .attr('y', function(d, i) {
        return (i * 20) - 5;
    })
    .text(function(d) {
        console.log(d.name)
        return d.name;
    })
    .style('fill', 'white');
}

function setLabels(xAxis,yAxis,ChosenYAxis) {
    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    //.attr("transform", "rotate(-90)")
    .attr("y", margin.bottom-50)
    //.attr("dy", ".80em")
    .attr("x", (width/2))
    .style("text-anchor", "end")
    .style("fill","white")
    .text("Year");

}

function setLineFollower(timeseries2plot,data,color,xScale,yScale) {
    t2plot = svg.selectAll(".t2plot")
    .data(timeseries2plot)
    .enter().append("g")
    .attr("class", "t2plot");

    t2plot.append("path")
    .attr("class", "line")
    .attr("d", function(d) {
        console.log(d)
        return line(d.values);
    })
    .style("stroke", function(d) {
        return color(d.name);
    });

    t2plot.append("text")
    .datum(function(d) {
        return {
                //name: d.name,
                value: d.values[d.values.length - 1]
        };
    })
    .attr("transform", function(d) {
        //console.log(y(d.value.price))
        return "translate(" + xScale(d.value.date) + "," + yScale(d.value.price) + ")";
    })
    .attr("x", 3)
    .attr("dy", ".50em")
    .text(function(d) {
        return d.name;
    })
    .style('fill', 'white');
}

function setMouseInteractions(timeseries2plot,data,color,xScale,yScale) {
    mouseG = svg.append("g")
    .attr("class", "mouse-over-effects");

    mouseG.append("path") // this is the black vertical line to follow mouse
    .attr("class", "mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", "0");

    var lines = document.getElementsByClassName('line');

    var mousePerLine = 
    mouseG.selectAll('.mouse-per-line')
    .data(timeseries2plot)
    .enter()
    .append("g")
    .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
    .attr("r", 7)
    .style("stroke", function(d) {
        return color(d.name);
    })
    .style("fill", "false")
    .style("stroke-width", "5px")
    .style("opacity", "10");

    mousePerLine.append("text")
    .attr("transform", "translate(10,5)")
    .style("fill","white");

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
    .attr('width', width) // can't catch mouse events on a g element
    .attr('height', height)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mouseout', function() { // on mouse out hide line, circles and text
        d3.select(".mouse-line")
            .style("opacity", "10");
        d3.selectAll(".mouse-per-line circle")
            .style("opacity", "10");
        d3.selectAll(".mouse-per-line text")
            .style("opacity", "10");
    })
    .on('mouseover', function() { // on mouse in show line, circles and text
        d3.select(".mouse-line")
            .style("opacity", "10");
        d3.selectAll(".mouse-per-line circle")
            .style("opacity", "10");
        d3.selectAll(".mouse-per-line text")
            .style("opacity", "10");
    })
    .on('mousemove', function() { // mouse moving over canvas
        var mouse = d3.mouse(this);
        d3.select(".mouse-line")
            .attr("d", function() {
                    var d = "M" + mouse[0] + "," + height;
                    d += " " + mouse[0] + "," + 0;
                    return d;
            });

        d3.selectAll(".mouse-per-line")
        .attr("transform", function(d, i) {
            //console.log(width/mouse[0])
            var xDate = xScale.invert(mouse[0]),
                bisect = d3.bisector(function(d) { return d.date; }).right;
            idx = bisect(d.values, xDate);
            var beginning = 0,
                end = lines[i].getTotalLength(),
                target = null;
            while (true) {
                    target = Math.floor((beginning + end) / 2);
                    pos = lines[i].getPointAtLength(target);
                    if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                        break;
                    }
                    if (pos.x > mouse[0]) end = target;
                    else if (pos.x < mouse[0]) beginning = target;
                    else break; //position found
            }

            d3.select(this)
            .select('text')
            .text(yScale.invert(pos.y).toFixed(5));

            return "translate(" + mouse[0] + "," + pos.y + ")";
        });
    })
}

function rebuildplot(value,jsondata,ChosenYAxis){
    
    console.log(value)
    console.log(ChosenYAxis)
    if (value!=ChosenYAxis){
        ChosenYAxis=value;
        data = [];
        console.log(ChosenYAxis)
            if (ChosenYAxis==="Production"){
                names = [`Wood Energy ${ChosenYAxis}`,
                `Biofuels ${ChosenYAxis}`,
                `Total Biomass Energy ${ChosenYAxis}`,
                `Total Renewable Energy ${ChosenYAxis}`,
                ];
            }
            else {
                console.log("inside else")
                names = [`Wood Energy ${ChosenYAxis}`,
                `Biofuels ${ChosenYAxis}`,
                `Total Biomass Energy ${ChosenYAxis}`,
                `Total Renewable Energy ${ChosenYAxis}`,
                `Geothermal Energy ${ChosenYAxis}`,
                `Hydroelectric Power ${ChosenYAxis}`,
                `Solar Energy ${ChosenYAxis}`,
                `Waste Energy ${ChosenYAxis}`,
                `Wind Energy ${ChosenYAxis}`
                ];
            }
        for (var i = 0; i < jsondata.length; i++) {
            var row = { "date": jsondata[i].date };
            for (const n of names) {
                row[n] = jsondata[i][n];
            }
            data.push(row);
        };
    
        console.log(jsondata);
        console.log(data);

        d3.select(graphtitle).text("")
        d3.select(graphtitle)
        .append("h3")
        .append("b")
        .text(`Yearly ${ChosenYAxis} by sources`)

        var xScale,yScale,xAxis,yAxis,timeseries2plot
        // Set general color scale (20)
        var bubbleColors=setLinesColorScale()
        //console.log(bubbleColors)

        appendSvg(domElement,data,bubbleColors) // Add general svg

        scales=setupScales()
        console.log(scales)
        xScale=scales[0]
        yScale=scales[1]
        //[xScale,yScale]=setupScales() 
        //console.log(xScale)

        // Set X, Y axis
        var Axis=setupAxis(xScale,yScale) // Set X, Y axis
        xAxis=Axis[0]
        yAxis=Axis[1]

        interpolateLines(jsondata,xScale,yScale) // Interpolate lines from parsed data
        //colorTransform(data,bubbleColors);
        
        timeseries2plot=mapLines(jsondata,bubbleColors) // Map lines
        console.log(timeseries2plot)
        setupScaleDomains(timeseries2plot,jsondata,xScale,yScale) // Set scale domains
        //transformyAxis(yScale,yAxis)
        console.log("Before Legend")
        drawLegend(timeseries2plot,bubbleColors) // Draw legend
        console.log("After Legend")
        setLabels(xAxis,yAxis,ChosenYAxis) // Set text labels

        // Add interactions
        setLineFollower(timeseries2plot,jsondata,bubbleColors,xScale,yScale)

        setMouseInteractions(timeseries2plot,jsondata,bubbleColors,xScale,yScale)

        //Create labels group for y axis
        var ylabelsgroup= svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
    // // , `translate(0, ${(0 - (height / 2))})`)
    // // .attr("transform", `translate(${width / 2}, ${height + margin.top})`)
    // //.classed("yText", true)

    //Add label for Production and default to active
        var ProductionLabel = ylabelsgroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -100)
        .attr("dy", ".80em")
        .attr("x", -(height/3))
        .style("text-anchor", "end")
        //.style("fill","white")
        .attr("value", "Production") // value to grab for event listener
        //.classed("active ylabel", true)
        .text("Production [Trillion (BTU]");

    //Add label for Consumption and default to inactive
        var ConsumptionLabel = ylabelsgroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -80)
        .attr("dy", "1.20em")
        .attr("x", -(height/3))
        .style("text-anchor", "end")
        //.style("fill","white")
        .attr("value", "Consumption") // value to grab for event listener
        //.classed("inactive ylabel", true)
        .text("Consumption [Trillion (BTU]");

        if (ChosenYAxis === "Consumption") {
            ConsumptionLabel
                .classed("active ylabel", true)
                .classed("inactive ylabel", false);
            ProductionLabel
                .classed("active ylabel", false)
                .classed("inactive ylabel", true);
        }
        else {
            ProductionLabel
                .classed("active ylabel", true)
                .classed("inactive ylabel", false);
            ConsumptionLabel
                .classed("active ylabel", false)
                .classed("inactive ylabel", true);
        } 

        d3.selectAll(".ylabel")
        .on("click",function(){
            var value = d3.select(this).attr("value");
            console.log(value)
            if (value!=ChosenYAxis){
                rebuildplot(value,jsondata,ChosenYAxis);
            }
        
        })

    }
}

//d3.json("http://localhost:5000/renewables").then(jsondata=> {
d3.json(url,function(jsondata) {
    
    var parseDate = d3.time.format("%Y").parse;
    console.log(parseDate)
    jsondata.forEach(function(d) {
        d.date = parseDate(d.Year + "");

    });
    console.log(jsondata);
    var data = [];
    var names = [`Wood Energy ${ChosenYAxis}`,
        `Biofuels ${ChosenYAxis}`,
        `Total Biomass Energy ${ChosenYAxis}`,
        `Total Renewable Energy ${ChosenYAxis}`,
    ];
    for (var i = 0; i < jsondata.length; i++) {
        var row = { "date": jsondata[i].date };
        for (const n of names) {
            row[n] = jsondata[i][n];
        }
        data.push(row);
    };
    var xScale,yScale,xAxis,yAxis,timeseries2plot
    // Set general color scale (20)
    var bubbleColors=setLinesColorScale()
    //console.log(bubbleColors)

    // Set X, Y scales
    var scales=setupScales()
    console.log(scales)
    xScale=scales[0]
    yScale=scales[1]
    //[xScale,yScale]=setupScales() 
    //console.log(xScale)

    // Set X, Y axis
    var Axis=setupAxis(xScale,yScale) // Set X, Y axis
    xAxis=Axis[0]
    yAxis=Axis[1]

    interpolateLines(jsondata,xScale,yScale) // Interpolate lines from parsed data
    appendSvg(domElement,data,bubbleColors) // Add general svg
    timeseries2plot=mapLines(jsondata,bubbleColors) // Map lines
    setupScaleDomains(timeseries2plot,jsondata,xScale,yScale) // Set scale domains
    drawLegend(timeseries2plot,bubbleColors) // Draw legend
    setLabels(xAxis,yAxis,ChosenYAxis) // Set text labels

    // Add interactions
    setLineFollower(timeseries2plot,jsondata,bubbleColors,xScale,yScale)

    setMouseInteractions(timeseries2plot,jsondata,bubbleColors,xScale,yScale)

    //Create labels group for y axis
    var ylabelsgroup= svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    // , `translate(0, ${(0 - (height / 2))})`)
    // .attr("transform", `translate(${width / 2}, ${height + margin.top})`)
    //.classed("yText", true)

    //Add label for Production and default to active
    var ProductionLabel = ylabelsgroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -100)
        .attr("dy", ".80em")
        .attr("x", -(height/3))
        .style("text-anchor", "end")
        //.style("fill","white")
        .attr("value", "Production") // value to grab for event listener
        .classed("active ylabel", true)
        .text("Production [Trillion (BTU]");

    //Add label for Consumption and default to inactive
    var ConsumptionLabel = ylabelsgroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -80)
        .attr("dy", "1.20em")
        .attr("x", -(height/3))
        .style("text-anchor", "end")
        //.style("fill","white")
        .attr("value", "Consumption") // value to grab for event listener
        .classed("inactive ylabel", true)
        .text("Consumption [Trillion (BTU]");
    
    d3.selectAll(".ylabel")
    .on("click",function(){
        var value = d3.select(this).attr("value");
        console.log(value)
        if (value!=ChosenYAxis){
            rebuildplot(value,jsondata,ChosenYAxis);
        }
        
    })
})


    /*  Araceli Manzano Chicano (aramanzano@uma.es)

        References: data - http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:bollinger_bands
                    initial script - https://stackoverflow.com/questions/34886070/multiseries-line-chart-with-mouseover-tooltip/34887578#34887578
                    d3 - https://www.analyticsvidhya.com/blog/2017/08/visualizations-with-d3-js/

    */

// 