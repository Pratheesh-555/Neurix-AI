# ══════════════════════════════════════════════════════
#  PLUG-AND-PLAY MODEL SLOT
#  To swap in maam's model:
#  1. Drop her .pkl file in model/saved/
#  2. Change the joblib.load() path below
#  3. Update the features list to match her model's expected columns
#  4. Done. Nothing else changes in the entire codebase.
# ══════════════════════════════════════════════════════

from fastapi import APIRouter
from pydantic import BaseModel
import joblib, numpy as np
import shap

router = APIRouter()

# ← SWAP THIS PATH when maam's model arrives
model     = joblib.load("model/saved/xgboost_model.pkl")
explainer = shap.TreeExplainer(model)

DIAGNOSIS_MAP = {'Level 1 - Mild': 1, 'Level 2 - Moderate': 2, 'Level 3 - Severe': 3}
COMM_MAP      = {'Non-verbal': 0, 'Emerging Verbal': 1, 'Functional Verbal': 2, 'Conversational': 3}
LEARNING_MAP  = {'Visual': 0, 'Auditory': 1, 'Kinesthetic': 2, 'Mixed': 3}

# ← UPDATE these feature names to match maam's model if different
FEATURES = [
    'age', 'diagnosis_level', 'communication_level',
    'num_interests', 'num_sensory_triggers', 'num_behavioral_challenges',
    'learning_style', 'num_target_goals', 'prior_therapy_months'
]

class ChildInput(BaseModel):
    age:                   int
    diagnosisLevel:        str
    communicationLevel:    str
    interests:             list
    sensoryProfile:        dict
    behavioralChallenges:  list
    learningStyle:         str
    targetGoals:           list
    previousTherapyMonths: int = 0

@router.post("/")
def predict(child: ChildInput):
    X = np.array([[
        child.age,
        DIAGNOSIS_MAP.get(child.diagnosisLevel, 2),
        COMM_MAP.get(child.communicationLevel, 1),
        len(child.interests),
        len(child.sensoryProfile.get('hypersensitive', [])),
        len(child.behavioralChallenges),
        LEARNING_MAP.get(child.learningStyle, 0),
        len(child.targetGoals),
        child.previousTherapyMonths
    ]])

    prob      = float(model.predict_proba(X)[0][1]) * 100
    shap_vals = explainer.shap_values(X)[0].tolist()
    importance = sorted(zip(FEATURES, shap_vals), key=lambda x: abs(x[1]), reverse=True)

    return {
        "successProbability": round(prob, 1),
        "shapValues":         dict(zip(FEATURES, shap_vals)),
        "topFeatures":        [f[0] for f in importance[:3]],
        "confidenceLevel":    "High" if prob > 75 else "Medium" if prob > 50 else "Low"
    }
