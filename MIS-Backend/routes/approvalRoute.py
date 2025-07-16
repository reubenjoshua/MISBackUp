from flask import Blueprint, request, jsonify
from models.Daily import Daily
from models.db import db
from models.Status import Status
from models.Branch import  Branch
from models.Area import Area
from models.sourceType import SourceType
from models.sourceName import SourceName
from models.Monthly import Monthly
from models.User import User
from utils.auth import token_required
from routes.monthlyRoutes import sum_daily_fields
from flask_cors import cross_origin
from sqlalchemy import text
import json
from datetime import datetime



approval_bp = Blueprint('approval', __name__)

@approval_bp.route('/api/approval-data/<int:daily_id>', methods=['PUT', 'OPTION'])
@cross_origin(origins=["http://localhost:5173", "http://localhost:5174"])
def approve_data(daily_id):
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.get_json()
        print("Received Data:", data)
        status = data.get('status')
        remarks = data.get('remarks')

        # Use stored procedure with text()
        db.session.execute(
            text('EXEC spApproveDailyData :daily_id, :status, :remarks'),
            {'daily_id': daily_id, 'status': status, 'remarks': remarks}
        )



        # Commit the transaction
        db.session.commit()



        return jsonify({'message': 'Approval updated successfully'})
    except Exception as e:
        db.session.rollback()
        print("Error in approve_data", e)
        return jsonify({'message': f'failed to update approval: {str(e)}'}), 500

@approval_bp.route('/api/approval-monthly-data', methods=['GET'])
@cross_origin(origins=["http://localhost:5173", "http://localhost:5174"])
def get_approval_monthly_data():
    try:
        # Use stored procedure with text()
        result = db.session.execute(text('EXEC spGetApprovalMonthlyData'))
        items = result.fetchall()

        # Convert to list of dictionaries - handle the conversion properly
        monthly_data = []
        for row in items:
            # Convert row to dictionary using _mapping attribute
            row_dict = dict(row._mapping) if hasattr(row, '_mapping') else dict(row)
            monthly_data.append(row_dict)

        return jsonify(monthly_data)
    except Exception as e:
        print("Error in get_approval_monthly_data", e)
        return jsonify({'message': f'failed to fetch approval monthly data: {str(e)}'}), 500

@approval_bp.route('/api/approval-monthly-data/<int:monthly_id>', methods=['PUT', 'OPTIONS'])
@cross_origin(origins=["http://localhost:5173", "http://localhost:5174"])
def approve_monthly_data(monthly_id):
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.get_json()
        status = data.get('status')
        remarks = data.get('remarks')
        comment = data.get('comment')

        # Use stored procedure with text()
        db.session.execute(
            text('EXEC spApproveMonthlyData :monthly_id, :status, :remarks, :comment'),
            {'monthly_id': monthly_id, 'status': status, 'remarks': remarks, 'comment': comment}
        )

        # Commit the transaction
        db.session.commit()

        return jsonify({'message': 'Monthly Approval updated successfully'})
    except Exception as e:
        db.session.rollback()
        print("Error in approve_monthly_data", e)
        return jsonify({'message': f'failed to update monthly approval: {str(e)}'}), 500

@approval_bp.route('/api/encoder-monthly-data', methods=['GET'])
@cross_origin(origins=["http://localhost:5173", "http://localhost:5174"])
@token_required
def get_encoder_monthly_data(current_user):
    try:
        # Use stored procedure with user's branch ID
        result = db.session.execute(
            text('EXEC spGetEncoderMonthlyData :branch_id'),
            {'branch_id': current_user.branchId}
        )
        items = result.fetchall()

        # Convert to list of dictionaries - handle the conversion properly
        monthly_data = []
        for row in items:
            # Convert row to dictionary using _mapping attribute
            row_dict = dict(row._mapping) if hasattr(row, '_mapping') else dict(row)
            monthly_data.append(row_dict)

        return jsonify(monthly_data)
    except Exception as e:
        print("Error in get_encoder_monthly_data", e)
        return jsonify({'message': f'failed to fetch encoder monthly data: {str(e)}'}), 500

@approval_bp.route('/api/monthly/<int:id>', methods=['GET'])
@token_required
@cross_origin(origins=["http://localhost:5173", "http://localhost:5174"])
def get_monthly(current_user, id):
    try:
        # Use stored procedure with user permissions
        result = db.session.execute(
            text('EXEC spGetMonthlyById :monthly_id, :user_id, :user_role_id, :user_branch_id'),
            {'monthly_id': id, 'user_id': current_user.id, 'user_role_id': current_user.roleId,
             'user_branch_id': current_user.branchId}
        )

        monthly_data = result.fetchone()
        if not monthly_data:
            return jsonify({'message': 'Record not found'}), 404

        # Convert single row to dictionary
        row_dict = dict(monthly_data._mapping) if hasattr(monthly_data, '_mapping') else dict(monthly_data)

        return jsonify(row_dict)

    except Exception as e:
        error_message = str(e)
        if 'Forbidden' in error_message:
            return jsonify({'message': 'Forbidden'}), 403
        elif 'Record not found' in error_message:
            return jsonify({'message': 'Record not found'}), 404
        else:
            return jsonify({'message': f'Error fetching monthly record: {error_message}'}), 500


@approval_bp.route('/api/monthly/<int:id>', methods=['PUT'])
@token_required
@cross_origin(origins=["http://localhost:5173", "http://localhost:5174"])
def update_monthly(current_user, id):
    try:
        data = request.get_json()

        # Convert data to JSON string for stored procedure
        data_json = json.dumps(data)

        # Use stored procedure
        db.session.execute(
            text('EXEC spUpdateMonthlyRecord :monthly_id, :user_id, :user_role_id, :user_branch_id, :data_json'),
            {'monthly_id': id, 'user_id': current_user.id, 'user_role_id': current_user.roleId,
             'user_branch_id': current_user.branchId, 'data_json': data_json}
        )

        # Commit the transaction
        db.session.commit()

        return jsonify({'message': 'Monthly record updated successfully'})

    except Exception as e:
        db.session.rollback()
        error_message = str(e)

        if 'User not found' in error_message:
            return jsonify({'message': 'User not found'}), 404
        elif 'Monthly record not found' in error_message:
            return jsonify({'message': 'Monthly record not found'}), 404
        elif 'You can only edit from your assigned branch' in error_message:
            return jsonify({'message': 'You can only edit from your assigned branch'}), 403
        elif 'You can only edit rejected forms' in error_message:
            return jsonify({'message': 'You can only edit rejected forms'}), 403
        else:
            return jsonify({'message': f'failed to update monthly records: {error_message}'}), 500

@approval_bp.route('/api/monthly/<int:id>', methods=['GET'])
@token_required
@cross_origin(origins=["http://localhost:5173", "http://localhost:5174"])
def get_monthly_by_id(current_user, id):
    try:
        # Use stored procedure with user permissions
        result = db.session.execute(
            text('EXEC spGetMonthlyByIdWithRoles :monthly_id, :user_id, :user_role_id, :user_branch_id'),
            {'monthly_id': id, 'user_id': current_user.id, 'user_role_id': current_user.roleId,
             'user_branch_id': current_user.branchId}
        )

        monthly_data = result.fetchone()
        if not monthly_data:
            return jsonify({'message': 'Monthly record not found'}), 404

        # Convert single row to dictionary
        row_dict = dict(monthly_data._mapping) if hasattr(monthly_data, '_mapping') else dict(monthly_data)

        return jsonify(row_dict)

    except Exception as e:
        error_message = str(e)
        if 'User not found' in error_message:
            return jsonify({'message': 'User not found'}), 404
        elif 'Monthly record not found' in error_message:
            return jsonify({'message': 'Monthly record not found'}), 404
        elif 'You can only access records from your assigned branch' in error_message:
            return jsonify({'message': 'You can only access records from your assigned branch'}), 403
        else:
            return jsonify({'message': f'Error fetching monthly record: {error_message}'}), 500

@approval_bp.route('/api/monthly/<int:id>', methods=['OPTIONS'])
@cross_origin(origins=["http://localhost:5173", "http://localhost:5174"])
def monthly_options(id):
    return '', 204
