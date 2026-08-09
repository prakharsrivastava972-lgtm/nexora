import joblib
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from collections import Counter

WEIGHTS = {
    "content": 0.35,
    "collaborative": 0.30,
    "popularity": 0.20,
    "recency": 0.15,
}

def normalize(arr):
    arr = np.array(arr, dtype=float)
    if arr.max() == arr.min():
        return np.zeros_like(arr)
    return (arr - arr.min()) / (arr.max() - arr.min())

def parse_skills(skills_str):
    if not isinstance(skills_str, str) or not skills_str:
        return []
    cleaned = skills_str.replace("[", "").replace("]", "").replace("'", "")
    return [s.strip() for s in cleaned.split(",") if s.strip()]

def get_hybrid_recommendations(user_id, top_n=10, model_dir="ml/models", db_session=None):
    tfidf_matrix = joblib.load(f"{model_dir}/tfidf_matrix.pkl")
    item_index = pd.read_csv(f"{model_dir}/item_index.csv")
    cf_model = joblib.load(f"{model_dir}/collaborative_model.pkl")
    items = pd.read_csv("ml/data/processed/items.csv")

    interactions = pd.read_csv("ml/data/processed/interactions.csv")
    user_items = interactions[interactions["user_id"] == user_id]["item_id"].unique()
    user_positions = item_index[item_index["item_id"].isin(user_items)].index.tolist()

    if user_positions:
        content_scores = cosine_similarity(tfidf_matrix[user_positions], tfidf_matrix).mean(axis=0)
    else:
        content_scores = np.zeros(tfidf_matrix.shape[0])

    if user_id in cf_model["user_ids"]:
        user_pos = cf_model["user_ids"].index(user_id)
        collab_scores = cf_model["predicted_matrix"][user_pos]
    else:
        collab_scores = np.zeros(len(item_index))

    students_clean = pd.to_numeric(
        items["students_enrolled"].astype(str).str.replace(",", "", regex=False),
        errors="coerce"
    ).fillna(0)
    reviews_clean = pd.to_numeric(items["reviews_num"], errors="coerce").fillna(0)

    pop_raw = reviews_clean + students_clean / 100
    popularity_scores = normalize(pop_raw.values)

    content_scores = normalize(content_scores)
    collab_scores = normalize(collab_scores)

    # Recency score: boosts items similar to the user's MOST RECENTLY interacted items,
    # using real interaction timestamps from the database (falls back to 0 if unavailable).
    recency_scores = np.zeros(len(item_index))
    if db_session is not None:
        try:
            from sqlalchemy import text
            recent_rows = db_session.execute(text("""
                SELECT item_id FROM interactions
                WHERE user_id = :user_id
                ORDER BY created_at DESC
                LIMIT 5
            """), {"user_id": user_id}).fetchall()
            recent_item_ids = [r[0] for r in recent_rows]
            recent_positions = item_index[item_index["item_id"].isin(recent_item_ids)].index.tolist()
            if recent_positions:
                recency_scores = cosine_similarity(tfidf_matrix[recent_positions], tfidf_matrix).mean(axis=0)
                recency_scores = normalize(recency_scores)
        except Exception:
            pass  # recency is an enhancement, never block recommendations if it fails

    final_scores = (
        WEIGHTS["content"] * content_scores +
        WEIGHTS["collaborative"] * collab_scores +
        WEIGHTS["popularity"] * popularity_scores +
        WEIGHTS["recency"] * recency_scores
    )

    results = item_index.copy()
    results["content_score"] = content_scores
    results["collaborative_score"] = collab_scores
    results["popularity_score"] = popularity_scores
    results["recency_score"] = recency_scores
    results["final_score"] = final_scores
    results = results[~results["item_id"].isin(user_items)]
    top_results = results.sort_values("final_score", ascending=False).head(top_n).copy()

    # --- Build explanation context: matched skills + top category ---
    items_by_id = items.set_index("item_id")

    user_skill_counter = Counter()
    for iid in user_items:
        if iid in items_by_id.index:
            for skill in parse_skills(items_by_id.loc[iid].get("skills", "")):
                user_skill_counter[skill] += 1
    user_skills = set(user_skill_counter.keys())

    user_category_counter = Counter()
    for iid in user_items:
        if iid in items_by_id.index:
            org = items_by_id.loc[iid].get("organization")
            if isinstance(org, str) and org:
                user_category_counter[org] += 1
    top_category = user_category_counter.most_common(1)[0][0] if user_category_counter else None

    matched_skills_list = []
    for _, row in top_results.iterrows():
        item_skills = set(parse_skills(items_by_id.loc[row["item_id"]].get("skills", "")))
        overlap = list(item_skills & user_skills)
        matched_skills_list.append(overlap)

    top_results["matched_skills"] = matched_skills_list
    top_results["top_category"] = top_category

    return top_results

if __name__ == "__main__":
    recs = get_hybrid_recommendations(user_id=1, top_n=10)
    print("Top 10 hybrid recommendations for User 1:\n")
    print(recs[["item_id", "title", "difficulty", "final_score", "recency_score"]].to_string(index=False))