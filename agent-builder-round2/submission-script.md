# Submission Script

## 1. Problem
BCBAs spend hours hand-crafting individualized ABA therapy plans for each child. That process is slow, repetitive, and hard to scale when therapist time is limited.

## 2. Agent Goal
Our goal is to design a BCBA Copilot Agent that turns structured child intake into a personalized therapy-plan draft that the BCBA can review and approve.

## 3. Workflow
The workflow begins with child intake. The system validates the profile, retrieves semantically similar prior cases, runs intervention prediction, assembles all of that context into a generation prompt, drafts a personalized ABA plan, explains the basis for that draft, and then sends it to the BCBA for human review.

## 4. Why This Is An Agent
This is an agent because it is not a one-step text generator. It performs multiple connected tasks, uses different tools and data sources, combines evidence before generating output, and supports a clear goal from input to final draft.

## 5. Why Human-In-The-Loop Matters
We are working in a clinical decision-support context, so the BCBA remains the final decision-maker. The agent accelerates drafting and reasoning support, but the clinician approves the final therapy plan.

## 6. Final Output
The final output is a BCBA-reviewable personalized ABA therapy plan, not just a raw LLM response.

## 7. If We Need A 30-Second Version
We designed a BCBA Copilot Agent that starts with structured child intake, retrieves similar prior cases, runs intervention prediction, generates a personalized ABA plan, explains the reasoning behind that draft, and keeps the BCBA in the loop for final approval.

## 8. If Judges Ask About Innovation
Our innovation is not just plan generation. It is the combination of retrieval, prediction, structured generation, and clinician review in one coherent workflow. That makes the output more personalized, more explainable, and more trustworthy than a one-shot prompt.

## 9. If Judges Ask What We Deliberately Left Out
For this round, we intentionally centered one core workflow and moved broader features like live pivots, digital twin, and writing-style adaptation into future extensions so the main agent flow stays clear and defensible.
