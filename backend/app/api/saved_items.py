from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.session import get_db
from backend.app.services.auth import decode_access_token

router = APIRouter(prefix="/api/saved-items", tags=["saved-items"])

def get_current_user_id(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return int(payload["sub"])

@router.get("")
def get_saved_items(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    query = text("""
        SELECT DISTINCT items.id, items.title, items.difficulty, items.rating
        FROM items
        JOIN interactions ON interactions.item_id = items.id
        WHERE interactions.user_id = :user_id
          AND interactions.event_type = 'save'
        ORDER BY items.id
    """)
    result = db.execute(query, {"user_id": user_id})
    rows = result.fetchall()

    return [
        {"item_id": row.id, "title": row.title, "difficulty": row.difficulty, "rating": row.rating}
        for row in rows
    ]