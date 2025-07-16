from flask import Flask
from flask_socketio import SocketIO
from config import cache, CACHE_CONFIG
from flask_cors import CORS
from config import Config
from models.db import db
from routes.areaRoutes import area_bp
from routes.authRoutes import auth_bp
from routes.dashboardRoutes import dashboard_bp
from routes.userRoutes import user_bp
from routes.branchRoutes import branch_bp
from routes.sourceName import source_name_bp
from routes.branchSourceName import branch_source_name_bp
from routes.branchSource import branch_source_bp
from routes.sourceRoutes import source_bp
from routes.dailyRoutes import daily_bp
from routes.roleRoutes import role_bp
from routes.statusRoutes import status_bp
from routes.requiredFields import required_fields_bp
from routes.approvalRoute import approval_bp
from routes.monthlyRoutes import monthly_bp
from routes.sourceForBranch import source_for_branch_bp




def create_app():
    app = Flask(__name__)
    app.config.from_mapping(CACHE_CONFIG)
    app.config.from_object(Config)

    db.init_app(app)
    cache.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}})



    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(area_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(branch_bp)
    app.register_blueprint(source_name_bp)
    app.register_blueprint(branch_source_bp)
    app.register_blueprint(branch_source_name_bp)
    app.register_blueprint(source_bp)
    app.register_blueprint(daily_bp)
    app.register_blueprint(role_bp)
    app.register_blueprint(status_bp)
    app.register_blueprint(required_fields_bp)
    app.register_blueprint(approval_bp)
    app.register_blueprint(monthly_bp)
    app.register_blueprint(source_for_branch_bp)
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
