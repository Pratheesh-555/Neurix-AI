function buildDecayPrompt(child, program) {
  return `Predict when this ABA therapy program will plateau for this child.

CHILD: Age ${child.age}, ${child.diagnosisLevel}, Obsession intensity: ${child.obsessionIntensity}
ACTIVITIES: ${program.activities?.map(a => a.name).join(', ') || 'Not yet generated'}
PRIOR THERAPY: ${child.previousTherapyMonths} months

Respond with VALID JSON ONLY. No markdown. No preamble.

{
  "estimatedPlateauWeek": 8,
  "decayReason": "specific clinical reason engagement drops",
  "earlyWarningSignals": ["signal1", "signal2"],
  "rotationRecommendation": "what to introduce to prevent plateau"
}`;
}

module.exports = { buildDecayPrompt };
