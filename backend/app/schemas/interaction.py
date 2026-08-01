from pydantic import BaseModel

class InteractionCreate(BaseModel):
    item_id: int
    event_type: str  # view, click, save, like, complete, dislike

class RecommendationOut(BaseModel):
    item_id: int
    title: str
    difficulty: str
    final_score: float