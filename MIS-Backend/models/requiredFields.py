from .db import db

class RequiredFields(db.Model):
    __tablename__ = 'RequiredFields'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    branchId = db.Column(db.Integer, db.ForeignKey('Branch.id'), nullable=False)
    fieldKey = db.Column(db.String(64), nullable=False)
    formType = db.Column(db.String(16), nullable=False)

    # Optional: relationship to Branch
    branch = db.relationship('Branch', backref='required_fields')