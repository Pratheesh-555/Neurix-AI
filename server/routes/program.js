const express = require('express');
const router  = express.Router();

const {
  generate,
  getStatus,
  getProgram,
  getProgramHistory,
  approveProgram,
} = require('../controllers/programController');

const { protect }           = require('../middleware/authMiddleware');
const { programGenLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.post('/generate',             programGenLimiter, generate);
router.get('/status/:jobId',         getStatus);
router.get('/child/:childId',        getProgramHistory);
router.get('/:id',                   getProgram);
router.post('/:id/approve',          approveProgram);

module.exports = router;
