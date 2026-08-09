from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.tables import Item
from ml.data.curated_resources import get_resources_for_item

router = APIRouter(prefix="/api/items", tags=["items"])

@router.get("/{item_id}")
def get_item_detail(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return {
        "id": item.id,
        "title": item.title,
        "description": item.description,
        "difficulty": item.difficulty,
        "category": item.category,
        "skills": item.skills,
        "rating": item.rating,
    }

@router.get("/{item_id}/resources")
def get_item_resources(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    resources = get_resources_for_item(item.title, item.skills)
    return {"item_id": item_id, "resources": resources}