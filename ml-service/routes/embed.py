from fastapi import APIRouter
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import chromadb, ast

router   = APIRouter()
st_model = SentenceTransformer('all-MiniLM-L6-v2')
client   = chromadb.PersistentClient(path="./chroma_store")
col      = client.get_or_create_collection("child_profiles")

def to_text(c: dict) -> str:
    return (
        f"Age {c.get('age')}, {c.get('diagnosisLevel')}, {c.get('communicationLevel')}. "
        f"Interests: {', '.join(c.get('interests', []))}. "
        f"Challenges: {', '.join(c.get('behavioralChallenges', []))}. "
        f"Goals: {', '.join(c.get('targetGoals', []))}."
    )

class StoreInput(BaseModel):
    childId:             str
    childData:           dict
    effectiveApproaches: list = []

class QueryInput(BaseModel):
    childData: dict
    n:         int = 3

@router.post("/store")
def store(inp: StoreInput):
    text = to_text(inp.childData)
    emb  = st_model.encode(text).tolist()
    col.upsert(
        ids=[inp.childId],
        embeddings=[emb],
        documents=[text],
        metadatas=[{
            "effectiveApproaches": str(inp.effectiveApproaches),
            "interests":           str(inp.childData.get('interests', []))
        }]
    )
    return {"status": "stored"}

@router.post("/similar")
def similar(inp: QueryInput):
    text  = to_text(inp.childData)
    emb   = st_model.encode(text).tolist()
    count = col.count()
    if count == 0:
        return {"similar": []}
    results = col.query(query_embeddings=[emb], n_results=min(inp.n, count))
    out = []
    for i, doc_id in enumerate(results['ids'][0]):
        meta = results['metadatas'][0][i]
        out.append({
            "childId":             doc_id,
            "similarityScore":     round(1 - results['distances'][0][i], 3),
            "effectiveApproaches": ast.literal_eval(meta.get('effectiveApproaches', '[]')),
            "interestOverlap":     ast.literal_eval(meta.get('interests', '[]'))
        })
    return {"similar": out}
