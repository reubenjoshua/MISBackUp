from flask import Blueprint, jsonify
from models.Role import Role
from utils.auth import token_required
from sqlalchemy import text
from models.db import db

role_bp = Blueprint('role', __name__)

@role_bp.route('/api/roles', methods=['GET'])
@token_required
def get_all_roles(current_user):
    try:
        result = db.session.execute(text('EXEC spGetAllRoles'))
        rows = result.fetchall()
        roles = [
            {
                'id': row.id,
                'roleName': row.roleName,
                'description': row.description
            }
            for row in rows
        ]
        return jsonify(roles)
    except Exception as e:
        return jsonify({'message': f'Failed to get roles: {str(e)}'}), 500