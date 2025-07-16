from flask import Blueprint, jsonify
from models.Status import Status
from utils.auth import token_required
from sqlalchemy import text
from models.db import db

status_bp = Blueprint('status', __name__)

@status_bp.route('/api/status', methods=['GET'])
@token_required
def get_all_status(current_user):
    result = db.session.execute(text('EXEC spGetAllStatus'))
    rows = result.fetchall()
    statuses = [
        dict(row._mapping) if hasattr(row, '_mapping') else dict(row)
        for row in rows
    ]
    return jsonify(statuses)