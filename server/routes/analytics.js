const express  = require('express');
const router   = express.Router();
const { protect }                      = require('../middleware/authMiddleware');
const { overview, outcomes, shapSummary } = require('../controllers/analyticsController');

router.use(protect);

router.get('/overview',     overview);
router.get('/outcomes',     outcomes);
router.get('/shap-summary', shapSummary);

module.exports = router;
