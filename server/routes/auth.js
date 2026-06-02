const express = require('express');
const router  = express.Router();

const { register, login, googleSignIn, completeProfile, getMe, updateVoice } = require('../controllers/authController');
const { protect }     = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register',          authLimiter, register);
router.post('/login',             authLimiter, login);
router.post('/google',            authLimiter, googleSignIn);
router.post('/complete-profile',  protect,     completeProfile);
router.get('/me',                 protect,     getMe);
router.put('/update-voice',       protect,     updateVoice);

module.exports = router;
