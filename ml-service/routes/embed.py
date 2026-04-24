from fastapi import APIRouter
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import chromadb, ast, json

router   = APIRouter()
st_model = SentenceTransformer('all-MiniLM-L6-v2')
client   = chromadb.PersistentClient(path="./chroma_store")
col      = client.get_or_create_collection("child_profiles")

def to_text(c: dict) -> str:
    diagnosis = c.get('diagnosisLevel', '')
    comm      = c.get('communicationLevel', '')
    return (
        f"Age {c.get('age')}, {diagnosis}, {comm} communication. "
        f"Interests: {', '.join(c.get('interests', []))}. "
        f"Challenges: {', '.join(c.get('behavioralChallenges', []))}. "
        f"Goals: {', '.join(c.get('targetGoals', []))}."
    )

class StoreInput(BaseModel):
    childId:             str
    childData:           dict
    effectiveApproaches: list = []
    adosTotal:           str  = "unknown"
    successLabel:        str  = "unknown"
    protocol:            str  = "ABA"

class QueryInput(BaseModel):
    childData: dict
    n:         int = 3

def _parse_list(raw: str) -> list:
    """Safely parse a JSON or Python-repr list string."""
    if not raw or raw == "[]":
        return []
    try:
        return json.loads(raw)
    except Exception:
        try:
            return ast.literal_eval(raw)
        except Exception:
            return []

@router.post("/store")
def store(inp: StoreInput):
    text = to_text(inp.childData)
    emb  = st_model.encode(text).tolist()
    col.upsert(
        ids=[inp.childId],
        embeddings=[emb],
        documents=[text],
        metadatas=[{
            "source":              "live_intake",
            "effectiveApproaches": json.dumps(inp.effectiveApproaches),
            "interests":           json.dumps(inp.childData.get('interests', [])),
            "adosTotal":           inp.adosTotal,
            "successLabel":        inp.successLabel,
            "protocol":            inp.protocol,
            "successLabelText":    "success" if inp.successLabel == "2" else inp.successLabel,
        }]
    )
    return {"status": "stored"}

@router.post("/similar")
def similar(inp: QueryInput):
    text  = to_text(inp.childData)
    emb   = st_model.encode(text).tolist()
    count = col.count()
    if count == 0:
        return {"similar": [], "totalInMemory": 0}

    results = col.query(query_embeddings=[emb], n_results=min(inp.n, count))
    out = []
    for i, doc_id in enumerate(results['ids'][0]):
        meta  = results['metadatas'][0][i]
        score = round(1 - results['distances'][0][i], 3)
        out.append({
            "childId":             doc_id,
            "similarityScore":     score,
            "source":              meta.get("source", "unknown"),
            "effectiveApproaches": _parse_list(meta.get("effectiveApproaches", "[]")),
            "interestOverlap":     _parse_list(meta.get("interests", "[]")),
            "adosTotal":           meta.get("adosTotal", "unknown"),
            "successLabel":        meta.get("successLabelText", "unknown"),
            "protocol":            meta.get("protocol", "ABA"),
            "therapyDomain":       meta.get("therapyDomain", ""),
            "initialCondition":    meta.get("initialCondition", ""),
        })
    return {"similar": out, "totalInMemory": count}
