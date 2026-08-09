from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.session import get_db

router = APIRouter(prefix="/api/platform", tags=["platform"])

@router.get("/stats")
def get_platform_stats(db: Session = Depends(get_db)):
    total_users = db.execute(text("SELECT COUNT(*) FROM users")).scalar()
    total_items = db.execute(text("SELECT COUNT(*) FROM items")).scalar()
    total_interactions = db.execute(text("SELECT COUNT(*) FROM interactions")).scalar()

    event_breakdown = db.execute(text("""
        SELECT event_type, COUNT(*) as count
        FROM interactions
        GROUP BY event_type
        ORDER BY count DESC
    """)).fetchall()

    top_items = db.execute(text("""
        SELECT items.title, COUNT(interactions.id) as interaction_count
        FROM items
        JOIN interactions ON interactions.item_id = items.id
        GROUP BY items.id, items.title
        ORDER BY interaction_count DESC
        LIMIT 5
    """)).fetchall()

    return {
        "total_users": total_users,
        "total_items": total_items,
        "total_interactions": total_interactions,
        "event_breakdown": [{"event_type": r[0], "count": r[1]} for r in event_breakdown],
        "top_items": [{"title": r[0], "interaction_count": r[1]} for r in top_items],
    }