/**
 * Builds the master Claude prompt.
 * Now includes a CLINICAL EVIDENCE section grounded in the
 * DREAM dataset (ADOS baselines) and Mendeley library (activities).
 */

function _formatEvidenceCase(c, index) {
  const match   = Math.round(c.similarityScore * 100);
  const source  = c.source === 'dream_dataset' ? 'DREAM Clinical Study' :
                  c.source === 'mendeley_indonesia' ? 'Mendeley Therapy Library' :
                  'Historical Case';
  const ados    = c.adosTotal && c.adosTotal !== 'unknown' ? `ADOS Total: ${c.adosTotal}` : '';
  const proto   = c.protocol ? `Protocol: ${c.protocol}` : '';
  const domain  = c.therapyDomain ? `Domain: ${c.therapyDomain}` : '';
  const outcome = c.successLabel === 'success' ? '✓ Successful Outcome' :
                  c.successLabel === 'partial_success' ? '~ Partial Outcome' : '';
  const approaches = c.effectiveApproaches?.length
    ? c.effectiveApproaches.slice(0, 4).join('; ')
    : 'N/A';

  return [
    `Case ${index + 1} [${source}] — ${match}% profile match`,
    [ados, proto, domain, outcome].filter(Boolean).join(' | '),
    `Effective approaches: ${approaches}`,
  ].filter(Boolean).join('\n  ');
}

function build(child, mlResult, decayResult, similarCases, bcba) {
  const voiceExamples = bcba.approvedProgramTexts?.length
    ? `\nMATCH THIS BCBA'S WRITING STYLE exactly. Examples:\n${bcba.approvedProgramTexts.slice(0, 3).join('\n---\n')}\n`
    : '';

  const evidenceBlock = similarCases.length
    ? similarCases.map((c, i) => _formatEvidenceCase(c, i)).join('\n\n')
    : 'No historical cases found — generate based on child profile alone.';

  const hasRealEvidence = similarCases.some(
    c => c.source === 'dream_dataset' || c.source === 'mendeley_indonesia'
  );

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

ML INSIGHTS (XGBoost):
Predicted Success Rate: ${mlResult.successProbability}%  |  Confidence: ${mlResult.confidenceLevel}
Key predictive factors: ${mlResult.topFeatures.join(', ')}
Plateau expected: Week ${decayResult.estimatedPlateauWeek} — rotate activities before then
${voiceExamples}
CLINICAL EVIDENCE BASE:
${hasRealEvidence ? 'The following cases are sourced from the DREAM Clinical Study and the Mendeley Therapy Library. You MUST use these as the primary basis for your activity selection.' : ''}

${evidenceBlock}

OUTPUT RULES:
- Respond with VALID JSON ONLY. No markdown. No explanation. No preamble.
- Every activity MUST be themed around the child's listed interests
- NEVER include the sensory triggers listed above
- Each activity's "evidenceSource" field MUST reference which case above inspired it
- Therapist script must be warm, child-directed, use child's first name
- Minimum 6 activities, maximum 8
- All JSON keys must match exactly as shown below

{
  "summary": "2-sentence program overview referencing the clinical evidence",
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
      "sensoryConsiderations": "how this avoids listed triggers",
      "evidenceSource": "cite the Case number and dataset name from above"
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
  "dataTrackingPlan": "Specific numeric tracking method",
  "evidenceRationale": "2-3 sentences explaining how the DREAM and Mendeley evidence influenced this specific plan"
}`;
}

module.exports = { build };
