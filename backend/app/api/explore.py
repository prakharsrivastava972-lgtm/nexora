from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.session import get_db
from backend.app.services.auth import decode_access_token
import random

router = APIRouter(prefix="/api/explore", tags=["explore"])

def get_current_user_id(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return int(payload["sub"])

@router.get("")
def get_explore_items(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db), limit: int = 6):
    # Find categories/organizations the user has NOT interacted with,
    # to surface genuinely different content rather than more of the same.
    query = text("""
        SELECT items.id, items.title, items.difficulty, items.rating, items.category
        FROM items
        WHERE items.id NOT IN (
            SELECT item_id FROM interactions WHERE user_id = :user_id
        )
        AND (items.category IS NULL OR items.category NOT IN (
            SELECT DISTINCT i2.category FROM items i2
            JOIN interactions ON interactions.item_id = i2.id
            WHERE interactions.user_id = :user_id AND i2.category IS NOT NULL
        ))
        AND items.rating >= 4.5
        ORDER BY RANDOM()
        LIMIT :limit
    """)
    result = db.execute(query, {"user_id": user_id, "limit": limit})
    rows = result.fetchall()

    return [
        {"item_id": row.id, "title": row.title, "difficulty": row.difficulty, "rating": row.rating, "category": row.category}
        for row in rows
    ]