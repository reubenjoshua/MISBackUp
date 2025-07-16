# utils/cache_utils.py
from flask_caching import cache

def invalidate_dashboard_cache(user_id, role_id, branch_id):
    """Clear dashboard cache when data changes"""
    cache.delete_memoized('dashboard_stats', user_id, role_id, branch_id)
    cache.delete_memoized('branch_dashboard_stats', user_id, role_id, branch_id)
    cache.delete_memoized('encoder_dashboard_stats', user_id, role_id, branch_id)
    cache.delete_memoized('approval_counts', user_id, role_id, branch_id)