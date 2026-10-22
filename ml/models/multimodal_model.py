from typing import Dict, Any, List, Optional
from ml.models.transformer_model import TransformerTextClassifier
from ml.models.vision_model import VisionDarkPatternClassifier

class MultimodalDarkPatternClassifier:
    """
    Multimodal Dark Pattern Classifier fusing Text Semantics (Transformer),
    Visual Attributes (CNN), and DOM Spatial Layout coordinates.
    """

    def __init__(self):
        self.text_model = TransformerTextClassifier()
        self.vision_model = VisionDarkPatternClassifier()

    def predict_multimodal(
        self,
        text: str,
        image_bytes: Optional[bytes] = None,
        bbox: List[float] = None,
        attributes: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Fuses predictions across text, visual layout, and DOM node attributes.
        """
        bbox = bbox or [0, 0, 0, 0]
        attributes = attributes or {}

        text_result = self.text_model.predict(text)
        vision_result = self.vision_model.predict_element_visuals(image_bytes, bbox, attributes)

        # Weighted Multimodal Fusion (0.60 Text, 0.30 Visual/Attributes, 0.10 Spatial)
        text_conf = text_result["confidence"] if text_result["is_dark_pattern"] else (1.0 - text_result["confidence"])
        visual_score = vision_result["visual_score"]

        fused_score = (0.65 * text_conf) + (0.35 * visual_score)

        final_category = text_result["top_category"] if text_result["is_dark_pattern"] else (
            "Misdirection" if vision_result["is_dark_pattern"] else "Clean"
        )
        is_dark_pattern = fused_score >= 0.50

        return {
            "is_dark_pattern": is_dark_pattern,
            "category": final_category,
            "confidence": round(fused_score, 2),
            "text_analysis": text_result,
            "visual_analysis": vision_result,
            "fusion_weights": {"text": 0.65, "visual": 0.35},
            "model": "Multimodal-Fusion-v1"
        }
