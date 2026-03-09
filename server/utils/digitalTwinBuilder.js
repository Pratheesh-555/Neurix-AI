function buildDigitalTwinPrompt(child, program, mlResult) {
  return `You are a clinical AI generating a realistic 6-month therapy progress projection.

CHILD: ${child.name}, Age ${child.age}, ${child.diagnosisLevel}, ${child.communicationLevel}
THERAPY GOALS: ${program.goals.join(', ')}
PREDICTED SUCCESS RATE: ${mlResult.successProbability}%
ASSUMED FREQUENCY: 3 sessions per week

Respond with VALID JSON ONLY. No markdown. No preamble.
Be realistic and measurable. No vague statements.

{
  "conditionedOn": "Consistent therapy 3x per week as planned",
  "projectedOutcomes": [
    {
      "metric": "specific measurable metric e.g. Eye contact duration",
      "currentBaseline": "current measurable state",
      "projectedAt3Months": "realistic 3-month target",
      "projectedAt6Months": "realistic 6-month target"
    }
  ]
}

Generate 4 projections for: communication, social interaction, behavioral regulation, skill acquisition.`;
}

module.exports = { buildDigitalTwinPrompt };
