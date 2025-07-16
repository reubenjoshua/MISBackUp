from .db import db

class Status(db.Model):
    __tablename__ = 'Status'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    statusName = db.Column(db.String(16))

    def to_dict(self):
        return {
            'id': self.id,
            'statusName': self.statusName
        }