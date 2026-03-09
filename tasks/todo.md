# BCBA Copilot — Phase 1 Task Tracker

## Phase 1: Backend Foundation

- [x] tasks/todo.md — this file
- [x] Step 1:  neurixai/package.json (root concurrently script)
- [x] Step 2:  server/package.json + npm install (181 packages, 0 vulns)
- [x] Step 3:  server/config/db.js
- [x] Step 4:  server/models/User.js
- [x] Step 5:  server/models/Child.js
- [x] Step 6:  server/models/Program.js
- [x] Step 7:  server/models/SessionLog.js
- [x] Step 8:  server/app.js
- [x] Step 9:  server/server.js
- [x] Step 10: server/middleware/authMiddleware.js
- [x] Step 11: server/middleware/inputSanitizer.js
- [x] Step 12: server/middleware/rateLimiter.js
- [x] Step 13: server/controllers/authController.js
- [x] Step 14: server/routes/auth.js
- [x] Step 15: server/controllers/childController.js
- [x] Step 16: server/routes/child.js

## Phase 2: ML Service

- [x] ml-service/requirements.txt (Python 3.13 binary-wheel versions)
- [x] ml-service/main.py (exact PRD spec)
- [x] ml-service/routes/__init__.py
- [x] ml-service/routes/health.py
- [x] ml-service/routes/predict.py (exact PRD spec — plug-and-play slot)
- [x] ml-service/routes/embed.py (exact PRD spec — ChromaDB + sentence-transformers)
- [x] ml-service/routes/decay.py (evidence-based heuristic predictor)
- [x] ml-service/model/__init__.py
- [x] ml-service/model/train.py (exact PRD spec)
- [x] ml-service/model/predict.py (helper module)
- [x] ml-service/model/shap_explain.py (helper module)
- [x] ml-service/data/__init__.py
- [x] ml-service/data/preprocess.py
- [x] venv created: ml-service/venv/
- [x] pip install --only-binary=:all: (200+ packages, 0 errors)
- [x] python model/train.py — xgboost_model.pkl 575KB saved
- [x] uvicorn started on :8000
- [x] GET  /health/  -> {"status":"ok","ts":"..."}  200 OK
- [x] POST /predict/ -> successProbability, shapValues, topFeatures  200 OK
- [x] POST /decay/   -> estimatedPlateauWeek:8, date, reason, signals  200 OK
- [x] POST /embed/store -> {"status":"stored"}  200 OK

## Review

Phase 1 + Phase 2 complete and fully tested.
Phase 3 next: Generation Pipeline (prompt builders, Claude service, ML/Chroma service wrappers, Bull queue, programController + routes).

To restart ML service: cd ml-service && venv/Scripts/uvicorn main:app --reload --port 8000
Note: first startup ~30s (downloads all-MiniLM-L6-v2 from HuggingFace on first run).

---

## Stream 4 — ML Architecture Hardening

- [x] Fix 3: Create ml-service/utils/__init__.py
- [x] Fix 3: Create ml-service/utils/feature_engineering.py (10 features incl. obsession_intensity)
- [x] Fix 4: Create ml-service/utils/shap_explainer.py (Recharts-ready array output)
- [x] Fix 1: Create ml-service/training/train_model.py (5000 synthetic + real data + eval report)
- [x] Fix 1: Run training — Accuracy 0.8530, F1 0.8529, pkl saved (575KB → retrained with 10 features)
- [x] Fix 2: Update ml-service/routes/predict.py (10th feature, import from utils, modelVersion v2)
- [x] Fix 2: Verify predict response — 10 SHAP values, obsession_intensity present
- [x] Fix 5: Update DigitalTwinPanel.jsx (projection label added)
