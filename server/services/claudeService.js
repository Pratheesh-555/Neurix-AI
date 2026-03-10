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

module.exports = { generateProgram, generateDigitalTwin, generatePivots, generateInstantPivot };
