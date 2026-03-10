# Neurix AI

AI-powered ABA therapy platform for BCBAs to manage child profiles, generate therapy programs, run live sessions, and perform autism screening.

---

## Stack

| Layer       | Tech                          |
|-------------|-------------------------------|
| Frontend    | React 19 + Vite (port 5173)   |
| Backend     | Node.js + Express (port 5000) |
| ML Service  | Python FastAPI (port 8000)    |
| Database    | MongoDB                       |
| LLM         | OpenAI gpt-4o-mini            |

---

## Running the Project

### Option A — All services at once (from root)

```bash
npm start
```

### Option B — 3 separate terminals

**Terminal 1 — Frontend**
```bash
cd client
npm run dev
```

**Terminal 2 — Backend**
```bash
cd server
npm run dev
```

**Terminal 3 — ML Service**
```bash
cd ml-service
source venv/Scripts/activate
uvicorn main:app --reload --port 8000
```

---

## Environment Variables

Fill in `server/.env`:

```
MONGODB_URI=
JWT_SECRET=
OPENAI_API_KEY=
```

---

## First-time Setup

```bash
# Install all dependencies
npm run install-all

# Set up Python venv for ML service
cd ml-service
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
```
