from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.tables import Interaction
from backend.app.schemas.interaction import InteractionCreate
from backend.app.services.auth import decode_access_token
from fastapi import Header, HTTPException

router = APIRouter(prefix="/api/interactions", tags=["interactions"])

def get_current_user_id(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return int(payload["sub"])

@router.post("")
def create_interaction(
    interaction_in: InteractionCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    new_interaction = Interaction(
        user_id=user_id,
        item_id=interaction_in.item_id,
        event_type=interaction_in.event_type,
    )
    db.add(new_interaction)
    db.commit()
    db.refresh(new_interaction)
    return {"status": "recorded", "id": new_interaction.id}