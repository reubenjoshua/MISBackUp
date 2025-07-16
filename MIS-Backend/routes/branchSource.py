from flask import Blueprint, jsonify, request
from models.db import db
from models.branchSource import BranchSource
from models.sourceType import SourceType
from models.Branch import Branch
from sqlalchemy import text

branch_source_bp = Blueprint('branch_source', __name__)

@branch_source_bp.route('/api/branch-source', methods=['POST'])
def create_branch_source():
    data = request.json
    branch_id = data['branchId']
    source_type_id = data['sourceTypeId']
    is_active = data.get('isActive', True)

    try:
        result = db.session.execute(
            text('EXEC spCreateBranchSource :branchId, :sourceTypeId, :isActive'),
            {
                'branchId': branch_id,
                'sourceTypeId': source_type_id,
                'isActive': is_active
            }
        )
        branch_source = result.fetchone()
        db.session.commit()

        if branch_source:
            branch_source_dict = dict(branch_source._mapping) if hasattr(branch_source, '_mapping') else dict(
                branch_source)
            return jsonify(branch_source_dict), 201
        else:
            return jsonify({'error': 'Failed to create BranchSource'}), 500

    except Exception as e:
        db.session.rollback()
        error_message = str(e)
        if 'Branch not found' in error_message:
            return jsonify({'error': 'Branch not found'}), 404
        else:
            return jsonify({'error': f'Failed to create BranchSource: {error_message}'}), 500