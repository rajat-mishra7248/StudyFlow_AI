from app.database.base import Base
from app.database.session import engine

# Import all models
from app.models import Student


def create_database():
    Base.metadata.create_all(bind=engine)