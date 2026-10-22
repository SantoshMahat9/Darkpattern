import json
from typing import List, Dict, Any, Optional

class DOMExtractor:
    """
    Parses and extracts key DOM elements, bounding boxes, text nodes,
    and interactive components for dark pattern analysis.
    """

    @staticmethod
    def extract_interactive_elements(raw_dom_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Filters raw DOM elements to find high-risk interactive nodes
        (buttons, checkboxes, timers, popups, links, auto-renew inputs).
        """
        interactive_nodes = []
        high_risk_tags = {'button', 'a', 'input', 'select', 'form', 'span', 'div', 'p', 'tr'}
        
        for item in raw_dom_data:
            tag_name = item.get('tag_name', '').lower()
            text = (item.get('text') or '').strip()
            selector = item.get('selector', '')
            bbox = item.get('bbox', [0, 0, 0, 0]) # [x, y, width, height]
            attributes = item.get('attributes', {})

            if not tag_name or tag_name not in high_risk_tags:
                continue

            # Flag potential visual/behavioral dark pattern signals
            is_prechecked = attributes.get('checked') is not None or attributes.get('aria-checked') == 'true'
            is_hidden = item.get('is_hidden', False) or bbox[2] == 0 or bbox[3] == 0
            font_size = item.get('styles', {}).get('font_size', '14px')
            color = item.get('styles', {}).get('color', '#000000')

            interactive_nodes.append({
                "tag_name": tag_name,
                "selector": selector,
                "text": text,
                "bbox": bbox,
                "is_prechecked": is_prechecked,
                "is_hidden": is_hidden,
                "styles": {
                    "font_size": font_size,
                    "color": color
                },
                "attributes": attributes
            })

        return interactive_nodes

    @staticmethod
    def generate_dom_summary(interactive_nodes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generates structured metadata summary for ML feature extraction.
        """
        total_elements = len(interactive_nodes)
        prechecked_count = sum(1 for n in interactive_nodes if n['is_prechecked'])
        hidden_elements = sum(1 for n in interactive_nodes if n['is_hidden'])

        return {
            "total_interactive_elements": total_elements,
            "prechecked_count": prechecked_count,
            "hidden_elements_count": hidden_elements,
            "has_timer": any('timer' in n['text'].lower() or 'expire' in n['text'].lower() for n in interactive_nodes),
            "has_scarcity_terms": any(term in n['text'].lower() for n in interactive_nodes for term in ['only 1 left', 'only 2 left', 'limited stock'])
        }
