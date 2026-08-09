from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from backend.app.database.session import get_db
from backend.app.models.tables import UserPreference, User
from backend.app.services.auth import decode_access_token

router = APIRouter(prefix="/api/preferences", tags=["preferences"])

def get_current_user_id(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return int(payload["sub"])

class PreferencesIn(BaseModel):
    interests: List[str]
    skill_level: str

@router.post("")
def save_preferences(
    prefs: PreferencesIn,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    # Clear existing preferences for this user, then insert fresh
    db.query(UserPreference).filter(UserPreference.user_id == user_id).delete()
    for interest in prefs.interests:
        db.add(UserPreference(user_id=user_id, interest=interest))

    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.skill_level = prefs.skill_level

    db.commit()
    return {"status": "saved", "interests": prefs.interests, "skill_level": prefs.skill_level}

@router.get("")
def get_preferences(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    prefs = db.query(UserPreference).filter(UserPreference.user_id == user_id).all()
    user = db.query(User).filter(User.id == user_id).first()
    return {
        "interests": [p.interest for p in prefs],
        "skill_level": user.skill_level if user else None,
        "has_onboarded": len(prefs) > 0,
    }