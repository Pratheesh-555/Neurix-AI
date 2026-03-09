const Anthropic = require('@anthropic-ai/sdk');
const { buildDigitalTwinPrompt } = require('../utils/digitalTwinBuilder');
const { buildPivotPrompt }       = require('../utils/pivotPromptBuilder');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function parseJSON(text) {
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

async function callHaiku(prompt, maxTokens = 4096) {
  const res = await client.messages.create({
    model:      'claude-haiku-4-5',
    max_tokens: maxTokens,
    messages:   [{ role: 'user', content: prompt }]
  });
  return res.content[0].text;
}

async function generateProgram(prompt) {
  const text = await callHaiku(prompt, 4096);
  return parseJSON(text);
}

async function generateDigitalTwin(child, program, mlResult) {
  const prompt = buildDigitalTwinPrompt(child, program, mlResult);
  const text   = await callHaiku(prompt, 1024);
  return parseJSON(text);
}

async function generatePivots(program, child) {
  const withPivots = await Promise.all(
    program.activities.map(async (activity) => {
      const prompt = buildPivotPrompt(child, activity);
      const text   = await callHaiku(prompt, 512);
      const pivot  = parseJSON(text);
      return { ...activity, pivotActivity: pivot };
    })
  );
  return { ...program, activities: withPivots };
}

async function generateInstantPivot(child, failedActivity) {
  const prompt = buildPivotPrompt(child, failedActivity);
  const text   = await callHaiku(prompt, 512);
  return parseJSON(text);
}

module.exports = { generateProgram, generateDigitalTwin, generatePivots, generateInstantPivot };
