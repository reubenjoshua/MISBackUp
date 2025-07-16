from .db import db

class SourceName(db.Model):
    __tablename__ = 'sourceName'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    branchId = db.Column(db.Integer, db.ForeignKey('Branch.id'), nullable=False)
    sourceTypeId = db.Column(db.Integer, db.ForeignKey('sourceType.id'))
    sourceName = db.Column(db.String(64))
    isActive = db.Column(db.Boolean)

    def to_dict(self):
        return {
            'id': self.id,
            'branchId': self.branchId,
            'sourceTypeId': self.sourceTypeId,
            'sourceName': self.sourceName,
            'isActive': self.isActive
        }