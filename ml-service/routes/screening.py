import os
import pickle
import json
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

MODEL_PATH   = os.path.join(os.path.dirname(__file__), "../model/screening_model.pkl")
FEATURE_PATH = os.path.join(os.path.dirname(__file__), "../model/screening_features.json")

_model    = None
_features = None


def _load():
    global _model, _features
    if _model is None:
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
        with open(FEATURE_PATH, "r") as f:
            _features = json.load(f)


class ScreeningInput(BaseModel):
    answers:          List[int]  # exactly 20 binary (0/1)
    age:              int
    sex:              int = 1    # 1=M, 0=F
    jaundice:         int = 0
    familyASD:        int = 0
    speechDelay:      int = 0
    learningDisorder: int = 0
    geneticDisorders: int = 0


def _map_to_aq(answers: List[int]) -> dict:
    """
    Semantically maps our 20 yes/no answers (4 domains x 5 questions)
    to 10 AQ-style binary features used in training (max of each pair).

    Domain 1 - Social Communication (Q0-Q4):
      A1 = max(Q0, Q1)  eye contact + pointing
      A2 = max(Q2, Q3)  name response + shared enjoyment
      A3 = Q4           social interest

    Domain 2 - Repetitive Behavior (Q5-Q9):
      A4 = max(Q5, Q6)  repetitive movement + routine insistence
      A5 = max(Q7, Q8)  object focus + intense interest
      A6 = Q9           echolalia

    Domain 3 - Sensory Processing (Q10-Q14):
      A7 = max(Q10, Q11) sound sensitivity + sensory seeking
      A8 = max(Q12, Q13) texture sensitivity + pain threshold

    Domain 4 - Communication (Q15-Q19):
      A9  = max(Q14, Q15) physical contact avoidance + conversation difficulty
      A10 = max(Q16, Q17) gesture use + emotion understanding
    """
    a = answers
    return {
        "A1":  max(a[0],  a[1]),
        "A2":  max(a[2],  a[3]),
        "A3":  a[4],
        "A4":  max(a[5],  a[6]),
        "A5":  max(a[7],  a[8]),
        "A6":  a[9],
        "A7":  max(a[10], a[11]),
        "A8":  max(a[12], a[13]),
        "A9":  max(a[14], a[15]),
        "A10": max(a[16], a[17]),
    }


@router.post("/predict")
def predict_screening(inp: ScreeningInput):
    if len(inp.answers) != 20:
        raise HTTPException(status_code=400, detail="Exactly 20 answers required")
    if not all(a in (0, 1) for a in inp.answers):
        raise HTTPException(status_code=400, detail="Each answer must be 0 or 1")

    _load()
    aq = _map_to_aq(inp.answers)

    row = {
        **aq,
        "Age_Years":                                          inp.age,
        "Sex":                                                inp.sex,
        "Jaundice":                                           inp.jaundice,
        "Family_mem_with_ASD":                                inp.familyASD,
        "Speech Delay/Language Disorder":                     inp.speechDelay,
        "Learning disorder":                                  inp.learningDisorder,
        "Genetic_Disorders":                                  inp.geneticDisorders,
        "Depression":                                         0,
        "Global developmental delay/intellectual disability": 0,
        "Social/Behavioural Issues":                          1 if sum(inp.answers) >= 5 else 0,
        "Anxiety_disorder":                                   0,
    }

    df = pd.DataFrame([row])[_features]
    prob = float(_model.predict_proba(df)[0][1])

    if prob >= 0.65:
        risk_level = "High Risk"
    elif prob >= 0.35:
        risk_level = "Medium Risk"
    else:
        risk_level = "Low Risk"

    return {
        "riskLevel":    risk_level,
        "probability":  round(prob, 3),
        "asdPredicted": bool(_model.predict(df)[0]),
        "mlBased":      True,
    }
