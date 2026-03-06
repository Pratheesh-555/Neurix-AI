from fastapi  import APIRouter
from pydantic import BaseModel
from datetime import date, timedelta

router = APIRouter()

# ── Evidence-based heuristic decay predictor ──────────────────────────────────
# Plateau timing research basis:
# - Severe ASD → high repetition-susceptibility → faster habituation
# - Intense obsession → interest burns through faster under repeated exposure
# - Younger children → higher neuroplasticity → plateau later
# - Extended prior therapy → existing habituation baseline → plateau sooner
# Swap this entire function when a trained decay model becomes available.

DIAGNOSIS_PLATEAU = {'Level 1 - Mild': 12, 'Level 2 - Moderate': 9, 'Level 3 - Severe': 6}
OBSESSION_OFFSET  = {'Mild': 2, 'Moderate': 0, 'Intense': -2}
AGE_OFFSET        = {range(2, 6): 2, range(6, 10): 1, range(10, 14): 0, range(14, 19): -1}

DECAY_REASONS = {
    'Level 1 - Mild':     "Child has developed sufficient mastery; activities lose novelty around this point.",
    'Level 2 - Moderate': "Moderate habituation to repeated stimuli typically occurs at this interval.",
    'Level 3 - Severe':   "High repetition-susceptibility leads to earlier disengagement without novel stimuli.",
}

EARLY_WARNINGS = {
    'Level 1 - Mild':     ["Decreased initiation of target behaviors", "Shorter engagement windows during activities"],
    'Level 2 - Moderate': ["Increased self-stimming during structured tasks", "Longer latency to respond to prompts"],
    'Level 3 - Severe':   ["Elopement attempts resume", "Return of previously extinguished resistance behaviors"],
}

ROTATIONS = {
    'Level 1 - Mild':     "Introduce peer-mediated activities and community generalization tasks.",
    'Level 2 - Moderate': "Rotate to novel interest-based themes; increase activity difficulty by one step.",
    'Level 3 - Severe':   "Switch to sensory-motor based activities with new reinforcement schedules.",
}

class DecayInput(BaseModel):
    age:                   int
    diagnosisLevel:        str
    obsessionIntensity:    str  = 'Moderate'
    previousTherapyMonths: int  = 0
    numInterests:          int  = 3

@router.post("/")
def predict_decay(child: DecayInput):
    base = DIAGNOSIS_PLATEAU.get(child.diagnosisLevel, 9)

    # Obsession intensity offset
    base += OBSESSION_OFFSET.get(child.obsessionIntensity, 0)

    # Age offset
    for age_range, offset in AGE_OFFSET.items():
        if child.age in age_range:
            base += offset
            break

    # Prior therapy reduces margin (already accumulated habituation)
    base -= min(child.previousTherapyMonths // 6, 3)

    # More diverse interests = longer sustainable engagement
    base += min((child.numInterests - 3) // 2, 2)

    plateau_week = max(4, min(base, 16))  # clamp to clinically sensible range

    switch_date = (date.today() + timedelta(weeks=plateau_week - 1)).isoformat()

    return {
        "estimatedPlateauWeek":  plateau_week,
        "recommendedSwitchDate": switch_date,
        "decayReason":           DECAY_REASONS.get(child.diagnosisLevel, "Habituation to repeated activity structure."),
        "earlyWarningSignals":   EARLY_WARNINGS.get(child.diagnosisLevel, []),
        "rotationRecommendation": ROTATIONS.get(child.diagnosisLevel, "Introduce novel activity themes.")
    }
