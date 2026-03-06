const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:                   { type: String, required: true, trim: true },
  email:                  { type: String, required: true, unique: true, lowercase: true },
  password:               { type: String, required: true, minlength: 8 },
  licenseNumber:          { type: String, required: true },
  organization:           { type: String },
  approvedProgramTexts:   [String],
  totalProgramsGenerated: { type: Number, default: 0 },
  totalCostInr:           { type: Number, default: 0 },
  createdAt:              { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
