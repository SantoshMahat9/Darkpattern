import re
from typing import Dict, List, Any
from ml.preprocessing.text_cleaner import TextCleaner

class TFIDFBaselineClassifier:
    """
    TF-IDF + Heuristic Rule Baseline Classifier for rapid dark pattern detection.
    """

    CATEGORIES = [
        "Sneaky Subscription",
        "Urgency & Scarcity",
        "Misdirection",
        "Hidden Costs",
        "Confirmshaming",
        "Forced Action"
    ]

    PATTERN_KEYWORDS = {
        "Sneaky Subscription": ["auto-renew", "recurring", "cancel anytime", "billed annually", "free trial", "subscribe"],
        "Urgency & Scarcity": ["only 1 left", "only 2 left", "hurry", "limited time", "offer expires", "high demand"],
        "Misdirection": ["no thanks, i hate savings", "recommended", "pre-checked", "opt-out", "don't miss"],
        "Hidden Costs": ["processing fee", "handling charge", "service fee", "added at checkout", "taxes extra"],
        "Confirmshaming": ["no thanks, i prefer paying full price", "no i don't want to save money"],
        "Forced Action": ["accept cookies", "sign in to continue", "create account to view"]
    }

    def predict(self, text: str) -> Dict[str, Any]:
        """
        Calculates category probability scores using token n-grams & keyword similarity heuristics.
        """
        cleaned_text = TextCleaner.clean_text(text).lower()

        scores = {}
        matched_terms = []

        for category, keywords in self.PATTERN_KEYWORDS.items():
            matches = [kw for kw in keywords if kw in cleaned_text]
            if matches:
                scores[category] = min(0.95, 0.60 + len(matches) * 0.15)
                matched_terms.extend(matches)
            else:
                scores[category] = 0.05

        best_category = max(scores, key=scores.get)
        max_score = scores[best_category]

        is_dark_pattern = max_score >= 0.60

        return {
            "is_dark_pattern": is_dark_pattern,
            "top_category": best_category if is_dark_pattern else "Clean",
            "confidence": round(max_score, 2) if is_dark_pattern else round(1.0 - max_score, 2),
            "category_probabilities": scores,
            "matched_terms": matched_terms,
            "model": "TFIDF-Heuristic-Baseline"
        }
