from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Dataset, DatasetSample, TaxonomyCategory, Annotation, User
from flask_jwt_extended import jwt_required, get_jwt_identity

dataset_bp = Blueprint('dataset', __name__, url_prefix='/api')

@dataset_bp.route('/datasets', methods=['GET'])
def list_datasets():
    datasets = Dataset.query.all()
    return jsonify({
        "success": True,
        "data": [
            {
                "id": d.id,
                "name": d.name,
                "source_url": d.source_url,
                "license": d.license,
                "version": d.version,
                "created_at": d.created_at.isoformat()
            } for d in datasets
        ]
    }), 200

@dataset_bp.route('/datasets', methods=['POST'])
@jwt_required()
def create_dataset():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({"success": False, "error": {"message": "Dataset name is required"}}), 400

    dataset = Dataset(
        name=name,
        source_url=data.get('source_url'),
        citation=data.get('citation'),
        license=data.get('license', 'CC-BY-4.0'),
        version=data.get('version', '1.0.0')
    )
    db.session.add(dataset)
    db.session.commit()

    return jsonify({"success": True, "data": {"id": dataset.id, "name": dataset.name}}), 201

@dataset_bp.route('/taxonomy', methods=['GET'])
def get_taxonomy():
    default_categories = [
        {"name": "Sneaky Subscription", "tier": 1, "description": "Pre-selected auto-renewals"},
        {"name": "Urgency & Scarcity", "tier": 1, "description": "Artificial countdowns and low stock warnings"},
        {"name": "Misdirection", "tier": 1, "description": "Visual weight and button asymmetry tricks"},
        {"name": "Hidden Costs", "tier": 1, "description": "Mandatory fees revealed at final checkout step"},
        {"name": "Confirmshaming", "tier": 2, "description": "Emotional pressure opt-out phrasing"},
        {"name": "Forced Action", "tier": 2, "description": "Requiring registration for simple viewing"}
    ]
    try:
        categories = TaxonomyCategory.query.all()
        if not categories:
            return jsonify({"success": True, "data": default_categories}), 200
        return jsonify({
            "success": True,
            "data": [
                {
                    "id": c.id,
                    "name": c.name,
                    "tier": c.tier,
                    "description": c.description
                } for c in categories
            ]
        }), 200
    except Exception:
        return jsonify({"success": True, "data": default_categories}), 200
