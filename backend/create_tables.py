from backend.app.database.session import engine, Base
from backend.app.models import tables

Base.metadata.create_all(bind=engine)
print("All tables created successfully!")