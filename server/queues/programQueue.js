/**
 * In-process job queue — drop-in replacement for Bull.
 *
 * Why: Upstash Redis wire protocol (port 6380) is blocked on this network.
 *      Bull requires a persistent TCP connection to Redis; it cannot use the
 *      REST API.  This implementation stores jobs in memory and processes them
 *      in the background using plain async/await — no external dependencies.
 *
 * Public API (mirrors Bull exactly so programController.js needs zero changes):
 *   queue.add(data, opts)    → Promise<{ id }>
 *   queue.getJob(id)         → Promise<Job | null>
 *   queue.process(fn)        → registers async job processor
 *   queue.on('failed', fn)   → registers failure hook
 *
 * Job object API:
 *   job.id                   → string
 *   job.data                 → the payload passed to add()
 *   job.getState()           → Promise<'waiting'|'active'|'completed'|'failed'>
 *   job._progress            → number 0–100
 *   job.progress(n)          → Promise<void>  (sets _progress)
 *   job.returnvalue          → result returned by processor (set on completion)
 */

const { EventEmitter } = require('events');

const Child   = require('../models/Child');
const User    = require('../models/User');
const Program = require('../models/Program');

const claudeService  = require('../services/claudeService');
const mlService      = require('../services/mlService');
const chromaService  = require('../services/chromaService');
const promptBuilder  = require('../utils/promptBuilder');

// ── Job class ────────────────────────────────────────────────────────────────
let _nextId = 1;

class Job {
  constructor(data) {
    this.id          = String(_nextId++);
    this.data        = data;
    this.state       = 'waiting';   // waiting | active | completed | failed
    this._progress   = 0;
    this.returnvalue = null;
    this.failReason  = null;
  }

  // Bull-compatible async getter
  async getState() { return this.state; }

  // Bull-compatible progress setter (called as: await job.progress(n))
  async progress(n) { this._progress = n; }
}

// ── Queue class ──────────────────────────────────────────────────────────────
class InProcessQueue extends EventEmitter {
  constructor() {
    super();
    this._jobs      = new Map();   // id → Job
    this._processor = null;        // set via .process()
  }

  // Register the async processor function (called once at startup)
  process(fn) {
    this._processor = fn;
  }

  // Enqueue a new job and kick it off asynchronously
  async add(data /*, opts — accepted but ignored */) {
    if (!this._processor) throw new Error('No processor registered');
    const job = new Job(data);
    this._jobs.set(job.id, job);

    // Run in background — don't await here
    setImmediate(() => this._run(job));

    return job;
  }

  // Retrieve a job by id (Bull returns null for unknown ids)
  async getJob(id) {
    return this._jobs.get(String(id)) || null;
  }

  // Internal: execute the job and update its state
  async _run(job) {
    job.state = 'active';
    try {
      job.returnvalue = await this._processor(job);
      job.state       = 'completed';
      job._progress   = 100;
    } catch (err) {
      job.state     = 'failed';
      job.failReason = err.message;
      this.emit('failed', job, err);
    }
  }
}

// ── Singleton queue ──────────────────────────────────────────────────────────
const programQueue = new InProcessQueue();

// ── 10-step generation pipeline ──────────────────────────────────────────────
programQueue.process(async (job) => {
  const { childId, bcbaId } = job.data;
  const start = Date.now();

  // STEP 1 — Load child + BCBA
  await job.progress(10);
  const child = await Child.findById(childId);
  const bcba  = await User.findById(bcbaId);
  if (!child || !bcba) throw new Error('Child or BCBA not found');

  // STEP 2 — ML Prediction
  await job.progress(20);
  const mlResult = await mlService.predict(child);

  // STEP 3 — Decay Prediction
  await job.progress(30);
  const decayResult = await mlService.predictDecay(child);

  // STEP 4 — ChromaDB RAG
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
    childId,
    bcbaId,
    jobId:            job.id,
    status:           'completed',
    generationTimeMs: Date.now() - start,
    costInr:          0.124,
    mlPrediction:     { ...mlResult, decayPrediction: decayResult },
    similarProfiles:  similarCases,
    digitalTwin,
    program:          programWithPivots
  });

  // STEP 10 — Update BCBA usage stats
  await User.findByIdAndUpdate(bcbaId, {
    $inc: { totalProgramsGenerated: 1, totalCostInr: 0.124 }
  });

  await job.progress(100);
  return { programId: saved._id };
});

// ── Error logging ─────────────────────────────────────────────────────────────
programQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.stack || err.message || err);
  // Mark the placeholder program doc as failed
  Program.findOneAndUpdate(
    { jobId: job.id },
    { status: 'failed' }
  ).catch(() => {});
});

module.exports = programQueue;
