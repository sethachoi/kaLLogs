var dataset = [{
	        data: [{
	            month: 'Aug',
	            count: 123
	        	}, {
	            month: 'Sep',
	            count: 234
	        	}, {
	            month: 'Oct',
	            count: 345
        	}], 
        	name: 'Series #1' }, 
        	{
        	data: [{
            	month: 'Aug',
            	count: 235
        		}, {
            	month: 'Sep',
            	count: 267
       			}, {
            	month: 'Oct',
            	count: 573
        	}],
        name: 'Series #2'
    	}];

$(document).ready(function() {
	$('.dropdown-toggle').dropdown();
	render();
});

function render() {
	doEverything("memChart",dataset,"scal");
	doEverything("cpuChart",dataset,"perc");
	doEverything("ioChart",dataset,"scal");
}

function getInfo() {
	console.log("lel");
}

function doEverything(target_elem, data_set, type) {
	var margins = {
	    top: 12,
	    left: 48,
	    right: 24,
	    bottom: 24
	},
	legendPanel = {
	    width: 180
	},
	width = 500 - margins.left - margins.right - legendPanel.width,
	    height = 200 - margins.top - margins.bottom,
	    series = data_set.map(function (d) {
	        return d.name;
	    }),
	    data_set = data_set.map(function (d) {
	        return d.data.map(function (o, i) {
	            // Structure it so that your numeric
	            // axis (the stacked amount) is y
	            return {
	                y: o.count,
	                x: o.month
	            };
	        });
	    }),
	    stack = d3.layout.stack();

	stack(data_set);

	var data_set = data_set.map(function (group) {
	    return group.map(function (d) {
	        // Invert the x and y values, and y0 becomes x0
	        return {
	            x: d.y,
	            y: d.x,
	            x0: d.y0
	        };
	    });
	}),
    svg = d3.select('#' + target_elem)
        .append('svg')
        .attr('width', width + margins.left + margins.right + legendPanel.width)
        .attr('height', height + margins.top + margins.bottom)
        .classed('chartFiller', true)
        .append('g')
        .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')'),
    xMax = d3.max(data_set, function (group) {
        return d3.max(group, function (d) {
            return d.x + d.x0;
        });
    }),
    xScale = d3.scale.linear()
        .domain([0, xMax])
        .range([0, width]),
    months = data_set[0].map(function (d) {
        return d.y;
    }),
    _ = console.log(months),
    yScale = d3.scale.ordinal()
        .domain(months)
        .rangeRoundBands([0, height], .1),
    xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom'),
    yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left'),
    colours = d3.scale.category10(),
    groups = svg.selectAll('g')
        .data(data_set)
        .enter()
        .append('g')
        .style('fill', function (d, i) {
        return colours(i);
    }),
    rects = groups.selectAll('rect')
        .data(function (d) {
        return d;
    })
        .enter()
        .append('rect')
        .attr('x', function (d) {
        return xScale(d.x0);
    })
        .attr('y', function (d, i) {
        return yScale(d.y);
    })
        .attr('height', function (d) {
        return yScale.rangeBand();
    })
        .attr('width', function (d) {
        return xScale(d.x);
    })
        .on('mouseover', function (d) {
        	/*
        var xPos = parseFloat(d3.select(this).attr('x')) / 2 + width / 2;
        var yPos = parseFloat(d3.select(this).attr('y')) + yScale.rangeBand() / 2;
			*/
		var coordinates = [0, 0];
		coordinates = d3.mouse(document.body);
		var xPos = coordinates[0];
		var yPos = coordinates[1];
        d3.select('#tooltip')
            .style('left', xPos + 'px')
            .style('top', yPos + 'px')
            .select('#value')
            .text(d.y + ": " + d.x);

        d3.select('#tooltip').classed('hidden', false);
    })
        .on('mouseout', function () {
        d3.select('#tooltip').classed('hidden', true);
    })

    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);
	        
	svg.append('g')
	    .attr('class', 'axis')
	    .call(yAxis);
}
