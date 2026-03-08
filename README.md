# Neurix AI

AI copilot for autism therapists. Generates personalized ABA therapy programs in under 5 minutes.

---

## What it does

1. Takes a child's profile as input
2. Runs ML prediction on intervention success
3. Finds similar past cases via vector search
4. Generates a fully personalized, gamified therapy program via Claude Haiku
5. Tracks live session resistance and pivots activities in real time
6. Projects the child's progress 6 months forward (Digital Twin)

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind + TanStack Query + Recharts + Zustand |
| Backend | Node.js + Express + in-process job queue |
| Database | MongoDB Atlas |
| Vector DB | ChromaDB (self-hosted) |
| Embeddings | sentence-transformers all-MiniLM-L6-v2 |
| LLM | Claude Haiku 3.5 |
| ML | XGBoost |

> No Redis required. The job queue runs in-process.

---

## Setup

### 1. Environment

```bash
cp server/.env.example server/.env
```

Fill in `server/.env`:

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=any-long-random-string
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Backend dependencies

```bash
cd server
npm install
```

### 3. Frontend dependencies

```bash
cd client
npm install
```

### 4. ML service

```bash
cd ml-service
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
python model/train.py        # trains the XGBoost model (one-time)
```

> ChromaDB runs automatically when the ML service starts — no separate process needed.

### 5. Root concurrently

```bash
# From project root
npm install
```

### 6. Seed demo data

Create a BCBA account first via the app's register page, then:

```bash
npm run seed
```

This loads 3 demo children:
- **Aryan** (age 6, Level 2 - Moderate) — visual learner, dinosaurs/trains
- **Priya** (age 8, Level 1 - Mild) — visual learner, minecraft/space
- **Rohan** (age 4, Level 3 - Severe) — kinesthetic, water/music

### 7. Run everything

```bash
npm run dev
```

Services start at:
- Backend   → http://localhost:5000
- ML service → http://localhost:8000
- Frontend  → http://localhost:5173

---

## Demo walkthrough

1. **Register** a BCBA account at `/register`
2. Run `npm run seed` to load 3 demo children
3. **Dashboard** — see children listed with quick-generate buttons
4. **Generate program** — select Aryan → click Generate
   - Watch 10-step progress bar (ML predict → vector search → Claude → done)
   - If no Anthropic credits: mock program is shown automatically
5. **Program view** — Outcome Predictor panel (SHAP values) + Digital Twin chart
6. **Start Live Session** — tap ✅ Engaged or ❌ Resistant after each trial
   - After 3 consecutive ❌ on one activity → pivot suggestion appears automatically
7. **Analytics** — cost breakdown vs manual therapy + success probability trend

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all 3 services concurrently |
| `npm run seed` | Load 3 demo children into MongoDB |
| `npm run train` | Retrain the XGBoost model |
| `npm run build` | Build frontend for production |

---

## Cost

₹0.124 per program (~$0.0015). MongoDB Atlas free tier, ChromaDB local, no Redis.
