from flask import Blueprint, jsonify, request
from models.db import db
from models.Branch import Branch
from models.branchSourceName import BranchSourceName
from models.sourceName import SourceName
from models.sourceType import SourceType
from sqlalchemy import text
from config import cache

branch_source_name_bp = Blueprint('branch_source_name', __name__)

def invalidate_branch_source_cache(branch_id, source_type_id):
    """Clear cache when branch source names change"""
    # Invalidate the specific branch source names cache
    cache.delete_memoized('get_branch_source_names', branch_id, source_type_id)
    # Also invalidate source names cache from daily routes
    cache.delete_memoized('get_all_source_names')

@branch_source_name_bp.route('/api/branch/<int:branch_id>/source-names', methods=['GET'])
@cache.memoize(timeout=600)
def get_branch_source_names(branch_id):
    source_type_id = request.args.get('sourceTypeId', type=int)
    result = db.session.execute(
        text('EXEC spGetBranchSourceNames :branchId, :sourceTypeId'),
        {'branchId': branch_id, 'sourceTypeId': source_type_id}
    )
    rows = result.fetchall()
    output = [
        {
            'id': row.sourceNameId,
            'branchId': row.branchId,
            'sourceName': row.sourceName,
            'sourceTypeId': row.sourceTypeId,
            'sourceTypeName': row.sourceTypeName,
            'isActive': row.isActive
        }
        for row in rows
    ]
    return jsonify(output)

@branch_source_name_bp.route('/api/branch-source-name', methods=['POST'])
def create_branch_source_name():
    data = request.json
    branch_id = data['branchId']
    source_name_id = data['sourceNameId']
    is_active = data.get('isActive', True)

    try:
        result = db.session.execute(
            text('EXEC spCreateBranchSourceName :branchId, :sourceNameId, :isActive'),
            {
                'branchId': branch_id,
                'sourceNameId': source_name_id,
                'isActive': is_active
            }
        )
        bsn = result.fetchone()
        db.session.commit()

        source_name = SourceName.query.get(source_name_id)
        if source_name:
            invalidate_branch_source_cache(branch_id, source_name.sourceTypeId)

        if bsn:
            bsn_dict = dict(bsn._mapping) if hasattr(bsn, '_mapping') else dict(bsn)
            return jsonify(bsn_dict), 201
        else:
            return jsonify({'error': 'Failed to create BranchSourceName'}), 500

    except Exception as e:
        db.session.rollback()
        error_message = str(e)
        if 'Branch not found' in error_message:
            return jsonify({'error': 'Branch not found'}), 404
        elif 'SourceName not found' in error_message:
            return jsonify({'error': 'SourceName not found'}), 404
        else:
            return jsonify({'error': f'Failed to create BranchSourceName: {error_message}'}), 500