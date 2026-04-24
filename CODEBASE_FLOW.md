# Neurix AI — Complete Codebase Flow

## Repository Structure

```
Neurix-AI/
├── client/                      # React frontend
├── server/                      # Node.js + Express backend
│   ├── controllers/             # Route handlers
│   ├── models/                  # Mongoose schemas
│   ├── queues/                  # Background job pipeline
│   ├── routes/                  # Express routers
│   ├── services/                # External service clients
│   └── utils/                   # Prompt builder & helpers
├── ml-service/                  # Python FastAPI ML service
│   ├── routes/                  # API endpoints
│   ├── model/saved/             # XGBoost .pkl (gitignored)
│   ├── chroma_store/            # ChromaDB vector DB (gitignored)
│   ├── scripts/                 # Dataset ingestion scripts
│   ├── training/                # Model training pipeline
│   └── utils/                   # Feature engineering + SHAP
└── dataset/                     # Raw datasets (gitignored)
    ├── DREAMdataset/            # 61 users, 4000+ sessions
    ├── Autism Therapy Activity  # Mendeley Indonesia CSVs
    └── Dataset_FINAL/           # Skeleton + ADOS rating
```

---

## End-to-End Request Flow

```
BROWSER (React Client)
        │
        │  POST /api/programs/:childId/generate
        ▼
EXPRESS SERVER (Node.js)
  └── programController.js
        │  Validates childId, bcbaId
        │  Adds job to InProcessQueue
        │  Returns { jobId } immediately
        │
        ▼
PROGRAM QUEUE (programQueue.js)
  Background async pipeline — 10 steps, 0→100% progress
        │
        ├─ STEP 1 ──► MongoDB: Load Child + BCBA documents
        │
        ├─ STEP 2 ──► ML SERVICE (Python/FastAPI :8000)
        │              POST /predict/
        │              Input:  child profile fields
        │              Output: successProbability, topFeatures, shapValues
        │
        ├─ STEP 3 ──► ML SERVICE
        │              POST /decay/
        │              Output: estimatedPlateauWeek
        │
        ├─ STEP 4 ──► ML SERVICE  ◄── ChromaDB (1,689 records)
        │              POST /embed/similar
        │              Input:  child profile text
        │              Output: Top 3 similar cases with:
        │                       - source (dream_dataset / mendeley_indonesia)
        │                       - adosTotal, protocol
        │                       - effectiveApproaches
        │                       - successLabel, therapyDomain
        │
        ├─ STEP 5 ──► PROMPT BUILDER (promptBuilder.js)
        │              Merges: Child Profile + ML Insights + Clinical Evidence
        │              Builds: Master prompt with CLINICAL EVIDENCE BASE section
        │                      (cites DREAM ADOS scores + Mendeley activities)
        │
        ├─ STEP 6 ──► ANTHROPIC CLAUDE API
        │              generateProgram(prompt)
        │              Output: Structured ABA plan JSON with:
        │                       - summary, goals, activities (with evidenceSource)
        │                       - weeklySchedule, parentHomeActivities
        │                       - therapistScript, dataTrackingPlan
        │                       - evidenceRationale
        │
        ├─ STEP 7 ──► ANTHROPIC CLAUDE API
        │              generateDigitalTwin(child, program, mlResult)
        │              Output: Long-term trajectory projection
        │
        ├─ STEP 8 ──► ANTHROPIC CLAUDE API
        │              generatePivots(program, child)
        │              Output: Fallback pivot for each activity
        │
        ├─ STEP 9 ──► MongoDB
        │              Program.create({ program, digitalTwin, mlPrediction,
        │                               similarProfiles, status: 'completed' })
        │
        └─ STEP 10 ──► MongoDB
                       User.update({ $inc: totalProgramsGenerated })

BROWSER POLLS  GET /api/programs/job/:jobId/status
               ◄── { progress: 0–100, status, programId }
```

---

## ChromaDB Memory Population

```
ONE-TIME SETUP (run before first use):

  python scripts/run_ingestion.py
        │
        ├─ ingest_mendeley.py
        │   Reads: activity_detail_dataset.csv (2571 successful activities)
        │           initial_condition_dataset.csv (1637 condition rows)
        │   Stores: 1637 records with effectiveApproaches + therapyDomain
        │
        └─ ingest_dream.py
            Reads: DREAMdataset/User N/*.json (header only — ADOS/SCQ)
            Stores: 61 records with adosTotal + protocol (JA/TT/IM)

  Total ChromaDB: 1,689 grounded clinical records
```

---

## ML Service Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/health` | GET | Liveness check |
| `/predict/` | POST | XGBoost success probability + SHAP |
| `/decay/` | POST | Estimated therapy plateau week |
| `/embed/store` | POST | Store child profile into ChromaDB |
| `/embed/similar` | POST | Retrieve top N similar cases |
| `/screening/predict` | POST | ASD risk screening score |

---

## Model Training

```
python training/train_model.py
  ├─ Generates 5,000 clinically-weighted synthetic cases
  ├─ Loads any real CSVs from ml-service/data/
  ├─ Trains XGBoost (300 estimators, accuracy: 85.3%)
  └─ Saves → model/saved/xgboost_model.pkl
```

---

## Key Design Decisions

| Decision | Reason |
|----------|--------|
| In-process queue (no Redis) | Network constraints; no external TCP dependency |
| ChromaDB persistent store | Survives server restarts; no cloud required |
| Header-only DREAM ingestion | DREAM session JSONs are 3–12 MB each; we need only ADOS metadata |
| Mendeley as activity library | Only grounded source with class → activity → success label chain |
| Claude Haiku for generation | Low cost, fast, handles large structured JSON output reliably |
| SHAP values in prompt | Makes ML predictions interpretable to BCBAs |

---

## How To Run

```bash
# 1. Populate ChromaDB (once)
cd ml-service
python scripts/run_ingestion.py

# 2. Train / retrain XGBoost
python training/train_model.py

# 3. Start ML service
uvicorn main:app --host 0.0.0.0 --port 8000

# 4. Start Node server (separate terminal)
cd ..
npm run dev
```
