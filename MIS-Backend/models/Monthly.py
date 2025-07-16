from .db import db
from .sourceName import SourceName

class Monthly(db.Model):
    __tablename__ = 'Monthly'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    branchId = db.Column(db.Integer, db.ForeignKey('Branch.id'))
    sourceType = db.Column(db.Integer, db.ForeignKey('sourceType.id'))
    sourceName = db.Column(db.Integer, db.ForeignKey('sourceName.id'))
    status = db.Column(db.Integer, db.ForeignKey('Status.id'), default=2)
    byUser = db.Column(db.Integer)
    month = db.Column(db.String(32))
    year = db.Column(db.Integer)
    productionVolume = db.Column(db.Float)
    operationHours = db.Column(db.Float)
    serviceInterruption = db.Column(db.Float)
    totalHoursServiceInterruption = db.Column(db.Float)
    electricityConsumption = db.Column(db.Float)
    electricityCost = db.Column(db.Float)
    bulkCost = db.Column(db.Float)
    bulkOuttake = db.Column(db.String(128))
    bulkProvider = db.Column(db.String(128))
    WTPCost = db.Column(db.Float)
    WTPSource = db.Column(db.String(128))
    WTPVolume = db.Column(db.Float)
    disinfectionMode = db.Column(db.String(128))
    disinfectantCost = db.Column(db.Float)
    disinfectionAmount = db.Column(db.Float)
    disinfectionBrandType = db.Column(db.String(128))
    otherTreatmentCost = db.Column(db.Float)
    emergencyLitersConsumed = db.Column(db.Float)
    emergencyFuelCost = db.Column(db.Float)
    emergencyTotalHoursUsed = db.Column(db.Float)
    gensetLitersConsumed = db.Column(db.Float)
    gensetFuelCost = db.Column(db.Float)
    isActive = db.Column(db.Boolean)
    comment = db.Column(db.String(1024))

    # Relationships
    branch = db.relationship('Branch', backref='monthlies')
    source_type = db.relationship('SourceType', backref='monthlies')
    status_rel = db.relationship('Status', backref='monthlies')
    source_name = db.relationship('SourceName', backref='monthlies', foreign_keys=[sourceName])