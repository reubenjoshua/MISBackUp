from flask import Blueprint, request, jsonify
from models.db import db
from models.sourceName import SourceName
from models.branchSourceName import BranchSourceName
from models.sourceType import SourceType
from sqlalchemy import text
from config import cache

source_name_bp = Blueprint('source_name', __name__)

def invalidate_source_name_cache(branch_id, source_type_id):
    """Clear cache when source name data changes"""
    # Invalidate branch source names cache
    cache.delete_memoized('get_source_names_for_branch', branch_id, source_type_id)
    # Also invalidate other related caches
    cache.delete_memoized('get_all_source_names')
    cache.delete_memoized('get_branch_source_names', branch_id, source_type_id)

@source_name_bp.route('/api/source-name', methods=['POST'])
def create_source_name():
    data = request.json

    result = db.session.execute(
        text('EXEC spCreateSourceName :sourceName, :sourceTypeId, :branchId, :isActive'),
        {
            'sourceName': data['sourceName'],
            'sourceTypeId': data['sourceTypeId'],
            'branchId': data['branchId'],
            'isActive': data.get('isActive', True)
        }
    )
    source_name = result.fetchone()
    db.session.commit()

    invalidate_source_name_cache(data['branchId'], data['sourceTypeId'])

    if source_name:
        source_name_dict = dict(source_name._mapping) if hasattr(source_name, '_mapping') else dict(source_name)
        return jsonify(source_name_dict), 201
    else:
        return jsonify({'message': 'Failed to create source name'}), 500

@source_name_bp.route('/api/branch/<int:branch_id>/source-names', methods=['GET'])
@cache.memoize(timeout=600)
def get_source_names_for_branch(branch_id):
    source_type_id = request.args.get('sourceTypeId', type=int)

    result = db.session.execute(
        text('EXEC spGetSourceNamesForBranch :branchId, :sourceTypeId'),
        {'branchId': branch_id, 'sourceTypeId': source_type_id}
    )
    rows = result.fetchall()

    output = [
        {
            'id': row.id,
            'branchId': row.branchId,
            'sourceName': row.sourceName,
            'sourceTypeId': row.sourceTypeId,
            'sourceTypeName': row.sourceTypeName,
            'isActive': row.isActive
        }
        for row in rows
    ]
    return jsonify(output)

@source_name_bp.route('/api/source-name/<int:source_name_id>/toggle-active', methods=['PUT'])
def toggle_source_name_active(source_name_id):
    try:
        result = db.session.execute(
            text('EXEC spToggleSourceNameActive :sourceNameId'),
            {'sourceNameId': source_name_id}
        )
        updated = result.fetchone()
        db.session.commit()

        if updated:
            updated_dict = dict(updated._mapping) if hasattr(updated, '_mapping') else dict(updated)
            invalidate_source_name_cache(updated_dict['branchId'], updated_dict['sourceTypeId'])
            return jsonify(updated_dict), 200
        else:
            return jsonify({'message': 'Source name not found'}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'failed to update source name status: {str(e)}'}), 500

@source_name_bp.route('/api/source-name/<int:source_name_id>', methods=['PUT'])
def update_source_name(source_name_id):
    data = request.json

    new_name = data.get('sourceName')
    if not new_name:
        return jsonify({'message': 'No new source name provided'}), 400

    conn = db.engine.raw_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("EXEC spUpdateSourceName ?, ?", (source_name_id, new_name))
        # Skip any result sets until we get to the SELECT
        while True:
            if cursor.description is not None:
                break
            if not cursor.nextset():
                break
        row = cursor.fetchone()
        conn.commit()
        if row:
            # If you want column names, use cursor.description
            columns = [col[0] for col in cursor.description]
            updated_dict = dict(zip(columns, row))
            invalidate_source_name_cache(updated_dict['branchId'], updated_dict['sourceTypeId'])
            return jsonify(updated_dict), 200
        else:
            return jsonify({'message': 'Source name not found'}), 404
    except Exception as e:
        conn.rollback()
        print('Update error:', e)
        return jsonify({'message': f'Failed to update source name: {str(e)}'}), 500
    finally:
        conn.close()