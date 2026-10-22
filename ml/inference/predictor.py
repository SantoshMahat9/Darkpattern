from typing import Dict, Any, List, Optional
from ml.models.tfidf_model import TFIDFBaselineClassifier
from ml.models.multimodal_model import MultimodalDarkPatternClassifier

class DarkPatternPredictor:
    """
    Unified Inference Engine for Dark Pattern Detection.
    Orchestrates rule heuristic matching, TF-IDF baseline, and Multimodal deep learning models.
    """

    SEVERITY_MAP = {
        "Sneaky Subscription": "CRITICAL",
        "Hidden Costs": "HIGH",
        "Misdirection": "HIGH",
        "Urgency & Scarcity": "MEDIUM",
        "Confirmshaming": "MEDIUM",
        "Forced Action": "LOW",
        "Clean": "NONE"
    }

    def __init__(self):
        self.baseline_model = TFIDFBaselineClassifier()
        self.multimodal_model = MultimodalDarkPatternClassifier()

    def predict_text(self, text: str) -> Dict[str, Any]:
        """
        Runs text classification pipeline on a string snippet.
        """
        result = self.baseline_model.predict(text)
        category = result["top_category"]
        severity = self.SEVERITY_MAP.get(category, "MEDIUM") if result["is_dark_pattern"] else "NONE"
        result["severity"] = severity
        return result

    def predict_dom_nodes(self, interactive_nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Runs batch prediction over extracted webpage interactive DOM nodes.
        """
        detections = []
        for node in interactive_nodes:
            text = node.get("text", "")
            bbox = node.get("bbox", [0, 0, 0, 0])
            attributes = node.get("attributes", {})
            selector = node.get("selector", "")

            multimodal_res = self.multimodal_model.predict_multimodal(
                text=text,
                image_bytes=None,
                bbox=bbox,
                attributes=attributes
            )

            if multimodal_res["is_dark_pattern"]:
                category = multimodal_res["category"]
                detections.append({
                    "category": category,
                    "severity": self.SEVERITY_MAP.get(category, "MEDIUM"),
                    "confidence": multimodal_res["confidence"],
                    "element": selector or node.get("tag_name", "element"),
                    "text": text,
                    "bbox": bbox,
                    "description": f"Detected {category} pattern via multimodal visual & text model.",
                    "matched_terms": [text] if text else ["visual_heuristic"]
                })

        return detections
