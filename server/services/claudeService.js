// LLM provider: OpenAI — swap MODEL here to change model
const OpenAI = require('openai');
const { buildDigitalTwinPrompt } = require('../utils/digitalTwinBuilder');
const { buildPivotPrompt }       = require('../utils/pivotPromptBuilder');

const MODEL = 'gpt-4o-mini'; // change this to swap models e.g. gpt-4o

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function parseJSON(text) {
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

async function callLLM(prompt, maxTokens = 4096) {
  const res = await client.chat.completions.create({
    model:      MODEL,
    max_tokens: maxTokens,
    messages:   [{ role: 'user', content: prompt }],
  });
  return res.choices[0].message.content;
}

async function generateProgram(prompt) {
  const text = await callLLM(prompt, 4096);
  return parseJSON(text);
}

async function generateDigitalTwin(child, program, mlResult) {
  const prompt = buildDigitalTwinPrompt(child, program, mlResult);
  const text   = await callLLM(prompt, 1024);
  return parseJSON(text);
}

async function generatePivots(program, child) {
  const withPivots = await Promise.all(
    program.activities.map(async (activity) => {
      const prompt = buildPivotPrompt(child, activity);
      const text   = await callLLM(prompt, 512);
      const pivot  = parseJSON(text);
      return { ...activity, pivotActivity: pivot };
    })
  );
  return { ...program, activities: withPivots };
}

async function generateInstantPivot(child, failedActivity) {
  const prompt = buildPivotPrompt(child, failedActivity);
  const text   = await callLLM(prompt, 512);
  return parseJSON(text);
}

async function generateScreeningInterpretation(child, answers, totalScore, riskLevel, sessionSnapshot, questions) {
  const domainCounts = {};
  questions.forEach((q, i) => {
    if (answers[i] === 1) domainCounts[q.domain] = (domainCounts[q.domain] || 0) + 1;
  });

  const domainSummary = Object.entries(domainCounts)
    .map(([d, n]) => `${d}: ${n} concern(s)`).join(', ') || 'No concerns flagged';

  const flaggedLines = questions
    .map((q, i) => `Q${q.id} [${q.domain}]: ${q.text}\n   → ${answers[i] === 1 ? 'CONCERN FLAGGED' : 'No concern'}`)
    .join('\n');

  const prompt = `You are a clinical autism screening assistant helping a BCBA interpret behavioral assessment results.

CHILD PROFILE:
- Name: ${child.name}, Age: ${child.age} years
- Current Diagnosis: ${child.diagnosisLevel}
- Communication: ${child.communicationLevel}
- Learning Style: ${child.learningStyle || 'Not documented'}
- Behavioral Challenges: ${(child.behavioralChallenges || []).join(', ') || 'None noted'}

SCREENING RESULTS:
- Total Score: ${totalScore}/20
- Risk Level: ${riskLevel}
- Domain Breakdown: ${domainSummary}

DETAILED RESPONSES:
${flaggedLines}

SESSION BEHAVIORAL DATA (from ${sessionSnapshot.totalSessions} recorded therapy sessions):
- Average Engagement Score: ${sessionSnapshot.avgEngagementScore}%
- Resistance Rate: ${sessionSnapshot.resistanceRate}% of logged activities
- Pivot Rate: ${sessionSnapshot.pivotRate}% of logged activities

Provide a focused clinical interpretation in 4 sentences:
1. Summarise the primary behavioral pattern indicated by the screening.
2. Note whether the session data supports or contrasts with the screening findings.
3. Identify the highest-priority domain warranting clinical follow-up.
4. Give one specific, actionable recommendation for the BCBA.

Write in plain text. No bullet points. No JSON. Be direct and clinically precise.`;

  return callLLM(prompt, 600);
}

module.exports = { generateProgram, generateDigitalTwin, generatePivots, generateInstantPivot, generateScreeningInterpretation };
