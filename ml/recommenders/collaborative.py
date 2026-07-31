import pandas as pd
import numpy as np
from scipy.sparse.linalg import svds
import joblib

EVENT_WEIGHTS = {"view": 1, "click": 2, "save": 4, "like": 5, "complete": 7, "dislike": -5}

def build_cf_model(interactions_path, out_dir="ml/models", k=20):
    df = pd.read_csv(interactions_path)
    df["weight"] = df["event_type"].map(EVENT_WEIGHTS)

    # Sum weights when a user interacted with the same item multiple times
    matrix = df.pivot_table(index="user_id", columns="item_id",
                             values="weight", aggfunc="sum", fill_value=0)

    # k must be smaller than the smallest matrix dimension
    k = min(k, min(matrix.shape) - 1)

    U, sigma, Vt = svds(matrix.values.astype(float), k=k)
    sigma = np.diag(sigma)
    predicted = np.dot(np.dot(U, sigma), Vt)

    joblib.dump({
        "predicted_matrix": predicted,
        "user_ids": matrix.index.tolist(),
        "item_ids": matrix.columns.tolist()
    }, f"{out_dir}/collaborative_model.pkl")

    print("CF model trained. Matrix shape:", predicted.shape)
    print("Users:", len(matrix.index), "| Items with interactions:", len(matrix.columns))

if __name__ == "__main__":
    build_cf_model("ml/data/processed/interactions.csv")