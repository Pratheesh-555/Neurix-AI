"""
DREAM Dataset (Header-only) → ChromaDB Ingestion
=================================================
Reads ONLY the header metadata from each DREAM JSON session file
(ADOS/SCQ scores, condition, intervention type). Does NOT load the
full eye-gaze/skeleton time-series arrays (those are gigabytes).

Run from ml-service/ directory:
    python scripts/ingest_dream.py
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import hashlib
import re
from sentence_transformers import SentenceTransformer
import chromadb

# ── Config ────────────────────────────────────────────────────────────────────

DREAM_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "..", "dataset", "DREAMdataset"
)

CHROMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "chroma_store")

# DREAM intervention name → protocol label
PROTOCOL_MAP = {
    "1": "Joint Attention",
    "2": "Turn Taking",
    "3": "Imitation",
    "4": "Joint Attention",
    "5": "Turn Taking",
    "6": "Imitation",
    "7": "Joint Attention",
    "8": "Turn Taking",
}

# ADOS total → approximate diagnosis level
def ados_to_diagnosis(total: int) -> str:
    if total <= 7:
        return "Level 1 - Mild"
    elif total <= 14:
        return "Level 2 - Moderate"
    return "Level 3 - Severe"

# ADOS communication → approximate communication level
def ados_comm_to_level(comm: int) -> str:
    if comm <= 3:
        return "Conversational"
    elif comm <= 6:
        return "Functional Verbal"
    elif comm <= 9:
        return "Emerging Verbal"
    return "Non-verbal"

def stable_id(text: str) -> str:
    return "dream_" + hashlib.md5(text.encode()).hexdigest()[:12]

def extract_header(path: str) -> dict | None:
    """
    Reads just the first ~200 chars of a DREAM JSON to extract
    ADOS scores and condition without loading gigabytes of sensor data.
    Uses a streaming approach reading line by line.
    """
    header = {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            # Read the first 4000 bytes only — enough to cover the header
            raw = f.read(4000)

        # Extract ADOS pre-test block via regex (avoid full JSON parse)
        ados_block = re.search(r'"ados"\s*:\s*\{.*?"preTest"\s*:\s*\{(.*?)\}', raw, re.DOTALL)
        if ados_block:
            block = ados_block.group(1)
            comm_match  = re.search(r'"communication"\s*:\s*([\d.]+)', block)
            inter_match = re.search(r'"interaction"\s*:\s*([\d.]+)', block)
            play_match  = re.search(r'"play"\s*:\s*([\d.]+)', block)
            stereo_match= re.search(r'"stereotype"\s*:\s*([\d.]+)', block)
            total_match = re.search(r'"total"\s*:\s*([\d.]+)', block)
            scq_match   = re.search(r'"socialCommunicationQuestionnaire"\s*:\s*([\d.]+)', block)

            header["adosCommunication"] = float(comm_match.group(1))  if comm_match  else None
            header["adosInteraction"]   = float(inter_match.group(1)) if inter_match else None
            header["adosPlay"]          = float(play_match.group(1))  if play_match  else None
            header["adosStereotype"]    = float(stereo_match.group(1))if stereo_match else None
            header["adosTotal"]         = float(total_match.group(1)) if total_match else None
            header["scqScore"]          = float(scq_match.group(1))   if scq_match   else None

        # Extract condition (SHT = Standard Human Therapy, RET = Robot)
        cond_match = re.search(r'"condition"\s*:\s*"([A-Z]+)"', raw)
        header["condition"] = cond_match.group(1) if cond_match else "SHT"

    except Exception as e:
        return None

    return header if header.get("adosTotal") is not None else None

def extract_intervention_number(filename: str) -> str:
    """Pull e.g. '1' from 'User 3_10_intervention 1_...' """
    m = re.search(r'intervention\s+(\d+)', filename, re.IGNORECASE)
    return m.group(1) if m else "0"


# ── Main ingestion ────────────────────────────────────────────────────────────

def ingest():
    print("=" * 60)
    print("  DREAM Dataset (Headers) → ChromaDB Ingestion")
    print("=" * 60)

    if not os.path.exists(DREAM_DIR):
        print(f"[ERROR] DREAMdataset not found at:\n  {DREAM_DIR}")
        return 0

    user_dirs = [d for d in os.listdir(DREAM_DIR)
                 if os.path.isdir(os.path.join(DREAM_DIR, d)) and d.startswith("User")]
    print(f"\n[1/4] Found {len(user_dirs)} user directories.")

    print("\n[2/4] Loading embedding model (all-MiniLM-L6-v2)...")
    model = SentenceTransformer("all-MiniLM-L6-v2")

    print("\n[3/4] Connecting to ChromaDB...")
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    col    = client.get_or_create_collection("child_profiles")

    print("\n[4/4] Reading DREAM session headers and ingesting...")
    stored  = 0
    skipped = 0
    no_ados = 0

    for user_dir in sorted(user_dirs):
        user_path = os.path.join(DREAM_DIR, user_dir)
        user_id   = user_dir.replace(" ", "_").lower()

        json_files = [f for f in os.listdir(user_path) if f.endswith(".json")]

        # Use the first "diagnosis abilities" file for baseline ADOS
        # Fall back to any intervention file if no diagnosis file exists
        baseline_file = next(
            (f for f in json_files if "diagnosis" in f.lower()),
            json_files[0] if json_files else None
        )
        if not baseline_file:
            skipped += 1
            continue

        header = extract_header(os.path.join(user_path, baseline_file))
        if not header:
            no_ados += 1
            continue

        ados_total = int(header["adosTotal"])
        ados_comm  = int(header.get("adosCommunication") or 5)
        scq_score  = int(header.get("scqScore") or 0)
        condition  = header.get("condition", "SHT")

        # Find all intervention files to determine protocols used
        protocols = set()
        for fname in json_files:
            if "intervention" in fname.lower():
                num = extract_intervention_number(fname)
                proto = PROTOCOL_MAP.get(num, "ABA")
                protocols.add(proto)

        # Build a canonical child-like profile for embedding
        diagnosis = ados_to_diagnosis(ados_total)
        comm_level = ados_comm_to_level(ados_comm)
        protocols_list = list(protocols) if protocols else ["ABA General"]

        text = (
            f"{diagnosis} child, {comm_level} communication. "
            f"ADOS total {ados_total}, SCQ {scq_score}. "
            f"Therapy condition: {condition}. "
            f"Protocols used: {', '.join(protocols_list)}."
        )

        record_id = stable_id(f"{user_id}_{ados_total}_{scq_score}")

        try:
            emb = model.encode(text).tolist()
            col.upsert(
                ids=[record_id],
                embeddings=[emb],
                documents=[text],
                metadatas=[{
                    "source":               "dream_dataset",
                    "userId":               user_id,
                    "adosTotal":            str(ados_total),
                    "adosCommunication":    str(ados_comm),
                    "scqScore":             str(scq_score),
                    "condition":            condition,
                    "diagnosisLevel":       diagnosis,
                    "communicationLevel":   comm_level,
                    "effectiveApproaches":  json.dumps(protocols_list),
                    "allActivities":        json.dumps(protocols_list),
                    "interests":            json.dumps(["therapy_session"]),
                    "successLabel":         "2",
                    "successLabelText":     "success",
                    "protocol":             ", ".join(protocols_list),
                }]
            )
            stored += 1
        except Exception as e:
            print(f"  [WARN] Skipped {user_id}: {e}")
            skipped += 1

    print(f"\n  ✓ Stored : {stored}")
    print(f"  ✗ Skipped: {skipped}")
    print(f"  ⚠ No ADOS: {no_ados}")
    print(f"  Total in collection: {col.count()}")
    return stored


if __name__ == "__main__":
    ingest()
