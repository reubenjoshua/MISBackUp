from flask import Blueprint, jsonify, request
from models.db import db
from models.sourceType import SourceType
from models.sourceName import SourceName
from utils.auth import token_required
from sqlalchemy import text
from config import cache

source_bp = Blueprint('source', __name__)

def invalidate_source_cache(user_id, role_id, branch_id, source_type_id):
    """Clear cache when source data changes"""
    # Clear cache for simple cache (doesn't support delete_memoized with strings)
    try:
        # Invalidate source types cache
        cache.delete_memoized('get_all_source_types', user_id, role_id, branch_id)
        # Invalidate source names cache
        cache.delete_memoized('get_all_source_names', user_id, role_id, branch_id, source_type_id)
        # Also invalidate branch source names cache
        cache.delete_memoized('get_branch_source_names', branch_id, source_type_id)
    except (TypeError, AttributeError):
        # For simple cache, clear all cache
        cache.clear()

@source_bp.route('/api/source-types', methods=['GET'])
@token_required
@cache.memoize(timeout=1800)
def get_all_source_types(current_user):
    #items = SourceType.query.all()
   #return jsonify([item.to_dict() for item in items])
    result = db.session.execute(
        text('EXEC spGetAllSourceTypes :roleId, :branchId'),
        {
            'roleId': current_user.roleId,
            'branchId': getattr(current_user, 'branchId', None)
        }
    )
    rows = result.fetchall()
    items = [
        dict(row._mapping) if hasattr(row, '_mapping') else dict(row)
        for row in rows
    ]
    return jsonify(items)

@source_bp.route('/api/source-names', methods=['POST'])
@token_required
def create_source_name(current_user):
    data = request.get_json()
    result = db.session.execute(
        text('EXEC spCreateSourceName :branchId, :sourceTypeId, :sourceName, :isActive'),
        {
            'branchId': data['branchId'],
            'sourceTypeId': data['sourceTypeId'],
            'sourceName': data['sourceName'],
            'isActive': data.get('isActive', True)
        }
    )
    new_source_name = result.fetchone()
    db.session.commit()

    invalidate_source_cache(
        current_user.id,
        current_user.roleId,
        data['branchId'],
        data['sourceTypeId']
    )

    if new_source_name:
        new_source_name_dict = dict(new_source_name._mapping) if hasattr(new_source_name, '_mapping') else dict(
            new_source_name)
        return jsonify(new_source_name_dict), 201
    else:
        return jsonify({'message': 'Failed to create source name'}), 500

@source_bp.route('/api/source-names', methods=['GET'])
@token_required
@cache.memoize(timeout=1800)
def get_all_source_names(current_user):
    source_type_id = request.args.get('sourceTypeId', type=int)
    result = db.session.execute(
        text('EXEC spGetAllSourceNames :roleId, :branchId, :sourceTypeId'),
        {
            'roleId': current_user.roleId,
            'branchId': getattr(current_user, 'branchId', None),
            'sourceTypeId': source_type_id
        }
    )
    rows = result.fetchall()
    items = [
        dict(row._mapping) if hasattr(row, '_mapping') else dict(row)
        for row in rows
    ]
    return jsonify(items)