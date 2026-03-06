"""
Reusable prediction helper — imported by routes/predict.py.
Swap the model path here when maam's model arrives; nothing else changes.
"""
import joblib, numpy as np

DIAGNOSIS_MAP = {'Level 1 - Mild': 1, 'Level 2 - Moderate': 2, 'Level 3 - Severe': 3}
COMM_MAP      = {'Non-verbal': 0, 'Emerging Verbal': 1, 'Functional Verbal': 2, 'Conversational': 3}
LEARNING_MAP  = {'Visual': 0, 'Auditory': 1, 'Kinesthetic': 2, 'Mixed': 3}

FEATURES = [
    'age', 'diagnosis_level', 'communication_level',
    'num_interests', 'num_sensory_triggers', 'num_behavioral_challenges',
    'learning_style', 'num_target_goals', 'prior_therapy_months'
]

def build_feature_vector(child: dict) -> np.ndarray:
    return np.array([[
        child.get('age', 0),
        DIAGNOSIS_MAP.get(child.get('diagnosisLevel', ''), 2),
        COMM_MAP.get(child.get('communicationLevel', ''), 1),
        len(child.get('interests', [])),
        len(child.get('sensoryProfile', {}).get('hypersensitive', [])),
        len(child.get('behavioralChallenges', [])),
        LEARNING_MAP.get(child.get('learningStyle', ''), 0),
        len(child.get('targetGoals', [])),
        child.get('previousTherapyMonths', 0)
    ]])

def run_prediction(model, X: np.ndarray) -> dict:
    prob = float(model.predict_proba(X)[0][1]) * 100
    return {
        "successProbability": round(prob, 1),
        "confidenceLevel":    "High" if prob > 75 else "Medium" if prob > 50 else "Low"
    }
