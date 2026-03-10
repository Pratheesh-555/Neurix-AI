"""
SHAP explanation utilities for Neurix AI ML service.

Returns Recharts-ready sorted array format:
    [{"feature": str, "value": float}, ...]
sorted by absolute SHAP impact descending.

Uses XGBoost's native pred_contribs to avoid SHAP-library version
incompatibilities with XGBoost 3.x.

Used by:
  - routes/predict.py  (inference endpoint)
"""

import numpy as np
import xgboost as xgb


def get_shap_values(
    model,
    X: np.ndarray,
    feature_names: list,
) -> list:
    """
    Compute and return SHAP feature importances as a Recharts-ready list.

    Args:
        model:         Fitted XGBClassifier instance.
        X:             (1, n_features) numpy array — single prediction input.
        feature_names: Ordered list matching X columns.

    Returns:
        List of dicts sorted by abs(value) descending:
        [{"feature": "prior_therapy_months", "value": -0.7855}, ...]
    """
    dm = xgb.DMatrix(X, feature_names=feature_names)
    # pred_contribs returns shape (n_samples, n_features + 1); last col is bias
    contribs = model.get_booster().predict(dm, pred_contribs=True)
    vals = contribs[0, :-1]  # exclude bias term

    importance = sorted(
        zip(feature_names, vals.tolist()),
        key=lambda pair: abs(pair[1]),
        reverse=True,
    )

    return [{"feature": f, "value": round(v, 4)} for f, v in importance]
