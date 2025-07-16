from flask import Blueprint, jsonify
from models.User import User
from models.Area import Area
from models.Branch import Branch
from models.Status import Status
from models.Daily import Daily
from models.Monthly import Monthly
from models.db import db
from sqlalchemy import text
from config import cache
from utils.auth import token_required

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/api/dashboard-stats', methods=['GET'])
@token_required
@cache.memoize(timeout=120)
def dashboard_stats(current_user):
    try:
        result = db.session.execute(
            text('EXEC GetDashboardStats @UserRoleId=:role, @UserBranchId=:branch'),
            {'role': current_user.roleId, 'branch': current_user.branchId}
        )
        stats = {}
        for row in result:
            stats[row.MetricName] = row.MetricValue
        return jsonify(stats)
    except Exception as e:
        return jsonify({'message': f'Error fetching dashboard stats: {str(e)}'}), 500

@dashboard_bp.route('/api/branch-dashboard-stats', methods=['GET'])
@token_required
@cache.memoize(timeout=120)
def branch_dashboard_stats(current_user):
    if current_user.roleId != 3:
        return jsonify({'message': 'Unauthorized'}), 403

    try:
        # Call the same stored procedure
        result = db.session.execute(
            text('EXEC GetDashboardStats @UserRoleId=:role, @UserBranchId=:branch'),
            {'role': current_user.roleId, 'branch': current_user.branchId}
        )

        stats = {}
        for row in result:
            stats[row.MetricName] = row.MetricValue

        return jsonify(stats)
    except Exception as e:
        return jsonify({'message': f'Error fetching branch dashboard stats: {str(e)}'}), 500

@dashboard_bp.route('/api/encoder-dashboard-stats', methods=['GET'])
@token_required
@cache.memoize(timeout=120)
def encoder_dashboard_stats(current_user):
    if current_user.roleId != 4:
        return jsonify({'message': 'Unauthorized'}), 403

    try:
        # Call the same stored procedure
        result = db.session.execute(
            text('EXEC GetDashboardStats @UserRoleId=:role, @UserBranchId=:branch'),
            {'role': current_user.roleId, 'branch': current_user.branchId}
        )

        stats = {}
        for row in result:
            stats[row.MetricName] = row.MetricValue

        return jsonify(stats)
    except Exception as e:
        return jsonify({'message': f'Error fetching encoder dashboard stats: {str(e)}'}), 500
@dashboard_bp.route('/api/approval-counts', methods=['GET'])
@token_required
@cache.memoize(timeout=60)
def approval_counts(current_user):
    try:
        # Call the new stored procedure to get both daily and monthly approval counts
        result = db.session.execute(
            text('EXEC GetApprovalCounts @UserRoleId=:role, @UserBranchId=:branch'),
            {'role': current_user.roleId, 'branch': current_user.branchId}
        )

        counts = {}
        for row in result:
            counts[row.ApprovalType] = row.Count  # e.g., {'Daily': 96, 'Monthly': 24}

        return jsonify(counts)
    except Exception as e:
        return jsonify({'message': f'Error fetching approval counts: {str(e)}'}), 500