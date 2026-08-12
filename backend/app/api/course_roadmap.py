from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.tables import CourseRoadmap, CourseTopic, Item
from backend.app.services.auth import decode_access_token

router = APIRouter(prefix="/api", tags=["course_roadmap"])

def get_current_user_id(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return int(payload["sub"])

def _build_topic_names(item: Item):
    skills_raw = item.skills or ""
    skills_list = [s.strip() for s in skills_raw.replace("[", "").replace("]", "").replace("'", "").split(",") if s.strip()]
    topic_names = list(skills_list[:5])
    topic_names.append("Watch YouTube resources")
    topic_names.append("Complete course")
    return topic_names

@router.post("/courses/{item_id}/roadmap")
def create_course_roadmap(item_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = db.query(CourseRoadmap).filter(
        CourseRoadmap.user_id == user_id, CourseRoadmap.item_id == item_id
    ).first()
    if existing:
        return {"course_roadmap_id": existing.id, "status": "already_exists"}

    roadmap = CourseRoadmap(user_id=user_id, item_id=item_id)
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)

    for i, name in enumerate(_build_topic_names(item)):
        topic = CourseTopic(course_roadmap_id=roadmap.id, name=name, order_index=i, completed=False)
        db.add(topic)
    db.commit()

    return {"course_roadmap_id": roadmap.id, "status": "created"}

@router.get("/courses/{item_id}/roadmap")
def get_course_roadmap(item_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    roadmap = db.query(CourseRoadmap).filter(
        CourseRoadmap.user_id == user_id, CourseRoadmap.item_id == item_id
    ).first()
    if not roadmap:
        return {"has_roadmap": False}

    topics = db.query(CourseTopic).filter(
        CourseTopic.course_roadmap_id == roadmap.id
    ).order_by(CourseTopic.order_index).all()

    total = len(topics)
    completed = sum(1 for t in topics if t.completed)
    progress = round((completed / total) * 100) if total > 0 else 0

    return {
        "has_roadmap": True,
        "course_roadmap_id": roadmap.id,
        "item_id": item_id,
        "progress": progress,
        "topics": [{"id": t.id, "name": t.name, "completed": t.completed} for t in topics],
    }

@router.put("/courses/topic/{topic_id}/toggle")
def toggle_course_topic(topic_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    topic = db.query(CourseTopic).filter(CourseTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    roadmap = db.query(CourseRoadmap).filter(CourseRoadmap.id == topic.course_roadmap_id).first()
    if roadmap.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this roadmap")

    topic.completed = not topic.completed
    db.commit()
    return {"topic_id": topic_id, "completed": topic.completed}

@router.put("/courses/{item_id}/reset")
def reset_course_roadmap(item_id: int, user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    roadmap = db.query(CourseRoadmap).filter(
        CourseRoadmap.user_id == user_id, CourseRoadmap.item_id == item_id
    ).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="No roadmap found for this course")

    topics = db.query(CourseTopic).filter(CourseTopic.course_roadmap_id == roadmap.id).all()
    for t in topics:
        t.completed = False
    db.commit()

    return {"course_roadmap_id": roadmap.id, "status": "reset", "progress": 0}

@router.get("/my-courses")
def get_my_courses(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    roadmaps = db.query(CourseRoadmap).filter(CourseRoadmap.user_id == user_id).all()
    out = []
    for r in roadmaps:
        item = db.query(Item).filter(Item.id == r.item_id).first()
        if not item:
            continue
        topics = db.query(CourseTopic).filter(CourseTopic.course_roadmap_id == r.id).all()
        total = len(topics)
        completed = sum(1 for t in topics if t.completed)
        progress = round((completed / total) * 100) if total > 0 else 0
        out.append({
            "item_id": item.id,
            "title": item.title,
            "difficulty": item.difficulty,
            "progress": progress,
        })
    return out

