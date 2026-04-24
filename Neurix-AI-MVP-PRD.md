# PRD: Neurix AI – Evidence-Grounded BCBA Copilot

**Version:** 1.0 (MVP)  
**Status:** Ready for Implementation  
**Target:** Final Round / MVP Presentation

---

## 1. Executive Summary
Neurix AI is a clinical-grade decision support system designed for Board Certified Behavior Analysts (BCBAs). Unlike generic AI assistants that rely on uncontrolled LLM outputs, Neurix AI utilizes a **Multi-Modal Evidence Engine** to generate ABA therapy plans. By grounding its logic in 4,000+ real clinical sessions (DREAM Dataset) and a validated intervention library (Mendeley), it eliminates "AI Hallucinations" and provides clinicians with a data-backed starting point for therapy.

---

## 2. Problem Statement
*   **Administrative Burnout:** BCBAs spend 25% of their time on manual plan drafting.
*   **Evidence Gap:** Junior therapists often lack immediate access to historical outcomes for specific child profiles.
*   **The "Black Box" Risk:** Standard AI solutions cannot explain *why* an intervention was chosen, making them untrustworthy for clinical use.

---

## 3. The Solution: Evidence-Grounded Workflow
Neurix AI implements a 9-node agentic workflow that bridges the gap between raw behavioral intake and professional therapy programs.

### 3.1 Data Foundations
| Dataset | Role in Neurix AI | Value Prop |
| :--- | :--- | :--- |
| **DREAM** | Clinical Memory | Provides ADOS/SCQ baselines and success metrics from 4,000 sessions. |
| **Mendeley** | Activity Engine | Source-of-truth for specific therapy activities and materials. |
| **TASD** | Intake Precision | Extracts 14 specific behavioral markers (e.g., Tiptoe Flapping) from text. |

---

## 4. Core Features (MVP)

### 4.1 High-Precision Intake (HPI)
*   **Capability:** Extracts quantitative markers from qualitative parent/teacher notes using NLP models trained on the TASD dataset.
*   **Outcome:** A structured "Child Profile" that includes ADOS baselines and sensory triggers.

### 4.2 Evidence-Based RAG (EB-RAG)
*   **Capability:** Instead of "generating" ideas, the agent **retrieves** successful interventions from the Mendeley library based on the child's "Initial Condition."
*   **Outcome:** 100% grounded therapy activities that have been used in real clinical settings.

### 4.3 Predictive Success Scoring
*   **Capability:** An ML model (XGBoost) trained on the DREAM dataset predicts the success probability of a selected intervention for the specific child profile.
*   **Outcome:** A "Confidence Score" for every recommendation.

### 4.4 Clinical Rationale (The "Why" Node)
*   **Capability:** The system generates a human-readable justification for every plan section, citing historical similar cases.
*   **Outcome:** Clinician trust and safety.

---

## 5. Technical Architecture

### 5.1 Orchestration Layer
*   **Tool:** n8n / Node.js
*   **Logic:** A deterministic state machine that ensures every plan passes through **Validation -> Retrieval -> Prediction -> Synthesis**.

### 5.2 Intelligence Layer
*   **LLM:** Claude 3.5 Sonnet (for synthesis and clinical writing).
*   **Vector DB:** ChromaDB (for storing the Mendeley and DREAM knowledge bases).
*   **Predictive Model:** Python/XGBoost (for success estimation).

---

## 6. Success Metrics for MVP
1.  **Drafting Speed:** Reduce initial plan drafting time from 2 hours to < 2 minutes.
2.  **Groundedness:** 0% hallucination rate (all activities must exist in the reference datasets).
3.  **Clinician Approval:** 90%+ acceptance rate of generated drafts by BCBAs.

---

## 7. Future Roadmap
*   **Phase 2 (Kinetic Analysis):** Integrating 3D skeleton data for automated session progress tracking.
*   **Phase 3 (Live Gaze Monitoring):** Real-time engagement feedback using the DREAM gaze protocols.
*   **Phase 4 (Enterprise EHR):** Direct integration with clinic management software.
