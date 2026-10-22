import io
from typing import Tuple, List, Optional

class ImageProcessor:
    """
    Preprocessing utility for webpage visual cropped elements & bounding boxes.
    """

    @staticmethod
    def crop_bounding_box(image_bytes: bytes, bbox: List[float]) -> Optional[bytes]:
        """
        Crops bbox [x, y, width, height] from screenshot image bytes.
        """
        if not image_bytes or not bbox or len(bbox) < 4:
            return None

        try:
            from PIL import Image
            img = Image.open(io.BytesIO(image_bytes))
            x, y, w, h = bbox
            crop_box = (int(x), int(y), int(x + w), int(y + h))
            cropped = img.crop(crop_box)
            
            output = io.BytesIO()
            cropped.save(output, format="PNG")
            return output.getvalue()
        except Exception:
            return None

    @staticmethod
    def normalize_spatial_coordinates(bbox: List[float], viewport: Tuple[int, int] = (1280, 800)) -> List[float]:
        """
        Normalizes [x, y, w, h] relative to standard viewport width & height (0.0 to 1.0).
        """
        if not bbox or len(bbox) < 4:
            return [0.0, 0.0, 0.0, 0.0]

        vp_w, vp_h = viewport
        return [
            round(bbox[0] / vp_w, 4),
            round(bbox[1] / vp_h, 4),
            round(bbox[2] / vp_w, 4),
            round(bbox[3] / vp_h, 4)
        ]
