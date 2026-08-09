from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="NEXORA API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://nexora-seven-sepia.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from backend.app.api.auth import router as auth_router
app.include_router(auth_router)
from backend.app.api.recommendations import router as recommendations_router
from backend.app.api.interactions import router as interactions_router
app.include_router(recommendations_router)
app.include_router(interactions_router)
from backend.app.api.analytics import router as analytics_router
app.include_router(analytics_router)
from backend.app.api.items import router as items_router
app.include_router(items_router)
from backend.app.api.trending import router as trending_router
app.include_router(trending_router)
from backend.app.api.search import router as search_router
app.include_router(search_router)
from backend.app.api.continue_learning import router as continue_learning_router
app.include_router(continue_learning_router)
from backend.app.api.platform_stats import router as platform_router
app.include_router(platform_router)
from backend.app.api.saved_items import router as saved_items_router
app.include_router(saved_items_router)
from backend.app.api.preferences import router as preferences_router
app.include_router(preferences_router)
from backend.app.api.explore import router as explore_router
app.include_router(explore_router)
from backend.app.api.roadmap import router as roadmap_router
app.include_router(roadmap_router)
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "NEXORA API"}