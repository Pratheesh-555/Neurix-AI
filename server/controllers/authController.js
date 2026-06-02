const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { verifyGoogleToken } = require('../services/googleAuth.service');

// ── helpers ────────────────────────────────────────────────────────────────

function signToken(id, expiresIn) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '24h',
  });
}

function sendToken(user, statusCode, res) {
  const token = signToken(user._id);
  // strip password before sending
  const userObj = user.toObject();
  delete userObj.password;
  res.status(statusCode).json({ token, user: userObj });
}

// ── controllers ────────────────────────────────────────────────────────────

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, licenseNumber, organization } = req.body;

    if (!name || !email || !password || !licenseNumber) {
      return res.status(400).json({ error: 'name, email, password, and licenseNumber are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, licenseNumber, organization, profileComplete: true });
    sendToken(user, 201, res);
  } catch (err) {
    console.error('register error:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    console.error('login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
};

// POST /api/auth/google
// Accepts the Google access_token from the frontend, verifies it via Google userinfo, and either:
//  - issues a full JWT (returning user or user with licenseNumber already set)
//  - issues a short-lived "temp" JWT + needsProfile flag (new Google user without licenseNumber)
const googleSignIn = async (req, res) => {
  try {
    const { idToken: accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: 'idToken (access token) is required' });

    // 1. Verify with Google userinfo endpoint
    const { googleId, email, name, picture } = await verifyGoogleToken(accessToken);


    // 2. Find existing user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Link googleId if they previously signed up with email/password
      if (!user.googleId) {
        user.googleId = googleId;
        user.picture  = user.picture || picture;
        await user.save();
      }
    } else {
      // 3. Brand new user — create a stub (profileComplete = false until licenseNumber is set)
      user = await User.create({ name, email, googleId, picture, profileComplete: false });
    }

    // 4. If the user has no licenseNumber yet, send a short-lived temp token
    if (!user.licenseNumber) {
      const tempToken = signToken(user._id, '30m'); // 30 min to complete profile
      const userObj = user.toObject();
      delete userObj.password;
      return res.json({ needsProfile: true, tempToken, user: userObj });
    }

    // 5. Fully onboarded — issue the normal JWT
    sendToken(user, 200, res);
  } catch (err) {
    console.error('googleSignIn error:', err.message);
    res.status(401).json({ error: 'Google sign-in failed: ' + err.message });
  }
};

// POST /api/auth/complete-profile
// Called after Google sign-in when a user needs to add their licenseNumber
const completeProfile = async (req, res) => {
  try {
    const { licenseNumber, organization } = req.body;

    if (!licenseNumber) {
      return res.status(400).json({ error: 'licenseNumber is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { licenseNumber, organization, profileComplete: true },
      { new: true, select: '-password' }
    );

    sendToken(user, 200, res);
  } catch (err) {
    console.error('completeProfile error:', err.message);
    res.status(500).json({ error: 'Could not complete profile' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch user' });
  }
};

// PUT /api/auth/update-voice
// Saves a new approved program text to the BCBA's ghost-mode library (max 20 stored)
const updateVoice = async (req, res) => {
  try {
    const { programText } = req.body;
    if (!programText || typeof programText !== 'string' || programText.trim().length < 10) {
      return res.status(400).json({ error: 'programText must be a non-empty string (min 10 chars)' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { approvedProgramTexts: { $each: [programText.trim()], $slice: -20 } } },
      { new: true, select: '-password' }
    );

    res.json({ message: 'Voice sample saved', totalSamples: user.approvedProgramTexts.length });
  } catch (err) {
    console.error('updateVoice error:', err.message);
    res.status(500).json({ error: 'Could not save voice sample' });
  }
};

module.exports = { register, login, googleSignIn, completeProfile, getMe, updateVoice };
