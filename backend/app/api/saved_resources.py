from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from backend.app.database.session import get_db
from backend.app.models.tables import SavedResource
from backend.app.services.auth import decode_access_token

router = APIRouter(prefix="/api", tags=["saved_resources"])

def get_current_user_id(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return int(payload["sub"])

class SaveResourceRequest(BaseModel):
    item_id: int
    topic_name: Optional[str] = None
    video_label: str
    video_url: str

@router.post("/saved-resources")
def save_resource(req: SaveResourceRequest, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    existing = db.query(SavedResource).filter(
        SavedResource.user_id == user_id,
        SavedResource.video_url == req.video_url,
    ).first()
    if existing:
        return {"id": existing.id, "status": "already_saved"}

    resource = SavedResource(
        user_id=user_id,
        item_id=req.item_id,
        topic_name=req.topic_name,
        video_label=req.video_label,
        video_url=req.video_url,
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return {"id": resource.id, "status": "saved"}

@router.delete("/saved-resources/{resource_id}")
def unsave_resource(resource_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    resource = db.query(SavedResource).filter(SavedResource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Saved resource not found")
    if resource.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(resource)
    db.commit()
    return {"status": "unsaved"}

@router.get("/saved-resources")
def list_saved_resources(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    resources = db.query(SavedResource).filter(SavedResource.user_id == user_id).order_by(SavedResource.id.desc()).all()
    return [
        {
            "id": r.id,
            "item_id": r.item_id,
            "topic_name": r.topic_name,
            "video_label": r.video_label,
            "video_url": r.video_url,
        }
        for r in resources
    ]
