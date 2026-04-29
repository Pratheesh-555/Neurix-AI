"""
Mendeley Indonesia Therapy Dataset -> ChromaDB Ingestion
=======================================================
- initial_condition_dataset.csv: class, initial_condition, label
- activity_detail_dataset.csv:   value_1, value_2, value_3, activity_detail, label

Strategy:
  - Each unique (class, initial_condition) row from the condition file
    becomes one ChromaDB record.
  - We attach the activity_detail rows that have label=2 (success)
    as "effectiveApproaches" metadata.

Run from ml-service/ directory:
    python scripts/ingest_mendeley.py
"""

import sys, os, json, csv, hashlib
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sentence_transformers import SentenceTransformer
import chromadb

# ── Paths ─────────────────────────────────────────────────────────────────────

BASE    = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "..", "dataset",
    "Autism Therapy Activity and Material Dataset",
    "Autism Therapy Activity and Material Dataset",
    "Autism Activity Dataset"
)
ACTIVITY_CSV  = os.path.join(BASE, "activity_detail_dataset.csv")
CONDITION_CSV = os.path.join(BASE, "initial_condition_dataset.csv")
CHROMA_PATH   = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "chroma_store")

LABEL_MAP = {0: "failed", 1: "partial_success", 2: "success"}

# ── Loaders ───────────────────────────────────────────────────────────────────

def stable_id(text: str) -> str:
    return "mendeley_" + hashlib.md5(text.encode()).hexdigest()[:12]

def load_successful_activities(path: str) -> list:
    """Returns list of activity_detail strings with label == 2."""
    successful = []
    with open(path, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            detail = (row.get("activity_detail") or "").strip()
            try:
                label = int(row.get("label") or 0)
            except ValueError:
                label = 0
            if detail and label == 2:
                successful.append(detail)
    return successful

def load_conditions(path: str) -> list:
    rows = []
    with open(path, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            cls       = (row.get("class") or "").strip()
            condition = (row.get("initial_condition") or "").strip()
            try:
                label = int(row.get("label") or 0)
            except ValueError:
                label = 0
            if cls and condition:
                rows.append({"class": cls, "condition": condition, "label": label})
    return rows

# ── Main ──────────────────────────────────────────────────────────────────────

def ingest():
    print("=" * 60)
    print("  Mendeley Dataset -> ChromaDB Ingestion")
    print("=" * 60)

    for path, name in [(ACTIVITY_CSV, "activity_detail"), (CONDITION_CSV, "initial_condition")]:
        if not os.path.exists(path):
            print(f"[ERROR] {name}.csv not found at:\n  {path}")
            return 0

    print("\n[1/4] Loading CSVs...")
    successful_activities = load_successful_activities(ACTIVITY_CSV)
    conditions            = load_conditions(CONDITION_CSV)
    print(f"  Successful activities : {len(successful_activities)}")
    print(f"  Condition rows        : {len(conditions)}")

    print("\n[2/4] Loading embedding model...")
    model = SentenceTransformer("all-MiniLM-L6-v2")

    print("\n[3/4] Connecting to ChromaDB...")
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    col    = client.get_or_create_collection("child_profiles")

    print("\n[4/4] Ingesting records...")
    stored  = 0
    skipped = 0

    # We'll attach the global successful_activities list to every record
    # since the CSV doesn't link activities to specific conditions by key.
    # This still grounds every plan with real proven activities.
    effective_sample = successful_activities[:10]

    for cond in conditions:
        cls       = cond["class"]
        condition = cond["condition"]
        label     = cond["label"]

        text = (
            f"Child with initial condition: {condition}. "
            f"Therapy domain: {cls}. "
            f"Documented successful activities: {'; '.join(effective_sample[:5])}."
        )
        record_id = stable_id(f"{cls}_{condition}")

        try:
            emb = model.encode(text).tolist()
            col.upsert(
                ids=[record_id],
                embeddings=[emb],
                documents=[text],
                metadatas=[{
                    "source":              "mendeley_indonesia",
                    "therapyDomain":       cls,
                    "initialCondition":    condition,
                    "successLabel":        str(label),
                    "successLabelText":    LABEL_MAP.get(label, "unknown"),
                    "effectiveApproaches": json.dumps(effective_sample[:5]),
                    "allActivities":       json.dumps(effective_sample[:8]),
                    "interests":           json.dumps([cls]),
                    "adosTotal":           "unknown",
                    "protocol":            "ABA-Indonesian",
                }]
            )
            stored += 1
        except Exception as e:
            print(f"  [WARN] Skipped '{condition[:40]}': {e}")
            skipped += 1

    print(f"\n  Stored  : {stored}")
    print(f"  Skipped : {skipped}")
    print(f"  Total in collection: {col.count()}")
    return stored


if __name__ == "__main__":
    ingest()
