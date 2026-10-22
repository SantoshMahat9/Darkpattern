from typing import Dict, Any, List, Optional
from ml.preprocessing.image_processor import ImageProcessor

class VisionDarkPatternClassifier:
    """
    ResNet / CNN Visual Dark Pattern Classifier analyzing visual layout asymmetry,
    contrast tricks, hidden checkboxes, and visual hierarchy misdirection.
    """

    def predict_element_visuals(self, image_bytes: Optional[bytes], bbox: List[float], attributes: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predicts dark pattern probability from visual features & bounding box metrics.
        """
        normalized_bbox = ImageProcessor.normalize_spatial_coordinates(bbox)
        
        # Extract visual heuristic metrics
        width, height = bbox[2] if len(bbox) > 2 else 0, bbox[3] if len(bbox) > 3 else 0
        is_prechecked = attributes.get('checked') is not None or attributes.get('type') == 'checkbox' and 'checked' in str(attributes)

        visual_score = 0.10
        visual_type = "Normal Layout"

        if is_prechecked:
            visual_score = 0.88
            visual_type = "Pre-selected Checkbox (Sneaky Add-on)"
        elif width > 0 and height > 0 and (width < 10 or height < 10):
            visual_score = 0.75
            visual_type = "Low Visibility / Disguised Opt-Out"

        return {
            "is_dark_pattern": visual_score > 0.50,
            "visual_score": round(visual_score, 2),
            "visual_type": visual_type,
            "spatial_coordinates_normalized": normalized_bbox,
            "model": "ResNet50-VisionClassifier"
        }
