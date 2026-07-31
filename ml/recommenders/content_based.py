import joblib
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

class ContentRecommender:
    def __init__(self, model_dir="ml/models"):
        self.vectorizer = joblib.load(f"{model_dir}/tfidf_vectorizer.pkl")
        self.matrix = joblib.load(f"{model_dir}/tfidf_matrix.pkl")
        self.item_index = pd.read_csv(f"{model_dir}/item_index.csv")

    def similar_items(self, item_id, top_n=5):
        # Find the row position for this item_id
        idx = self.item_index[self.item_index["item_id"] == item_id].index[0]

        sims = cosine_similarity(self.matrix[idx], self.matrix).flatten()
        top_idx = sims.argsort()[::-1][1:top_n + 1]  # skip itself (index 0 after sort)

        results = self.item_index.iloc[top_idx].copy()
        results["similarity"] = sims[top_idx]
        return results

if __name__ == "__main__":
    rec = ContentRecommender()

    # Show what item_id=1 actually is
    print("Source course:")
    print(rec.item_index[rec.item_index["item_id"] == 1])

    print("\nTop 5 similar courses:")
    print(rec.similar_items(item_id=1, top_n=5))