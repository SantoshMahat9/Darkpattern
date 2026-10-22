import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ml.preprocessing.text_cleaner import TextCleaner
from ml.data.dataset_loader import SiteSplitDatasetLoader
from ml.models.tfidf_model import TFIDFBaselineClassifier
from ml.inference.predictor import DarkPatternPredictor
from ml.evaluation.metrics import ModelEvaluator

def test_text_cleaner():
    raw_html = "<p>Auto-renew &amp; save 10%!</p>"
    cleaned = TextCleaner.clean_text(raw_html)
    assert cleaned == "Auto-renew & save 10%!"

def test_site_split_dataset_loader():
    loader = SiteSplitDatasetLoader(seed=42)
    samples = loader.load_sample_dataset()
    train, val, test = loader.split_by_site(samples, train_ratio=0.5, val_ratio=0.25)
    
    # Ensure total samples preserved
    assert len(train) + len(val) + len(test) == len(samples)
    
    # Ensure no domain overlap between train and test
    train_sites = {s["source_site"] for s in train}
    test_sites = {s["source_site"] for s in test}
    assert train_sites.isdisjoint(test_sites)

def test_tfidf_baseline_model():
    classifier = TFIDFBaselineClassifier()
    result = classifier.predict("Special protection auto-renew subscription annually")
    assert result["is_dark_pattern"] is True
    assert result["top_category"] == "Sneaky Subscription"
    assert result["confidence"] >= 0.60

def test_dark_pattern_predictor():
    predictor = DarkPatternPredictor()
    result = predictor.predict_text("Hurry! Only 1 left in stock!")
    assert result["is_dark_pattern"] is True
    assert result["top_category"] == "Urgency & Scarcity"
    assert result["severity"] == "MEDIUM"

def test_model_evaluator():
    y_true = [1, 1, 0, 0, 1]
    y_pred = [1, 1, 0, 1, 1]
    metrics = ModelEvaluator.evaluate_predictions(y_true, y_pred)
    assert metrics["accuracy"] == 0.8
    assert metrics["precision"] == 0.75
    assert metrics["recall"] == 1.0
