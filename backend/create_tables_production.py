import sys
from sqlalchemy import create_engine
from backend.app.database.session import Base
from backend.app.models import tables  # noqa: ensures all models are registered

def create_tables_production(database_url):
    engine = create_engine(database_url)
    Base.metadata.create_all(bind=engine)
    print("All tables (including any new ones) created successfully on production.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m backend.create_tables_production <DATABASE_URL>")
        sys.exit(1)
    create_tables_production(sys.argv[1])