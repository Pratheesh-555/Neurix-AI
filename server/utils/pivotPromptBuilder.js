function buildPivotPrompt(child, failedActivity) {
  return `A child resisted this therapy activity 3 times in a row. Generate one alternative activity for the same goal.

CHILD: ${child.name}, Age ${child.age}
Interests: ${child.interests.join(', ')}
Sensory triggers to avoid: ${child.sensoryProfile.hypersensitive.join(', ')}

FAILED ACTIVITY:
Name: ${failedActivity.name}
Objective: ${failedActivity.objective}
Why it likely failed: child resisted engagement

Respond with VALID JSON ONLY. No markdown. No preamble.
Make the alternative simpler, more interest-driven, lower effort, higher reward.

{
  "id": "pivot_${failedActivity.id}",
  "name": "alternative activity name",
  "theme": "use child's interest",
  "objective": "${failedActivity.objective}",
  "instructions": "simpler, more playful version",
  "duration": 5,
  "difficulty": "Easy",
  "successMetric": "lower bar than original",
  "gamificationElement": "high reward, low effort mechanic"
}`;
}

module.exports = { buildPivotPrompt };
