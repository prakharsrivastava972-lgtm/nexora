import sys
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.database.session import Base
from backend.app.models.tables import Item

def seed_production(database_url):
    engine = create_engine(database_url)
    Session = sessionmaker(bind=engine)
    db = Session()

    # Ensure tables exist on the production database
    Base.metadata.create_all(bind=engine)

    existing_count = db.query(Item).count()
    if existing_count > 0:
        print(f"Items table already has {existing_count} rows. Skipping seed.")
        db.close()
        return

    df = pd.read_csv("ml/data/processed/items.csv")
    for _, row in df.iterrows():
        item = Item(
            id=int(row["item_id"]),
            title=row["title"],
            description=row.get("description", ""),
            difficulty=row.get("difficulty", ""),
            category=row.get("organization", ""),
            skills=row.get("skills", ""),
            rating=float(row["rating"]) if pd.notna(row["rating"]) else None,
        )
        db.add(item)

    db.commit()
    print(f"Seeded {len(df)} items into production database.")
    db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m backend.seed_production <DATABASE_URL>")
        sys.exit(1)
    seed_production(sys.argv[1])