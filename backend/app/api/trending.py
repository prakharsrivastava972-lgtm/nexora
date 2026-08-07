from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.session import get_db

router = APIRouter(prefix="/api/trending", tags=["trending"])

@router.get("")
def get_trending(limit: int = 6, db: Session = Depends(get_db)):
    # Popularity = count of interactions per item, joined with item details
    query = text("""
        SELECT items.id, items.title, items.difficulty, items.rating,
               COUNT(interactions.id) AS interaction_count
        FROM items
        LEFT JOIN interactions ON interactions.item_id = items.id
        GROUP BY items.id, items.title, items.difficulty, items.rating
        ORDER BY interaction_count DESC, items.rating DESC NULLS LAST
        LIMIT :limit
    """)
    result = db.execute(query, {"limit": limit})
    rows = result.fetchall()

    return [
        {
            "item_id": row.id,
            "title": row.title,
            "difficulty": row.difficulty,
            "rating": row.rating,
            "interaction_count": row.interaction_count,
        }
        for row in rows
    ]