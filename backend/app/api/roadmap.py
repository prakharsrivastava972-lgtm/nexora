from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from backend.app.database.session import get_db
from backend.app.models.tables import Roadmap, RoadmapStage, RoadmapTopic
from backend.app.services.auth import decode_access_token
from ml.roadmaps.templates import generate_roadmap, get_available_goals

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])

def get_current_user_id(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return int(payload["sub"])

class RoadmapCreate(BaseModel):
    goal: str
    level: str
    duration: str
    existing_skills: Optional[List[str]] = []

@router.get("/goals")
def list_available_goals():
    return {"goals": get_available_goals()}

@router.post("/generate")
def create_roadmap(
    req: RoadmapCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    stages_data = generate_roadmap(req.goal, req.existing_skills)
    if stages_data is None:
        raise HTTPException(
            status_code=400,
            detail=f"No template available for '{req.goal}'. Available goals: {', '.join(get_available_goals())}"
        )

    roadmap = Roadmap(user_id=user_id, goal=req.goal, level=req.level, duration=req.duration)
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)

    for i, stage_data in enumerate(stages_data):
        stage = RoadmapStage(
            roadmap_id=roadmap.id,
            title=stage_data["title"],
            order_index=i,
            duration=stage_data["duration"],
            difficulty=stage_data["difficulty"],
        )
        db.add(stage)
        db.commit()
        db.refresh(stage)

        for j, topic_data in enumerate(stage_data["topics"]):
            topic = RoadmapTopic(
                stage_id=stage.id,
                name=topic_data["name"],
                estimated_hours=topic_data["estimated_hours"],
                order_index=j,
                completed=False,
                already_known=topic_data["already_known"],
            )
            db.add(topic)
    db.commit()

    return {"roadmap_id": roadmap.id, "status": "created"}

@router.get("")
def get_my_roadmap(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    roadmap = db.query(Roadmap).filter(Roadmap.user_id == user_id).order_by(Roadmap.id.desc()).first()
    if not roadmap:
        return {"has_roadmap": False}

    stages = db.query(RoadmapStage).filter(RoadmapStage.roadmap_id == roadmap.id).order_by(RoadmapStage.order_index).all()

    total_topics = 0
    completed_topics = 0
    stages_out = []
    for stage in stages:
        topics = db.query(RoadmapTopic).filter(RoadmapTopic.stage_id == stage.id).order_by(RoadmapTopic.order_index).all()
        topics_out = []
        for t in topics:
            total_topics += 1
            if t.completed:
                completed_topics += 1
            topics_out.append({
                "id": t.id, "name": t.name, "estimated_hours": t.estimated_hours,
                "completed": t.completed, "already_known": t.already_known,
            })
        stages_out.append({
            "id": stage.id, "title": stage.title, "duration": stage.duration,
            "difficulty": stage.difficulty, "topics": topics_out,
        })

    progress = round((completed_topics / total_topics) * 100) if total_topics > 0 else 0

    return {
        "has_roadmap": True,
        "roadmap_id": roadmap.id,
        "goal": roadmap.goal,
        "level": roadmap.level,
        "duration": roadmap.duration,
        "progress": progress,
        "stages": stages_out,
    }

@router.put("/topic/{topic_id}/toggle")
def toggle_topic_completion(topic_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    topic = db.query(RoadmapTopic).filter(RoadmapTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    # Verify ownership through the chain: topic -> stage -> roadmap -> user
    stage = db.query(RoadmapStage).filter(RoadmapStage.id == topic.stage_id).first()
    roadmap = db.query(Roadmap).filter(Roadmap.id == stage.roadmap_id).first()
    if roadmap.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this roadmap")

    topic.completed = not topic.completed
    db.commit()
    return {"topic_id": topic_id, "completed": topic.completed}