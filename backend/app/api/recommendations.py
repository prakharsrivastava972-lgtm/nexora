from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from ml.recommenders.hybrid import get_hybrid_recommendations
from ml.recommenders.explain import generate_explanation

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

@router.get("/{user_id}")
def recommendations_for_user(user_id: int, top_n: int = 10, db: Session = Depends(get_db)):
    try:
        recs = get_hybrid_recommendations(user_id=user_id, top_n=top_n, db_session=db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    results = []
    for _, row in recs.iterrows():
        explanation = generate_explanation(
            content_score=row["content_score"],
            collab_score=row["collaborative_score"],
            popularity_score=row["popularity_score"],
            difficulty=row["difficulty"],
            matched_skills=row.get("matched_skills"),
            top_category=row.get("top_category"),
            recency_score=row.get("recency_score", 0),
        )
        results.append({
            "item_id": int(row["item_id"]),
            "title": row["title"],
            "difficulty": row["difficulty"],
            "final_score": round(float(row["final_score"]), 4),
            "why_recommended": explanation,
        })

    return results