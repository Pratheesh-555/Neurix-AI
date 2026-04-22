# BCBA Copilot Agent Workflow

## Core Agent Statement
The BCBA Copilot Agent takes a structured child profile, gathers supporting evidence from similar cases and ML predictions, drafts a personalized ABA therapy plan, explains the basis for that draft, and then hands it to the BCBA for approval.

## Node-by-Node Workflow

### 1. Intake Node
Purpose:
Capture the child profile and therapy context.

Inputs:
- child demographics
- diagnosis level
- communication level
- interests
- sensory profile
- behavioral challenges
- current skills
- target goals
- therapy history

Outputs:
- normalized child profile object

Why it matters:
This is the foundation for all later decisions. If intake is weak, the agent is weak.

### 2. Validation Node
Purpose:
Check whether the profile is complete enough to generate a safe and useful draft.

Inputs:
- normalized child profile

Outputs:
- validated child profile
- missing-field flags or readiness status

Why it matters:
This lets us explain that the workflow is not a blind one-shot prompt. The system first verifies that it has enough context.

### 3. Similar-Case Retrieval Node
Purpose:
Find semantically similar past child profiles and surface approaches that previously worked.

Inputs:
- validated child profile

Outputs:
- similar case list
- similarity scores
- retrieved effective approaches
- overlapping interests or patterns

Repo grounding:
- retrieval logic is represented in [chromaService.js](/D:/Projects/Neurix-AI/server/services/chromaService.js:1)
- embedding search lives in [embed.py](/D:/Projects/Neurix-AI/ml-service/routes/embed.py:1)

### 4. Intervention Prediction Node
Purpose:
Estimate likely intervention suitability and provide decision support before generation.

Inputs:
- validated child profile

Outputs:
- success probability
- confidence level
- top predictive features
- explainability context

Repo grounding:
- service call is in [mlService.js](/D:/Projects/Neurix-AI/server/services/mlService.js:1)
- prediction endpoint is in [predict.py](/D:/Projects/Neurix-AI/ml-service/routes/predict.py:1)

### 5. Prompt Assembly Node
Purpose:
Combine the child profile, ML insights, and similar-case evidence into a single structured prompt for the LLM.

Inputs:
- validated child profile
- similar case list
- intervention prediction result
- optional BCBA style memory

Outputs:
- final generation prompt

Repo grounding:
- prompt composition is in [promptBuilder.js](/D:/Projects/Neurix-AI/server/utils/promptBuilder.js:1)

### 6. Plan Generation Node
Purpose:
Draft a personalized ABA therapy program in structured JSON.

Inputs:
- final generation prompt

Outputs:
- therapy plan summary
- goals
- activities
- weekly schedule
- home activities
- therapist script
- tracking plan

Repo grounding:
- generation call is in [claudeService.js](/D:/Projects/Neurix-AI/server/services/claudeService.js:1)
- orchestration is in [programQueue.js](/D:/Projects/Neurix-AI/server/queues/programQueue.js:1)

### 7. Explanation Node
Purpose:
Show why the draft plan was produced so the BCBA can trust and review it.

Inputs:
- intervention prediction result
- similar case list
- generated plan

Outputs:
- rationale for chosen interventions
- predictive support summary
- retrieved evidence summary
- trust-building explanation for review

How to frame it in the challenge:
This node is where we demonstrate that the system is not only generating output, but also surfacing the reasoning context behind the output.

### 8. Human Review Node
Purpose:
Keep the BCBA in control of the final decision.

Inputs:
- generated therapy plan
- explanation summary

Outputs:
- approved plan
- edited plan
- regenerate request

Why it matters:
This is the most important safety and trust step. The agent supports clinical judgment; it does not replace it.

### 9. Final Output Node
Purpose:
Produce the BCBA-reviewable final therapy plan.

Inputs:
- approved or edited draft

Outputs:
- final personalized ABA program

## The 60-Second Version
Our agent starts with a structured child intake, validates that profile, retrieves similar past cases, runs intervention prediction, builds a context-rich prompt, drafts a personalized ABA therapy plan, explains the basis for that plan, and then hands it to the BCBA for approval. The final output is not an uncontrolled AI answer; it is a BCBA-reviewed therapy draft generated through a multi-step workflow.
