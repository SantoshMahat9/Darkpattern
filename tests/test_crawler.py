import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from crawler.validators.url_validator import is_valid_url, sanitize_url, extract_domain
from crawler.extractors.dom_extractor import DOMExtractor

def test_url_validation():
    assert is_valid_url("https://example.com") is True
    assert is_valid_url("http://localhost:5000") is True
    assert is_valid_url("invalid-url-no-domain") is False

def test_url_sanitizer():
    assert sanitize_url("example.com") == "https://example.com"
    assert sanitize_url("  https://store.shop  ") == "https://store.shop"

def test_domain_extractor():
    assert extract_domain("https://checkout.amazon.com/pay") == "checkout.amazon.com"

def test_dom_extractor_interactive_elements():
    mock_dom = [
        {
            "tag_name": "button",
            "text": "Auto-renew for $99/year",
            "selector": "button.renew",
            "bbox": [10, 10, 100, 30],
            "attributes": {"checked": "checked"}
        }
    ]
    interactive = DOMExtractor.extract_interactive_elements(mock_dom)
    assert len(interactive) == 1
    assert interactive[0]["is_prechecked"] is True

    summary = DOMExtractor.generate_dom_summary(interactive)
    assert summary["prechecked_count"] == 1
