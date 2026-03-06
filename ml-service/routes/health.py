from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()

@router.get("/")
def health():
    return {"status": "ok", "ts": datetime.now(timezone.utc).isoformat()}
