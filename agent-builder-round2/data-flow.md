# Data Flow For The Agent Builder Round

## Goal
This document explains what data enters and leaves each node so the team can clearly describe architecture during submission.

## End-to-End Flow
`Child profile -> validated profile -> similar-case evidence + ML insights -> structured generation prompt -> draft ABA plan -> explanation -> BCBA review -> final plan`

## Node Inputs And Outputs

### 1. Intake Node
Input data:
- child name
- age
- diagnosis level
- communication level
- interests
- sensory sensitivities
- behavioral challenges
- current skills
- target goals
- prior therapy duration

Output data:
- one structured child profile object

Plain-language description:
We convert raw intake answers into a structured profile that the rest of the workflow can understand.

### 2. Validation Node
Input data:
- structured child profile

Output data:
- validated profile
- completeness status
- missing information flags

Plain-language description:
This node ensures the system has enough information before reasoning further.

### 3. Similar-Case Retrieval Node
Input data:
- validated child profile
- profile text representation for embedding search

Output data:
- top similar prior cases
- similarity scores
- effective approaches from retrieved cases
- interest overlap signals

Plain-language description:
This node gives the agent memory-like context from related past cases instead of relying only on one prompt.

### 4. Intervention Prediction Node
Input data:
- validated child profile
- engineered features for the ML model

Output data:
- predicted success probability
- confidence level
- top predictive features
- explainability information

Plain-language description:
This node produces decision-support signals that help the plan become more evidence-backed.

### 5. Prompt Assembly Node
Input data:
- validated child profile
- similar-case evidence
- ML prediction output
- BCBA writing-style context if available

Output data:
- final structured prompt for plan generation

Plain-language description:
This node merges all available context into one instruction package for the generation model.

### 6. Plan Generation Node
Input data:
- structured generation prompt

Output data:
- summary
- goals
- therapy activities
- schedule
- parent home activities
- therapist script
- data tracking plan

Plain-language description:
This node creates the actual ABA draft in a structured format that can be reviewed and shown in the product.

### 7. Explanation Node
Input data:
- ML prediction output
- retrieved case evidence
- generated plan sections

Output data:
- rationale summary
- evidence summary
- review context for the BCBA

Plain-language description:
This node answers the question, "Why did the agent produce this plan?"

### 8. Human Review Node
Input data:
- draft therapy plan
- explanation summary

Output data:
- approved draft
- edited draft
- rejection or regeneration instruction

Plain-language description:
This node keeps the clinician in the loop and makes the workflow safe and trustworthy.

### 9. Final Output Node
Input data:
- approved or edited plan

Output data:
- final therapy program ready for use

Plain-language description:
This is the final result of the workflow and the main artifact judges should remember.

## What To Say If Judges Ask "Why Is This An Agent?"
Say:
- It performs a multi-step workflow, not a single prompt.
- It uses multiple sources of context before generating output.
- It combines retrieval, prediction, and generation.
- It can explain the basis of its draft.
- It includes a human approval step before final use.
