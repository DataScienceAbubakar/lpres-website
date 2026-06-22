from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class AdminCreate(BaseModel):
    username: str
    email: str
    password: str


class AdminLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class NewsArticleCreate(BaseModel):
    title: str
    body: str
    event_date: Optional[str] = None
    published_by: str
    template: int = 1
    is_published: bool = False
    excerpt: Optional[str] = None
    category: str = "News"


class NewsArticleUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    event_date: Optional[str] = None
    published_by: Optional[str] = None
    template: Optional[int] = None
    is_published: Optional[bool] = None
    excerpt: Optional[str] = None
    category: Optional[str] = None


class NewsArticleOut(BaseModel):
    id: int
    title: str
    body: str
    featured_image: Optional[str]
    images: List[str]
    event_date: Optional[str]
    published_by: str
    template: int
    is_published: bool
    slug: str
    excerpt: Optional[str]
    category: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
