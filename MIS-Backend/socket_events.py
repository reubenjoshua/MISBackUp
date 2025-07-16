# MIS-Backend/socket_events.py
from flask_socketio import emit, join_room, leave_room
from main import socketio
from flask import request
import json
from datetime import datetime


@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')


@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')


@socketio.on('joinRoom')
def handle_join_room(data):
    """Join a room based on user role and branch"""
    try:
        role = data.get('role')
        branch_id = data.get('branchId')

        if role and branch_id:
            room = f"role_{role}_branch_{branch_id}"
            join_room(room)
            print(f'Client {request.sid} joined room: {room}')

            # Also join a general branch room for all users in that branch
            branch_room = f"branch_{branch_id}"
            join_room(branch_room)
            print(f'Client {request.sid} joined branch room: {branch_room}')

            emit('roomJoined', {'room': room, 'branchRoom': branch_room})
    except Exception as e:
        print(f'Error joining room: {e}')


@socketio.on('leaveRoom')
def handle_leave_room(data):
    """Leave a room"""
    try:
        role = data.get('role')
        branch_id = data.get('branchId')

        if role and branch_id:
            room = f"role_{role}_branch_{branch_id}"
            leave_room(room)
            print(f'Client {request.sid} left room: {room}')
    except Exception as e:
        print(f'Error leaving room: {e}')


def notify_approval_status_change(record_id, new_status, branch_id, record_type='daily'):
    """Notify all users in a branch about approval status change"""
    try:
        data = {
            'recordId': record_id,
            'status': new_status,
            'branchId': branch_id,
            'recordType': record_type,
            'timestamp': str(datetime.now())
        }

        # Emit to all users in the branch
        room = f"branch_{branch_id}"
        socketio.emit('approvalStatusChanged', data, room=room)
        print(f'Approval status change notified to room {room}: {data}')

    except Exception as e:
        print(f'Error notifying approval status change: {e}')


def notify_daily_data_change(branch_id, action='update'):
    """Notify about daily data changes"""
    try:
        data = {
            'branchId': branch_id,
            'action': action,
            'timestamp': str(datetime.now())
        }

        room = f"branch_{branch_id}"
        socketio.emit('dailyDataChanged', data, room=room)
        print(f'Daily data change notified to room {room}: {data}')

    except Exception as e:
        print(f'Error notifying daily data change: {e}')


def notify_monthly_data_change(branch_id, action='update'):
    """Notify about monthly data changes"""
    try:
        data = {
            'branchId': branch_id,
            'action': action,
            'timestamp': str(datetime.now())
        }

        room = f"branch_{branch_id}"
        socketio.emit('monthlyDataChanged', data, room=room)
        print(f'Monthly data change notified to room {room}: {data}')

    except Exception as e:
        print(f'Error notifying monthly data change: {e}')