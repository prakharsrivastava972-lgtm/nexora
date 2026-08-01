from pydantic import BaseModel
from typing import List, Dict

class CategoryBreakdown(BaseModel):
    category: str
    count: int

class AnalyticsOut(BaseModel):
    total_interactions: int
    event_type_breakdown: Dict[str, int]
    difficulty_breakdown: Dict[str, int]
    most_interacted_items: List[Dict]