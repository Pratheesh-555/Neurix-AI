"""
Central feature engineering for Neurix AI ML service.
All enum → int conversions and feature vector construction live here.

Used by:
  - training/train_model.py  (training pipeline)
  - routes/predict.py        (inference endpoint)

Adding a new feature: update FEATURES list + encode_child() only.
Nothing else in the codebase needs to change.
"""

import numpy as np

# ── Label encodings ───────────────────────────────────────────────────────────

DIAGNOSIS_MAP = {
    'Level 1 - Mild':     1,
    'Level 2 - Moderate': 2,
    'Level 3 - Severe':   3,
}

COMM_MAP = {
    'Non-verbal':        0,
    'Emerging Verbal':   1,
    'Functional Verbal': 2,
    'Conversational':    3,
}

LEARNING_MAP = {
    'Visual':      0,
    'Auditory':    1,
    'Kinesthetic': 2,
    'Mixed':       3,
}

OBSESSION_MAP = {
    'Mild':     1,
    'Moderate': 2,
    'Intense':  3,
}

# ── Feature list (order matters — must match training and inference) ───────────

FEATURES = [
    'age',
    'diagnosis_level',
    'communication_level',
    'num_interests',
    'num_sensory_triggers',
    'num_behavioral_challenges',
    'learning_style',
    'num_target_goals',
    'prior_therapy_months',
    'obsession_intensity',        # 10th feature — added Stream 4
]


# ── Feature vector builder ─────────────────────────────────────────────────────

def encode_child(child) -> np.ndarray:
    """
    Encode a ChildInput Pydantic model or plain dict to a (1, 10) numpy array.

    Pydantic model fields expected:
        age, diagnosisLevel, communicationLevel, interests (list),
        sensoryProfile (dict with 'hypersensitive' list), behavioralChallenges (list),
        learningStyle, targetGoals (list), previousTherapyMonths, obsessionIntensity

    Dict keys expected (same names as above).
    """
    # Support both Pydantic attribute access and plain dict access
    is_pydantic = hasattr(child, 'model_fields')

    def _get(attr, default):
        if is_pydantic:
            return getattr(child, attr, default)
        return child.get(attr, default)

    age                    = int(_get('age', 6))
    diagnosis_level        = DIAGNOSIS_MAP.get(_get('diagnosisLevel', ''), 2)
    communication_level    = COMM_MAP.get(_get('communicationLevel', ''), 1)
    num_interests          = len(_get('interests', []))
    sensory_profile        = _get('sensoryProfile', {})
    num_sensory_triggers   = len(sensory_profile.get('hypersensitive', []))
    num_behavioral         = len(_get('behavioralChallenges', []))
    learning_style         = LEARNING_MAP.get(_get('learningStyle', ''), 0)
    num_target_goals       = len(_get('targetGoals', []))
    prior_therapy_months   = int(_get('previousTherapyMonths', 0))
    obsession_intensity    = OBSESSION_MAP.get(_get('obsessionIntensity', 'Moderate'), 2)

    return np.array([[
        age,
        diagnosis_level,
        communication_level,
        num_interests,
        num_sensory_triggers,
        num_behavioral,
        learning_style,
        num_target_goals,
        prior_therapy_months,
        obsession_intensity,
    ]])
