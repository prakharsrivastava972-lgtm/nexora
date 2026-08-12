from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from backend.app.database.session import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    skill_level = Column(String, default="Beginner")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    difficulty = Column(String)
    category = Column(String)
    skills = Column(String)
    rating = Column(Float)

class UserPreference(Base):
    __tablename__ = "user_preferences"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    interest = Column(String, nullable=False)

class Interaction(Base):
    __tablename__ = "interactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    event_type = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    feedback_type = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Roadmap(Base):
    __tablename__ = "roadmaps"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    goal = Column(String, nullable=False)
    level = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class RoadmapStage(Base):
    __tablename__ = "roadmap_stages"
    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id"), nullable=False)
    title = Column(String, nullable=False)
    order_index = Column(Integer, nullable=False)
    duration = Column(String)
    difficulty = Column(String)

class RoadmapTopic(Base):
    __tablename__ = "roadmap_topics"
    id = Column(Integer, primary_key=True, index=True)
    stage_id = Column(Integer, ForeignKey("roadmap_stages.id"), nullable=False)
    name = Column(String, nullable=False)
    estimated_hours = Column(Integer, default=4)
    order_index = Column(Integer, nullable=False)
    completed = Column(Boolean, default=False)
    already_known = Column(Boolean, default=False)
    
class CourseRoadmap(Base):
    __tablename__ = "course_roadmaps"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CourseTopic(Base):
    __tablename__ = "course_topics"
    id = Column(Integer, primary_key=True, index=True)
    course_roadmap_id = Column(Integer, ForeignKey("course_roadmaps.id"), nullable=False)
    name = Column(String, nullable=False)
    order_index = Column(Integer, nullable=False)
    completed = Column(Boolean, default=False)

class SavedResource(Base):
    __tablename__ = "saved_resources"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    topic_name = Column(String, nullable=True)
    video_label = Column(String, nullable=False)
    video_url = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
