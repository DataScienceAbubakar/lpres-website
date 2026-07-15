import re
import os
import uuid
import base64
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/news", tags=["news"])

UPLOAD_DIR = "uploads"


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")[:200]


def save_data_url(data_url: str) -> str:
    """Decode a base64 data URL, save to disk, return the /api/news/uploads/... path."""
    # data:image/jpeg;base64,<data>
    header, encoded = data_url.split(",", 1)
    mime = header.split(";")[0].split(":")[1]          # e.g. image/jpeg
    ext = mime.split("/")[1].replace("jpeg", "jpg")    # jpg / png / webp
    filename = f"{uuid.uuid4().hex}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with open(path, "wb") as f:
        f.write(base64.b64decode(encoded))
    return f"/api/news/uploads/{filename}"


def resolve_image(value: str | None) -> str | None:
    """If the value is a base64 data URL, save it and return the file path."""
    if value and value.startswith("data:"):
        return save_data_url(value)
    return value


# ── Public endpoints ──────────────────────────────────────────

@router.get("/", response_model=List[schemas.NewsArticleOut])
def list_published(skip: int = 0, limit: int = 12, db: Session = Depends(get_db)):
    return (
        db.query(models.NewsArticle)
        .filter(models.NewsArticle.is_published == True)
        .order_by(
            models.NewsArticle.event_date.desc().nullslast(),
            models.NewsArticle.created_at.desc(),
        )
        .offset(skip).limit(limit).all()
    )


@router.get("/category/{category}", response_model=List[schemas.NewsArticleOut])
def list_by_category(category: str, db: Session = Depends(get_db)):
    return (
        db.query(models.NewsArticle)
        .filter(models.NewsArticle.is_published == True, models.NewsArticle.category == category)
        .order_by(models.NewsArticle.created_at.desc())
        .all()
    )


@router.get("/uploads/{filename}")
def serve_upload(filename: str):
    path = os.path.join("uploads", filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path)


@router.get("/{slug}", response_model=schemas.NewsArticleOut)
def get_article(slug: str, db: Session = Depends(get_db)):
    article = db.query(models.NewsArticle).filter(
        models.NewsArticle.slug == slug,
        models.NewsArticle.is_published == True,
    ).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


# ── Admin-protected endpoints ─────────────────────────────────

@router.get("/admin/all", response_model=List[schemas.NewsArticleOut])
def list_all(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: models.Admin = Depends(auth.get_current_admin),
):
    return (
        db.query(models.NewsArticle)
        .order_by(models.NewsArticle.created_at.desc())
        .offset(skip).limit(limit).all()
    )


@router.post("/admin/create", response_model=schemas.NewsArticleOut)
def create_article(
    data: schemas.NewsArticleCreate,
    db: Session = Depends(get_db),
    _: models.Admin = Depends(auth.get_current_admin),
):
    base_slug = slugify(data.title)
    slug = base_slug
    counter = 1
    while db.query(models.NewsArticle).filter(models.NewsArticle.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    article = models.NewsArticle(
        title=data.title,
        body=data.body,
        featured_image=resolve_image(data.featured_image),
        images=[resolve_image(img) for img in (data.images or [])],
        event_date=data.event_date,
        published_by=data.published_by,
        template=data.template,
        is_published=data.is_published,
        slug=slug,
        excerpt=data.excerpt or (data.body[:200].strip() + "…" if len(data.body) > 200 else data.body),
        category=data.category,
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@router.put("/admin/{article_id}", response_model=schemas.NewsArticleOut)
def update_article(
    article_id: int,
    data: schemas.NewsArticleUpdate,
    db: Session = Depends(get_db),
    _: models.Admin = Depends(auth.get_current_admin),
):
    article = db.query(models.NewsArticle).filter(models.NewsArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    if data.title is not None:
        article.title = data.title
    if data.body is not None:
        article.body = data.body
    if data.event_date is not None:
        article.event_date = data.event_date
    if data.published_by is not None:
        article.published_by = data.published_by
    if data.template is not None:
        article.template = data.template
    if data.is_published is not None:
        article.is_published = data.is_published
    if data.excerpt is not None:
        article.excerpt = data.excerpt
    if data.category is not None:
        article.category = data.category
    if data.featured_image is not None:
        article.featured_image = resolve_image(data.featured_image)
    if data.images is not None:
        article.images = [resolve_image(img) for img in data.images]

    db.commit()
    db.refresh(article)
    return article


@router.patch("/admin/{article_id}/publish", response_model=schemas.NewsArticleOut)
def toggle_publish(
    article_id: int,
    db: Session = Depends(get_db),
    _: models.Admin = Depends(auth.get_current_admin),
):
    article = db.query(models.NewsArticle).filter(models.NewsArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    article.is_published = not article.is_published
    db.commit()
    db.refresh(article)
    return article


@router.delete("/admin/{article_id}")
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    _: models.Admin = Depends(auth.get_current_admin),
):
    article = db.query(models.NewsArticle).filter(models.NewsArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    db.delete(article)
    db.commit()
    return {"message": "Article deleted"}
