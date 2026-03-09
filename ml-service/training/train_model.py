"""
Neurix AI — Stream 4 XGBoost Training Pipeline
===============================================
Run from ml-service/ directory:

    python training/train_model.py

Outputs:
    model/saved/xgboost_model.pkl     — trained model (replaces existing)
    training/evaluation_report.txt    — accuracy, F1, feature importance

Features trained on (10 total):
    age, diagnosis_level, communication_level, num_interests,
    num_sensory_triggers, num_behavioral_challenges, learning_style,
    num_target_goals, prior_therapy_months, obsession_intensity

Dataset strategy:
    1. Generate 5000 synthetic cases (spec formula + Gaussian noise)
    2. Append any real CSVs found in data/ (asd_screening, toddler_screening, etc.)
    3. Train XGBoost on combined dataset
"""

import os
import sys
import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, classification_report
import joblib

# Allow `from utils.foo import ...` when running as training/train_model.py
ML_SERVICE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ML_SERVICE_ROOT)

from utils.feature_engineering import FEATURES, DIAGNOSIS_MAP, COMM_MAP, LEARNING_MAP, OBSESSION_MAP  # noqa: E402

DATA_DIR   = os.path.join(ML_SERVICE_ROOT, 'data')
MODEL_DIR  = os.path.join(ML_SERVICE_ROOT, 'model', 'saved')
REPORT_DIR = os.path.join(ML_SERVICE_ROOT, 'training')


# ── Synthetic data generator ──────────────────────────────────────────────────

def generate_synthetic(n: int = 5000, seed: int = 42) -> pd.DataFrame:
    """
    Generate n clinically-weighted synthetic therapy cases using the Stream-4 spec formula.

    Success formula:
        base = comm*0.30 + interests*0.20 + obsession*0.15 + therapy_months*0.10
               - diagnosis*0.15 - sensory*0.10

    Theoretical min/max from feature ranges → normalise to [0,1]
    Add Gaussian noise (σ=0.08) to prevent formula memorisation.
    Threshold at 0.5 for binary label.
    """
    rng = np.random.default_rng(seed)

    age                       = rng.integers(2, 18, n)
    diagnosis_level           = rng.integers(1, 4, n)     # 1=Mild, 2=Moderate, 3=Severe
    communication_level       = rng.integers(0, 4, n)     # 0=Non-verbal … 3=Conversational
    num_interests             = rng.integers(1, 9, n)     # 1–8
    num_sensory_triggers      = rng.integers(0, 7, n)     # 0–6
    num_behavioral_challenges = rng.integers(1, 7, n)     # 1–6
    learning_style            = rng.integers(0, 4, n)     # 0=Visual … 3=Mixed
    num_target_goals          = rng.integers(1, 7, n)     # 1–6
    prior_therapy_months      = rng.integers(0, 37, n)    # 0–36
    obsession_intensity       = rng.integers(1, 4, n)     # 1=Mild, 2=Moderate, 3=Intense

    raw = (
        communication_level  * 0.30 +
        num_interests        * 0.20 +
        obsession_intensity  * 0.15 +
        prior_therapy_months * 0.10 -
        diagnosis_level      * 0.15 -
        num_sensory_triggers * 0.10
    )

    # Theoretical min = -0.70, max = 6.40
    RAW_MIN, RAW_MAX = -0.70, 6.40
    normalised = (raw - RAW_MIN) / (RAW_MAX - RAW_MIN)

    # Noise prevents model from memorising the formula
    noise  = rng.normal(0.0, 0.08, n)
    score  = np.clip(normalised + noise, 0.0, 1.0)
    labels = (score >= 0.5).astype(int)

    return pd.DataFrame({
        'age':                       age,
        'diagnosis_level':           diagnosis_level,
        'communication_level':       communication_level,
        'num_interests':             num_interests,
        'num_sensory_triggers':      num_sensory_triggers,
        'num_behavioral_challenges': num_behavioral_challenges,
        'learning_style':            learning_style,
        'num_target_goals':          num_target_goals,
        'prior_therapy_months':      prior_therapy_months,
        'obsession_intensity':       obsession_intensity,
        'intervention_success':      labels,
    })


# ── Real-data loader ──────────────────────────────────────────────────────────

def load_real_data() -> 'pd.DataFrame | None':
    """
    Try to load and preprocess real ASD CSVs from data/.
    Returns None if no usable files found.
    """
    frames = []
    candidates = [
        'autism_screening.csv',
        'asd_screening.csv',
        'toddler_screening.csv',
        'processed_combined.csv',
    ]
    for fname in candidates:
        path = os.path.join(DATA_DIR, fname)
        if not os.path.exists(path):
            continue
        df = pd.read_csv(path)

        # Normalise target column name
        for label_col in ['intervention_success', 'result', 'ASD_traits', 'Class/ASD']:
            if label_col in df.columns and label_col != 'intervention_success':
                df['intervention_success'] = (
                    pd.to_numeric(df[label_col], errors='coerce').fillna(0) > 0
                ).astype(int)
                break

        if 'intervention_success' not in df.columns:
            print(f"  Skipping {fname} — no recognisable target column")
            continue

        # Inject obsession_intensity default (real datasets won't have it)
        if 'obsession_intensity' not in df.columns:
            df['obsession_intensity'] = 2  # Moderate

        # Keep only needed columns, fill missing
        available = [f for f in FEATURES if f in df.columns]
        if len(available) < 5:
            print(f"  Skipping {fname} — only {len(available)} matching features")
            continue

        chunk = pd.DataFrame()
        for feat in FEATURES:
            chunk[feat] = pd.to_numeric(df.get(feat, 0), errors='coerce').fillna(0)
        chunk['intervention_success'] = df['intervention_success'].values
        frames.append(chunk)
        print(f"  Loaded {len(chunk)} rows from {fname}")

    return pd.concat(frames, ignore_index=True) if frames else None


# ── Main training pipeline ────────────────────────────────────────────────────

def train():
    sep = "=" * 60
    print(sep)
    print("  Neurix AI — XGBoost Training Pipeline v2")
    print(f"  Features ({len(FEATURES)}): {', '.join(FEATURES)}")
    print(sep)

    # 1. Synthetic data
    print("\n[1/4] Generating 5 000 synthetic cases...")
    synthetic = generate_synthetic(5000)
    pos_rate  = synthetic['intervention_success'].mean()
    print(f"  Done. Success rate: {pos_rate:.1%} (target ≈ 50%)")

    frames = [synthetic]

    # 2. Real data (optional)
    print("\n[2/4] Looking for real datasets in data/...")
    real = load_real_data()
    if real is not None:
        frames.append(real[FEATURES + ['intervention_success']])
        print(f"  Combined real rows: {len(real)}")
    else:
        print("  None found — synthetic-only is fine for demo/pilot.")

    # 3. Train
    combined  = pd.concat(frames, ignore_index=True)
    X         = combined[FEATURES].fillna(0).astype(float)
    y         = combined['intervention_success'].astype(int)
    total     = len(combined)

    print(f"\n[3/4] Training XGBoost on {total} rows...")
    print(f"  Class balance: {y.mean():.1%} positive")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = XGBClassifier(
        n_estimators=300,
        learning_rate=0.08,
        max_depth=5,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric='logloss',
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    y_pred = model.predict(X_test)
    acc    = accuracy_score(y_test, y_pred)
    f1     = f1_score(y_test, y_pred, average='weighted')
    report = classification_report(y_test, y_pred, target_names=['No Success', 'Success'])

    feat_imp = sorted(
        zip(FEATURES, model.feature_importances_),
        key=lambda p: p[1],
        reverse=True,
    )

    print(f"\n  Accuracy : {acc:.4f}")
    print(f"  F1 Score : {f1:.4f}")
    print("\n  Feature importance (XGBoost gain):")
    for feat, imp in feat_imp:
        bar = '#' * int(imp * 40)
        print(f"    {feat:<30s} {imp:.4f}  {bar}")

    # 4. Save model
    print(f"\n[4/4] Saving artefacts...")
    os.makedirs(MODEL_DIR, exist_ok=True)
    model_path = os.path.join(MODEL_DIR, 'xgboost_model.pkl')
    joblib.dump(model, model_path)
    print(f"  Model  → {model_path}")

    # Save evaluation report
    os.makedirs(REPORT_DIR, exist_ok=True)
    report_path = os.path.join(REPORT_DIR, 'evaluation_report.txt')
    with open(report_path, 'w') as fh:
        fh.write("Neurix AI — XGBoost Model Evaluation Report\n")
        fh.write(sep + "\n\n")
        fh.write(f"Total training samples : {len(X_train)}\n")
        fh.write(f"Total test samples     : {len(X_test)}\n")
        fh.write(f"Features ({len(FEATURES)})           : {', '.join(FEATURES)}\n\n")
        fh.write(f"Accuracy  : {acc:.4f}\n")
        fh.write(f"F1 Score  : {f1:.4f}\n\n")
        fh.write("Classification Report:\n")
        fh.write(report + "\n")
        fh.write("Feature Importance (XGBoost gain):\n")
        for feat, imp in feat_imp:
            fh.write(f"  {feat:<30s} {imp:.4f}\n")
    print(f"  Report → {report_path}")

    print(f"\n{'✓'} Training complete.\n")
    return model


if __name__ == '__main__':
    train()
