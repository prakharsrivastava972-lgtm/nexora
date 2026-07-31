import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib

def build_content_features(items_path, out_dir="ml/models"):
    df = pd.read_csv(items_path)

    # Combine relevant text fields into one string per course
    df["text"] = (
        df["title"].fillna("") + " " +
        df["description"].fillna("") + " " +
        df["skills"].fillna("") + " " +
        df["difficulty"].fillna("")
    )

    vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
    tfidf_matrix = vectorizer.fit_transform(df["text"])

    joblib.dump(vectorizer, f"{out_dir}/tfidf_vectorizer.pkl")
    joblib.dump(tfidf_matrix, f"{out_dir}/tfidf_matrix.pkl")
    df[["item_id", "title", "difficulty"]].to_csv(f"{out_dir}/item_index.csv", index=False)

    print("Content features built. Matrix shape:", tfidf_matrix.shape)
    print("Vocabulary size:", len(vectorizer.vocabulary_))

if __name__ == "__main__":
    build_content_features("ml/data/processed/items.csv")