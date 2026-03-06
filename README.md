# BCBA Copilot

AI copilot for autism therapists. Generates personalized ABA therapy programs in under 5 minutes for ₹0.124 per program.

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
| Frontend | React 18 + Vite + Tailwind + TanStack Query + Recharts |
| Backend | Node.js + Express + Bull queue |
| Database | MongoDB Atlas |
| Cache | Upstash Redis |
| Vector DB | ChromaDB (self-hosted) |
| Embeddings | sentence-transformers all-MiniLM-L6-v2 |
| LLM | Claude Haiku 3.5 |
| ML | XGBoost (plug-and-play slot) |

---

## Setup

### 1. Environment
```bash
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, ANTHROPIC_API_KEY, UPSTASH_REDIS_URL
```

### 2. Backend
```bash
cd server
npm install
```

### 3. ML Service
```bash
cd ml-service
python -m venv venv
venv\Scripts\activate          # Windows
pip install --only-binary=:all: -r requirements.txt
python model/train.py
```

### 4. Run everything
```bash
# From root
npm install
npm run dev
```

Services start at:
- Backend → http://localhost:5000
- ML service → http://localhost:8000
- Frontend → http://localhost:5173

---

## Cost

₹0.124 per program. MongoDB, ChromaDB, Redis, embeddings — all free tier.
