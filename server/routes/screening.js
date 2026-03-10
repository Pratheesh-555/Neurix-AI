const express    = require('express');
const router     = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { submitScreening, getScreeningHistory, getScreening } = require('../controllers/screeningController');

router.use(protect);

router.post('/',                 submitScreening);      // POST /api/screening
router.get('/child/:childId',    getScreeningHistory);  // GET  /api/screening/child/:childId
router.get('/:id',               getScreening);         // GET  /api/screening/:id

module.exports = router;
