# BCBA Copilot — Enterprise PRD v3.0 (Final)
> Team: CodeX | Pratheesh Krishnan D + Dasari Sai Teja | SASTRA University | DAKSH Hackathon
> 
> ⚠️ THIS IS THE ONLY DOCUMENT YOU NEED. Feed this to Claude in VS Code and say "Build Phase 1". Follow phases in order. Do not skip.

---

## WHAT WE ARE BUILDING

A web app for BCBAs (autism therapists) that:
1. Takes a child's profile as input
2. Runs ML prediction on intervention success
3. Finds similar past cases via vector search
4. Generates a fully personalized, gamified ABA therapy program via Claude Haiku
5. Tracks live session resistance and pivots activities in real time
6. Projects the child's progress 6 months forward (Digital Twin)

All of this in under 5 minutes. For ₹0.124 per program.

---

## TECH STACK (LOCKED)

```
Frontend   →  React 18 + Vite + Tailwind + TanStack Query + Recharts + Framer Motion
Backend    →  Node.js + Express + Bull queue
Database   →  MongoDB Atlas M0 (free)
Cache      →  Upstash Redis (free tier)
Vector DB  →  ChromaDB (self-hosted, open source)
Embeddings →  sentence-transformers all-MiniLM-L6-v2 (local, free)
LLM        →  Claude Haiku 3.5
ML         →  PLUG-AND-PLAY SLOT (XGBoost default → swap with maam's model anytime)
Infra      →  AWS EC2 (organizer provided)
```

---

## FOLDER STRUCTURE

```
bcba-copilot/
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   ├── auth.api.js
│   │   │   ├── child.api.js
│   │   │   └── program.api.js
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── child/
│   │   │   │   ├── ChildProfileForm.jsx      # 5-step wizard
│   │   │   │   ├── ChildList.jsx
│   │   │   │   ├── ChildCard.jsx
│   │   │   │   └── InterestTagInput.jsx
│   │   │   ├── program/
│   │   │   │   ├── ProgramGenerator.jsx      # trigger + poll job
│   │   │   │   ├── ProgramDisplay.jsx        # full program view
│   │   │   │   ├── ActivityCard.jsx
│   │   │   │   ├── OutcomePredictorPanel.jsx # ML score + SHAP
│   │   │   │   ├── DecayPredictor.jsx        # plateau week display
│   │   │   │   ├── DigitalTwinPanel.jsx      # 6-month projection
│   │   │   │   ├── ResistanceTracker.jsx     # live ✅/❌ tapping
│   │   │   │   ├── TherapistScript.jsx
│   │   │   │   ├── ParentHomePlan.jsx
│   │   │   │   └── ProgramExport.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── StatsCard.jsx
│   │   │   │   └── CostTracker.jsx
│   │   │   ├── analytics/
│   │   │   │   ├── AnalyticsDashboard.jsx
│   │   │   │   ├── SuccessRateChart.jsx
│   │   │   │   └── CostBreakdown.jsx
│   │   │   └── shared/
│   │   │       ├── Navbar.jsx
│   │   │       ├── Loader.jsx
│   │   │       ├── ProgressStepper.jsx
│   │   │       └── Toast.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useProgram.js
│   │   │   ├── useJobPoller.js
│   │   │   └── useResistance.js
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── NewChild.jsx
│   │   │   ├── ChildDetail.jsx
│   │   │   ├── GenerateProgram.jsx
│   │   │   ├── ProgramView.jsx
│   │   │   ├── ProgramHistory.jsx
│   │   │   ├── LiveSession.jsx
│   │   │   └── Analytics.jsx
│   │   ├── store/
│   │   │   ├── authStore.js                  # Zustand
│   │   │   └── sessionStore.js
│   │   ├── utils/
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── childController.js
│   │   ├── programController.js
│   │   └── sessionController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── rateLimiter.js
│   │   └── inputSanitizer.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Child.js
│   │   ├── Program.js
│   │   └── SessionLog.js
│   ├── queues/
│   │   └── programQueue.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── child.js
│   │   ├── program.js
│   │   └── session.js
│   ├── services/
│   │   ├── claudeService.js
│   │   ├── chromaService.js
│   │   ├── mlService.js                      # calls Python — swap-ready
│   │   └── redisService.js
│   ├── utils/
│   │   ├── promptBuilder.js
│   │   ├── digitalTwinBuilder.js
│   │   ├── pivotPromptBuilder.js
│   │   └── decayPromptBuilder.js
│   ├── app.js
│   └── server.js
│
├── ml-service/
│   ├── main.py
│   ├── routes/
│   │   ├── predict.py                        # ← SWAP POINT for maam's model
│   │   ├── embed.py
│   │   ├── decay.py
│   │   └── health.py
│   ├── model/
│   │   ├── train.py
│   │   ├── predict.py
│   │   ├── shap_explain.py
│   │   └── saved/                            # ← DROP maam's .pkl here
│   ├── data/
│   │   ├── asd_screening.csv
│   │   ├── swedish_asd.csv
│   │   ├── toddler_screening.csv
│   │   └── preprocess.py
│   ├── chroma_store/
│   └── requirements.txt
│
├── .env
├── .env.example
├── package.json                              # root: concurrently script
└── README.md
```

---

## MONGODB SCHEMAS

### server/models/User.js
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:                   { type: String, required: true, trim: true },
  email:                  { type: String, required: true, unique: true, lowercase: true },
  password:               { type: String, required: true, minlength: 8 },
  licenseNumber:          { type: String, required: true },
  organization:           { type: String },
  approvedProgramTexts:   [String],         // Ghost mode: BCBA's past phrasing
  totalProgramsGenerated: { type: Number, default: 0 },
  totalCostInr:           { type: Number, default: 0 },
  createdAt:              { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### server/models/Child.js
```javascript
const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  bcbaId:               { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:                 { type: String, required: true },
  age:                  { type: Number, required: true, min: 2, max: 18 },
  diagnosisLevel:       { type: String, enum: ['Level 1 - Mild', 'Level 2 - Moderate', 'Level 3 - Severe'], required: true },
  communicationLevel:   { type: String, enum: ['Non-verbal', 'Emerging Verbal', 'Functional Verbal', 'Conversational'], required: true },
  interests:            [String],
  obsessionIntensity:   { type: String, enum: ['Mild', 'Moderate', 'Intense'] },
  sensoryProfile: {
    hypersensitive:     [String],
    hyposensitive:      [String],
    seeksBehaviors:     [String]
  },
  behavioralChallenges: [String],
  learningStyle:        { type: String, enum: ['Visual', 'Auditory', 'Kinesthetic', 'Mixed'] },
  currentSkills:        [String],
  targetGoals:          [String],
  previousTherapyMonths:{ type: Number, default: 0 },
  chromaEmbeddingId:    String,
  createdAt:            { type: Date, default: Date.now },
  updatedAt:            { type: Date, default: Date.now }
});

module.exports = mongoose.model('Child', childSchema);
```

### server/models/Program.js
```javascript
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  id:                    String,
  name:                  String,
  theme:                 String,
  objective:             String,
  instructions:          String,
  duration:              Number,
  difficulty:            { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  successMetric:         String,
  gamificationElement:   String,
  reinforcementStrategy: String,
  sensoryConsiderations: String,
  resistanceCount:       { type: Number, default: 0 },
  pivotActivity:         mongoose.Schema.Types.Mixed
});

const programSchema = new mongoose.Schema({
  childId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
  bcbaId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId:      String,
  status:     { type: String, enum: ['queued','predicting','retrieving','generating','completed','failed'], default: 'queued' },
  generationTimeMs: Number,
  costInr:    { type: Number, default: 0.124 },

  mlPrediction: {
    successProbability: Number,
    shapValues:         mongoose.Schema.Types.Mixed,
    topFeatures:        [String],
    confidenceLevel:    String,
    decayPrediction: {
      estimatedPlateauWeek:   Number,
      recommendedSwitchDate:  Date,
      decayReason:            String
    }
  },

  similarProfiles: [{
    childId:             String,
    similarityScore:     Number,
    effectiveApproaches: [String],
    interestOverlap:     [String]
  }],

  digitalTwin: {
    conditionedOn:    String,
    projectedOutcomes: [{
      metric:               String,
      currentBaseline:      String,
      projectedAt3Months:   String,
      projectedAt6Months:   String
    }]
  },

  program: {
    summary:              String,
    goals:                [String],
    activities:           [activitySchema],
    weeklySchedule:       mongoose.Schema.Types.Mixed,
    parentHomeActivities: mongoose.Schema.Types.Mixed,
    therapistScript:      String,
    dataTrackingPlan:     String
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Program', programSchema);
```

### server/models/SessionLog.js
```javascript
const mongoose = require('mongoose');

const sessionLogSchema = new mongoose.Schema({
  programId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  childId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Child' },
  bcbaId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionDate:{ type: Date, default: Date.now },
  activityLogs: [{
    activityId:      String,
    result:          { type: String, enum: ['engaged', 'resistant', 'pivoted'] },
    timestamp:       Date,
    pivotTriggered:  Boolean
  }],
  overallEngagementScore: Number,
  notes: String
});

module.exports = mongoose.model('SessionLog', sessionLogSchema);
```

---

## ALL API ENDPOINTS

```
AUTH
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/update-voice           # saves BCBA phrasing for Ghost Mode

CHILDREN
POST   /api/children                    # create + auto-embed in ChromaDB
GET    /api/children                    # all children for this BCBA
GET    /api/children/:id
PUT    /api/children/:id
DELETE /api/children/:id

PROGRAMS
POST   /api/programs/generate           # starts Bull job → returns { jobId }
GET    /api/programs/status/:jobId      # poll progress 0–100
GET    /api/programs/:id                # get completed program
GET    /api/programs/child/:childId     # history
POST   /api/programs/:id/approve        # BCBA approves → saves to ghost mode
POST   /api/programs/:id/export         # PDF

SESSIONS
POST   /api/sessions/start
POST   /api/sessions/:id/log            # log ✅ or ❌
POST   /api/sessions/:id/pivot          # 3 ❌ → instant Claude pivot (10s)
GET    /api/sessions/:id/summary

ANALYTICS
GET    /api/analytics/overview
GET    /api/analytics/costs
GET    /api/analytics/outcomes
```

---

## GENERATION PIPELINE (server/queues/programQueue.js)

```javascript
const Queue = require('bull');
const programQueue = new Queue('program-generation', process.env.UPSTASH_REDIS_URL);

programQueue.process(async (job) => {
  const { childId, bcbaId } = job.data;
  const start = Date.now();

  // STEP 1 — Load child + BCBA
  await job.progress(10);
  const child = await Child.findById(childId);
  const bcba  = await User.findById(bcbaId);

  // STEP 2 — ML Prediction (XGBoost or maam's model — same call)
  await job.progress(20);
  const mlResult = await mlService.predict(child);

  // STEP 3 — Decay Prediction
  await job.progress(30);
  const decayResult = await mlService.predictDecay(child);

  // STEP 4 — ChromaDB RAG (find similar children)
  await job.progress(40);
  const similarCases = await chromaService.findSimilar(child);

  // STEP 5 — Build master prompt
  await job.progress(50);
  const prompt = promptBuilder.build(child, mlResult, decayResult, similarCases, bcba);

  // STEP 6 — Claude Haiku: generate program
  await job.progress(60);
  const programJSON = await claudeService.generateProgram(prompt);

  // STEP 7 — Claude Haiku: Digital Twin
  await job.progress(72);
  const digitalTwin = await claudeService.generateDigitalTwin(child, programJSON, mlResult);

  // STEP 8 — Claude Haiku: pre-generate pivot for each activity
  await job.progress(84);
  const programWithPivots = await claudeService.generatePivots(programJSON, child);

  // STEP 9 — Save everything to MongoDB
  await job.progress(94);
  const saved = await Program.create({
    childId, bcbaId, jobId: job.id,
    status: 'completed',
    generationTimeMs: Date.now() - start,
    costInr: 0.124,
    mlPrediction: { ...mlResult, decayPrediction: decayResult },
    similarProfiles: similarCases,
    digitalTwin,
    program: programWithPivots
  });

  // STEP 10 — Update BCBA usage stats
  await User.findByIdAndUpdate(bcbaId, {
    $inc: { totalProgramsGenerated: 1, totalCostInr: 0.124 }
  });

  await job.progress(100);
  return { programId: saved._id };
});

module.exports = programQueue;
```

---

## CLAUDE PROMPT TEMPLATES

### server/utils/promptBuilder.js
```javascript
function build(child, mlResult, decayResult, similarCases, bcba) {
  const voiceExamples = bcba.approvedProgramTexts?.length
    ? `\nMATCH THIS BCBA'S WRITING STYLE exactly. Examples:\n${bcba.approvedProgramTexts.slice(0,3).join('\n---\n')}\n`
    : '';

  return `You are a senior Board Certified Behavior Analyst (BCBA) generating a complete, evidence-based ABA therapy program.

CHILD PROFILE:
Name: ${child.name} | Age: ${child.age} | Diagnosis: ${child.diagnosisLevel}
Communication: ${child.communicationLevel} | Learning Style: ${child.learningStyle}
Interests (use ALL of these): ${child.interests.join(', ')} | Obsession Intensity: ${child.obsessionIntensity}
AVOID these sensory triggers: ${child.sensoryProfile.hypersensitive.join(', ')}
Behavioral Challenges: ${child.behavioralChallenges.join(', ')}
Current Skills: ${child.currentSkills.join(', ')}
Target Goals: ${child.targetGoals.join(', ')}
Prior Therapy: ${child.previousTherapyMonths} months

ML INSIGHTS:
Predicted Success Rate: ${mlResult.successProbability}%  |  Confidence: ${mlResult.confidenceLevel}
Key predictive factors: ${mlResult.topFeatures.join(', ')}
Plateau expected: Week ${decayResult.estimatedPlateauWeek} — design activities to rotate before then

SIMILAR SUCCESSFUL CASES:
${similarCases.map((c,i) => `Case ${i+1} (${Math.round(c.similarityScore*100)}% match) — Interest overlap: ${c.interestOverlap.join(', ')} — What worked: ${c.effectiveApproaches.join(', ')}`).join('\n')}
${voiceExamples}

OUTPUT RULES:
- Respond with VALID JSON ONLY. No markdown. No explanation. No preamble.
- Every activity MUST be themed around the child's listed interests
- NEVER include the sensory triggers listed above
- Therapist script must be warm, child-directed, use child's first name
- Minimum 6 activities, maximum 8
- All JSON keys must match exactly as shown below

{
  "summary": "2-sentence program overview",
  "goals": ["goal1", "goal2", "goal3"],
  "activities": [
    {
      "id": "act_1",
      "name": "activity name",
      "theme": "interest-based theme e.g. Dinosaur Expedition",
      "objective": "skill this builds",
      "instructions": "step-by-step BCBA instructions",
      "duration": 10,
      "difficulty": "Easy",
      "successMetric": "measurable success indicator",
      "gamificationElement": "specific game mechanic",
      "reinforcementStrategy": "what reinforces correct behavior",
      "sensoryConsiderations": "how this avoids listed triggers"
    }
  ],
  "weeklySchedule": {
    "monday": ["act_1", "act_2"],
    "tuesday": ["act_3"],
    "wednesday": ["act_1", "act_4"],
    "thursday": ["act_2", "act_5"],
    "friday": ["act_3", "act_6"]
  },
  "parentHomeActivities": [
    {
      "name": "home activity name",
      "instructions": "simple parent-friendly instructions",
      "frequency": "daily OR 3x per week",
      "materials": ["item1", "item2"]
    }
  ],
  "therapistScript": "Complete word-for-word script. Use child's name. Include therapist prompts and expected child responses. Warm, encouraging tone.",
  "dataTrackingPlan": "Specific numeric tracking method"
}`;
}

module.exports = { build };
```

### server/utils/digitalTwinBuilder.js
```javascript
function buildDigitalTwinPrompt(child, program, mlResult) {
  return `You are a clinical AI generating a realistic 6-month therapy progress projection.

CHILD: ${child.name}, Age ${child.age}, ${child.diagnosisLevel}, ${child.communicationLevel}
THERAPY GOALS: ${program.goals.join(', ')}
PREDICTED SUCCESS RATE: ${mlResult.successProbability}%
ASSUMED FREQUENCY: 3 sessions per week

Respond with VALID JSON ONLY. No markdown. No preamble.
Be realistic and measurable. No vague statements.

{
  "conditionedOn": "Consistent therapy 3x per week as planned",
  "projectedOutcomes": [
    {
      "metric": "specific measurable metric e.g. Eye contact duration",
      "currentBaseline": "current measurable state",
      "projectedAt3Months": "realistic 3-month target",
      "projectedAt6Months": "realistic 6-month target"
    }
  ]
}

Generate 4 projections for: communication, social interaction, behavioral regulation, skill acquisition.`;
}

module.exports = { buildDigitalTwinPrompt };
```

### server/utils/pivotPromptBuilder.js
```javascript
function buildPivotPrompt(child, failedActivity) {
  return `A child resisted this therapy activity 3 times in a row. Generate one alternative activity for the same goal.

CHILD: ${child.name}, Age ${child.age}
Interests: ${child.interests.join(', ')}
Sensory triggers to avoid: ${child.sensoryProfile.hypersensitive.join(', ')}

FAILED ACTIVITY:
Name: ${failedActivity.name}
Objective: ${failedActivity.objective}
Why it likely failed: child resisted engagement

Respond with VALID JSON ONLY. No markdown. No preamble.
Make the alternative simpler, more interest-driven, lower effort, higher reward.

{
  "id": "pivot_${failedActivity.id}",
  "name": "alternative activity name",
  "theme": "use child's interest",
  "objective": "${failedActivity.objective}",
  "instructions": "simpler, more playful version",
  "duration": 5,
  "difficulty": "Easy",
  "successMetric": "lower bar than original",
  "gamificationElement": "high reward, low effort mechanic"
}`;
}

module.exports = { buildPivotPrompt };
```

### server/utils/decayPromptBuilder.js
```javascript
function buildDecayPrompt(child, program) {
  return `Predict when this ABA therapy program will plateau for this child.

CHILD: Age ${child.age}, ${child.diagnosisLevel}, Obsession intensity: ${child.obsessionIntensity}
ACTIVITIES: ${program.activities?.map(a => a.name).join(', ') || 'Not yet generated'}
PRIOR THERAPY: ${child.previousTherapyMonths} months

Respond with VALID JSON ONLY. No markdown. No preamble.

{
  "estimatedPlateauWeek": 8,
  "decayReason": "specific clinical reason engagement drops",
  "earlyWarningSignals": ["signal1", "signal2"],
  "rotationRecommendation": "what to introduce to prevent plateau"
}`;
}

module.exports = { buildDecayPrompt };
```

---

## CLAUDE SERVICE (server/services/claudeService.js)

```javascript
const Anthropic = require('@anthropic-ai/sdk');
const { buildDigitalTwinPrompt } = require('../utils/digitalTwinBuilder');
const { buildPivotPrompt } = require('../utils/pivotPromptBuilder');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function parseJSON(text) {
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

async function callHaiku(prompt, maxTokens = 4096) {
  const res = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }]
  });
  return res.content[0].text;
}

async function generateProgram(prompt) {
  const text = await callHaiku(prompt, 4096);
  return parseJSON(text);
}

async function generateDigitalTwin(child, program, mlResult) {
  const prompt = buildDigitalTwinPrompt(child, program, mlResult);
  const text = await callHaiku(prompt, 1024);
  return parseJSON(text);
}

async function generatePivots(program, child) {
  const withPivots = await Promise.all(
    program.activities.map(async (activity) => {
      const prompt = buildPivotPrompt(child, activity);
      const text = await callHaiku(prompt, 512);
      const pivot = parseJSON(text);
      return { ...activity, pivotActivity: pivot };
    })
  );
  return { ...program, activities: withPivots };
}

async function generateInstantPivot(child, failedActivity) {
  const prompt = buildPivotPrompt(child, failedActivity);
  const text = await callHaiku(prompt, 512);
  return parseJSON(text);
}

module.exports = { generateProgram, generateDigitalTwin, generatePivots, generateInstantPivot };
```

---

## ML SERVICE — PLUG AND PLAY SLOT

> ⚡ THIS IS THE SWAP POINT. Default = XGBoost. When maam gives her model: drop .pkl in model/saved/, update joblib.load() path in predict.py. Nothing else changes anywhere.

### ml-service/requirements.txt
```
fastapi==0.104.1
uvicorn==0.24.0
xgboost==2.0.2
scikit-learn==1.3.2
shap==0.44.0
pandas==2.1.3
numpy==1.24.3
sentence-transformers==2.2.2
chromadb==0.4.18
joblib==1.3.2
pydantic==2.5.0
python-dotenv==1.0.0
```

### ml-service/main.py
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.predict import router as predict_router
from routes.embed import router as embed_router
from routes.decay import router as decay_router
from routes.health import router as health_router

app = FastAPI(title="BCBA Copilot ML Service", version="3.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.include_router(health_router,  prefix="/health")
app.include_router(predict_router, prefix="/predict")
app.include_router(embed_router,   prefix="/embed")
app.include_router(decay_router,   prefix="/decay")
```

### ml-service/routes/predict.py
```python
# ══════════════════════════════════════════════════════
#  PLUG-AND-PLAY MODEL SLOT
#  To swap in maam's model:
#  1. Drop her .pkl file in model/saved/
#  2. Change the joblib.load() path below
#  3. Update the features list to match her model's expected columns
#  4. Done. Nothing else changes in the entire codebase.
# ══════════════════════════════════════════════════════

from fastapi import APIRouter
from pydantic import BaseModel
import joblib, numpy as np
import shap

router = APIRouter()

# ← SWAP THIS PATH when maam's model arrives
model = joblib.load("model/saved/xgboost_model.pkl")
explainer = shap.TreeExplainer(model)

DIAGNOSIS_MAP  = {'Level 1 - Mild': 1, 'Level 2 - Moderate': 2, 'Level 3 - Severe': 3}
COMM_MAP       = {'Non-verbal': 0, 'Emerging Verbal': 1, 'Functional Verbal': 2, 'Conversational': 3}
LEARNING_MAP   = {'Visual': 0, 'Auditory': 1, 'Kinesthetic': 2, 'Mixed': 3}

# ← UPDATE these feature names to match maam's model if different
FEATURES = [
  'age', 'diagnosis_level', 'communication_level',
  'num_interests', 'num_sensory_triggers', 'num_behavioral_challenges',
  'learning_style', 'num_target_goals', 'prior_therapy_months'
]

class ChildInput(BaseModel):
  age:                    int
  diagnosisLevel:         str
  communicationLevel:     str
  interests:              list
  sensoryProfile:         dict
  behavioralChallenges:   list
  learningStyle:          str
  targetGoals:            list
  previousTherapyMonths:  int = 0

@router.post("/")
def predict(child: ChildInput):
  X = np.array([[
    child.age,
    DIAGNOSIS_MAP.get(child.diagnosisLevel, 2),
    COMM_MAP.get(child.communicationLevel, 1),
    len(child.interests),
    len(child.sensoryProfile.get('hypersensitive', [])),
    len(child.behavioralChallenges),
    LEARNING_MAP.get(child.learningStyle, 0),
    len(child.targetGoals),
    child.previousTherapyMonths
  ]])

  prob       = float(model.predict_proba(X)[0][1]) * 100
  shap_vals  = explainer.shap_values(X)[0].tolist()
  importance = sorted(zip(FEATURES, shap_vals), key=lambda x: abs(x[1]), reverse=True)

  return {
    "successProbability": round(prob, 1),
    "shapValues":         dict(zip(FEATURES, shap_vals)),
    "topFeatures":        [f[0] for f in importance[:3]],
    "confidenceLevel":    "High" if prob > 75 else "Medium" if prob > 50 else "Low"
  }
```

### ml-service/routes/embed.py
```python
from fastapi import APIRouter
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import chromadb, ast

router  = APIRouter()
st_model = SentenceTransformer('all-MiniLM-L6-v2')
client   = chromadb.PersistentClient(path="./chroma_store")
col      = client.get_or_create_collection("child_profiles")

def to_text(c: dict) -> str:
  return f"Age {c.get('age')}, {c.get('diagnosisLevel')}, {c.get('communicationLevel')}. Interests: {', '.join(c.get('interests',[]))}. Challenges: {', '.join(c.get('behavioralChallenges',[]))}. Goals: {', '.join(c.get('targetGoals',[]))}."

class StoreInput(BaseModel):
  childId:             str
  childData:           dict
  effectiveApproaches: list = []

class QueryInput(BaseModel):
  childData: dict
  n:         int = 3

@router.post("/store")
def store(inp: StoreInput):
  text = to_text(inp.childData)
  emb  = st_model.encode(text).tolist()
  col.upsert(
    ids=[inp.childId], embeddings=[emb], documents=[text],
    metadatas=[{
      "effectiveApproaches": str(inp.effectiveApproaches),
      "interests":           str(inp.childData.get('interests', []))
    }]
  )
  return {"status": "stored"}

@router.post("/similar")
def similar(inp: QueryInput):
  text    = to_text(inp.childData)
  emb     = st_model.encode(text).tolist()
  count   = col.count()
  if count == 0:
    return {"similar": []}
  results = col.query(query_embeddings=[emb], n_results=min(inp.n, count))
  out = []
  for i, doc_id in enumerate(results['ids'][0]):
    meta = results['metadatas'][0][i]
    out.append({
      "childId":             doc_id,
      "similarityScore":     round(1 - results['distances'][0][i], 3),
      "effectiveApproaches": ast.literal_eval(meta.get('effectiveApproaches','[]')),
      "interestOverlap":     ast.literal_eval(meta.get('interests','[]'))
    })
  return {"similar": out}
```

### ml-service/model/train.py
```python
import pandas as pd, numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib, os

FEATURES = [
  'age','diagnosis_level','communication_level','num_interests',
  'num_sensory_triggers','num_behavioral_challenges','learning_style',
  'num_target_goals','prior_therapy_months'
]

def load_data():
  dfs = []
  for f in ['asd_screening.csv','swedish_asd.csv','toddler_screening.csv']:
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
    'age':                          np.random.randint(2,18,n),
    'diagnosis_level':              np.random.randint(1,4,n),
    'communication_level':          np.random.randint(0,4,n),
    'num_interests':                np.random.randint(1,8,n),
    'num_sensory_triggers':         np.random.randint(0,6,n),
    'num_behavioral_challenges':    np.random.randint(1,6,n),
    'learning_style':               np.random.randint(0,4,n),
    'num_target_goals':             np.random.randint(1,6,n),
    'prior_therapy_months':         np.random.randint(0,36,n),
    'intervention_success':         np.random.randint(0,2,n)
  })

def train():
  df = load_data()
  X  = df[FEATURES].fillna(0)
  y  = df['intervention_success']
  X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)
  model = XGBClassifier(n_estimators=200,learning_rate=0.1,max_depth=6,
                        eval_metric='logloss',random_state=42)
  model.fit(X_train,y_train,eval_set=[(X_test,y_test)],verbose=False)
  print(f"Accuracy: {accuracy_score(y_test, model.predict(X_test)):.3f}")
  os.makedirs('saved',exist_ok=True)
  joblib.dump(model,'saved/xgboost_model.pkl')
  print("Saved → model/saved/xgboost_model.pkl")

if __name__ == '__main__':
  train()
```

---

## SECURITY MIDDLEWARE

### server/middleware/inputSanitizer.js
```javascript
const PATTERNS = [
  /ignore previous instructions/i,
  /jailbreak/i,
  /pretend you are/i,
  /you are now/i,
  /forget everything/i,
  /act as(?! a therapist)/i,
  /<script>/i,
  /\.\.\//
];

module.exports = (req, res, next) => {
  const body = JSON.stringify(req.body || {});
  for (const p of PATTERNS) {
    if (p.test(body)) {
      return res.status(400).json({ error: 'Invalid input', code: 'INJECTION_BLOCKED' });
    }
  }
  next();
};
```

### server/middleware/rateLimiter.js
```javascript
const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 10,                     // 10 program generations per BCBA per hour
  message: { error: 'Rate limit exceeded. Max 10 programs per hour.' }
});
```

---

## ENVIRONMENT VARIABLES (.env)

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/bcba-copilot

JWT_SECRET=replace_with_long_random_string
JWT_EXPIRES_IN=24h

ANTHROPIC_API_KEY=sk-ant-api03-...

UPSTASH_REDIS_URL=rediss://default:<token>@<host>.upstash.io:6380

ML_SERVICE_URL=http://localhost:8000
```

---

## ROOT PACKAGE.JSON (run everything with one command)

```json
{
  "name": "bcba-copilot",
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\" \"npm run ml\"",
    "server": "cd server && nodemon server.js",
    "client": "cd client && npm run dev",
    "ml":     "cd ml-service && uvicorn main:app --reload --port 8000",
    "train":  "cd ml-service && python model/train.py",
    "seed":   "cd server && node scripts/seedDemoChildren.js"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

---

## DEMO CHILD PROFILES (server/scripts/seedDemoChildren.js)

```javascript
// Run: npm run seed
// Pre-loads 3 children for live demo

const mongoose = require('mongoose');
require('dotenv').config();

const demoChildren = [
  {
    name: "Aryan",
    age: 6,
    diagnosisLevel: "Level 2 - Moderate",
    communicationLevel: "Emerging Verbal",
    interests: ["dinosaurs", "trains", "wheels"],
    obsessionIntensity: "Intense",
    sensoryProfile: { hypersensitive: ["loud noises","bright lights"], hyposensitive: ["deep pressure"] },
    behavioralChallenges: ["meltdowns during transitions","hand-flapping"],
    learningStyle: "Visual",
    currentSkills: ["points to objects","follows 1-step commands"],
    targetGoals: ["eye contact 5 seconds","request objects verbally","tolerate transitions"],
    previousTherapyMonths: 3
  },
  {
    name: "Priya",
    age: 8,
    diagnosisLevel: "Level 1 - Mild",
    communicationLevel: "Functional Verbal",
    interests: ["minecraft","space","drawing","numbers"],
    obsessionIntensity: "Moderate",
    sensoryProfile: { hypersensitive: ["unexpected touch","certain textures"], hyposensitive: [] },
    behavioralChallenges: ["peer interaction difficulty","rigid routines","turn-taking"],
    learningStyle: "Visual",
    currentSkills: ["reads at grade level","strong memory","advanced math"],
    targetGoals: ["initiate peer conversation","emotional regulation","flexible thinking"],
    previousTherapyMonths: 12
  },
  {
    name: "Rohan",
    age: 4,
    diagnosisLevel: "Level 3 - Severe",
    communicationLevel: "Non-verbal",
    interests: ["water","bubbles","music","spinning objects"],
    obsessionIntensity: "Intense",
    sensoryProfile: { hypersensitive: ["crowded spaces","unexpected sounds"], hyposensitive: [], seeksBehaviors: ["spinning","water play"] },
    behavioralChallenges: ["self-stimming","elopement","no eye contact"],
    learningStyle: "Kinesthetic",
    currentSkills: ["responds to name occasionally","enjoys cause-effect toys"],
    targetGoals: ["functional communication via AAC","safety awareness","joint attention"],
    previousTherapyMonths: 1
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Child = require('../models/Child');
  const User  = require('../models/User');
  const bcba  = await User.findOne();
  if (!bcba) return console.log('Create a BCBA account first via /api/auth/register');
  for (const c of demoChildren) {
    await Child.findOneAndUpdate({ name: c.name, bcbaId: bcba._id }, { ...c, bcbaId: bcba._id }, { upsert: true });
  }
  console.log('3 demo children seeded');
  process.exit(0);
}

seed();
```

---

## AWS DEPLOYMENT (No Docker — Pure Simple)

```bash
# On your AWS EC2 instance (Ubuntu)

# 1. Install Node
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install Python
sudo apt install python3-pip python3-venv -y

# 3. Install PM2
npm install -g pm2

# 4. Clone your repo
git clone https://github.com/yourrepo/bcba-copilot.git
cd bcba-copilot

# 5. Setup server
cd server && npm install
pm2 start server.js --name bcba-server

# 6. Setup ML service
cd ../ml-service
pip3 install -r requirements.txt
python3 model/train.py              # train model once
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name bcba-ml

# 7. Build and serve frontend
cd ../client && npm install && npm run build
# serve via Express static OR nginx

# 8. Seed demo data
cd .. && npm run seed

pm2 save
pm2 startup
```

---

## BUILD ORDER (Follow exactly. Do not skip steps.)

```
━━━ PHASE 1: Backend Foundation (Hours 0–4) ━━━
[ ] 1.  cd server && npm init -y
[ ] 2.  npm install express mongoose bcryptjs jsonwebtoken cors dotenv express-rate-limit @anthropic-ai/sdk axios bull
[ ] 3.  npm install -D nodemon
[ ] 4.  server/config/db.js — MongoDB Atlas connect
[ ] 5.  All 4 models: User.js, Child.js, Program.js, SessionLog.js
[ ] 6.  server/app.js + server/server.js (entry point)
[ ] 7.  Auth: authController + /api/auth routes + JWT middleware
[ ] 8.  Child: childController + /api/children CRUD routes
[ ] 9.  TEST: register BCBA, login, create child via Postman

━━━ PHASE 2: ML Service (Hours 4–8) ━━━
[ ] 10. cd ml-service && pip install -r requirements.txt
[ ] 11. python model/train.py → confirm xgboost_model.pkl saved
[ ] 12. main.py + all 4 route files (health, predict, embed, decay)
[ ] 13. uvicorn main:app --reload
[ ] 14. TEST /predict via Postman with sample child JSON
[ ] 15. TEST /embed/store + /embed/similar with 2 children

━━━ PHASE 3: Generation Pipeline (Hours 8–14) ━━━
[ ] 16. All 4 prompt builders in server/utils/
[ ] 17. claudeService.js (all 4 functions)
[ ] 18. mlService.js (calls Python /predict)
[ ] 19. chromaService.js (calls Python /embed/similar)
[ ] 20. programQueue.js (all 10 steps)
[ ] 21. programController.js + /api/programs routes
[ ] 22. TEST: POST /api/programs/generate → poll status → get program
[ ] 23. MUST WORK END TO END before touching frontend

━━━ PHASE 4: Live Session (Hours 14–16) ━━━
[ ] 24. sessionController.js + /api/sessions routes
[ ] 25. Pivot logic: 3 ❌ → claudeService.generateInstantPivot()

━━━ PHASE 5: Frontend (Hours 16–22) ━━━
[ ] 26. cd client && npm create vite@latest . -- --template react
[ ] 27. npm install tailwindcss @tanstack/react-query recharts framer-motion zustand axios react-router-dom
[ ] 28. client/src/api/axios.js (base URL + JWT interceptor)
[ ] 29. Login.jsx + Register.jsx + ProtectedRoute.jsx
[ ] 30. Dashboard.jsx with StatsCard + CostTracker
[ ] 31. ChildProfileForm.jsx (5-step wizard)
[ ] 32. ProgramGenerator.jsx (trigger + job polling every 2s)
[ ] 33. ProgramDisplay.jsx with ALL panels:
        → OutcomePredictorPanel (Recharts bar — SHAP values)
        → DigitalTwinPanel (Recharts area — 6-month projection)
        → ActivityCard x6-8 (themed, gamified)
        → TherapistScript
        → ParentHomePlan
        → DecayPredictor (plateau week callout)
[ ] 34. LiveSession.jsx (ResistanceTracker ✅/❌ + pivot trigger)
[ ] 35. Analytics.jsx (Recharts line + cost breakdown)

━━━ PHASE 6: Demo Prep (Hours 22–24) ━━━
[ ] 36. npm run seed (load 3 demo children)
[ ] 37. Full end-to-end run with Aryan — time it (target < 5 min)
[ ] 38. Full end-to-end run with Priya
[ ] 39. Test live session pivot with Rohan
[ ] 40. Polish loading states, error messages
[ ] 41. Push to GitHub
[ ] 42. Deploy to AWS EC2
```

---

## COST VALIDATION (For Finals Submission)

| Component | Per Program | Notes |
|-----------|------------|-------|
| Claude Haiku — main program | ₹0.081 | ~2000 in + 1500 out tokens |
| Claude Haiku — digital twin | ₹0.021 | ~500 in + 300 out tokens |
| Claude Haiku — 6 pivots pre-gen | ₹0.018 | ~300 in + 200 out × 6 |
| Claude Haiku — decay (fallback) | ₹0.004 | only if ML unavailable |
| MongoDB Atlas M0 | ₹0 | free tier |
| ChromaDB | ₹0 | self-hosted |
| sentence-transformers | ₹0 | local inference |
| Upstash Redis | ₹0 | free tier |
| AWS EC2 | ₹0 | organizer provided |
| **TOTAL** | **₹0.124** | |

**At scale (cost per program):**

| Users | Programs/month | Claude cost | Redis cache hit rate | Effective cost |
|-------|---------------|-------------|---------------------|----------------|
| 100 | 500 | ₹0.124 | 0% | ₹0.124 |
| 1,000 | 5,000 | ₹0.098 | 20% cache hits | ₹0.099 |
| 10,000 | 50,000 | ₹0.081 | 40% cache hits | ₹0.074 |
| 100,000 | 500,000 | ₹0.065 | 60% cache hits | ₹0.052 |

---

## THE 4 INNOVATIONS (Rehearse for Q&A)

| Stream | Innovation | Pitch Line |
|--------|-----------|-----------|
| Outcome Predictor | Intervention Decay Prediction | "We predict when therapy stops working before it does" |
| Personalization | Semantic Interest Graph RAG | "We match children by what their obsessions mean, not just what they are" |
| Engagement | Live Resistance Pivot in 10 seconds | "When a child resists mid-session, therapy adapts in 10 seconds" |
| Efficiency | BCBA Ghost Mode + Digital Twin | "Plans sound like the therapist wrote them. Progress projected 6 months forward." |

**Final pitch:**
"BCBA Copilot is the first clinical AI that predicts when a child's therapy will plateau before it happens, adapts mid-session in real time, and projects progress 6 months forward — all for ₹0.124 per program versus ₹56,000 manually."

---

## SWAPPING MAAM'S MODEL (When She Sends It)

**3 steps. 30 minutes. Zero disruption.**

```
Step 1: Drop her model file into ml-service/model/saved/
        e.g. maams_model.pkl

Step 2: Open ml-service/routes/predict.py
        Change line: model = joblib.load("model/saved/xgboost_model.pkl")
        To:          model = joblib.load("model/saved/maams_model.pkl")

Step 3: Update FEATURES list to match her model's expected column names
        (ask her for the exact column names)

That's it. Frontend, backend, Claude, ChromaDB — nothing changes.
```

---
*BCBA Copilot PRD v3.0 — Build-ready. No fluff. Start Phase 1.*
