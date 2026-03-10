import os
import json
import pickle
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from xgboost import XGBClassifier

DATA_PATH    = os.path.join(os.path.dirname(__file__), "../data/data_csv.csv")
MODEL_PATH   = os.path.join(os.path.dirname(__file__), "../model/screening_model.pkl")
FEATURE_PATH = os.path.join(os.path.dirname(__file__), "../model/screening_features.json")

DROP_COLS = [
    "CASE_NO_PATIENT'S",
    "Who_completed_the_test",
    "Ethnicity",
    "Social_Responsiveness_Scale",    # clinical scale — not available at app screening time
    "Childhood Autism Rating Scale",  # clinical scale — data leakage
    "Qchat_10_Score",                 # derived from A1-A10, redundant
]

YES_NO_COLS = [
    "Speech Delay/Language Disorder",
    "Learning disorder",
    "Genetic_Disorders",
    "Depression",
    "Global developmental delay/intellectual disability",
    "Social/Behavioural Issues",
    "Anxiety_disorder",
    "Jaundice",
    "Family_mem_with_ASD",
]

def load_and_preprocess():
    df = pd.read_csv(DATA_PATH)

    # Rename A10 column
    df = df.rename(columns={"A10_Autism_Spectrum_Quotient": "A10"})

    # Drop leakage / irrelevant columns
    df = df.drop(columns=[c for c in DROP_COLS if c in df.columns])

    # Target
    df["ASD_traits"] = df["ASD_traits"].astype(str).str.strip().str.lower().map({"yes": 1, "no": 0})
    df = df.dropna(subset=["ASD_traits"])
    df["ASD_traits"] = df["ASD_traits"].astype(int)

    # Encode Yes/No columns
    for col in YES_NO_COLS:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip().str.lower().map({"yes": 1, "no": 0}).fillna(0).astype(int)

    # Encode Sex
    if "Sex" in df.columns:
        df["Sex"] = df["Sex"].astype(str).str.strip().str.upper().map({"M": 1, "F": 0}).fillna(0).astype(int)

    feature_cols = [c for c in df.columns if c != "ASD_traits"]
    X = df[feature_cols].fillna(0)
    y = df["ASD_traits"]

    return X, y, feature_cols


def train():
    X, y, feature_cols = load_and_preprocess()

    print(f"Dataset: {len(X)} samples | Features: {len(feature_cols)}")
    print(f"Class distribution: {y.value_counts().to_dict()}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        random_state=42,
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    y_pred = model.predict(X_test)
    acc    = accuracy_score(y_test, y_pred)
    print(f"\nTest Accuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred, target_names=["No ASD", "ASD"]))

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(FEATURE_PATH, "w") as f:
        json.dump(feature_cols, f)

    print(f"\nModel  → {MODEL_PATH}")
    print(f"Features → {FEATURE_PATH}")


if __name__ == "__main__":
    train()
