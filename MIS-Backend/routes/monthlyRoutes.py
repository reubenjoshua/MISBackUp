from flask import Blueprint, request, jsonify
from sqlalchemy.util.typing import resolve_name_to_real_class_name

import calendar

from models.Monthly import Monthly
from models.db import db
from models.User import User
from models.Daily import Daily
from models.sourceType import SourceType
from models.sourceName import SourceName
from datetime import datetime, date
from utils.auth import token_required
from flask_cors import cross_origin
from models.Area import Area
from models.Branch import Branch
from models.Status import Status
from sqlalchemy import text
from config import cache

monthly_bp = Blueprint('monthly', __name__)

def invalidate_monthly_cache(user_id, role_id, branch_id):
    """Clear cache when monthly data changes"""
    # Clear cache for simple cache (doesn't support delete_memoized with strings)
    try:
        # Invalidate daily sums cache
        cache.delete_memoized('get_daily_sums')
        cache.delete_memoized('get_daily_sums_batch')
        # Invalidate dashboard cache since monthly data affects approval counts
        cache.delete_memoized('dashboard_stats', user_id, role_id, branch_id)
        cache.delete_memoized('approval_counts', user_id, role_id, branch_id)
    except (TypeError, AttributeError):
        # For simple cache, clear all cache
        cache.clear()

def sum_daily_fields(branch_id, source_type_id, year, month):
    try:
        if not year or not month:
            print("Error in sum_daily_fields: year or month is empty")
            return None

        try:
            month = int(month)
            year = int(year)
        except (ValueError, TypeError) as e:
            print(f"Error in sum_daily_fields: Invalid month/year values = {str(e)}")
            return None

        if not (1 <= month <= 12):
            print(f"Error in sum_daily_fields: Invalid month value - {month}")
            return None

        result = db.session.execute(
            text('EXEC spSumDailyFields :branchId, :sourceTypeId, :year, :month'),
            {
                'branchId': branch_id,
                'sourceTypeId': source_type_id,
                'year': year,
                'month': month
            }
        )
        row = result.fetchone()
        if not row or all(v is None for v in row):
            return None

        sums = {
            'productionVolume': row.productionVolume,
            'operationHours': row.operationHours,
            'serviceInterruption': row.serviceInterruption,
            'totalHoursServiceInterruption': row.totalHoursServiceInterruption,
            'electricityConsumption': row.electricityConsumption
        }
        return sums
    except Exception as e:
        print(f"Error in sum_daily_fields: {str(e)}")
        return None

def validate_daily_completion(branch_id, source_name_id, year, month):
    try:
        year = int(year)
        month = int(month)
        days_in_month = calendar.monthrange(year, month)[1]

        # Use raw DB-API connection for multiple result sets
        conn = db.engine.raw_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(
                "EXEC spValidateDailyCompletion ?, ?, ?, ?",
                (branch_id, source_name_id, year, month)
            )

            # First result set: missing days
            missing_days = [row[0] for row in cursor.fetchall()]

            # Move to next result set: completed days
            cursor.nextset()
            completed_days_row = cursor.fetchone()
            completed_days = completed_days_row[0] if completed_days_row else 0

        finally:
            cursor.close()
            conn.close()

        is_valid = len(missing_days) == 0
        total_days = days_in_month

        error_message = None
        if not is_valid:
            month_names = [
                "January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
                "November", "December"
            ]
            month_name = month_names[month - 1]

            missing_display = missing_days[:5]
            missing_text = ", ".join(str(d) for d in missing_display)
            if len(missing_days) > 5:
                missing_text += f"... and {len(missing_days) - 5} more days"
            error_message = (
                f"cannot submit Monthly for {month_name} {year}. "
                f"Missing daily forms for {len(missing_days)} days. "
                f"Only accepted forms count toward completion. "
                f"Complete daily forms for: {missing_text}"
            )

        return is_valid, missing_days, total_days, completed_days, error_message
    except Exception as e:
        print(f"Error in validate_daily_completion: {str(e)}")
        return False, [], 0, 0, f"Error checking daily completion: {str(e)}"

@monthly_bp.route('/api/monthly', methods=['GET', 'OPTIONS'])
@cross_origin("http://localhost:5173", "http://localhost;5174")
@token_required
def get_all_monthly(current_user):
    user = User.query.get(current_user.id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    result = db.session.execute(
        text('EXEC spGetAllMonthly :userId, :roleId'),
        {'userId': current_user.id, 'roleId': user.roleId}
    )
    rows = result.fetchall()

    def convert_to_float(value):
        try:
            if isinstance(value, (int, float)):
                return float(value)
            if value is None or value == '':
                return 0
            return float(value)
        except (ValueError, TypeError):
            return 0

    output = []
    for row in rows:
        row_dict = dict(row._mapping) if hasattr(row, '_mapping') else dict(row)
        # Convert numeric fields to float if needed
        for key in [
            'productionVolumeAutoSum', 'operationHoursAutoSum',
            'serviceInterruptionAutoSum', 'totalHoursServiceInterruptionAutoSum',
            'electricityConsumption', 'electricityCost', 'bulkCost', 'bulkOuttake',
            'WTPCost', 'WTPVolume', 'disinfectionCost', 'disinfectionAmount',
            'otherTreatmentCost', 'emergencyLitersConsumed', 'emergencyFuelCost',
            'emergencyTotalHoursUsed', 'gensetLitersConsumed', 'gensetFuelCost'
        ]:
            if key in row_dict:
                row_dict[key] = convert_to_float(row_dict[key])
        output.append(row_dict)
    return jsonify(output)

def convert_to_float(value):
    try:
        if isinstance(value, (int, float)):
            return float(value)
        if value is None or value == '':
            return 0.0
        return float(value)
    except (ValueError, TypeError):
        return 0.0

@monthly_bp.route('/api/monthly', methods=['POST'])
@token_required
def create_monthly(current_user):
    try:
        user = User.query.get(current_user.id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        data = request.get_json()
        if data is None:
            return jsonify({'message': 'No data received'}), 400

        if user.roleId in [3, 4]:
            if str(data.get('branchId')) != str(user.branchId):
                return jsonify({'message': 'You can only submit data for your assigned branch'}), 403

        branch_id = data.get('branchId')
        source_name_id = data.get('sourceName')
        year = data.get('year')
        month = data.get('month')

        if not all([branch_id, source_name_id, year, month]):
            return jsonify({'message': 'Missing required fields for validation'}), 400

        is_valid, missing_days, total_days, completed_days, error_message = validate_daily_completion(
            branch_id, source_name_id, year, month
        )

        if not is_valid:
            return jsonify({
                'message': error_message,
                'validation': {
                    'isValid': False,
                    'missingDays': missing_days,
                    'totalDays': total_days,
                    'completedDays': completed_days,
                    'errorMessage': error_message
                }
            }), 400

        numeric_fields = {
            'electricityConsumption': convert_to_float,
            'electricityCost': convert_to_float,
            'bulkCost': convert_to_float,
            'WTPCost': convert_to_float,
            'WTPVolume': convert_to_float,
            'disinfectantCost': convert_to_float,
            'disinfectionAmount': convert_to_float,
            'otherTreatmentCost': convert_to_float,
            'emergencyLitersConsumed': convert_to_float,
            'emergencyFuelCost': convert_to_float,
            'emergencyTotalHoursUsed': convert_to_float,
            'gensetLitersConsumed': convert_to_float,
            'gensetFuelCost': convert_to_float,
            'productionVolume': convert_to_float,
            'operationHours': convert_to_float,
            'serviceInterruption': convert_to_float,
            'totalHoursServiceInterruption': convert_to_float
        }

        for field, converter in numeric_fields.items():
            if field in data:
                data[field] = converter(data[field])
        for field in numeric_fields:
            if field not in data:
                data[field] = 0

        result = db.session.execute(
            text('EXEC spCreateMonthly :branchId, :sourceType, :sourceName, :status, :byUser, :month, :year, '
                 ':productionVolume, :operationHours, :serviceInterruption, :totalHoursServiceInterruption, '
                 ':electricityConsumption, :electricityCost, :bulkCost, :bulkOuttake, :bulkProvider, '
                 ':WTPCost, :WTPSource, :WTPVolume, :disinfectionMode, :disinfectantCost, '
                 ':disinfectionAmount, :disinfectionBrandType, :otherTreatmentCost, '
                 ':emergencyLitersConsumed, :emergencyFuelCost, :emergencyTotalHoursUsed, '
                 ':gensetLitersConsumed, :gensetFuelCost, :isActive, :comment'),
            {
                'branchId': data.get('branchId'),
                'sourceType': data.get('sourceType'),
                'sourceName': data.get('sourceName'),
                'status': data.get('status', 2),
                'byUser': current_user.id,
                'month': data.get('month'),
                'year': data.get('year'),
                'productionVolume': data.get('productionVolume'),
                'operationHours': data.get('operationHours'),
                'serviceInterruption': data.get('serviceInterruption'),
                'totalHoursServiceInterruption': data.get('totalHoursServiceInterruption'),
                'electricityConsumption': data.get('electricityConsumption'),
                'electricityCost': data.get('electricityCost'),
                'bulkCost': data.get('bulkCost'),
                'bulkOuttake': data.get('bulkOuttake'),
                'bulkProvider': data.get('bulkProvider'),
                'WTPCost': data.get('WTPCost'),
                'WTPSource': data.get('WTPSource'),
                'WTPVolume': data.get('WTPVolume'),
                'disinfectionMode': data.get('disinfectionMode'),
                'disinfectantCost': data.get('disinfectantCost'),
                'disinfectionAmount': data.get('disinfectionAmount'),
                'disinfectionBrandType': data.get('disinfectionBrandType'),
                'otherTreatmentCost': data.get('otherTreatmentCost'),
                'emergencyLitersConsumed': data.get('emergencyLitersConsumed'),
                'emergencyFuelCost': data.get('emergencyFuelCost'),
                'emergencyTotalHoursUsed': data.get('emergencyTotalHoursUsed'),
                'gensetLitersConsumed': data.get('gensetLitersConsumed'),
                'gensetFuelCost': data.get('gensetFuelCost'),
                'isActive': data.get('isActive', True),
                'comment': data.get('comment')
            }
        )
        new_id = result.fetchone()[0]
        db.session.commit()

        invalidate_monthly_cache(current_user.id, current_user.roleId, current_user.branchId)

        return jsonify({
            'message': 'Monthly record created successfully',
            'id': new_id
        }), 201
    except Exception as e:
        db.session.rollback()
        print("Error in create_monthly:", str(e))
        return jsonify({'message': f'failed to create monthly record: {str(e)}'}), 500

@monthly_bp.route('/api/monthly-data', methods=['GET', 'OPTIONS'])
@cross_origin("http://localhost:5173", "http://localhost:5174")
@token_required
def get_filtered_monthly(current_user):
    try:
        source_type_id = request.args.get('sourceTypeId', type=int)
        branch_id = request.args.get('branchId', type=int)
        year = request.args.get('year', type=int)

        user = User.query.get(current_user.id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        result = db.session.execute(
            text('EXEC spGetFilteredMonthly :userId, :roleId, :sourceTypeId, :branchId'),
            {
                'userId': current_user.id,
                'roleId': user.roleId,
                'sourceTypeId': source_type_id,
                'branchId': branch_id,
                'year': year
            }
        )
        rows = result.fetchall()

        output = []
        for row in rows:
            row_dict = dict(row._mapping) if hasattr(row, '_mapping') else dict(row)
            output.append(row_dict)
        return jsonify(output)

    except Exception as e:
        print(f"Error in get_filtered_monthly: {str(e)}")
        return jsonify({'message': f'failed to fetch monthly data: {str(e)}'}), 500

@monthly_bp.route('/api/daily-sums', methods=['GET'])
@token_required
@cache.memoize(timeout=300)
def get_daily_sums(current_user):
    try:
        branch_id = request.args.get('branchId', type=int)
        source_type_id = request.args.get('sourceTypeId', type=int)
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)

        if not all([branch_id, source_type_id, month, year]):
            return jsonify({'message': 'Missing required parameters'}), 400

        user = User.query.get(current_user.id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        if user.roleId in [3, 4]:
            if str(branch_id) != str(user.branchId):
                return jsonify({'message': 'You can only view data for your assigned branch'}), 403

        result = db.session.execute(
            text('EXEC spSumDailyFields :branchId, :sourceTypeId, :year, :month'),
            {
                'branchId': branch_id,
                'sourceTypeId': source_type_id,
                'year': year,
                'month': month
            }
        )
        row = result.fetchone()
        if not row or all(v is None for v in row):
            return jsonify({
                'productionVolume': 0,
                'operationHours': 0,
                'serviceInterruption': 0,
                'totalHoursServiceInterruption': 0,
                'electricityConsumption': 0
            })
        sums = {
            'productionVolume': row.productionVolume,
            'operationHours': row.operationHours,
            'serviceInterruption': row.serviceInterruption,
            'totalHoursServiceInterruption': row.totalHoursServiceInterruption,
            'electricityConsumption': row.electricityConsumption
        }
        return jsonify(sums)
    except Exception as e:
        print(f"Error in get_daily_sums: {str(e)}")
        return jsonify({'message': f'failed to fetch daily sums'}), 500


@monthly_bp.route('/api/daily-sums/batch', methods=['POST'])
@token_required
@cache.memoize(timeout=300)
def get_daily_sums_batch(current_user):
    try:
        data = request.get_json()
        requests = data.get('requests', [])
        if not isinstance(requests, list):
            return jsonify({'message': 'Invalid request format'}), 400

        user = User.query.get(current_user.id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

        results = []
        for req in requests:
            branch_id = req.get('branchId')
            source_type_id = req.get('sourceTypeId')
            month = req.get('month')
            year = req.get('year')

            if not all([branch_id, source_type_id, month, year]):
                results.append({
                    'branchId': branch_id,
                    'sourceTypeId': source_type_id,
                    'month': month,
                    'year': year,
                    'error': 'Missing required parameters',
                    'productionVolume': 0,
                    'operationHours': 0,
                    'serviceInterruption': 0,
                    'totalHoursServiceInterruption': 0,
                    'electricityConsumption': 0
                })
                continue

            if user.roleId in [3, 4]:
                if str(branch_id) != str(user.branchId):
                    results.append({
                        'branchId': branch_id,
                        'sourceTypeId': source_type_id,
                        'month': month,
                        'year': year,
                        'error': 'You can only view data for your assigned branch',
                        'productionVolume': 0,
                        'operationHours': 0,
                        'serviceInterruption': 0,
                        'totalHoursServiceInterruption': 0,
                        'electricityConsumption': 0
                    })
                    continue

            # Call the stored procedure for each batch item
            result = db.session.execute(
                text('EXEC spSumDailyFields :branchId, :sourceTypeId, :year, :month'),
                {
                    'branchId': branch_id,
                    'sourceTypeId': source_type_id,
                    'year': year,
                    'month': month
                }
            )
            row = result.fetchone()
            if not row or all(v is None for v in row):
                sums = {
                    'productionVolume': 0,
                    'operationHours': 0,
                    'serviceInterruption': 0,
                    'totalHoursServiceInterruption': 0,
                    'electricityConsumption': 0
                }
            else:
                sums = {
                    'productionVolume': row.productionVolume,
                    'operationHours': row.operationHours,
                    'serviceInterruption': row.serviceInterruption,
                    'totalHoursServiceInterruption': row.totalHoursServiceInterruption,
                    'electricityConsumption': row.electricityConsumption
                }
            results.append({
                'branchId': branch_id,
                'sourceTypeId': source_type_id,
                'month': month,
                'year': year,
                **sums
            })
        return jsonify({'results': results})
    except Exception as e:
        print(f"Error in get_daily_sums_batch: {str(e)}")
        return jsonify({'message': f'failed to fetch daily sums batch: {str(e)}'}), 500

@monthly_bp.route('/api/validate-daily-completion', methods=['POST'])
@token_required
def validate_daily_completion_endpoint(current_user):
    try:
        data = request.get_json()

        if not data:
            return jsonify({'message': 'No data received'}), 400

        branch_id = data.get('branchId')
        source_name_id = data.get('sourceName')
        year = data.get('year')
        month = data.get('month')

        if not all([branch_id, source_name_id, year, month]):
            return jsonify({'message': 'Missing required fields'}), 400

        # Use the correct function!
        is_valid, missing_days, total_days, completed_days, error_message = validate_daily_completion(
            branch_id, source_name_id, year, month
        )

        return jsonify({
            'isValid': is_valid,
            'missingDays': missing_days,
            'totalDays': total_days,
            'completedDays': completed_days,
            'errorMessage': error_message
        }), 200

    except Exception as e:
        print(f"Error in validate_daily_completion_endpoint: {str(e)}")
        return jsonify({'message': f'Error validating daily completion: {str(e)}'}), 500