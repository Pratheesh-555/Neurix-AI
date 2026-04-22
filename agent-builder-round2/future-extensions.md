# Future Extensions

## Why This Exists
These ideas are valuable, and some are already represented in the codebase, but they should not clutter the main round-2 workflow. Use them only if judges ask what comes after the core agent.

## Extension 1: Live Session Pivot Agent
What it is:
Detect repeated resistance during a session and generate or retrieve an alternative activity.

Repo grounding:
- [sessionController.js](/D:/Projects/Neurix-AI/server/controllers/sessionController.js:1)
- [pivotService.js](/D:/Projects/Neurix-AI/server/services/pivotService.js:1)

Why it is not the centerpiece now:
It is a compelling feature, but it adds another workflow and can distract from the main plan-generation story.

## Extension 2: Digital Twin Projection
What it is:
Project the child's likely learning trajectory over time using generated or model-supported future estimates.

Repo grounding:
- [digitalTwinBuilder.js](/D:/Projects/Neurix-AI/server/utils/digitalTwinBuilder.js:1)
- [programQueue.js](/D:/Projects/Neurix-AI/server/queues/programQueue.js:1)

Why it is not the centerpiece now:
It is future-facing and innovative, but less immediate and less essential than the core intake-to-plan workflow.

## Extension 3: BCBA Ghost Mode
What it is:
Incorporate approved past program text so future drafts better match the therapist's writing style.

Repo grounding:
- [promptBuilder.js](/D:/Projects/Neurix-AI/server/utils/promptBuilder.js:1)
- [programController.js](/D:/Projects/Neurix-AI/server/controllers/programController.js:1)

Why it is not the centerpiece now:
It is useful for personalization, but it is an enhancement to generation quality rather than the main round-2 architecture story.

## Extension 4: Decay And Plateau Prediction
What it is:
Estimate when the current program may lose effectiveness and surface early signals for intervention changes.

Repo grounding:
- [mlService.js](/D:/Projects/Neurix-AI/server/services/mlService.js:1)
- [programQueue.js](/D:/Projects/Neurix-AI/server/queues/programQueue.js:1)

Why it is not the centerpiece now:
It strengthens the future product narrative, but the core round-2 flow should remain easy to explain in one pass.

## Recommended Judge Framing
If asked what comes next, say:
After establishing the core BCBA Copilot Agent for plan generation, we extend the platform into live session adaptation, trajectory forecasting, and therapist-specific personalization.
