from flask import Blueprint,request, jsonify,current_app
from models import db, User
import jwt
from datetime import datetime,timedelta
from sqlalchemy import text

auth_bp =Blueprint('auth', __name__)

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'message': 'Missing username or password'}), 400

        # Use stored procedure for authentication
        result = db.session.execute(
            text('EXEC spAuthenticateUser :username, :password'),
            {'username': data['username'], 'password': data['password']}
        )

        user_data = result.fetchone()
        result.close()  # <-- This is important!

        if not user_data:
            print("Invalid Credentials")
            return jsonify({'message': 'Invalid username or password'}), 401

        user_dict = dict(user_data._mapping) if hasattr(user_data, '_mapping') else dict(user_data)

        role_name = None
        if user_dict['roleId']:
            role_result = db.session.execute(
                text('SELECT roleName FROM Role WHERE id = :roleId'),
                {'roleId': user_dict['roleId']}
            )
            role_row = role_result.fetchone()
            role_result.close()  # <-- Also close this result set!
            if role_row:
                role_name = role_row[0]

        token = jwt.encode({
            'user_id': user_dict['id'],
            'branchId': user_dict['branchId'],
            'roleId': user_dict['roleId'],
            'exp': datetime.utcnow() + timedelta(hours=1)
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

        return jsonify({
            'token': token,
            'user': {
                'id': user_dict['id'],
                'userName': user_dict['userName'],
                'roleName': role_name,
                'branchId': user_dict['branchId'],
                'roleId': user_dict['roleId'],
                'isActive': user_dict['isActive'],
                'email': user_dict.get('email')
            }
        })

    except Exception as e:
        error_message = str(e)
        print(f"Login error: {error_message}")
        if 'Invalid username or password' in error_message:
            return jsonify({'message': 'Invalid username or password'}), 401
        elif 'Account is inactive' in error_message:
            return jsonify({'message': 'Account is inactive'}), 401
        else:
            return jsonify({'message': f'Login failed: {error_message}'}), 500

@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        print("Received Data", data)

        # Validate required fields
        required_fields = ['userName', 'firstName', 'lastName', 'email', 'password', 'roleId']
        for field in required_fields:
            if field not in data or (isinstance(data[field], str) and not data[field].strip()):
                return jsonify({'message': f'Missing or empty required field: {field}'}), 400

        # Handle optional fields
        area_id = data.get('areaId')
        if area_id in [None, '', 'null', 0, '0']:
            area_id = None
        branch_id = data.get('branchId')
        if branch_id in [None, '', 'null', 0, '0']:
            branch_id = None

            # Print before calling the stored procedure
            print("Calling spRegisterUser with:", {
                'userName': data['userName'],
                'firstName': data['firstName'],
                'lastName': data['lastName'],
                'email': data['email'],
                'password': data['password'],
                'roleId': data['roleId'],
                'areaId': area_id,
                'branchId': branch_id
            })

        # Use stored procedure for registration
        result = db.session.execute(
            text(
                'EXEC spRegisterUser :userName, :firstName, :lastName, :email, :password, :roleId, :areaId, :branchId'),
            {
                'userName': data['userName'],
                'firstName': data['firstName'],
                'lastName': data['lastName'],
                'email': data['email'],
                'password': data['password'],
                'roleId': data['roleId'],
                'areaId': area_id,
                'branchId': branch_id
            }
        )

        # Print after calling the stored procedure
        print("Stored procedure executed.")
        print("Stored procedure executed, about to fetchone()")
        # Get the created user data
        user_data = result.fetchone()
        print("Fetched user_data:", user_data)
        result.close()
        db.session.commit()

        if user_data:
            # Convert to dictionary
            user_dict = dict(user_data._mapping) if hasattr(user_data, '_mapping') else dict(user_data)

            # Create user object for response
            new_user = User()
            new_user.id = user_dict['id']
            new_user.userName = user_dict['userName']
            new_user.firstName = user_dict['firstName']
            new_user.lastName = user_dict['lastName']
            new_user.email = user_dict['email']
            new_user.roleId = user_dict['roleId']
            new_user.areaId = user_dict['areaId']
            new_user.branchId = user_dict['branchId']
            new_user.isActive = user_dict['isActive']

            return jsonify({'message': 'User created successfully', 'user': new_user.to_dict()}), 201
        else:
            return jsonify({'message': 'Failed to create user'}), 500

    except Exception as e:
        db.session.rollback()
        error_message = str(e)

        if 'Username already exists' in error_message:
            return jsonify({'message': 'Username already exists'}), 400
        elif 'Email already exists' in error_message:
            return jsonify({'message': 'Email already exists'}), 400
        else:
            return jsonify({'message': f'Failed to create user: {error_message}'}), 500
