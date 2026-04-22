# Agent Builder Round 2 Pack

## One-Line Goal
Design and present one clear GenAI agent workflow for Neurix AI:
`BCBA Copilot Agent -> child intake -> similar-case retrieval -> intervention prediction -> draft ABA plan -> explanation -> BCBA approval`.

## What This Round Is Really Asking For
This round is not asking us to present the entire product or prove every feature in the repo.
It is asking us to show a logical, node-based GenAI workflow with clear data flow, clear node responsibilities, and a believable end-to-end outcome.

The strongest version of our idea for this round is:
- one agent
- one main workflow
- one final output
- one clear human approval step

## What To Center
- Child intake as the starting point
- Retrieval of similar prior cases
- ML-based intervention support
- LLM-based ABA plan drafting
- Rationale and explainability
- BCBA review before final output

## What To De-Emphasize
These may exist in the repo, but they should not be the main round-2 story:
- live pivot generation
- digital twin projection
- BCBA ghost mode
- pricing and infra depth
- full platform positioning

## Source Of Truth In The Existing Repo
This pack is grounded in the current codebase:
- [programQueue.js](/D:/Projects/Neurix-AI/server/queues/programQueue.js:1) for the implemented multi-step generation pipeline
- [mlService.js](/D:/Projects/Neurix-AI/server/services/mlService.js:1) for prediction and decay calls
- [chromaService.js](/D:/Projects/Neurix-AI/server/services/chromaService.js:1) for similar-case retrieval
- [promptBuilder.js](/D:/Projects/Neurix-AI/server/utils/promptBuilder.js:1) for how context becomes the program-generation prompt
- [programController.js](/D:/Projects/Neurix-AI/server/controllers/programController.js:1) for queueing and retrieval flow

## How To Use This Folder
- Read `workflow.md` first to understand the node sequence.
- Read `data-flow.md` to explain what moves through each node.
- Use `submission-script.md` to speak consistently as a team.
- Use `future-extensions.md` only if judges ask what comes next.
- Fill `team-split-template.md` yourselves before the challenge.
