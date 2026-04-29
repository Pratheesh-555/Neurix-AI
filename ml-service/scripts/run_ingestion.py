"""
Neurix AI — Master Ingestion Runner
====================================
Run ONCE to populate ChromaDB with all clinical datasets.

Usage (from ml-service/ directory):
    python scripts/run_ingestion.py
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set stdout to UTF-8 for Windows compatibility
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from scripts.ingest_mendeley import ingest as ingest_mendeley
from scripts.ingest_dream    import ingest as ingest_dream
import chromadb

CHROMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "chroma_store")

def main():
    print("\n" + "=" * 60)
    print("  NEURIX AI — FULL DATASET INGESTION PIPELINE")
    print("=" * 60)

    print("\n\n-- PHASE 1: Mendeley Indonesia Therapy Dataset --------------\n")
    mendeley_count = ingest_mendeley()

    print("\n\n-- PHASE 2: DREAM Clinical Sessions Dataset -----------------\n")
    dream_count = ingest_dream()

    # Final summary
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    col    = client.get_or_create_collection("child_profiles")
    total  = col.count()

    print("\n" + "=" * 60)
    print("  INGESTION COMPLETE")
    print("=" * 60)
    print(f"  Mendeley rows stored : {mendeley_count}")
    print(f"  DREAM rows stored    : {dream_count}")
    print(f"  Total in ChromaDB   : {total}")
    print("=" * 60)
    print("\nYou can now start the ML service. The agent will use this")
    print("grounded evidence when generating therapy plans.\n")


if __name__ == "__main__":
    main()
