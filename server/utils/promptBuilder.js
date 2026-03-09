function build(child, mlResult, decayResult, similarCases, bcba) {
  const voiceExamples = bcba.approvedProgramTexts?.length
    ? `\nMATCH THIS BCBA'S WRITING STYLE exactly. Examples:\n${bcba.approvedProgramTexts.slice(0, 3).join('\n---\n')}\n`
    : '';

  return `You are a senior Board Certified Behavior Analyst (BCBA) generating a complete, evidence-based ABA therapy program.

CHILD PROFILE:
Name: ${child.name} | Age: ${child.age} | Diagnosis: ${child.diagnosisLevel}
Communication: ${child.communicationLevel} | Learning Style: ${child.learningStyle}
Interests (use ALL of these): ${child.interests.join(', ')} | Obsession Intensity: ${child.obsessionIntensity}
AVOID these sensory triggers: ${child.sensoryProfile.hypersensitive.join(', ')}
Behavioral Challenges: ${child.behavioralChallenges.join(', ')}
Current Skills: ${child.currentSkills.join(', ')}
Target Goals: ${child.targetGoals.join(', ')}
Prior Therapy: ${child.previousTherapyMonths} months

ML INSIGHTS:
Predicted Success Rate: ${mlResult.successProbability}%  |  Confidence: ${mlResult.confidenceLevel}
Key predictive factors: ${mlResult.topFeatures.join(', ')}
Plateau expected: Week ${decayResult.estimatedPlateauWeek} — design activities to rotate before then

SIMILAR SUCCESSFUL CASES:
${similarCases.map((c, i) => `Case ${i + 1} (${Math.round(c.similarityScore * 100)}% match) — Interest overlap: ${c.interestOverlap.join(', ')} — What worked: ${c.effectiveApproaches.join(', ')}`).join('\n')}
${voiceExamples}

OUTPUT RULES:
- Respond with VALID JSON ONLY. No markdown. No explanation. No preamble.
- Every activity MUST be themed around the child's listed interests
- NEVER include the sensory triggers listed above
- Therapist script must be warm, child-directed, use child's first name
- Minimum 6 activities, maximum 8
- All JSON keys must match exactly as shown below

{
  "summary": "2-sentence program overview",
  "goals": ["goal1", "goal2", "goal3"],
  "activities": [
    {
      "id": "act_1",
      "name": "activity name",
      "theme": "interest-based theme e.g. Dinosaur Expedition",
      "objective": "skill this builds",
      "instructions": "step-by-step BCBA instructions",
      "duration": 10,
      "difficulty": "Easy",
      "successMetric": "measurable success indicator",
      "gamificationElement": "specific game mechanic",
      "reinforcementStrategy": "what reinforces correct behavior",
      "sensoryConsiderations": "how this avoids listed triggers"
    }
  ],
  "weeklySchedule": {
    "monday": ["act_1", "act_2"],
    "tuesday": ["act_3"],
    "wednesday": ["act_1", "act_4"],
    "thursday": ["act_2", "act_5"],
    "friday": ["act_3", "act_6"]
  },
  "parentHomeActivities": [
    {
      "name": "home activity name",
      "instructions": "simple parent-friendly instructions",
      "frequency": "daily OR 3x per week",
      "materials": ["item1", "item2"]
    }
  ],
  "therapistScript": "Complete word-for-word script. Use child's name. Include therapist prompts and expected child responses. Warm, encouraging tone.",
  "dataTrackingPlan": "Specific numeric tracking method"
}`;
}

module.exports = { build };
