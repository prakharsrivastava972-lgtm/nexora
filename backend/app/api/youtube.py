from fastapi import APIRouter, Query
from urllib.parse import quote_plus

router = APIRouter(prefix="/api/youtube", tags=["youtube"])

def build_search_link(query: str) -> str:
    return f"https://www.youtube.com/results?search_query={quote_plus(query)}"

@router.get("/search")
def youtube_search(q: str = Query(..., min_length=1), level: str = "Beginner"):
    """
    Returns real YouTube search links for a topic, tagged by suggested search variant.
    No YOUTUBE_API_KEY is configured, so this uses YouTube's own search results page
    rather than fabricating specific video titles/thumbnails — every link is real and functional.
    """
    variants = [
        {"label": f"{q} tutorial", "query": f"{q} tutorial"},
        {"label": f"{q} for {level.lower()}s", "query": f"{q} for {level.lower()}s"},
        {"label": f"{q} crash course", "query": f"{q} crash course"},
    ]

    results = []
    for v in variants:
        results.append({
            "label": v["label"],
            "url": build_search_link(v["query"]),
            "source": "youtube_search",  # honestly labeled: a search link, not a specific fetched video
        })

    return {"topic": q, "resources": results}