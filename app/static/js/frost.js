/*
var memData = [{
	data: [{
        commit: 'abc123',
        count: 123
    	}, {
        commit: 'dedbef',
        count: 234
    	}, {
        commit: '29bead',
        count: 345
    	}, {
        commit: '1',
        count: 143
    	},{
        commit: '2',
        count: 243
    	},{
        commit: '3',
        count: 321
    	},{
        commit: '4',
        count: 241
    	},{
        commit: '5',
        count: 258
    	},{
        commit: '6',
        count: 391
    	},{
        commit: '7',
        count: 211
    	},{
        commit: '8',
        count: 109
	}], 
	name: 'Average' }, 
	{
	data: [{
    	commit: 'abc123',
    	count: 235
		}, {
    	commit: 'dedbef',
    	count: 267
		}, {
    	commit: '29bead',
    	count: 573
    	}, {
        commit: '1',
        count: 234
    	},{
        commit: '2',
        count: 390
    	},{
        commit: '3',
        count: 472
    	},{
        commit: '4',
        count: 532
    	},{
        commit: '5',
        count: 466
    	},{
        commit: '6',
        count: 521
    	},{
        commit: '7',
        count: 622
    	},{
        commit: '8',
        count: 421
	}],
    name: 'Max'
}];

var cpuData = [{
	data: [{
        commit: 'abc123',
        count: 50
    	}, {
        commit: 'dedbef',
        count: 72
    	}, {
        commit: '29bead',
        count: 27
	}], 
	name: 'Average' }, 
	{
	data: [{
    	commit: 'abc123',
    	count: 60
		}, {
    	commit: 'dedbef',
    	count: 97
			}, {
    	commit: '29bead',
    	count: 85
	}],
    name: 'Max'
}];
*/
var ioData = [{
	data: [{
        commit: 'abc123',
        count: 123
    	}, {
        commit: 'dedbef',
        count: 234
    	}, {
        commit: '29bead',
        count: 345
	}], 
	name: 'Average' }, 
	{
	data: [{
    	commit: 'abc123',
    	count: 235
		}, {
    	commit: 'dedbef',
    	count: 267
			}, {
    	commit: '29bead',
    	count: 573
	}],
    name: 'Max'
}];

var dataDeferred = new jQuery.Deferred();
var cpuDataD;
var memDataD;

$(document).ready(function() {
	$('.dropdown-toggle').dropdown();
    //dataDeferred = getInfo();
    //cpuDataD = dataDeferred[0];
    //memDataD = dataDeferred[1];
    //$.when(getInfo()).then(render);
    populateCommits();
	displayCommitData();
    $('#filepick').fileinput();
    $('#submitCSV').click(function() {
        sendCSV();
    });
});


function sendCSV() {
    console.log("CSV");
    if($('#filepick').val()!='') {   
        console.log("CSV1");
        var formData = new FormData();
        console.log($('#filepick')[0].files[0]);
        formData.append('file', $('#filepick')[0].files[0]);
        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            async: false,
            dataType: 'text/csv',
            success: function (r) { 
                if(r.success) {
                //success work 
                 }
            },
            cache: false,
            contentType: false,
            processData: false
        });
    }
    populateCommits();
}

function populateCommits() {
    console.log("populating");
    var $drop = $('#dropit');

    $.ajax({
        type: "POST",
        url: '/commits',
        dataType: 'json',
        success: function(json) {
            $drop.empty(); // remove old options
            $drop.append($('<a class="dropdown-item" href="#"></a>')
                    .attr('value', '').text('Please Select'));
            $.each(json, function(value, key) {
                $drop.append($('<a class="dropdown-item" href="#"></a>')
                        .attr('value', value).text(key));
            });                                                                
        }
    });
}

//do this to refresh the data
function render(dData) {
    console.log(dData);
    populateCommits();
    cpuDataD = dData[0];
    memDataD = dData[1];
	doEverything("memChart",memDataD,"scal");
	doEverything("cpuChart",cpuDataD,"perc");
	doEverything("ioChart",ioData,"scal");
}

//fetch data from commit logs
function getInfo() {
	var deferredData = new jQuery.Deferred();
    /*
    $.ajax({
        type: "GET",
        url: "/parse_csv",
        dataType: "json",
        success: function(data) {
            deferredData.resolve(data);
            deferredData = data;
        },
        complete: function(xhr, textStatus) {
            console.log("AJAX request complete -> ", xhr, " -> ", textStatus);
        }
    });
    */

    //console.log(deferredData);
    //console.log(deferredData["cpu"]);
    return deferredData;
}

//I mean... yeah
function doEverything(target_elem, data_set, type) {
	var margins = {
	    top: 12,
	    left: 48,
	    right: 24,
	    bottom: 24
	},
	width = 360 - margins.left - margins.right,
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
	                x: o.commit
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
                name: d.name
	            //x0: d.y0
	        };
	    });
	}),
    svg = d3.select('#' + target_elem)
        .append('svg')
        .attr('width', width + margins.left + margins.right)
        .attr('height', height + margins.top + margins.bottom)
        .classed('chartFiller', true)
        .append('g')
        .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

    var xMax =  0;
    if (type === "perc") {
    	xMax = 100;
    } else { xMax = d3.max(data_set, function (group) {
	        return d3.max(group, function (d) {
	            return d.x ;//+ d.x0;
	        });
	    });
    }

    var xScale = d3.scale.linear()
        .domain([0, xMax])
        .range([0, width]),
    commits = data_set[0].map(function (d) {
        return d.y;
    }),
    _ = console.log(commits),
    yScale = d3.scale.ordinal()
        .domain(commits)
        .rangeRoundBands([0, height], .5),
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
    	}).moveToBack(),
    rects = groups.selectAll('rect')
        .data(function (d) {
        return d;
    })
        .enter()
        .append('rect')
        .attr('x', 0)
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

    svg.append('g')
    .attr('class', 'axis')
    .call(yAxis);
}

function displayCommitData() {
	$('.dropdown-item').click(function() {
        var deferredData = new jQuery.Deferred();
        var val = $(this).text();
        $.ajax({
            type: "POST",
            data: {id: val},
            url: '/getcommitdata',
            async: false,
            success: function(json) {
                render(json);                                                              
            }
        });
        //return deferredData;
    });
}

//used this to make the bars appear in order
d3.selection.prototype.moveToBack = function() { 
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    }); 
};