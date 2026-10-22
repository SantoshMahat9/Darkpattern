from flask import Blueprint, request, jsonify
from app.extensions import db, jwt
from app.models import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"success": False, "error": {"message": "Email and password required"}}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "error": {"message": "User already exists"}}), 400

    new_user = User(
        email=email,
        password_hash=generate_password_hash(password),
        role='annotator'
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"success": True, "data": {"message": "User created"}}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"success": False, "error": {"message": "Invalid credentials"}}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({"success": True, "data": {"access_token": access_token}}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify({
        "success": True,
        "data": {
            "id": user.id,
            "email": user.email,
            "role": user.role
        }
    }), 200
