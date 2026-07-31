import joblib
import pandas as pd
import numpy as np

def recommend_for_user(user_id, top_n=5, model_dir="ml/models"):
    model = joblib.load(f"{model_dir}/collaborative_model.pkl")
    item_index = pd.read_csv(f"{model_dir}/item_index.csv")

    user_pos = model["user_ids"].index(user_id)
    scores = model["predicted_matrix"][user_pos]

    top_positions = np.argsort(scores)[::-1][:top_n]
    top_item_ids = [model["item_ids"][i] for i in top_positions]
    top_scores = [scores[i] for i in top_positions]

    results = item_index[item_index["item_id"].isin(top_item_ids)].copy()
    results["predicted_score"] = results["item_id"].map(dict(zip(top_item_ids, top_scores)))
    return results.sort_values("predicted_score", ascending=False)

if __name__ == "__main__":
    # Show what this user actually interacted with, for context
    interactions = pd.read_csv("ml/data/processed/interactions.csv")
    item_index = pd.read_csv("ml/models/item_index.csv")

    test_user = 1
    history = interactions[interactions["user_id"] == test_user].merge(item_index, on="item_id")
    print(f"User {test_user}'s interaction history:")
    print(history[["title", "event_type"]])

    print(f"\nTop 5 CF-predicted recommendations for User {test_user}:")
    print(recommend_for_user(test_user, top_n=5))