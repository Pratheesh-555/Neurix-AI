from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.predict import router as predict_router
from routes.embed   import router as embed_router
from routes.decay   import router as decay_router
from routes.health  import router as health_router

app = FastAPI(title="BCBA Copilot ML Service", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router,  prefix="/health")
app.include_router(predict_router, prefix="/predict")
app.include_router(embed_router,   prefix="/embed")
app.include_router(decay_router,   prefix="/decay")
