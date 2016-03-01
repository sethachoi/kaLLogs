from flask import Response, render_template, json, jsonify, request, redirect, url_for
from app import app, db, models
from werkzeug import secure_filename
import csv
import os

ALLOWED_EXTENSIONS = set(['csv'])
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__),'tmp')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
@app.route('/index')
def index():
    return render_template('frostedflakes.html')

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload():
	print("uploading")
	file = request.files['file']
	print("request done")
	data = [0.0,0.0,0.0,0.0]
	rownum = 0
	cpunum = 0.0
	memnum = 0.0
	cpusum = 0.0
	memsum = 0.0

	if file and allowed_file(file.filename):
		filename = secure_filename(file.filename)
		filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
		file.save(filepath)

		with open(filepath) as f:
			rdr = csv.DictReader(f)
			for row in rdr:
				cpunum = float(row["CPU"])
				memnum = float(row["Mem"])

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
		data[0] = round(cpusum / rownum, 3)
		data[2] = round(memsum / rownum, 3)
		data[1] = round(data[1], 3)
		data[3] = round(data[3], 3)
		c = models.Commit(id=filename, ca = data[0], cm = data[1], ma = data[2], mm = data[3])
		db.session.add(c)
		db.session.commit()
		os.remove(os.path.join(app.config['UPLOAD_FOLDER'], filename))
		print("database add success!" + filename)
	
	else:
		print("database add failure :[")
	file.close()
	return

@app.route('/parse_csv')
def parse_csv():
	#print("testing")
	#init file opening
	filepath = os.path.join(os.path.dirname(__file__),'data/sampledata.csv')

#	reader = csv.reader(open_read)
#	print(filepath)


	#cpu avg, cpu max, mem avg, mem max
	data = [0.0,0.0,0.0,0.0]
	rownum = 0
	cpunum = 0.0
	memnum = 0.0
	cpusum = 0.0
	memsum = 0.0


	with open(filepath) as f:
		rdr = csv.DictReader(f)
		for row in rdr:
			cpunum = float(row["CPU"])
			memnum = float(row["Mem"])

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

	data[0] = round(cpusum / rownum, 3)
	data[2] = round(memsum / rownum, 3)
	data[1] = round(data[1], 3)
	data[3] = round(data[3], 3)

	js = [[{"data": [{"commit" : "testdata", "count" : data[0]}], "name" : "Average"},{"data": [{"commit" : "testdata", "count" : data[1]}], "name" : "Max"}],[{"data": [{"commit" : "testdata", "count" : data[2]}], "name" : "Average"},{"data": [{"commit" : "testdata", "count" : data[3]}], "name" : "Max"}]]
	#print(js)
	#print(json.dumps(js))
	return Response(json.dumps(js), mimetype='application/json')