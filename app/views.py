from flask import Response, render_template, json, jsonify, request, redirect, url_for
from app import app, db, models
from werkzeug import secure_filename
from sqlalchemy.sql import func
import csv, os, subprocess, datetime

ALLOWED_EXTENSIONS = set(['csv'])
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__),'tmp')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CSV_FOLDER = os.path.join(os.path.dirname(__file__),'data')
app.config['CSV_FOLDER'] = CSV_FOLDER

@app.route('/')
@app.route('/index')
def index():
    return render_template('frostedflakes.html')

#this is used to check whether the files are CSV
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

#this processes every CSV file in the app/data folder and stores it to a DB
@app.route('/processCSV')
def processCSV():
	print("begin processing CSV folder...")
	query = db.session.query(func.max(models.Entry.upload_count).label('max'))
	uploadnum = 0
	checknum = query.one().max
	if checknum is not None:
		uploadnum = checknum
	for file in os.listdir(app.config['CSV_FOLDER']):
	    if allowed_file(file):
	    	print("processing "+file)
	    	filepath = os.path.join(app.config['CSV_FOLDER'], file)
	    	filenameparse = file.split('-')
	    	fcommit = filenameparse[0]
	    	fid = filenameparse[1].split('.')[0]
	    	fdate = datetime.datetime.strptime("1111-11-11 11:11:11.111", "%Y-%m-%d %H:%M:%S.%f")
	    	fcpu = 0.0
	    	fmem = 0.0
	    	e = models.Entry(commit="", date=datetime.datetime.strptime("1111-11-11 11:11:11.111", "%Y-%m-%d %H:%M:%S.%f"), cpu=0.0, mem=0.0, identifier="", upload_count=0)
	    	with open(filepath) as f:
	    		rdr = csv.DictReader(f)
	    		for row in rdr:
	    			fdate = datetime.datetime.strptime(row['Date'], "%Y-%m-%d %H:%M:%S.%f")
	    			fcpu = float(row['CPU'])
	    			fmem = float(row['Mem'])
	    			e = models.Entry(commit=fcommit, date=fdate, cpu=fcpu, mem=fmem, identifier=fid, upload_count=uploadnum)
	    			db.session.add(e)
	    		db.session.commit()
	    	uploadnum += 1
	print("done processing csv folder")

#this POSTS data from the last 10 commits by the way of a JSON
@app.route('/getData', methods=['POST'])
def getData():
	print("fetching last 10 commit data")
	data = []
	command = "git --git-dir $KALITE_DIR/.git log | grep commit | head -n 10 | awk '{print $2}' | tail -r"
	text = subprocess.check_output(command, shell=True)
	commits = text.splitlines()
	comData = [None] * 10
	incr = 0
	for line in commits:
		comData[incr] = models.Entry.query.filter_by(commit=line)
		incr += 1
	for ent in comData:
		batch = []
		item = {}
		for e in ent:
			item = {"date": e.date, "id": e.identifier, "cpu": e.cpu, "mem": e.mem}
			batch.append(item)
		if ent is not None:
			data.append({"commit": ent[0].commit, "data": batch})
	return json.dumps(data)