from flask import Blueprint, jsonify, request
from models.sourceName import SourceName
from models.sourceType import SourceType
from utils.auth import token_required
from models.branchSource import BranchSource
from models.branchSourceName import BranchSourceName
from models.db import db
from sqlalchemy import text



source_for_branch_bp = Blueprint('source_for_branch', __name__)

@source_for_branch_bp.route('/api/my-branch/source-names', methods=['GET'])
@token_required
def my_branch_source_names(current_user):
    if current_user.roleId not in [3, 4]:  # Allow Branch Admin (3) and Encoder (4)
        return jsonify({'message': 'Unauthorized'}), 403

    branch_id = current_user.branchId
    source_type_id = request.args.get('sourceTypeId', type=int)

    result = db.session.execute(
        text('EXEC spGetMyBranchSourceNames :branchId, :sourceTypeId'),
        {'branchId': branch_id, 'sourceTypeId': source_type_id}
    )
    rows = result.fetchall()
    source_names = [
        dict(row._mapping) if hasattr(row, '_mapping') else dict(row)
        for row in rows
    ]
    return jsonify(source_names)

@source_for_branch_bp.route('/api/my-branch/source-types', methods=['GET'])
@token_required
def my_branch_source_types(current_user):
    if current_user.roleId not in [3, 4]:  # Allow Branch Admin (3) and Encoder (4)
        return jsonify({'message': 'Unauthorized'}), 403
    branch_id = current_user.branchId

    result = db.session.execute(
        text('EXEC spGetMyBranchSourceTypes :branchId'),
        {'branchId': branch_id}
    )
    rows = result.fetchall()
    source_types = [
        dict(row._mapping) if hasattr(row, '_mapping') else dict(row)
        for row in rows
    ]
    return jsonify(source_types)
