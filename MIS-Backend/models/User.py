from .db import db

class User(db.Model):
    __tablename__ = 'User'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    roleId = db.Column(db.Integer, db.ForeignKey('Role.id'))
    areaId = db.Column(db.Integer, db.ForeignKey('Area.id'))
    branchId = db.Column(db.Integer, db.ForeignKey('Branch.id'))
    # Remove dailyEncoded and monthlyEncoded columns if present
    userName = db.Column(db.String(64))
    firstName = db.Column(db.String(64))
    lastName = db.Column(db.String(64))
    email = db.Column(db.String(64))
    passwordHash = db.Column(db.String(64))
    isActive = db.Column(db.Boolean)

    # Relationship to Daily records encoded by this user
    daily_records = db.relationship(
        'Daily',
        back_populates='encoder',
        foreign_keys='Daily.byUser',
        lazy='dynamic',
        overlaps="dailies"
    )

    @property
    def dailyEncoded(self):
        return self.daily_records.count()

    def to_dict(self):
        from .Role import Role
        from .Area import Area
        from .Branch import Branch
        role = Role.query.get(self.roleId)
        area = Area.query.get(self.areaId)
        branch = Branch.query.get(self.branchId)
        return {
            'id': self.id,
            'roleId': self.roleId,
            'roleName': role.roleName if role else None,
            'areaId': self.areaId,
            'areaName': area.areaName if area else None,
            'branchId': self.branchId,
            'branchName': branch.branchName if branch else None,
            'firstName': self.firstName,
            'lastName': self.lastName,
            'email': self.email,
            'isActive': self.isActive,
            'username': self.userName,
            'dailyEncoded': self.dailyEncoded
        }