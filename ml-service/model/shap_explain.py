"""
SHAP explanation helper — called by routes/predict.py.
Provides top-N feature importance from TreeExplainer SHAP values.
"""
import shap, numpy as np

def get_shap_explanation(explainer, X: np.ndarray, feature_names: list) -> dict:
    """
    Returns shapValues dict and topFeatures list (top 3 by absolute magnitude).
    explainer: shap.TreeExplainer instance
    X:         (1, n_features) numpy array
    """
    raw = explainer.shap_values(X)

    # shap_values() returns array of shape (n_samples, n_features) for binary classification
    if isinstance(raw, list):
        # Older SHAP: list of [class0_vals, class1_vals]
        vals = raw[1][0] if len(raw) > 1 else raw[0][0]
    else:
        vals = raw[0]

    shap_list  = vals.tolist() if hasattr(vals, 'tolist') else list(vals)
    importance = sorted(zip(feature_names, shap_list), key=lambda x: abs(x[1]), reverse=True)

    return {
        "shapValues":  dict(zip(feature_names, shap_list)),
        "topFeatures": [f[0] for f in importance[:3]]
    }
