from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from database import Base

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(200))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class NewsArticle(Base):
    __tablename__ = "news_articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    body = Column(Text, nullable=False)
    featured_image = Column(String(500), nullable=True)
    images = Column(JSON, default=list)          # list of image paths
    event_date = Column(String(20), nullable=True)
    published_by = Column(String(100), nullable=False)
    template = Column(Integer, default=1)        # 1, 2, or 3
    is_published = Column(Boolean, default=False)
    slug = Column(String(400), unique=True, index=True)
    excerpt = Column(String(500), nullable=True)
    category = Column(String(100), default="News")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
