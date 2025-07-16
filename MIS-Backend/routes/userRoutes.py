from flask import Blueprint, jsonify, request
from models.User import User
from models.db import db
from utils.auth import token_required
from sqlalchemy import text
from flask_cors import cross_origin

user_bp = Blueprint('user', __name__)

@user_bp.route('/api/user/profile', methods=['GET', 'OPTIONS'])
@cross_origin(origins=["http://localhost:5173", "http://localhost:5174"])
@token_required
def get_profile(current_user):
    if request.method == 'OPTIONS':
        return '', 204
    try:
        result = db.session.execute(
            text('EXEC spGetUserProfile :userId'),
            {'userId': current_user.id}
        )
        row = result.fetchone()
        if row:
            user_dict = dict(row._mapping) if hasattr(row, '_mapping') else dict(row)
            return jsonify(user_dict)
        else:
            return jsonify({'message': 'User not found'}), 404
    except Exception as e:
        return jsonify({'message': f'failed to get profile: {str(e)}'}), 500

@user_bp.route('/api/users', methods=['GET', 'OPTIONS'])
@cross_origin(origins=["http://localhost:5173", "http://localhost:5174"])
@token_required
def get_all_users(current_user):
    try:
        result = db.session.execute(text('EXEC spGetAllUsers'))
        rows = result.fetchall()
        users = [
            dict(row._mapping) if hasattr(row, '_mapping') else dict(row)
            for row in rows
        ]
        return jsonify(users)
    except Exception as e:
        return jsonify({'message': f'failed to get users: {str(e)}'}), 500

@user_bp.route('/api/users/<int:user_id>/toggle-active', methods=['PUT', 'OPTIONS'])
@cross_origin(origins=["http://localhost:5173", "http://localhost:5174"])
@token_required
def toggle_user_active(current_user, user_id):
    try:
        result = db.session.execute(
            text('EXEC spToggleUserActive :userId'),
            {'userId': user_id}
        )
        updated = result.fetchone()
        db.session.commit()

        if updated:
            updated_dict = dict(updated._mapping) if hasattr(updated, '_mapping') else dict(updated)
            return jsonify(updated_dict), 200
        else:
            return jsonify({'message': 'User not found'}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'failed to update user status: {str(e)}'}), 500

@user_bp.route('/api/user/profile/update', methods=['PUT', 'OPTIONS'])
@cross_origin(origins=["http://localhost:5173", "http://localhost:5174"])
@token_required
def update_profile(current_user):
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.get_json()

        required_fields = ['roleName', 'username', 'firstName', 'lastName']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({'message': f'Missing or empty required field: {field}'}), 400

        result = db.session.execute(
            text('EXEC spUpdateUserProfileDetails :userId, :roleName, :username, :firstName, :lastName'),
            {
                'userId': current_user.id,
                'roleName': data['roleName'],
                'username': data['username'],
                'firstName': data['firstName'],
                'lastName': data['lastName']
            }
        )

        updated_user = result.fetchone()
        result.close()
        db.session.commit()

        if updated_user:
            user_dict = dict(updated_user._mapping) if hasattr(updated_user, '_mapping') else dict(updated_user)
            return jsonify({'message': 'Profile updated successfully', 'user': user_dict}), 200
        else:
            return jsonify({'message': 'Failed to update profile'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update profile: {str(e)}'}), 500


@user_bp.route('/api/user/password/change', methods=['PUT', 'OPTIONS'])
@cross_origin(origins=["http://localhost:5173", "http://localhost:5174"])
@token_required
def change_password(current_user):
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.get_json()

        # Validate required fields
        if not data.get('password') or not data.get('confirmPassword'):
            return jsonify({'message': 'Password and confirm password are required'}), 400

        if data['password'] != data['confirmPassword']:
            return jsonify({'message': 'Passwords do not match'}), 400

        # Call stored procedure to change password
        result = db.session.execute(
            text('EXEC spChangeUserPassword :userId, :newPassword'),
            {
                'userId': current_user.id,
                'newPassword': data['password']
            }
        )

        success = result.fetchone()
        result.close()
        db.session.commit()

        if success:
            return jsonify({'message': 'Password changed successfully'}), 200
        else:
            return jsonify({'message': 'Failed to change password'}), 500

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to change password: {str(e)}'}), 500



