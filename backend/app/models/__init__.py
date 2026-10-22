import uuid
from datetime import datetime
from app.extensions import db

def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='annotator') # researcher, annotator, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    annotations = db.relationship('Annotation', back_populates='user', lazy='dynamic')

class Dataset(db.Model):
    __tablename__ = 'datasets'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(255), nullable=False)
    source_url = db.Column(db.String(1024))
    citation = db.Column(db.Text)
    license = db.Column(db.String(100))
    version = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    samples = db.relationship('DatasetSample', back_populates='dataset', lazy='dynamic')

class DatasetSample(db.Model):
    __tablename__ = 'dataset_samples'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    dataset_id = db.Column(db.String(36), db.ForeignKey('datasets.id'), nullable=False)
    sample_id = db.Column(db.String(255))
    modality = db.Column(db.String(50))
    original_label = db.Column(db.String(255))
    normalized_label = db.Column(db.String(255))
    source_site = db.Column(db.String(255))
    image_path = db.Column(db.String(1024))
    text_path = db.Column(db.String(1024))
    dom_path = db.Column(db.String(1024))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    dataset = db.relationship('Dataset', back_populates='samples')

class Site(db.Model):
    __tablename__ = 'sites'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    url = db.Column(db.String(2048), nullable=False)
    domain = db.Column(db.String(255))
    country = db.Column(db.String(10))
    category = db.Column(db.String(100))
    split = db.Column(db.String(20)) # train, val, test
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    captures = db.relationship('Capture', back_populates='site', lazy='dynamic')

class Capture(db.Model):
    __tablename__ = 'captures'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    site_id = db.Column(db.String(36), db.ForeignKey('sites.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    site = db.relationship('Site', back_populates='captures')
    screens = db.relationship('Screen', back_populates='capture', lazy='dynamic')

class Screen(db.Model):
    __tablename__ = 'screens'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    capture_id = db.Column(db.String(36), db.ForeignKey('captures.id'), nullable=False)
    url = db.Column(db.String(2048))
    viewport_width = db.Column(db.Integer)
    viewport_height = db.Column(db.Integer)
    screenshot_path = db.Column(db.String(1024))
    dom_path = db.Column(db.String(1024))
    text_path = db.Column(db.String(1024))
    styles_path = db.Column(db.String(1024))
    sha256 = db.Column(db.String(64))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    capture = db.relationship('Capture', back_populates='screens')
    annotations = db.relationship('Annotation', back_populates='screen', lazy='dynamic')

class TaxonomyCategory(db.Model):
    __tablename__ = 'taxonomy_categories'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    tier = db.Column(db.Integer)
    version = db.Column(db.String(50))

class Annotation(db.Model):
    __tablename__ = 'annotations'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    screen_id = db.Column(db.String(36), db.ForeignKey('screens.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    is_dark_pattern = db.Column(db.Boolean, nullable=False)
    category_id = db.Column(db.String(36), db.ForeignKey('taxonomy_categories.id'))
    confidence = db.Column(db.Float)
    notes = db.Column(db.Text)
    version = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    screen = db.relationship('Screen', back_populates='annotations')
    user = db.relationship('User', back_populates='annotations')
    boxes = db.relationship('AnnotationBox', back_populates='annotation', lazy='dynamic')

class AnnotationBox(db.Model):
    __tablename__ = 'annotation_boxes'
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    annotation_id = db.Column(db.String(36), db.ForeignKey('annotations.id'), nullable=False)
    x = db.Column(db.Float)
    y = db.Column(db.Float)
    width = db.Column(db.Float)
    height = db.Column(db.Float)
    dom_selector = db.Column(db.Text)
    text_span = db.Column(db.Text)

    annotation = db.relationship('Annotation', back_populates='boxes')

# Need to ensure all imports are available in models module
