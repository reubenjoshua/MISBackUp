from sqlalchemy.orm import backref

from .db import db

class Branch(db.Model):
    __tablename__ = 'Branch'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    areaId = db.Column(db.Integer, db.ForeignKey('Area.id'))
    branchName = db.Column(db.String(64))
    isActive = db.Column(db.Boolean)

    area = db.relationship('Area', backref='branches')