import pandas as pd
import numpy as np
import joblib
from sklearn.metrics.pairwise import cosine_similarity
from ml.evaluation.metrics import precision_at_k, recall_at_k, ndcg_at_k

RELEVANT_EVENTS = {"like", "save", "complete"}
K = 10

def load_data():
    interactions = pd.read_csv("ml/data/processed/interactions.csv")
    items = pd.read_csv("ml/data/processed/items.csv")
    item_index = pd.read_csv("ml/models/item_index.csv")
    tfidf_matrix = joblib.load("ml/models/tfidf_matrix.pkl")
    cf_model = joblib.load("ml/models/collaborative_model.pkl")
    return interactions, items, item_index, tfidf_matrix, cf_model

def train_test_split_per_user(interactions, test_frac=0.3, seed=42):
    rng = np.random.default_rng(seed)
    relevant = interactions[interactions["event_type"].isin(RELEVANT_EVENTS)]
    train_rows, test_rows = [], []
    for user_id, group in relevant.groupby("user_id"):
        item_ids = group["item_id"].tolist()
        if len(item_ids) < 2:
            train_rows.extend(group.to_dict("records"))
            continue
        rng.shuffle(item_ids)
        n_test = max(1, int(len(item_ids) * test_frac))
        test_items = set(item_ids[:n_test])
        for _, row in group.iterrows():
            (test_rows if row["item_id"] in test_items else train_rows).append(row.to_dict())
    return pd.DataFrame(train_rows), pd.DataFrame(test_rows)

def popularity_ranking(items):
    students = pd.to_numeric(items["students_enrolled"].astype(str).str.replace(",", "", regex=False), errors="coerce").fillna(0)
    reviews = pd.to_numeric(items["reviews_num"], errors="coerce").fillna(0)
    score = reviews + students / 100
    return items.assign(pop_score=score).sort_values("pop_score", ascending=False)["item_id"].tolist()

def content_ranking(user_id, train_interactions, item_index, tfidf_matrix):
    user_items = train_interactions[train_interactions["user_id"] == user_id]["item_id"].unique()
    positions = item_index[item_index["item_id"].isin(user_items)].index.tolist()
    if not positions:
        return []
    scores = cosine_similarity(tfidf_matrix[positions], tfidf_matrix).mean(axis=0)
    ranked_idx = np.argsort(scores)[::-1]
    return item_index.iloc[ranked_idx]["item_id"].tolist()

def collaborative_ranking(user_id, cf_model, item_index):
    if user_id not in cf_model["user_ids"]:
        return []
    pos = cf_model["user_ids"].index(user_id)
    scores = cf_model["predicted_matrix"][pos]
    ranked_idx = np.argsort(scores)[::-1]
    return [cf_model["item_ids"][i] for i in ranked_idx]

def hybrid_ranking(content_rank, collab_rank, pop_rank, all_item_ids):
    def rank_score(rank_list, item_id, default=0):
        return 1 - (rank_list.index(item_id) / len(rank_list)) if item_id in rank_list else default
    scores = {}
    for item_id in all_item_ids:
        scores[item_id] = (0.40 * rank_score(content_rank, item_id) +
                            0.35 * rank_score(collab_rank, item_id) +
                            0.25 * rank_score(pop_rank, item_id))
    return sorted(scores, key=scores.get, reverse=True)

def evaluate_model(name, get_ranking_fn, test_by_user):
    precisions, recalls, ndcgs = [], [], []
    for user_id, relevant_items in test_by_user.items():
        ranking = get_ranking_fn(user_id)
        if not ranking:
            continue
        precisions.append(precision_at_k(ranking, relevant_items, K))
        recalls.append(recall_at_k(ranking, relevant_items, K))
        ndcgs.append(ndcg_at_k(ranking, relevant_items, K))
    print(f"{name:15s} | Precision@{K}: {np.mean(precisions):.4f} | Recall@{K}: {np.mean(recalls):.4f} | NDCG@{K}: {np.mean(ndcgs):.4f}")

if __name__ == "__main__":
    interactions, items, item_index, tfidf_matrix, cf_model = load_data()
    train, test = train_test_split_per_user(interactions)

    # Rebuild CF model using ONLY train data to avoid leakage into evaluation
    from scipy.sparse.linalg import svds
    EVENT_WEIGHTS = {"view": 1, "click": 2, "save": 4, "like": 5, "complete": 7, "dislike": -5}

    # Combine train (relevant events) with all non-relevant events (view/click/dislike stay as-is)
    non_relevant = interactions[~interactions["event_type"].isin({"like", "save", "complete"})]
    cf_train_data = pd.concat([train, non_relevant], ignore_index=True)
    cf_train_data["weight"] = cf_train_data["event_type"].map(EVENT_WEIGHTS)

    matrix = cf_train_data.pivot_table(index="user_id", columns="item_id", values="weight", aggfunc="sum", fill_value=0)
    k = min(20, min(matrix.shape) - 1)
    U, sigma, Vt = svds(matrix.values.astype(float), k=k)
    predicted = np.dot(np.dot(U, np.diag(sigma)), Vt)
    cf_model = {"predicted_matrix": predicted, "user_ids": matrix.index.tolist(), "item_ids": matrix.columns.tolist()}

    test_by_user = test.groupby("user_id")["item_id"].apply(list).to_dict()
    all_item_ids = item_index["item_id"].tolist()
    pop_rank = popularity_ranking(items)

    print(f"Evaluating on {len(test_by_user)} users with held-out test interactions\n")

    evaluate_model("Popularity", lambda u: pop_rank, test_by_user)
    evaluate_model("Content-Based", lambda u: content_ranking(u, train, item_index, tfidf_matrix), test_by_user)
    evaluate_model("Collaborative", lambda u: collaborative_ranking(u, cf_model, item_index), test_by_user)
    evaluate_model("Hybrid", lambda u: hybrid_ranking(
        content_ranking(u, train, item_index, tfidf_matrix),
        collaborative_ranking(u, cf_model, item_index),
        pop_rank, all_item_ids), test_by_user)