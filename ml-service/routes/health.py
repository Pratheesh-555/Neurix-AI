from fastapi import APIRouter
from datetime import datetime, timezone
import chromadb

router = APIRouter()
VERSION = "1.0.0"

def _chroma_status() -> str:
    try:
        client = chromadb.PersistentClient(path="./chroma_store")
        client.heartbeat()
        return "connected"
    except Exception:
        return "unavailable"

@router.get("/")
def health():
    return {
        "status":   "ok",
        "model":    "xgboost",
        "chromadb": _chroma_status(),
        "version":  VERSION,
        "ts":       datetime.now(timezone.utc).isoformat(),
    }
