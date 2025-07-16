from .db import db

class SourceType(db.Model):
    __tablename__ = 'sourceType'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    branchId = db.Column(db.Integer, db.ForeignKey('Branch.id'))
    sourceType = db.Column(db.String(64))
    isActive = db.Column(db.Boolean)

    def to_dict(self):
        return {
            'id': self.id,
            'branchId': self.branchId,
            'sourceType': self.sourceType,
            'isActive': self.isActive
        }