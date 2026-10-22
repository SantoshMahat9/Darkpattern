import os
import json
import random
from typing import List, Dict, Tuple, Any

class SiteSplitDatasetLoader:
    """
    Dataset loader designed for dark pattern detection.
    Guarantees site-level splitting (train/val/test) to prevent cross-domain data leakage.
    """

    def __init__(self, seed: int = 42):
        self.seed = seed
        random.seed(seed)

    def split_by_site(
        self, samples: List[Dict[str, Any]], train_ratio: float = 0.7, val_ratio: float = 0.15
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Splits data samples based on site/domain instead of individual elements.
        """
        # Group by site domain
        sites = {}
        for sample in samples:
            site = sample.get("source_site", "unknown_site")
            if site not in sites:
                sites[site] = []
            sites[site].append(sample)

        unique_sites = list(sites.keys())
        random.shuffle(unique_sites)

        n_sites = len(unique_sites)
        n_train = max(1, int(n_sites * train_ratio))
        n_val = int(n_sites * val_ratio)

        train_sites = set(unique_sites[:n_train])
        val_sites = set(unique_sites[n_train:n_train + n_val])
        test_sites = set(unique_sites[n_train + n_val:])

        train_set = [s for site in train_sites for s in sites[site]]
        val_set = [s for site in val_sites for s in sites[site]]
        test_set = [s for site in test_sites for s in sites[site]]

        return train_set, val_set, test_set

    def load_sample_dataset(self) -> List[Dict[str, Any]]:
        """
        Generates reference sample dataset of dark patterns for training & evaluation.
        """
        return [
            {
                "id": "sample-01",
                "source_site": "store-alpha.com",
                "text": "Special protection automatically added to your cart for $4.99/mo.",
                "category": "Sneaky Subscription",
                "is_dark_pattern": 1,
                "bbox": [100, 200, 300, 40]
            },
            {
                "id": "sample-02",
                "source_site": "hotel-beta.org",
                "text": "Hurry! 3 people are looking at this room right now!",
                "category": "Urgency & Scarcity",
                "is_dark_pattern": 1,
                "bbox": [50, 150, 250, 30]
            },
            {
                "id": "sample-03",
                "source_site": "shop-gamma.io",
                "text": "No thanks, I prefer paying full price for items.",
                "category": "Misdirection",
                "is_dark_pattern": 1,
                "bbox": [200, 400, 180, 25]
            },
            {
                "id": "sample-04",
                "source_site": "news-delta.com",
                "text": "Read privacy policy and terms of service.",
                "category": "Clean",
                "is_dark_pattern": 0,
                "bbox": [10, 800, 200, 20]
            }
        ]
