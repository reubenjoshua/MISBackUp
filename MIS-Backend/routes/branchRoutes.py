from flask import Blueprint, request, jsonify
from models.Branch import Branch
from models.branchSource import BranchSource
from models.branchSourceName import BranchSourceName
from models.sourceName import SourceName
from models.db import db
from sqlalchemy import text
from utils.auth import token_required
from config import cache



branch_bp = Blueprint('branch', __name__)

@branch_bp.route('/api/branches', methods=['GET'])
@token_required
@cache.cached(timeout=300, key_prefix='branches_active')
def get_all_branches(current_user):
    try:
        # Use the view instead of ORM
        result = db.session.execute(text('SELECT * FROM vwActiveBranches'))
        branches = result.fetchall()

        # Convert to list of dictionaries
        branch_list = []
        for row in branches:
            row_dict = dict(row._mapping) if hasattr(row, '_mapping') else dict(row)
            branch_list.append(row_dict)

        return jsonify(branch_list)
    except Exception as e:
        return jsonify({'message': f'Failed to get branches: {str(e)}'}), 500

@branch_bp.route('/api/branches/inactive', methods=['GET'])
@token_required
@cache.cached(timeout=300, key_prefix='branches_inactive')
def get_inactive_branches(current_user):
    try:
        # Use the view instead of ORM
        result = db.session.execute(text('SELECT * FROM vwInactiveBranches'))
        branches = result.fetchall()

        # Convert to list of dictionaries
        branch_list = []
        for row in branches:
            row_dict = dict(row._mapping) if hasattr(row, '_mapping') else dict(row)
            branch_list.append(row_dict)

        return jsonify(branch_list)
    except Exception as e:
        return jsonify({'message': f'failed to get inactive branches: {str(e)}'}), 500

@branch_bp.route('/api/branch', methods=['POST'])
@token_required

def create_branch(current_user):
    try:
        data = request.get_json()

        # Use stored procedure for creating branch
        result = db.session.execute(
            text('EXEC spCreateBranch :areaId, :branchName, :isActive'),
            {
                'areaId': data['areaId'],
                'branchName': data['branchName'],
                'isActive': data.get('isActive', True)
            }
        )

        # Get the created branch data
        branch_data = result.fetchone()
        db.session.commit()

        if branch_data:
            # Convert to dictionary
            branch_dict = dict(branch_data._mapping) if hasattr(branch_data, '_mapping') else dict(branch_data)
            
            # Clear cache for simple cache (doesn't support delete_pattern)
            try:
                cache.delete_pattern('branches:*')
                cache.delete_pattern('branch_details:*')
            except AttributeError:
                # For simple cache, clear all cache
                cache.clear()
                
            return jsonify(branch_dict['id']), 201
        else:
            return jsonify({'message': 'Failed to create branch'}), 500

    except Exception as e:
        db.session.rollback()
        error_message = str(e)

        if 'Branch name already exists in this area' in error_message:
            return jsonify({'message': 'Branch name already exists in this area'}), 400
        else:
            return jsonify({'message': f'Failed to create branch: {error_message}'}), 500

@branch_bp.route('/api/branches', methods=['POST'])
@token_required
def add_branch(current_user):
    try:
        data = request.json
        print("Received Data", data)
        area_id = data['areaId']
        branch_name = data['branchName']
        source_type_ids = data['sourceTypeIds']

        # Convert source type IDs list to comma-separated string
        source_type_ids_string = ','.join(map(str, source_type_ids))

        # Use stored procedure for creating branch with sources
        print(f"About to execute stored procedure with: areaId={area_id}, branchName={branch_name}, sourceTypeIds={source_type_ids_string}")
        
        result = db.session.execute(
            text('EXEC spAddBranchWithSources :areaId, :branchName, :sourceTypeIds'),
            {
                'areaId': area_id,
                'branchName': branch_name,
                'sourceTypeIds': source_type_ids_string
            }
        )

        print(f"Stored procedure executed. Result returns rows: {result.returns_rows}")
        
        # Get the created branch ID
        if result.returns_rows:
            branch_data = result.fetchone()
            print(f"Fetched branch data: {branch_data}")
            
            if branch_data:
                # Convert to dictionary
                branch_dict = dict(branch_data._mapping) if hasattr(branch_data, '_mapping') else dict(branch_data)
                
                # Commit only after successful data retrieval
                db.session.commit()

                # Clear cache for simple cache (doesn't support delete_pattern)
                try:
                    cache.delete_pattern('branches:*')
                    cache.delete_pattern('branch_details:*')
                except AttributeError:
                    # For simple cache, clear all cache
                    cache.clear()
                
                return jsonify({'branchId': branch_dict['branchId']}), 201
            else:
                # Don't commit if no data returned
                db.session.rollback()
                return jsonify({'message': 'Failed to create branch'}), 500
        else:
            # Stored procedure didn't return rows, try to get the branch ID manually
            print("Stored procedure didn't return rows, trying to get branch ID manually")
            db.session.commit()
            
            # Query for the newly created branch
            branch_result = db.session.execute(
                text('SELECT TOP 1 id FROM Branch WHERE areaId = :areaId AND branchName = :branchName ORDER BY id DESC'),
                {
                    'areaId': area_id,
                    'branchName': branch_name
                }
            )
            branch_row = branch_result.fetchone()

            # Clear cache for simple cache (doesn't support delete_pattern)
            try:
                cache.delete_pattern('branches:*')
                cache.delete_pattern('branch_details:*')
            except AttributeError:
                # For simple cache, clear all cache
                cache.clear()
            
            if branch_row:
                return jsonify({'branchId': branch_row[0]}), 201
            else:
                return jsonify({'message': 'Failed to create branch'}), 500

    except Exception as e:
        db.session.rollback()
        import traceback
        print(traceback.format_exc())
        error_message = str(e)

        if 'Branch name already exists in this area' in error_message:
            return jsonify({'message': 'Branch name already exists in this area'}), 400
        else:
            return jsonify({'message': f'Failed to create branch: {error_message}'}), 500

@branch_bp.route('/api/branch/<int:branch_id>/details', methods=['GET'])
@token_required
@cache.memoize(timeout=300)
def get_branch_details(branch_id):
    try:
        # Use stored procedure to get branch details
        result = db.session.execute(
            text('EXEC spGetBranchDetails :branchId'),
            {'branchId': branch_id}
        )

        # Get all result sets
        branch_data = result.fetchall()

        if not branch_data:
            return jsonify({'error': 'Branch not found'}), 404

        # Get the next result set (source names)
        result.nextset()
        source_names_data = result.fetchall()

        # Process branch and source types data
        branch_info = None
        source_types = []

        for row in branch_data:
            row_dict = dict(row._mapping) if hasattr(row, '_mapping') else dict(row)

            # Get branch info from first row
            if branch_info is None:
                branch_info = {
                    'id': row_dict['id'],
                    'areaId': row_dict['areaId'],
                    'branchName': row_dict['branchName'],
                    'isActive': row_dict['isActive']
                }

            # Add source type if it exists
            if row_dict['sourceTypeId'] is not None:
                source_types.append({
                    'id': row_dict['sourceTypeId'],
                    'name': row_dict['sourceTypeName']
                })

        # Process source names data
        source_names = []
        for row in source_names_data:
            row_dict = dict(row._mapping) if hasattr(row, '_mapping') else dict(row)
            source_names.append({
                'id': row_dict['sourceNameId'],
                'name': row_dict['sourceName'],
                'sourceTypeId': row_dict['sourceTypeId']
            })

        return jsonify({
            'id': branch_info['id'],
            'areaId': branch_info['areaId'],
            'branchName': branch_info['branchName'],
            'sourceTypes': source_types,
            'sourceNames': source_names
        })

    except Exception as e:
        error_message = str(e)
        if 'Branch not found' in error_message:
            return jsonify({'error': 'Branch not found'}), 404
        else:
            return jsonify({'error': f'Failed to get branch details: {error_message}'}), 500

@branch_bp.route('/api/branches/<int:branch_id>/toggle-active', methods=['PUT'])
@token_required
def toggle_branch_active(current_user, branch_id):
    try:
        # Use stored procedure to toggle branch status
        db.session.execute(
            text('EXEC spToggleBranchActive :branchId'),
            {'branchId': branch_id}
        )

        # Commit the transaction
        db.session.commit()

        # Clear cache for simple cache (doesn't support delete_pattern)
        try:
            cache.delete_pattern('branches:*')
            cache.delete_pattern('branch_details:*')
        except AttributeError:
            # For simple cache, clear all cache
            cache.clear()

        # Get the updated branch to return the new status
        result = db.session.execute(
            text('SELECT isActive FROM Branch WHERE id = :branchId'),
            {'branchId': branch_id}
        )

        branch_data = result.fetchone()
        is_active = branch_data[0] if branch_data else False

        return jsonify({
            'message': 'Branch status updated successfully',
            'isActive': is_active
        })

    except Exception as e:
        db.session.rollback()
        error_message = str(e)

        if 'Branch not found' in error_message:
            return jsonify({'message': 'Branch not found'}), 404
        else:
            return jsonify({'message': f'Failed to toggle branch status: {error_message}'}), 500




