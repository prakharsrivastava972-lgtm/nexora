from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from backend.app.database.session import get_db
from backend.app.models.tables import Item

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("")
def search_items(
    q: str = Query(..., min_length=1),
    difficulty: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(Item).filter(
        or_(
            Item.title.ilike(f"%{q}%"),
            Item.skills.ilike(f"%{q}%"),
            Item.description.ilike(f"%{q}%"),
        )
    )

    if difficulty:
        query = query.filter(Item.difficulty == difficulty)

    results = query.limit(limit).all()

    return [
        {
            "item_id": item.id,
            "title": item.title,
            "difficulty": item.difficulty,
            "rating": item.rating,
        }
        for item in results
    ]