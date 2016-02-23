from flask import Response, render_template, json, jsonify
from app import app
import csv
import os


@app.route('/')
@app.route('/index')
def index():
    return render_template('frostedflakes.html')
@app.route('/parse_csv')
def parse_csv():
	#init file opening
	filepath = os.path.join(os.path.dirname(__file__),'data/sampledata.csv')
	open_read = open(filepath, 'r')
	reader = csv.reader(open_read)
	print(filepath)


	#cpu avg, cpu max, mem avg, mem max
	data = [0.0,0.0,0.0,0.0]
	rownum = 0
	cpunum = 0.0
	memnum = 0.0
	cpusum = 0.0
	memsum = 0.0

	for row in reader:
	#skips first line
		if rownum != 0:
			cpunum = float(row[1])
			memnum = float(row[2])

			#add to cpu avg sum
			cpusum += cpunum

			#add to mem avg sum
			memsum += memnum

			#store max cpu
			if data[1] < cpunum:
				data[1] = cpunum

			#store max mem
			if data[3] < memnum:
				data[3] = memnum

		rownum += 1

	#make rownum == entries in dataset
	rownum -= 1

	print(rownum)

	data[0] = cpusum / rownum
	data[2] = memsum / rownum

	js = [[{"data": [{"commit" : "testdata", "count" : data[0]}], "name" : "Average"},{"data": [{"commit" : "testdata", "count" : data[1]}], "name" : "Average"}],[{"data": [{"commit" : "testdata", "count" : data[2]}], "name" : "Average"},{"data": [{"commit" : "testdata", "count" : data[3]}], "name" : "Average"}]]
	print(json.dumps(js))
	return Response(json.dumps(js), mimetype='application/json')