from .db import db

class BranchSourceName(db.Model):
    __tablename__ = 'branchSourceName'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    branchId = db.Column(db.Integer, db.ForeignKey('Branch.id'))
    sourceNameId = db.Column(db.Integer, db.ForeignKey('sourceName.id'))
    isActive = db.Column(db.Boolean, default=True)
    branch = db.relationship('Branch', backref='branch_source_names')
    source_name = db.relationship('SourceName', backref='branch_source_names')

    def to_dict(self):
        return {
            'id': self.id,
            'branchId': self.branchId,
            'sourceNameId': self.sourceNameId,
            'isActive': self.isActive,
            'branchName': self.branch.branchName if self.branch else None,
            'sourceName': self.source_name.sourceName if self.source_name else None
        }