import pandas as pd
from backend.app.database.session import SessionLocal
from backend.app.models.tables import Item

def seed_items():
    df = pd.read_csv("ml/data/processed/items.csv")
    db = SessionLocal()

    existing_count = db.query(Item).count()
    if existing_count > 0:
        print(f"Items table already has {existing_count} rows. Skipping seed.")
        db.close()
        return

    for _, row in df.iterrows():
        item = Item(
            id=int(row["item_id"]),
            title=row["title"],
            description=row.get("description", ""),
            difficulty=row.get("difficulty", ""),
            category=row.get("organization", ""),  # using organization as a stand-in category
            skills=row.get("skills", ""),
            rating=float(row["rating"]) if pd.notna(row["rating"]) else None,
        )
        db.add(item)

    db.commit()
    print(f"Seeded {len(df)} items into the database.")
    db.close()

if __name__ == "__main__":
    seed_items()