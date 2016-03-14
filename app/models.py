from app import db

class Entry(db.Model):
	pk = db.Column(db.Integer, primary_key=True)
	commit = db.Column(db.String())
	date = db.Column(db.DateTime())
	upload_count = db.Column(db.Integer)
	cpu = db.Column(db.Float())
	mem = db.Column(db.Float())
	identifier = db.Column(db.String())

	def __init__(self, commit, date, cpu, mem, identifier, upload_count):
		self.commit = commit
		self.date = date
		self.cpu = cpu
		self.mem = mem
		self.identifier = identifier
		self.upload_count = upload_count

	def __repr__(self):
		return '"\n"<Commit %r ID %r Date %r>' % (self.commit, self.identifier, self.date)