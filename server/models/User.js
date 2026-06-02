const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:                   { type: String, required: true, trim: true },
  email:                  { type: String, required: true, unique: true, lowercase: true },
  // password is optional — Google OAuth users won't have one
  password:               { type: String, minlength: 8, select: false },
  // Google OAuth fields
  googleId:               { type: String, sparse: true, unique: true },
  picture:                { type: String },
  // Profile fields (licenseNumber required for full access)
  licenseNumber:          { type: String },
  organization:           { type: String },
  profileComplete:        { type: Boolean, default: false },
  approvedProgramTexts:   [String],
  totalProgramsGenerated: { type: Number, default: 0 },
  totalCostInr:           { type: Number, default: 0 },
  createdAt:              { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
