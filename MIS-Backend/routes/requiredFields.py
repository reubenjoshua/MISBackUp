from flask import Blueprint, request, jsonify
from models.db import db
from models.requiredFields import RequiredFields
from models.User import User
from utils.auth import token_required
from sqlalchemy import text

required_fields_bp = Blueprint('required_fields', __name__)

@required_fields_bp.route('/api/required-fields/<int:branch_id>', methods=['GET'])
@token_required
def get_required_fields(current_user, branch_id):
    try:
        user = User.query.get(current_user.id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        if user.roleId in [3, 4]:
            if str(branch_id) != str(user.branchId):
                return jsonify({'message': 'You can only view required fields for your assigned branch'}), 403

        result = db.session.execute(
            text('EXEC spGetRequiredFields :branchId'),
            {'branchId': branch_id}
        )
        rows = result.fetchall()

        daily_fields = [row.fieldKey for row in rows if row.formType == 'daily']
        monthly_fields = [row.fieldKey for row in rows if row.formType == 'monthly']

        return jsonify({
            'daily': daily_fields,
            'monthly': monthly_fields
        })

    except Exception as e:
        return jsonify({'message': f'Failed to fetch required fields: {str(e)}'}), 500

@required_fields_bp.route('/api/required-fields/<int:branch_id>', methods=['POST'])
@token_required
def update_required_fields(current_user, branch_id):
    try:
        user = User.query.get(current_user.id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        if user.roleId in [3, 4]:
            if str(branch_id) != str(user.branchId):
                return jsonify({'message': 'You can only update required fields for your assigned branch'}), 403

        data = request.get_json()
        form_type = data.get('type')
        fields = data.get('fields', [])

        if not form_type or form_type not in ['daily', 'monthly']:
            return jsonify({'message': 'Invalid form type'}), 400

        # Convert fields list to comma-separated string
        fields_str = ','.join(fields)

        db.session.execute(
            text('EXEC spUpdateRequiredFields :branchId, :formType, :fields'),
            {'branchId': branch_id, 'formType': form_type, 'fields': fields_str}
        )
        db.session.commit()

        return jsonify({
            'message': f'{form_type.capitalize()} required fields updated successfully',
            'fields': fields
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'failed to update required fields: {str(e)}'}), 500
