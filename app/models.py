from app import db

class Commit(db.Model):
	id = db.Column(db.String(), primary_key=True)
	cpuavg = db.Column(db.Float())
	cpumax = db.Column(db.Float())
	memavg = db.Column(db.Float())
	memmax = db.Column(db.Float())

	def __init__(self, id, ca, cm, ma, mm):
		self.id = id
		self.cpuavg = ca
		self.cpumax = cm
		self.memavg = ma
		self.memmax = mm

	def __repr__(self):
		return '<Commit %r>' % (self.id)