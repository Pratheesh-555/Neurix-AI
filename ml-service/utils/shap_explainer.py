"""
SHAP explanation utilities for Neurix AI ML service.

Returns Recharts-ready sorted array format:
    [{"feature": str, "value": float}, ...]
sorted by absolute SHAP impact descending.

Used by:
  - routes/predict.py  (inference endpoint)
"""

import shap
import numpy as np


def get_shap_values(
    explainer: shap.TreeExplainer,
    X: np.ndarray,
    feature_names: list,
) -> list:
    """
    Compute and return SHAP feature importances as a Recharts-ready list.

    Args:
        explainer:     Fitted shap.TreeExplainer instance.
        X:             (1, n_features) numpy array — single prediction input.
        feature_names: Ordered list matching X columns.

    Returns:
        List of dicts sorted by abs(value) descending:
        [{"feature": "prior_therapy_months", "value": -0.7855}, ...]
    """
    raw = explainer.shap_values(X)

    # Handle both SHAP API versions:
    #   Old: list of arrays [class0_array, class1_array]
    #   New: single ndarray
    if isinstance(raw, list):
        vals = raw[1][0] if len(raw) > 1 else raw[0][0]
    else:
        vals = raw[0]

    shap_list  = vals.tolist() if hasattr(vals, 'tolist') else list(vals)
    importance = sorted(
        zip(feature_names, shap_list),
        key=lambda pair: abs(pair[1]),
        reverse=True,
    )

    return [{"feature": f, "value": round(v, 4)} for f, v in importance]
