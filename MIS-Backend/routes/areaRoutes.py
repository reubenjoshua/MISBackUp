from flask import Blueprint, jsonify, current_app
from models.Area import Area
from utils.auth import token_required
from sqlalchemy import text
from models.db import db

area_bp = Blueprint('area', __name__)

@area_bp.route('/api/areas', methods=['GET'])
@token_required
def get_all_areas(current_user):
    try:
        # Use the view instead of ORM
        result = db.session.execute(text('SELECT * FROM vw_active_areas'))
        areas = result.fetchall()

        # Convert to list of dictionaries
        area_list = []
        for row in areas:
            row_dict = dict(row._mapping) if hasattr(row, '_mapping') else dict(row)
            area_list.append(row_dict)

        return jsonify(area_list)
    except Exception as e:
        return jsonify({'message': f'Failed to get areas: {str(e)}'}), 500

@area_bp.route('/api/test-areas', methods=['GET'])
def test_areas():
    try:
        # Use the existing view with camelCase name
        result = db.session.execute(text('SELECT TOP 1 * FROM vwActiveAreas'))
        area = result.fetchone()

        if area:
            # Convert to dictionary
            area_dict = dict(area._mapping) if hasattr(area, '_mapping') else dict(area)

            return jsonify({
                'status': 'success',
                'message': 'Successfully found an area',
                'area': area_dict
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'No areas found'
            }), 404

    except Exception as e:
        current_app.logger.error(f"Error in test_areas: {str(e)}")
        import traceback
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            'status': 'error',
            'message': f'Error testing areas: {str(e)}'
        }), 500