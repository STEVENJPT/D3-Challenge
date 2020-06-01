function makeResponsive() {

    var svgArea = d3.select("#scatter>svg ")


    var svgHeight = window.innerHeight;
    var svgWidth = window.innerWidth;



    if (svgWidth > 600) {
        var margin = {
            top: 20 + 30 + 30,
            right: 120 + 30 + 30 + 100,
            bottom: 80,
            left: 80 + 30 + 30
        }
    } else {
        var margin = {
            top: 20 + 30 + 30,
            right: 30,
            bottom: 80,
            left: 30
        }

    }


    var chartWidth = svgWidth - margin.left - margin.right;
    var chartHeight = svgHeight - margin.top - margin.bottom;


    if (!svgArea.empty()) {
        svgArea.remove()
    }

    svg = d3.select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)


    svg.append('h1').text('this is p')

    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)




    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";


    function xScale(CensusData, chosenAxis) {

        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(CensusData, d => d[chosenAxis]),
                d3.max(CensusData, d => d[chosenAxis])
            ])
            .range([0, chartWidth]);
        return xLinearScale;
    }

    function yScale(CensusData, chosenAxis) {

        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(CensusData, d => d[chosenAxis]),
                d3.max(CensusData, d => d[chosenAxis])
            ])
            .range([chartHeight, 0]);

        return yLinearScale;

    }



    function renderAxes_x(newScale, xAxis) {
        var bottomAxis = d3.axisBottom(newScale);

        xAxis.transition()
            .duration(100)
            .call(bottomAxis);

        return xAxis;
    }


    function renderAxes_y(newScale, yAxis) {
        var leftAxis = d3.axisLeft(newScale);

        yAxis.transition()
            .duration(1000)
            .call(leftAxis);

        return yAxis;
    }



    function renderCircles_x(circlesGroup, newScale, chosenAxis) {
        circlesGroup.selectAll("circle").transition()
            .duration(1000)
            .attr("cx", d => newScale(d[chosenAxis]));
        circlesGroup.selectAll("text").transition()
            .duration(1000)
            .attr("x", d => newScale(d[chosenAxis]));


        return circlesGroup;
    }


    function renderCircles_y(circlesGroup, newScale, chosenAxis) {
        circlesGroup.selectAll("circle").transition()
            .duration(1000)
            .attr("cy", d => newScale(d[chosenAxis]));
        circlesGroup.selectAll("text").transition()
            .duration(1000)
            .attr("y", d => newScale(d[chosenAxis]));


        return circlesGroup;
    }


    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

        if (chosenXAxis === "poverty") {
            var label_x = "poverty:";
        } else if (chosenXAxis === "age") {
            var label_x = "age:";
        } else {
            var label_x = "income:";
        };

        if (chosenYAxis === "healthcare") {
            var label_y = "healthcare:";
        } else if (chosenYAxis === "obesity") {
            var label_y = "obesity:";
        } else { var label_y = "smokes" };



        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([0, 0])
            .html(function(d) { return `<center>${d.state}:<br>${label_x} ${d[chosenXAxis]} <br> ${label_y} ${d[chosenYAxis]}</center>` });


        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
        })



        .on("mouseout", function(data, index) {
            toolTip.hide(data, this);
        });

        return circlesGroup;
    }


    d3.csv("data.csv").then(function(CensusData) {


        CensusData.forEach(function(data) {

            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.healthcare = +data.healthcare;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;

        });


        var xLinearScale = xScale(CensusData, chosenXAxis);
        var yLinearScale = yScale(CensusData, chosenYAxis);



        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);


        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)

        .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);


        var yAxis = chartGroup.append("g")

        .classed("y-axis", true)
            .call(leftAxis);

        var circlesGroup = chartGroup.selectAll("g.dot")
            .data(CensusData)
            .enter().append('g');

        circlesGroup.append("circle")
            .attr("class", "dot")
            .attr("r", "15")
            .attr("cx", data => xLinearScale(data[chosenXAxis]))
            .attr("cy", data => yLinearScale(data[chosenYAxis]))
            .attr("fill", "blue");

        circlesGroup.append("text").text(function(d) {
                return d.abbr;
            })
            .attr("x", data => xLinearScale(data.poverty))
            .attr("y", data => yLinearScale(data.healthcare))
            .attr("text-anchor", "middle")
            .attr("font-size", "60%")



        var labelsGroup_x = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth/2}, ${chartHeight})`);


        var labelsGroup_y = chartGroup.append("g")

        .attr("x", -chartHeight / 2)
            .attr("y", 0)
            .attr("dy", "0.375em")
            .attr("transform", "rotate(-90)")


        var povertyLabel = labelsGroup_x.append("text")
            .attr("x", 0)
            .attr("y", 20 + 10)
            .attr("value", "poverty")
            .classed("active", true)
            .attr("text-anchor", "middle")
            .text("In Poverty(%)");

        var ageLabel = labelsGroup_x.append("text")
            .attr("x", 0)
            .attr("y", 35 + 10)
            .attr("value", "age")
            .classed("inactive", true)
            .attr("text-anchor", "middle")
            .text("Age(Median)");


        var incomeLabel = labelsGroup_x.append("text")
            .attr("x", 0)
            .attr("y", 50 + 10)
            .attr("value", "income")
            .classed("inactive", true)
            .attr("text-anchor", "middle")
            .text("Household Income(Median)");



        var healthcareLabel = labelsGroup_y.append("text")
            .attr("x", -chartHeight / 2)
            .attr("y", -20)
            .attr("value", "healthcare")
            .classed("active", true)
            .attr("text-anchor", "middle")
            .text("Lacks Healthcare(%)");

        var obesityLabel = labelsGroup_y.append("text")
            .attr("x", -chartHeight / 2)
            .attr("y", -35)
            .attr("value", "obesity")
            .classed("inactive", true)
            .attr("text-anchor", "middle")
            .text("Obesity(%)");

        var smokesLabel = labelsGroup_y.append("text")
            .attr("x", -chartHeight / 2)
            .attr("y", -50)
            .attr("value", "smokes")
            .classed("inactive", true)
            .attr("text-anchor", "middle")
            .text("Smokes(%)");



        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


        labelsGroup_x.selectAll("text")
            .on("click", function() {

                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {



                    chosenXAxis = value;
                }


                xLinearScale = xScale(CensusData, chosenXAxis);

                xAxis = renderAxes_x(xLinearScale, xAxis);

                circlesGroup = renderCircles_x(circlesGroup, xLinearScale, chosenXAxis);



                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis === "income") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                } else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);

                }
            })


        labelsGroup_y.selectAll("text")
            .on("click", function() {

                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {


                    chosenYAxis = value;
                }


                yLinearScale = yScale(CensusData, chosenYAxis);

                yAxis = renderAxes_y(yLinearScale, yAxis);

                circlesGroup = renderCircles_y(circlesGroup, yLinearScale, chosenYAxis);

                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);




                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenYAxis === "smokes") {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                } else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);

                }
            })
    });

}

makeResponsive()
d3.select(window).on("resize", makeResponsive);