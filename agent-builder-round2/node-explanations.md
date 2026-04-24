# BCBA Copilot Agent: Node Explanations

This file gives a clean explanation of what each node does and why we chose to include it in the workflow.

## 1. Intake Node

### What is at this node
We collect the child's therapy context:
- age
- diagnosis level
- communication level
- interests
- sensory sensitivities
- behavioral challenges
- current skills
- target goals
- therapy history

### Why we chose it
This is the personalization foundation. The quality of the final plan depends on how well we understand the child at the start. We chose this node first because every later step becomes weak if the intake is incomplete or generic.

## 2. Validation Node

### What is at this node
We check whether the intake is complete and usable. The output is a structured child profile plus readiness or missing-information flags.

### Why we chose it
We wanted the flow to feel safe and deliberate, not like a one-shot prompt. Validation shows that the system verifies context before reasoning or generating.

## 3. Similar-Case Retrieval Node

### What is at this node
The system finds semantically similar prior cases and surfaces:
- similar profiles
- similarity scores
- effective past approaches
- overlapping interests or patterns

### Why we chose it
This gives the workflow memory-like context. We chose retrieval because it grounds the plan in prior evidence instead of relying only on one prompt and one model response.

## 4. Intervention Prediction Node

### What is at this node
The ML layer produces decision-support signals such as:
- predicted success probability
- confidence level
- top predictive features

### Why we chose it
We wanted the workflow to combine retrieval with prediction. This node makes the plan feel more evidence-backed and helps explain that the draft is informed by measurable signals, not only language generation.

## 5. Prompt Assembly Node

### What is at this node
We combine:
- validated child profile
- similar-case evidence
- ML prediction output
- optional BCBA style context

The result is one structured prompt for generation.

### Why we chose it
This is the orchestration step. We chose it because it creates a clean handoff into the LLM and makes the overall flow easier to explain during the challenge.

## 6. Plan Generation Node

### What is at this node
The LLM drafts the ABA plan in structured output, including:
- summary
- goals
- activities
- weekly schedule
- parent home activities
- therapist script
- data tracking plan

### Why we chose it
This is the main value-creation step. We chose structured generation because the output needs to be consistent, reviewable, and usable inside the product.

## 7. Explanation Node

### What is at this node
The system explains why the plan was produced by linking:
- ML signals
- retrieved evidence
- chosen interventions in the draft

### Why we chose it
Trust matters. We chose this node so the system can answer, "Why did it recommend this?" That makes the workflow stronger for both judges and clinicians.

## 8. Human Review Node

### What is at this node
The BCBA reviews the draft and can:
- approve it
- edit it
- request regeneration

### Why we chose it
This is the core safety step. We chose it because the system is meant to support clinical judgment, not replace it.

## 9. Final Output Node

### What is at this node
The approved or edited draft becomes the final therapy plan ready for use.

### Why we chose it
We wanted the workflow to end with one clear artifact. This makes the story easy to remember: the agent produces a BCBA-reviewed personalized ABA plan, not just a generic AI answer.

## Short Flow Summary

The workflow starts with child intake, validates the profile, retrieves similar cases, adds ML-based intervention support, assembles a structured prompt, drafts a personalized ABA plan, explains that draft, and then passes it to the BCBA for approval before final use.

## Why This Flow Works For Round 2

- It is easy to present as a clear node-based agent workflow.
- It combines retrieval, prediction, and generation in one flow.
- It includes explanation, which improves trust.
- It keeps a human expert in the loop before the final output is used.
- It stays focused on one agent and one meaningful outcome.
