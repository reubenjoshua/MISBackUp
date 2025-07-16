from flask import Blueprint, request, jsonify
from models import db, RequiredFields, Branch, User
from utils.auth import token_required
import logging

# Configure logging
logger = logging.getLogger(__name__)

required_fields_bp = Blueprint('required_fields', __name__)


@required_fields_bp.route('/api/required-fields/<int:branch_id>', methods=['GET'])
@token_required
def get_required_fields(current_user, branch_id):
    try:
        # Get user's role and branch
        user = User.query.get(current_user.id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Validate branch permissions
        if user.roleId in [3, 4]:  # Branch Admin or Encoder
            if str(branch_id) != str(user.branchId):
                return jsonify({'message': 'You can only view required fields for your assigned branch'}), 403

        # Get all required fields for this branch
        required_fields = RequiredFields.query.filter_by(branchId=branch_id).all()

        # Separate into daily and monthly fields
        daily_fields = [rf.fieldKey for rf in required_fields if rf.formType == 'daily']
        monthly_fields = [rf.fieldKey for rf in required_fields if rf.formType == 'monthly']

        return jsonify({
            'daily': daily_fields,
            'monthly': monthly_fields
        })

    except Exception as e:
        logger.error(f"Error fetching required fields: {str(e)}")
        return jsonify({'message': f'Failed to fetch required fields: {str(e)}'}), 500


@required_fields_bp.route('/api/required-fields/<int:branch_id>', methods=['POST'])
@token_required
def update_required_fields(current_user, branch_id):
    try:
        # Get user's role and branch
        user = User.query.get(current_user.id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Validate branch permissions
        if user.roleId in [3, 4]:  # Branch Admin or Encoder
            if str(branch_id) != str(user.branchId):
                return jsonify({'message': 'You can only update required fields for your assigned branch'}), 403

        data = request.get_json()
        form_type = data.get('type')  # 'daily' or 'monthly'
        fields = data.get('fields', [])  # List of field keys

        if not form_type or form_type not in ['daily', 'monthly']:
            return jsonify({'message': 'Invalid form type'}), 400

        # Delete existing required fields of this type for this branch
        RequiredFields.query.filter_by(branchId=branch_id, formType=form_type).delete()

        # Add new required fields
        for field_key in fields:
            required_field = RequiredFields(
                branchId=branch_id,
                fieldKey=field_key,
                formType=form_type
            )
            db.session.add(required_field)

        db.session.commit()

        return jsonify({
            'message': f'{form_type.capitalize()} required fields updated successfully',
            'fields': fields
        })

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating required fields: {str(e)}")
        return jsonify({'message': f'Failed to update required fields: {str(e)}'}), 500 