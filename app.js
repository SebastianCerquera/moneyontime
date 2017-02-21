function dashboard(id, fData){
var barColor = 'steelblue';
function segColor(c){ return {interest:"#807dba", capital:"#e08214"}[c]; }

function linePlot(fD){
var hG={}, hGDim = {t: 60, r: 0, b: 30, l: 0};
hGDim.w = 700 - hGDim.l - hGDim.r,
hGDim.h = 300 - hGDim.t - hGDim.b;

var x = d3.scale.ordinal().rangeRoundBands([0, hGDim.w], 0.1)
.domain(fD.map(function(d) { return d[0]; }));

var xAxis = d3.svg.axis().scale(x).orient("bottom");

var y = d3.scale.linear().range([hGDim.h, 0])
.domain([0, d3.max(fD, function(d) { return d[1]; })]);

var yAxis = d3.svg.axis().scale(y).orient("left");

var line = d3.svg.line()
.x(function(d) { return x(d[0]); })
.y(function(d) { return y(d[1]); });

var hGsvg = d3.select(id).append("svg")
.attr("width", hGDim.w + hGDim.l + hGDim.r)
.attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
.attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");

hGsvg.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0," + hGDim.h + ")")
.call(xAxis);

hGsvg.append("g")
.attr("class", "y axis")
.call(yAxis);

var color = d3.scale.category10();
color.domain(["pv"]);
var points = color.domain().map(function(name) {
return {
name: name,
values: fD.map(function(d) {
return d;
})
};
});

var point = hGsvg.selectAll(".point")
.data(points)
.enter().append("g")
.attr("class", "point");
point.append("path")
.attr("class", "line")
.attr("transform", "translate(" + x.rangeBand()/2 +",0)")
.attr("stroke", "red")
.attr("stroke-width", 2)
.attr("fill", "none")
.attr("d", function(d) { return line(d.values);});

var filtered = point
.filter(function(d){
return d.name == "pv";
});

filtered
.selectAll('circle')
.data(
function(d){return d.values;}
).enter().append('circle')
.attr("transform", "translate(" + x.rangeBand()/2 +",0)")
.attr({
cx: function(d,i){
return x(d[0]);
},
cy: function(d,i){
return y(d[1]);
},
r: 5
})
.style("fill", "blue")
.on("mouseover",mouseover);


function mouseover(d){ // utility function to be called on mouseover.
// call update functions of pie-chart and legend.

var proportion;
if(d[0] === fData.N){
proportion = d[1]/fData.a;
}else{
var prev = fD[d[0]-1];
var cur = fD[d[0]];

proportion = (prev[1] - cur[1])/fData.a;
}
var state = [{type:"capital", perc: proportion},
{type:"interest", perc: 1 - proportion}];
pC.update(state);
leg.update(state);
}
}
// function to handle pieChart.
function pieChart(pD){
var pC ={}, pieDim ={w:250, h: 250};
pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;
// create svg for pie chart.
var piesvg = d3.select(id).append("svg")
.attr("width", pieDim.w).attr("height", pieDim.h).append("g")
.attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")");
// create function to draw the arcs of the pie slices.
var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);
// create a function to compute the pie slice angles.
var pie = d3.layout.pie().sort(null).value(function(d) { return d.perc; });
// Draw the pie slices.
piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
.each(function(d) { this._current = d; })
.style("fill", function(d) { return segColor(d.data.type); });
// create function to update pie-chart. This will be used by histogram.
pC.update = function(nD){
piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
.attrTween("d", arcTween);
};

// Animating the pie-slice requiring a custom function which specifies
// how the intermediate paths should be drawn.
function arcTween(a) {
var i = d3.interpolate(this._current, a);
this._current = i(0);
return function(t) { return arc(i(t)); };
}
return pC;
}
// function to handle legend.
function legend(lD){
var leg = {};
// create table for legend.
var legend = d3.select(id).append("table").attr('class','legend');
// create one row per segment.
var tr = legend.append("tbody").selectAll("tr").data(lD).enter().append("tr");
// create the first column for each segment.
tr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
.attr("width", '16').attr("height", '16')
.attr("fill",function(d){ return segColor(d.type); });
// create the second column for each segment.
tr.append("td").text(function(d){ return d.type;});
// create the fourth column for each segment.
tr.append("td").attr("class",'legendPerc')
.text(function(d){ return getLegend(d,lD);});
// Utility function to be used to update the legend.
leg.update = function(nD){
// update the data attached to the row elements.
var l = legend.select("tbody").selectAll("tr").data(nD);
// update the percentage column.
l.select(".legendPerc").text(function(d){ return getLegend(d,nD);});
};
function getLegend(d,aD){ // Utility function to compute percentage.
return d3.format("%")(d.perc/d3.sum(aD.map(function(v){ return v.perc; })));
}

return leg;
}

var table = [], i;
for(i = 1; i<=fData.N; i++)
table[i-1] = [i, fData.a + fData.d[i] - fData.p[i] ];

var diff = [];
for(i = 1; i<table.length; i++)
diff[i-1] = (table[i-1][1] - table[i][1])/fData.a;
diff[table.length] = 1;
var totalInterest = diff.map(function(x){return 1 - x;}).reduce(function(a, x){return a + x;}, 0);

var totalCapital = diff.reduce(function(a, x){return a + x;}, 0);

var proportion = totalInterest/(totalInterest + totalCapital);

var tF = [{type:"capital", perc: 1 - proportion},
{type:"interest", perc: proportion}];
var hG = linePlot(table), // create the histogram.
pC = pieChart(tF), // create the pie-chart.
leg= legend(tF); // create the legend.
}
