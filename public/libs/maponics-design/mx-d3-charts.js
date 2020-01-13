/* Maponics Design
 * Copyright © Maponics 2016
 * Created by John Hall <jhall@maponics.com>, <john@real-currents.com>
 * Base layout for Maponics web GUI's
 */
'use strict';

mxApp.directive('mxD3Chart', [ 
    '$document',
    'mxD3',
    'mxD3BarPlotTime',
    'mxD3LinePlotTime',
    'mxD3ScatterPlotTime',
    function ($document, mxD3, mxD3BarPlotTime, mxD3LinePlotTime, mxD3ScatterPlotTime) {
        return {
            compile: function (elm, attrs, trans) {
                var chartTypes = {
                    'mxD3BarPlotTime': mxD3BarPlotTime,
                    'mxD3LinePlotTime': mxD3LinePlotTime,
                    'mxD3ScatterPlotTime': mxD3ScatterPlotTime
                };
                
                return function (scope, element, attrs) {
                    var d3Chart, width, height, type;
                    
                    if (!scope.width) {
                        var dims = $document[0].body.getBoundingClientRect();
                        width = dims.width; 
                        height = dims.height;
                        
                    } else {
                        width = scope.width; 
                        height = scope.height;
                    }
                    
                    d3Chart = new mxD3(elm[0], width, height);
                        
                    if (!scope.width) {
                        d3Chart.svg.attr('style', "width:100%");
                    } else {
                        d3Chart.svg.attr('style', "width:"+ parseInt(scope.width) +"px");
                    }
                    
                    type = scope.type || 'mxD3ScatterPlotTime'; 
                    
                    d3Chart.create(chartTypes[type], scope.data);
                        
                    scope.$watch('data', function (newVal, oldVal, scope) {
                        d3Chart.clear();
                        d3Chart.create(chartTypes[type], scope.data);
                    });
                };
            },
            restrict: 'E',
            scope: {
                data: '=',
                width: '=',
                height: '=',
                type: '='
            },
            transclude: false
        }
    }
]);

mxApp.factory('mxD3BarPlotTime', [
    function mxD3BarPlotTime () {
        return function (data) {
            var d3 = this.d3,
                svg = this.svg,
                width = this.width,
                height = this.height,
                margin = 28,

                xMin = new Date(
                            d3.min(data, function (d) { return d.x }).getTime() //new Date('2015-01-01').getTime() 
                            - (new Date('2015-01-15').getTime()                 // Offset x start by half-month
                               - new Date('2015-01-01').getTime())
                        ),
                xMax = d3.max(data, function (d) { return d.x }),
                xScale = d3.time
                    .scale()
                    .domain([ xMin, xMax])
                    .range([margin, width - margin]),
                xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom')
                    .tickFormat(d3.time.format('%b')),

                yMin = 0,
                yMax = d3.max(data, function (d) { return d.y }),
                yScale = d3.time
                    .scale()
                    .domain([ yMax, yMin ])
                    .range([margin, height - margin]),

                yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient('left')
                    .tickFormat(d3.format('f'));

            /* Sort data before drawing bars */
            data = data.sort(function (a, b) {
                return xScale(a.x) - xScale(b.x);
            });

            svg.append('g').attr('class', "data");
            svg.append('g').attr('class', "x-axis axis");
            svg.append('g').attr('class', "y-axis axis");

            svg.select('.x-axis')
                .attr('transform', "translate(0, "+ (height - margin) +")")
                .call(xAxis);

            svg.select('.y-axis')
                .attr('transform', "translate("+ margin +")")
                .call(yAxis);

            svg.select('.data')
                .selectAll('circle').data(data)
                .enter()
                .append('rect');

            svg.select('.data')
                .selectAll('rect')
                .data(data)
                .attr('x', function (d) { return xScale(d.x); })
                .attr('y', function (d) { return (height - yScale(d.y)); })
                .attr('width', parseInt(width*0.05))
                .attr('height', function (d) { return yScale(d.y) - yScale(yMax); })
                .attr('class', 
                    function(d) {
                        switch (true) {
                            case (d.y > yMax>>1):
                                return 'low-value';
                            case (d.y > yMax>>2):
                                return 'medium-value';
                            case (d.y < yMax>>2):
                                return 'high-value';
                            default:
                                return 'medium-value';
                        }
                    }
                );

            return this;
        };
    }
]);

mxApp.factory('mxD3LinePlotTime', [
    function mxD3LinePlotTime () {
        return function (data) {
            var d3 = this.d3,
                svg = this.svg,
                width = this.width,
                height = this.height,
                margin = 28,

                xMin = new Date(
                            d3.min(data, function (d) { return d.x }).getTime() //new Date('2015-01-01').getTime() 
                            - (new Date('2015-01-15').getTime()                 // Offset x start by half-month
                               - new Date('2015-01-01').getTime())
                        ),
                xMax = d3.max(data, function (d) { return d.x }),
                xScale = d3.time
                    .scale()
                    .domain([ xMin, xMax])
                    .range([margin, width - margin]),
                xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom')
                    .tickFormat(d3.time.format('%b')),

                yMin = 0,
                yMax = d3.max(data, function (d) { return d.y }),
                yScale = d3.time
                    .scale()
                    .domain([ yMax, yMin ])
                    .range([margin, height - margin]),

                yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient('left')
                    .tickFormat(d3.format('f'));

            /* Sort data before drawing line */
            data = data.sort(function (a, b) {
                return xScale(a.x) - xScale(b.x);
            });

            svg.append('g').attr('class', "data");
            svg.append('g').attr('class', "x-axis axis");
            svg.append('g').attr('class', "y-axis axis");

            svg.select('.x-axis')
                .attr('transform', "translate(0, "+ (height - margin) +")")
                .call(xAxis);

            svg.select('.y-axis')
                .attr('transform', "translate("+ margin +")")
                .call(yAxis);


            svg.select('.data')
                .append('path')
                .datum(data)
                .attr("d", d3.svg.line()
                        .x(function (d) { return xScale(d.x); })
                        .y(function (d) { return margin + yScale(yMin) - yScale(d.y); })
                        .interpolate('cardinal'))
                .attr("fill", "none")
                .attr("stroke", "white");


            return this;
        };
    }
]);

mxApp.factory('mxD3ScatterPlotTime', [
    function mxD3ScatterPlotTime () {
        return function (data) {
            var d3 = this.d3,
                svg = this.svg,
                width = this.width,
                height = this.height,
                margin = 28,

                xMin = new Date(
                            d3.min(data, function (d) { return d.x }).getTime() -
                            (new Date('2015-01-15').getTime() - new Date('2015-01-01').getTime())
                        ),
                xMax = d3.max(data, function (d) { return d.x }),
                xScale = d3.time
                    .scale()
                    .domain([ xMin, xMax])
                    .range([margin, width - margin]),
                xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom')
                    .tickFormat(d3.time.format('%b')),

                yMin = 0,
                yMax = d3.max(data, function (d) { return d.y }),
                yScale = d3.time
                    .scale()
                    .domain([ yMax, yMin ])
                    .range([margin, height - margin]),

                yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient('left')
                    .tickFormat(d3.format('f'));

            svg.append('g').attr('class', "data");
            svg.append('g').attr('class', "x-axis axis");
            svg.append('g').attr('class', "y-axis axis");

            svg.select('.x-axis')
                .attr('transform', "translate(0, "+ (height - margin) +")")
                .call(xAxis);

            svg.select('.y-axis')
                .attr('transform', "translate("+ margin +")")
                .call(yAxis);

            svg.select('.data')
                .selectAll('circle').data(data)
                .enter()
                .append('circle');

            svg.select('.data')
                .selectAll('circle')
                .data(data)
                .attr('r', 12.5)
                .attr('cx', function (d) { return xScale(d.x); })
                .attr('cy', function (d) { return yScale(d.y); })
                .attr('class', 
                    function(d) {
                        switch (true) {
                            case (d.y > yMax>>1):
                                return 'high-value';
                            case (d.y > yMax>>2):
                                return 'medium-value';
                            case (d.y < yMax>>2):
                                return 'low-value';
                            default:
                                return 'low-value';

                        }
                    }
                );

            return this;
        };
    }
]);
