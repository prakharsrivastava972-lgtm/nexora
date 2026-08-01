from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database.session import get_db
from backend.app.models.tables import Interaction, Item
from backend.app.api.interactions import get_current_user_id

router = APIRouter(prefix="/api/users", tags=["analytics"])

@router.get("/{user_id}/analytics")
def get_user_analytics(user_id: int, db: Session = Depends(get_db)):
    interactions = db.query(Interaction).filter(Interaction.user_id == user_id).all()
    total = len(interactions)

    event_breakdown = {}
    for i in interactions:
        event_breakdown[i.event_type] = event_breakdown.get(i.event_type, 0) + 1

    difficulty_breakdown = {}
    item_counts = {}
    for i in interactions:
        item = db.query(Item).filter(Item.id == i.item_id).first()
        if item:
            difficulty_breakdown[item.difficulty] = difficulty_breakdown.get(item.difficulty, 0) + 1
            item_counts[item.title] = item_counts.get(item.title, 0) + 1

    most_interacted = sorted(item_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    most_interacted = [{"title": t, "count": c} for t, c in most_interacted]

    return {
        "total_interactions": total,
        "event_type_breakdown": event_breakdown,
        "difficulty_breakdown": difficulty_breakdown,
        "most_interacted_items": most_interacted,
    }