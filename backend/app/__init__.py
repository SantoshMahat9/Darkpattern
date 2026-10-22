from flask import Flask, jsonify
from app.config import Config
from app.extensions import db, migrate, jwt, cors, celery

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)

    with app.app_context():
        try:
            db.create_all()
        except Exception:
            pass

    # Configure Celery
    celery.conf.update(app.config)

    # Register blueprints/routes
    from app.routes.auth import auth_bp
    from app.routes.scan import scan_bp
    from app.routes.dataset import dataset_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(scan_bp)
    app.register_blueprint(dataset_bp)
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "success": True,
            "data": {"status": "healthy"},
            "error": None,
            "meta": {}
        })

    return app
