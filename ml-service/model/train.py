import pandas as pd, numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib, os

FEATURES = [
    'age', 'diagnosis_level', 'communication_level', 'num_interests',
    'num_sensory_triggers', 'num_behavioral_challenges', 'learning_style',
    'num_target_goals', 'prior_therapy_months'
]

def load_data():
    dfs = []
    for f in ['asd_screening.csv', 'swedish_asd.csv', 'toddler_screening.csv']:
        path = f'../data/{f}'
        if os.path.exists(path):
            dfs.append(pd.read_csv(path))
    if dfs:
        return pd.concat(dfs, ignore_index=True)
    # Synthetic fallback for demo if no datasets yet
    print("No datasets found — using synthetic data for demo")
    np.random.seed(42)
    n = 1000
    return pd.DataFrame({
        'age':                       np.random.randint(2, 18, n),
        'diagnosis_level':           np.random.randint(1, 4, n),
        'communication_level':       np.random.randint(0, 4, n),
        'num_interests':             np.random.randint(1, 8, n),
        'num_sensory_triggers':      np.random.randint(0, 6, n),
        'num_behavioral_challenges': np.random.randint(1, 6, n),
        'learning_style':            np.random.randint(0, 4, n),
        'num_target_goals':          np.random.randint(1, 6, n),
        'prior_therapy_months':      np.random.randint(0, 36, n),
        'intervention_success':      np.random.randint(0, 2, n)
    })

def train():
    df = load_data()
    X  = df[FEATURES].fillna(0)
    y  = df['intervention_success']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = XGBClassifier(
        n_estimators=200, learning_rate=0.1, max_depth=6,
        eval_metric='logloss', random_state=42
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
    print(f"Accuracy: {accuracy_score(y_test, model.predict(X_test)):.3f}")
    print(classification_report(y_test, model.predict(X_test)))
    os.makedirs('saved', exist_ok=True)
    joblib.dump(model, 'saved/xgboost_model.pkl')
    print("Saved -> model/saved/xgboost_model.pkl")

if __name__ == '__main__':
    train()
