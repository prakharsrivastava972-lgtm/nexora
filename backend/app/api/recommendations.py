from fastapi import APIRouter, HTTPException
from ml.recommenders.hybrid import get_hybrid_recommendations

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

@router.get("/{user_id}")
def recommendations_for_user(user_id: int, top_n: int = 10):
    try:
        recs = get_hybrid_recommendations(user_id=user_id, top_n=top_n)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return recs[["item_id", "title", "difficulty", "final_score"]].to_dict(orient="records")