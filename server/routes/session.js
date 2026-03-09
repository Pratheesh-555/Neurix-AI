const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { start, logActivity, pivot, getSummary } = require('../controllers/sessionController');

router.use(protect);   // all session routes require auth

router.post('/',           start);           // POST /api/sessions/start  (body: { programId })
router.post('/:id/log',    logActivity);     // POST /api/sessions/:id/log
router.post('/:id/pivot',  pivot);           // POST /api/sessions/:id/pivot
router.get('/:id/summary', getSummary);      // GET  /api/sessions/:id/summary

module.exports = router;
