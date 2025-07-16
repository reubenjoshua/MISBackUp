from .db import db
from datetime import datetime
from zoneinfo import ZoneInfo

class Daily(db.Model):
    __tablename__ = 'Daily'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    monthlyId = db.Column(db.Integer, db.ForeignKey('Monthly.id'))
    sourceType = db.Column(db.Integer, db.ForeignKey('sourceType.id'))
    sourceName = db.Column(db.Integer, db.ForeignKey('sourceName.id'))
    status = db.Column(db.Integer, db.ForeignKey('Status.id'), default=2)
    byUser = db.Column(db.Integer, db.ForeignKey('User.id'))
    date = db.Column(db.DateTime)
    productionVolume = db.Column(db.Float)
    operationHours = db.Column(db.Float)
    serviceInterruption = db.Column(db.Float)
    totalHoursServiceInterruption = db.Column(db.Float)
    electricityConsumption = db.Column(db.Float)
    VFDFrequency = db.Column(db.Float)
    spotFlow = db.Column(db.Float)
    spotPressure = db.Column(db.Float)
    timeSpotMeasurements = db.Column(db.Float)
    lineVoltage1 = db.Column(db.Float)
    lineVoltage2 = db.Column(db.Float)
    lineVoltage3 = db.Column(db.Float)
    lineCurrent1 = db.Column(db.Float)
    lineCurrent2 = db.Column(db.Float)
    lineCurrent3 = db.Column(db.Float)
    comment = db.Column(db.String(512))
    isActive = db.Column(db.Boolean)
    encodedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    branchId = db.Column(db.Integer, db.ForeignKey('Branch.id'))
    areaId = db.Column(db.Integer, db.ForeignKey('Area.id'))

    # Relationships
    monthly = db.relationship('Monthly', backref='dailies')
    source_type = db.relationship('SourceType', backref='dailies')
    source_name = db.relationship('SourceName', backref='dailies')
    status_rel = db.relationship('Status', backref='dailies')
    encoder = db.relationship('User', back_populates='daily_records', foreign_keys=[byUser], overlaps="dailies")
    branch = db.relationship('Branch', backref='dailies')
    area = db.relationship('Area', backref='dailies')

    def to_dict(self):
        encoded_at_ph = None
        if self.encodedAt:
            encoded_at_ph = self.encodedAt.replace(tzinfo=ZoneInfo("UTC")).astimezone(ZoneInfo("Asia/Manila"))
        return {
            'id': self.id,
            'monthlyId': self.monthlyId,
            'monthlyName': self.monthly.name if self.monthly else None,
            'sourceType': self.sourceType,
            'sourceTypeName': self.source_type.sourceType if self.source_type else None,
            'sourceName': self.sourceName,
            'sourceNameName': self.source_name.sourceName if self.source_name else None,
            'status': self.status,
            'statusName': self.status_rel.statusName if self.status_rel else None,
            'byUser': self.byUser,
            'userName': self.encoder.userName if self.encoder else None,
            'date': self.date,
            'productionVolume': self.productionVolume,
            'operationHours': self.operationHours,
            'serviceInterruption': self.serviceInterruption,
            'totalHoursServiceInterruption': self.totalHoursServiceInterruption,
            'electricityConsumption': self.electricityConsumption,
            'VFDFrequency': self.VFDFrequency,
            'spotFlow': self.spotFlow,
            'spotPressure': self.spotPressure,
            'timeSpotMeasurements': self.timeSpotMeasurements,
            'lineVoltage1': self.lineVoltage1,
            'lineVoltage2': self.lineVoltage2,
            'lineVoltage3': self.lineVoltage3,
            'lineCurrent1': self.lineCurrent1,
            'lineCurrent2': self.lineCurrent2,
            'lineCurrent3': self.lineCurrent3,
            'comment': self.comment,
            'isActive': self.isActive,
            'branchId': self.branchId,
            'branchName': self.branch.branchName if self.branch else None,
            'areaId': self.areaId,
            'areaName': self.area.areaName if self.area else None,
            'encodedAt': encoded_at_ph.isoformat() if encoded_at_ph else None
        }