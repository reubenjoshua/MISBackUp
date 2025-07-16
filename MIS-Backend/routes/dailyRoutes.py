from flask import Blueprint, jsonify, request
from models.Daily import Daily
from models.User import User
from models.Branch import Branch
from models.Area import Area
from models.db import db
from models.Status import Status
from utils.auth import token_required
from models.sourceName import SourceName
from models.sourceType import SourceType
from models.requiredFields import RequiredFields
from sqlalchemy import text
from config import cache
import pytz


daily_bp = Blueprint('daily', __name__)

def invalidate_daily_cache(user_id, role_id, branch_id):
    """Clear cache when daily data changes"""
    # Clear cache for simple cache (doesn't support delete_memoized with strings)
    try:
        cache.delete_memoized('get_all_source_names')
        # Invalidate dashboard cache since daily data affects approval counts
        cache.delete_memoized('dashboard_stats', user_id, role_id, branch_id)
        cache.delete_memoized('approval_counts', user_id, role_id, branch_id)
    except (TypeError, AttributeError):
        # For simple cache, clear all cache
        cache.clear()

@daily_bp.route('/api/daily', methods=['GET'])
@token_required
def get_all_daily(current_user):
    try:
        result = db.session.execute(
            text('EXEC spGetAllDailyReports :userId, :roleId'),
            {'userId': current_user.id, 'roleId': current_user.roleId}
        )
        rows = result.fetchall()
        result_list = []
        for row in rows:
            row_dict = dict(row._mapping) if hasattr(row, '_mapping') else dict(row)
            # Convert encodedAt to Manila timezone if present
            if row_dict.get('encodedAt'):
                import pytz
                row_dict['encodedAt'] = row_dict['encodedAt'].replace(tzinfo=pytz.UTC).astimezone(
                    pytz.timezone("Asia/Manila")).isoformat()
            result_list.append(row_dict)
        return jsonify(result_list)
    except Exception as e:
        return jsonify({'message': f'Failed to fetch daily reports: {str(e)}'}), 500


@daily_bp.route('/api/daily', methods=['POST'])
@token_required
def create_daily(current_user):
    try:
        user = User.query.get(current_user.id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        data = request.get_json()


        source_name_id = data.get('sourceName')
        source_name_obj = SourceName.query.get(source_name_id)
        if not source_name_obj:
            return jsonify({'message': 'Source name not found'}), 404

        correct_branch_id = source_name_obj.branchId

        if user.roleId in [3, 4]:
            if str(correct_branch_id) != str(user.branchId):
                return jsonify({'message': 'You can only submit data for your assigned branch'}), 403

        result = db.session.execute(
            text(
                'EXEC spCreateDaily :monthlyId, :sourceType, :sourceName, :byUser, :date, :productionVolume, :operationHours, :serviceInterruption, :totalHoursServiceInterruption, :electricityConsumption, :VFDFrequency, :spotFlow, :spotPressure, :timeSpotMeasurements, :lineVoltage1, :lineVoltage2, :lineVoltage3, :lineCurrent1, :lineCurrent2, :lineCurrent3, :comment, :isActive, :branchId, :areaId'),
            {
                'monthlyId': data.get('monthlyId'),
                'sourceType': data.get('sourceType'),
                'sourceName': source_name_id,
                'byUser': current_user.id,
                'date': data.get('date'),
                'productionVolume': data.get('productionVolume'),
                'operationHours': data.get('operationHours'),
                'serviceInterruption': data.get('serviceInterruption'),
                'totalHoursServiceInterruption': data.get('totalHoursServiceInterruption'),
                'electricityConsumption': data.get('electricityConsumption'),
                'VFDFrequency': data.get('VFDFrequency'),
                'spotFlow': data.get('spotFlow'),
                'spotPressure': data.get('spotPressure'),
                'timeSpotMeasurements': data.get('timeSpotMeasurements'),
                'lineVoltage1': data.get('lineVoltage1'),
                'lineVoltage2': data.get('lineVoltage2'),
                'lineVoltage3': data.get('lineVoltage3'),
                'lineCurrent1': data.get('lineCurrent1'),
                'lineCurrent2': data.get('lineCurrent2'),
                'lineCurrent3': data.get('lineCurrent3'),
                'comment': data.get('comment'),
                'isActive': data.get('isActive', True),
                'branchId': correct_branch_id,
                'areaId': data.get('areaId')
            }
        )
        new_id = result.fetchone()[0]
        db.session.commit()

        invalidate_daily_cache(current_user.id, current_user.roleId, current_user.branchId)

        return jsonify({
            'message': 'Daily record created successfully',
            'id': new_id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'failed to create daily records: {str(e)}'}), 500

@daily_bp.route('/api/source-names', methods=['GET'])
@token_required
@cache.memoize(timeout=600)
def get_all_source_names(current_user):
    user = User.query.get(current_user.id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if user.roleId not in [1, 2]:
        return jsonify({'message': 'Forbidden'}), 403

    result = db.session.execute(text('EXEC spGetAllSourceNames'))
    rows = result.fetchall()
    output = [
        {
            'id': row.id,
            'sourceName': row.sourceName,
            'sourceTypeId': row.sourceTypeId,
            'branchId': row.branchId,
            'isActive': row.isActive,
            'branchName': row.branchName,
            'sourceTypeName': row.sourceTypeName
        }
        for row in rows
    ]
    return jsonify(output)

@daily_bp.route('/api/daily/<int:id>', methods=['GET'])
@token_required
def get_daily_by_id(current_user, id):
    try:
        user = User.query.get(current_user.id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        result = db.session.execute(
            text('EXEC spGetDailyById :dailyId'),
            {'dailyId': id}
        )
        row = result.fetchone()
        if not row:
            return jsonify({'message': 'Daily record not found'}), 404

        row_dict = dict(row._mapping) if hasattr(row, '_mapping') else dict(row)

        # Access control for branch admin/encoder
        if user.roleId in [3, 4]:
            if row_dict['branchId'] != user.branchId:
                return jsonify({'message': 'you can only access records from your assigned branch'}), 403

        # Convert encodedAt and date to proper format
        import pytz
        if row_dict.get('encodedAt'):
            row_dict['encodedAt'] = row_dict['encodedAt'].replace(tzinfo=pytz.UTC).astimezone(
                pytz.timezone("Asia/Manila")).isoformat()
        if row_dict.get('date'):
            row_dict['date'] = row_dict['date'].isoformat()



        return jsonify(row_dict)
    except Exception as e:
        return jsonify({'message': f'Error fetching daily record: {str(e)}'})


@daily_bp.route('/api/daily/<int:id>', methods=['PUT'])
@token_required
def update_daily(current_user, id):
    try:
        user = User.query.get(current_user.id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        daily_record = Daily.query.get(id)
        if not daily_record:
            return jsonify({'message': 'Daily record not found'}), 404

        data = request.get_json()

        # Access control and field filtering for encoders
        if user.roleId == 4:
            if daily_record.branchId != user.branchId:
                return jsonify({'message': 'You can only edit from your assigned branch'}), 403

            status_obj = Status.query.get(daily_record.status)
            if not status_obj or status_obj.statusName not in ["Rejected", "Pending"]:
                return jsonify({'message': 'You can only edit rejected and pending forms'}), 403

            required_fields = RequiredFields.query.filter_by(
                branchId=daily_record.branchId,
                formType='daily'
            ).all()
            required_fields_key = [rf.fieldKey for rf in required_fields]

            allowed_fields = {
                'productionVolume', 'operationHours', 'serviceInterruption',
                'totalHoursServiceInterruption', 'electricityConsumption',
                'VFDFrequency', 'spotFlow', 'spotPressure', 'timeSpotMeasurements',
                'lineVoltage1', 'lineVoltage2', 'lineVoltage3',
                'lineCurrent1', 'lineCurrent2', 'lineCurrent3'
            }

            filtered_data = {}
            for field in data:
                if field in required_fields_key and field in allowed_fields:
                    filtered_data[field] = data[field]

            # Set status to Pending and comment to None
            pending_status = Status.query.filter_by(statusName="Pending").first()
            filtered_data['status'] = pending_status.id if pending_status else None
            filtered_data['comment'] = None
        else:
            # Admins can update any field except id
            filtered_data = {k: v for k, v in data.items() if k != 'id'}

        # Prepare parameters for the stored procedure
        params = {
            'id': id,
            'productionVolume': filtered_data.get('productionVolume'),
            'operationHours': filtered_data.get('operationHours'),
            'serviceInterruption': filtered_data.get('serviceInterruption'),
            'totalHoursServiceInterruption': filtered_data.get('totalHoursServiceInterruption'),
            'electricityConsumption': filtered_data.get('electricityConsumption'),
            'VFDFrequency': filtered_data.get('VFDFrequency'),
            'spotFlow': filtered_data.get('spotFlow'),
            'spotPressure': filtered_data.get('spotPressure'),
            'timeSpotMeasurements': filtered_data.get('timeSpotMeasurements'),
            'lineVoltage1': filtered_data.get('lineVoltage1'),
            'lineVoltage2': filtered_data.get('lineVoltage2'),
            'lineVoltage3': filtered_data.get('lineVoltage3'),
            'lineCurrent1': filtered_data.get('lineCurrent1'),
            'lineCurrent2': filtered_data.get('lineCurrent2'),
            'lineCurrent3': filtered_data.get('lineCurrent3'),
            'comment': filtered_data.get('comment'),
            'status': filtered_data.get('status'),
            'isActive': filtered_data.get('isActive')
        }

        db.session.execute(
            text(
                'EXEC spUpdateDaily :id, :productionVolume, :operationHours, :serviceInterruption, :totalHoursServiceInterruption, :electricityConsumption, :VFDFrequency, :spotFlow, :spotPressure, :timeSpotMeasurements, :lineVoltage1, :lineVoltage2, :lineVoltage3, :lineCurrent1, :lineCurrent2, :lineCurrent3, :comment, :status, :isActive'),
            params
        )
        db.session.commit()
        invalidate_daily_cache(current_user.id, current_user.roleId, current_user.branchId)
        return jsonify({'message': 'Daily record updated successfully'})



    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update daily records: {str(e)}'}), 500

