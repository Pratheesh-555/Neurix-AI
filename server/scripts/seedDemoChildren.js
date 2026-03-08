require('dotenv').config({ override: true, path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const demoChildren = [
  {
    name: 'Aryan',
    age: 6,
    diagnosisLevel: 'Level 2 - Moderate',
    communicationLevel: 'Emerging Verbal',
    interests: ['dinosaurs', 'trains', 'wheels'],
    obsessionIntensity: 'Intense',
    sensoryProfile: {
      hypersensitive: ['loud noises', 'bright lights'],
      hyposensitive: ['deep pressure'],
      seeksBehaviors: [],
    },
    learningStyle: 'Visual',
    behavioralChallenges: ['meltdowns', 'elopement'],
    targetGoals: ['eye contact', 'requesting using words', 'turn-taking'],
    previousTherapyMonths: 3,
  },
  {
    name: 'Priya',
    age: 8,
    diagnosisLevel: 'Level 1 - Mild',
    communicationLevel: 'Functional Verbal',
    interests: ['minecraft', 'space', 'drawing', 'numbers'],
    obsessionIntensity: 'Moderate',
    sensoryProfile: {
      hypersensitive: [],
      hyposensitive: [],
      seeksBehaviors: [],
    },
    learningStyle: 'Visual',
    behavioralChallenges: ['anxiety', 'rigid routines'],
    targetGoals: ['peer interaction', 'flexible thinking', 'emotional regulation'],
    previousTherapyMonths: 12,
  },
  {
    name: 'Rohan',
    age: 4,
    diagnosisLevel: 'Level 3 - Severe',
    communicationLevel: 'Non-verbal',
    interests: ['water', 'bubbles', 'music', 'spinning objects'],
    obsessionIntensity: 'Intense',
    sensoryProfile: {
      hypersensitive: [],
      hyposensitive: [],
      seeksBehaviors: ['spinning', 'water play'],
    },
    learningStyle: 'Kinesthetic',
    behavioralChallenges: ['self-injurious behavior', 'aggression', 'limited attention'],
    targetGoals: ['AAC device use', 'following 1-step instructions', 'joint attention'],
    previousTherapyMonths: 1,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Child = require('../models/Child');
  const User  = require('../models/User');

  const bcba = await User.findOne();
  if (!bcba) {
    console.log('Create a BCBA account first via /api/auth/register');
    process.exit(1);
  }

  for (const c of demoChildren) {
    await Child.findOneAndUpdate(
      { name: c.name, bcbaId: bcba._id },
      { ...c, bcbaId: bcba._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`  ✓ ${c.name} (${c.diagnosisLevel})`);
  }

  console.log('\n3 demo children seeded successfully.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
