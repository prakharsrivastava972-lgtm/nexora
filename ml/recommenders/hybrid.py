import joblib
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

WEIGHTS = {
    "content": 0.40,
    "collaborative": 0.35,
    "popularity": 0.25,
}

def normalize(arr):
    arr = np.array(arr, dtype=float)
    if arr.max() == arr.min():
        return np.zeros_like(arr)
    return (arr - arr.min()) / (arr.max() - arr.min())

def get_hybrid_recommendations(user_id, top_n=10, model_dir="ml/models"):
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

    final_scores = (
        WEIGHTS["content"] * content_scores +
        WEIGHTS["collaborative"] * collab_scores +
        WEIGHTS["popularity"] * popularity_scores
    )

    results = item_index.copy()
    results["final_score"] = final_scores
    results = results[~results["item_id"].isin(user_items)]
    return results.sort_values("final_score", ascending=False).head(top_n)

if __name__ == "__main__":
    recs = get_hybrid_recommendations(user_id=1, top_n=10)
    print("Top 10 hybrid recommendations for User 1:\n")
    print(recs[["item_id", "title", "difficulty", "final_score"]].to_string(index=False))