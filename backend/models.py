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


class GalleryItem(Base):
    __tablename__ = "gallery_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    file_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    media_type = Column(String(10), nullable=False, default="photo")   # 'photo' | 'video'
    category = Column(String(100), nullable=False, default="General")
    is_published = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    lga = Column(String(100), nullable=False)
    cluster = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="Active")   # Active | Completed | Planned
    cover_image = Column(String(500), nullable=True)
    images = Column(JSON, default=list)       # ordered gallery photos
    highlights = Column(JSON, default=list)
    is_published = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
