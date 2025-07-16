from .db import db

class Area(db.Model):
    __tablename__ = 'Area'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    areaCode = db.Column(db.Integer, nullable=False)
    areaName = db.Column(db.String(64))
    isActive = db.Column(db.Boolean)