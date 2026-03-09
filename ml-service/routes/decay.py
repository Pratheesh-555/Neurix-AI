from fastapi  import APIRouter
from pydantic import BaseModel
from datetime import date, timedelta

router = APIRouter()

# ── Evidence-based heuristic decay predictor ──────────────────────────────────
# Clinical basis (Dunlap & Kern, 1993; Carr & Durand, 1985):
# - Severe ASD → high repetition-susceptibility → faster plateau
# - Intense obsession → deep thematic engagement → child stays engaged longer
# - Younger children master/outgrow activities faster → earlier plateau
# - Extended prior therapy → accumulated habituation baseline → faster plateau
# - More diverse interests → broader stimulus pool → longer engagement window
# ─────────────────────────────────────────────────────────────────────────────

DIAGNOSIS_PLATEAU = {'Level 1 - Mild': 12, 'Level 2 - Moderate': 9, 'Level 3 - Severe': 6}

# Intense obsession → child stays deeply engaged with the theme → slower plateau
# Mild obsession    → weaker thematic anchor → novelty wears out faster
OBSESSION_OFFSET  = {'Mild': -2, 'Moderate': 0, 'Intense': 2}

# Younger children develop mastery faster and outgrow activities sooner
# Older adolescents have longer habituation windows
AGE_OFFSET = {range(2, 6): -2, range(6, 10): -1, range(10, 14): 0, range(14, 19): 1}

DECAY_REASONS = {
    'Level 1 - Mild':
        "Children at this level typically develop mastery of current activities within this window, "
        "reducing the novelty and challenge needed to sustain engagement.",
    'Level 2 - Moderate':
        "Moderate habituation to repeated activity structures occurs at this interval. "
        "Without novel stimuli, engagement and initiated responses will decline.",
    'Level 3 - Severe':
        "High repetition-susceptibility means the child's nervous system adapts to the activity "
        "pattern earlier, leading to disengagement before skill generalisation is achieved.",
}

EARLY_WARNINGS = {
    'Level 1 - Mild': [
        "Child completes activities mechanically without engagement",
        "Response latency increases beyond 5 seconds consistently",
        "Refusal rate exceeds 30% in sessions",
        "Decreased spontaneous initiation of target behaviours",
    ],
    'Level 2 - Moderate': [
        "Child completes activities mechanically without engagement",
        "Response latency increases beyond 5 seconds consistently",
        "Refusal rate exceeds 30% in sessions",
        "Increased self-stimulatory behaviour during structured tasks",
    ],
    'Level 3 - Severe': [
        "Child completes activities mechanically without engagement",
        "Response latency increases beyond 5 seconds consistently",
        "Refusal rate exceeds 30% in sessions",
        "Return of previously extinguished avoidance or escape behaviours",
    ],
}

ROTATIONS = {
    'Level 1 - Mild':
        "Introduce peer-mediated activities and community generalisation tasks. "
        "Increase task complexity by one step to restore challenge.",
    'Level 2 - Moderate':
        "Introduce 2 new interest-based activities and rotate out the lowest-engagement ones. "
        "Vary reinforcement schedules to restore unpredictability.",
    'Level 3 - Severe':
        "Switch to sensory-motor based activities with new reinforcement schedules. "
        "Pair any retained activities with a novel sensory element.",
}


class DecayInput(BaseModel):
    age:                   int
    diagnosisLevel:        str
    obsessionIntensity:    str = 'Moderate'
    previousTherapyMonths: int = 0
    numInterests:          int = 3


@router.post("/")
def predict_decay(child: DecayInput):
    base = DIAGNOSIS_PLATEAU.get(child.diagnosisLevel, 9)

    # Obsession intensity (intense = longer engagement = slower plateau)
    base += OBSESSION_OFFSET.get(child.obsessionIntensity, 0)

    # Age (younger children plateau faster — master activities quickly)
    for age_range, offset in AGE_OFFSET.items():
        if child.age in age_range:
            base += offset
            break

    # Prior therapy reduces margin (existing habituation baseline)
    base -= min(child.previousTherapyMonths // 6, 3)

    # Diverse interest pool → more thematic variety → slower plateau
    base += min((child.numInterests - 3) // 2, 2)

    plateau_week = max(4, min(base, 16))  # clamp: 4–16 weeks (clinically sensible)

    switch_date  = (date.today() + timedelta(weeks=plateau_week - 1)).isoformat()
    urgency      = "high" if plateau_week < 4 else "medium" if plateau_week <= 8 else "low"

    return {
        "estimatedPlateauWeek":   plateau_week,
        "recommendedSwitchDate":  switch_date,
        "decayReason":            DECAY_REASONS.get(child.diagnosisLevel, "Habituation to repeated activity structure."),
        "earlyWarningSignals":    EARLY_WARNINGS.get(child.diagnosisLevel, [
            "Child completes activities mechanically without engagement",
            "Response latency increases beyond 5 seconds consistently",
            "Refusal rate exceeds 30% in sessions",
        ]),
        "rotationRecommendation": ROTATIONS.get(child.diagnosisLevel, "Introduce novel activity themes."),
        "urgencyLevel":           urgency,
    }
