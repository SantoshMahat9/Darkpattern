from typing import List, Dict, Any

class ModelEvaluator:
    """
    Computes research-grade evaluation metrics (Precision, Recall, F1-Score, Confusion Matrix).
    """

    @staticmethod
    def evaluate_predictions(y_true: List[int], y_pred: List[int]) -> Dict[str, Any]:
        """
        Calculates precision, recall, f1, and accuracy from binary label lists.
        """
        if len(y_true) != len(y_pred) or not y_true:
            return {"error": "Invalid input lists"}

        tp = sum(1 for gt, p in zip(y_true, y_pred) if gt == 1 and p == 1)
        fp = sum(1 for gt, p in zip(y_true, y_pred) if gt == 0 and p == 1)
        fn = sum(1 for gt, p in zip(y_true, y_pred) if gt == 1 and p == 0)
        tn = sum(1 for gt, p in zip(y_true, y_pred) if gt == 0 and p == 0)

        total = len(y_true)
        accuracy = (tp + tn) / total if total > 0 else 0.0
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

        return {
            "accuracy": round(accuracy, 4),
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1, 4),
            "confusion_matrix": {
                "tp": tp,
                "fp": fp,
                "fn": fn,
                "tn": tn
            },
            "total_samples": total
        }
