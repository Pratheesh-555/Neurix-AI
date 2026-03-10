const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { start, logActivity, pivot, getSummary, getSessions } = require('../controllers/sessionController');

router.use(protect);

router.get('/',            getSessions);     // GET  /api/sessions  (list all, ?childId= optional)
router.post('/',           start);           // POST /api/sessions  (body: { programId })
router.post('/:id/log',    logActivity);     // POST /api/sessions/:id/log
router.post('/:id/pivot',  pivot);           // POST /api/sessions/:id/pivot
router.get('/:id/summary', getSummary);      // GET  /api/sessions/:id/summary

module.exports = router;
