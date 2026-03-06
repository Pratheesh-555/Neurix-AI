"""
Preprocessing pipeline for ASD datasets.
Run directly to produce a clean combined CSV:
    python data/preprocess.py
Outputs: data/processed_combined.csv (used by model/train.py if present)
"""
import os, pandas as pd, numpy as np

DIAGNOSIS_MAP  = {'Level 1 - Mild': 1, 'Level 2 - Moderate': 2, 'Level 3 - Severe': 3}
COMM_MAP       = {'Non-verbal': 0, 'Emerging Verbal': 1, 'Functional Verbal': 2, 'Conversational': 3}
LEARNING_MAP   = {'Visual': 0, 'Auditory': 1, 'Kinesthetic': 2, 'Mixed': 3}

OUTPUT_FEATURES = [
    'age', 'diagnosis_level', 'communication_level', 'num_interests',
    'num_sensory_triggers', 'num_behavioral_challenges', 'learning_style',
    'num_target_goals', 'prior_therapy_months', 'intervention_success'
]

def encode_df(df: pd.DataFrame) -> pd.DataFrame:
    """Map categorical string columns to integers and normalise column names."""
    out = pd.DataFrame()

    # Age — try multiple common column names from public ASD datasets
    for col in ['age', 'Age', 'age_months']:
        if col in df.columns:
            out['age'] = pd.to_numeric(df[col], errors='coerce').fillna(6)
            break
    if 'age' not in out.columns:
        out['age'] = 6

    # Diagnosis level
    if 'diagnosisLevel' in df.columns:
        out['diagnosis_level'] = df['diagnosisLevel'].map(DIAGNOSIS_MAP).fillna(2)
    elif 'diagnosis_level' in df.columns:
        out['diagnosis_level'] = pd.to_numeric(df['diagnosis_level'], errors='coerce').fillna(2)
    else:
        out['diagnosis_level'] = 2

    # Communication level
    if 'communicationLevel' in df.columns:
        out['communication_level'] = df['communicationLevel'].map(COMM_MAP).fillna(1)
    elif 'communication_level' in df.columns:
        out['communication_level'] = pd.to_numeric(df['communication_level'], errors='coerce').fillna(1)
    else:
        out['communication_level'] = 1

    # Numeric counts — default to reasonable median if missing
    out['num_interests']             = pd.to_numeric(df.get('num_interests', 3), errors='coerce').fillna(3)
    out['num_sensory_triggers']      = pd.to_numeric(df.get('num_sensory_triggers', 2), errors='coerce').fillna(2)
    out['num_behavioral_challenges'] = pd.to_numeric(df.get('num_behavioral_challenges', 2), errors='coerce').fillna(2)
    out['num_target_goals']          = pd.to_numeric(df.get('num_target_goals', 3), errors='coerce').fillna(3)
    out['prior_therapy_months']      = pd.to_numeric(df.get('prior_therapy_months', 0), errors='coerce').fillna(0)

    # Learning style
    if 'learningStyle' in df.columns:
        out['learning_style'] = df['learningStyle'].map(LEARNING_MAP).fillna(0)
    elif 'learning_style' in df.columns:
        out['learning_style'] = pd.to_numeric(df['learning_style'], errors='coerce').fillna(0)
    else:
        out['learning_style'] = 0

    # Target label
    for col in ['intervention_success', 'Class/ASD', 'ASD_traits', 'result']:
        if col in df.columns:
            out['intervention_success'] = (pd.to_numeric(df[col], errors='coerce').fillna(0) > 0).astype(int)
            break
    if 'intervention_success' not in out.columns:
        out['intervention_success'] = np.random.randint(0, 2, len(out))

    return out[OUTPUT_FEATURES]


def run():
    data_dir = os.path.dirname(os.path.abspath(__file__))
    frames   = []
    for fname in ['asd_screening.csv', 'swedish_asd.csv', 'toddler_screening.csv']:
        path = os.path.join(data_dir, fname)
        if os.path.exists(path):
            print(f"Loading {fname}...")
            df = pd.read_csv(path)
            frames.append(encode_df(df))

    if not frames:
        print("No source CSVs found — nothing to preprocess.")
        return

    combined = pd.concat(frames, ignore_index=True)
    out_path = os.path.join(data_dir, 'processed_combined.csv')
    combined.to_csv(out_path, index=False)
    print(f"Saved {len(combined)} rows → {out_path}")


if __name__ == '__main__':
    run()
