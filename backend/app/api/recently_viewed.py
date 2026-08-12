from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from backend.app.database.session import get_db
from backend.app.models.tables import Interaction, Item
from backend.app.services.auth import decode_access_token

router = APIRouter(prefix="/api", tags=["recently_viewed"])

def get_current_user_id(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return int(payload["sub"])

@router.get("/recently-viewed")
def get_recently_viewed(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    rows = (
        db.query(Interaction.item_id, func.max(Interaction.created_at).label("last_viewed"))
        .filter(Interaction.user_id == user_id, Interaction.event_type == "view")
        .group_by(Interaction.item_id)
        .order_by(desc("last_viewed"))
        .limit(5)
        .all()
    )

    out = []
    for item_id, last_viewed in rows:
        item = db.query(Item).filter(Item.id == item_id).first()
        if not item:
            continue
        out.append({
            "item_id": item.id,
            "title": item.title,
            "difficulty": item.difficulty,
            "last_viewed": last_viewed.isoformat() if last_viewed else None,
        })
    return out
