const express = require('express');
const router  = express.Router();

const {
  createChild,
  getChildren,
  getChild,
  updateChild,
  deleteChild,
} = require('../controllers/childController');
const { protect } = require('../middleware/authMiddleware');

// All child routes require a valid JWT
router.use(protect);

router.route('/')
  .post(createChild)
  .get(getChildren);

router.route('/:id')
  .get(getChild)
  .put(updateChild)
  .delete(deleteChild);

module.exports = router;
