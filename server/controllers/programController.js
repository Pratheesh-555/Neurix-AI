const Program      = require('../models/Program');
const Child        = require('../models/Child');
const User         = require('../models/User');
const programQueue = require('../queues/programQueue');

// POST /api/programs/generate
const generate = async (req, res) => {
  try {
    const { childId } = req.body;
    if (!childId) return res.status(400).json({ error: 'childId is required' });

    const child = await Child.findOne({ _id: childId, bcbaId: req.user._id });
    if (!child) return res.status(404).json({ error: 'Child not found' });

    // Create a placeholder program doc so we can track status before job finishes
    const program = await Program.create({
      childId,
      bcbaId: req.user._id,
      status: 'queued'
    });

    const job = await programQueue.add(
      { childId, bcbaId: req.user._id.toString() },
      { attempts: 2, backoff: { type: 'fixed', delay: 5000 }, removeOnComplete: false }
    );

    // Store jobId in the program doc
    program.jobId = job.id;
    await program.save();

    res.status(202).json({ jobId: job.id, programId: program._id });
  } catch (err) {
    console.error('generate error:', err.message);
    res.status(500).json({ error: 'Failed to queue program generation' });
  }
};

// GET /api/programs/status/:jobId
const getStatus = async (req, res) => {
  try {
    const job = await programQueue.getJob(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const state    = await job.getState();   // waiting | active | completed | failed
    const progress = job._progress || 0;

    let programId = null;
    if (state === 'completed') {
      const result = job.returnvalue;
      programId = result?.programId || null;
    }

    res.json({ jobId: job.id, state, progress, programId });
  } catch (err) {
    console.error('getStatus error:', err.message);
    res.status(500).json({ error: 'Could not fetch job status' });
  }
};

// GET /api/programs/:id
const getProgram = async (req, res) => {
  try {
    const program = await Program.findOne({ _id: req.params.id, bcbaId: req.user._id })
      .populate('childId', 'name age diagnosisLevel')
      .lean();
    if (!program) return res.status(404).json({ error: 'Program not found' });
    res.json({ program });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch program' });
  }
};

// GET /api/programs/child/:childId
const getProgramHistory = async (req, res) => {
  try {
    const programs = await Program.find({
      childId: req.params.childId,
      bcbaId:  req.user._id
    })
      .sort({ createdAt: -1 })
      .select('status costInr generationTimeMs createdAt mlPrediction.successProbability')
      .lean();
    res.json({ programs });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch program history' });
  }
};

// POST /api/programs/:id/approve  — saves program text to BCBA ghost mode
const approveProgram = async (req, res) => {
  try {
    const program = await Program.findOne({ _id: req.params.id, bcbaId: req.user._id });
    if (!program) return res.status(404).json({ error: 'Program not found' });
    if (program.status !== 'completed') {
      return res.status(400).json({ error: 'Can only approve completed programs' });
    }

    const snippet = [
      program.program?.summary,
      program.program?.therapistScript?.slice(0, 300)
    ].filter(Boolean).join('\n');

    await User.findByIdAndUpdate(req.user._id, {
      $push: { approvedProgramTexts: { $each: [snippet], $slice: -20 } }
    });

    res.json({ message: 'Program approved and added to your writing style' });
  } catch (err) {
    console.error('approveProgram error:', err.message);
    res.status(500).json({ error: 'Could not approve program' });
  }
};

module.exports = { generate, getStatus, getProgram, getProgramHistory, approveProgram };
