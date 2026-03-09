# ══════════════════════════════════════════════════════
#  PLUG-AND-PLAY MODEL SLOT
#  To swap in maam's model:
#  1. Drop her .pkl file in model/saved/
#  2. Change the joblib.load() path below
#  3. Update FEATURES in utils/feature_engineering.py
#  4. Done. Nothing else changes in the entire codebase.
# ══════════════════════════════════════════════════════

from fastapi import APIRouter
from pydantic import BaseModel
import joblib, numpy as np
import shap

from utils.feature_engineering import FEATURES, encode_child
from utils.shap_explainer import get_shap_values

router = APIRouter()

# ← SWAP THIS PATH when maam's model arrives
model     = joblib.load("model/saved/xgboost_model.pkl")
explainer = shap.TreeExplainer(model)


class ChildInput(BaseModel):
    age:                   int
    diagnosisLevel:        str
    communicationLevel:    str
    interests:             list
    sensoryProfile:        dict
    behavioralChallenges:  list
    learningStyle:         str
    targetGoals:           list
    previousTherapyMonths: int  = 0
    obsessionIntensity:    str  = 'Moderate'   # Mild | Moderate | Intense


@router.post("/")
def predict(child: ChildInput):
    X         = encode_child(child)
    prob      = float(model.predict_proba(X)[0][1]) * 100
    shap_vals = get_shap_values(explainer, X, FEATURES)

    return {
        "successProbability": round(prob, 1),
        "shapValues":         shap_vals,
        "topFeatures":        [s["feature"] for s in shap_vals[:3]],
        "confidenceLevel":    "High" if prob > 75 else "Medium" if prob > 50 else "Low",
        "modelVersion":       "xgboost-v2",
    }
