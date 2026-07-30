import pandas as pd

def clean_items(path_in, path_out):
    df = pd.read_csv(path_in)

    # Drop exact duplicate titles
    df = df.drop_duplicates(subset=["course_title"])

    # Description is essential for content-based filtering — drop rows missing it
    df = df.dropna(subset=["course_title", "course_description"])

    # Fill gaps in secondary fields instead of dropping rows
    df["course_rating"] = df["course_rating"].fillna(df["course_rating"].median())
    df["course_reviews_num"] = df["course_reviews_num"].fillna(0)
    df["course_students_enrolled"] = df["course_students_enrolled"].fillna(0)

    # Rename to simpler, consistent names for the rest of the pipeline
    df = df.rename(columns={
        "course_title": "title",
        "course_organization": "organization",
        "course_difficulty": "difficulty",
        "course_rating": "rating",
        "course_reviews_num": "reviews_num",
        "course_students_enrolled": "students_enrolled",
        "course_skills": "skills",
        "course_description": "description",
        "course_summary": "summary",
    })

    # Assign a clean numeric item_id used throughout the system
    df = df.reset_index(drop=True)
    df["item_id"] = range(1, len(df) + 1)

    df.to_csv(path_out, index=False)
    print(f"Cleaned {len(df)} items -> {path_out}")
    print(df[["item_id", "title", "difficulty", "rating"]].head())

if __name__ == "__main__":
    clean_items("ml/data/raw/courses.csv", "ml/data/processed/items.csv")