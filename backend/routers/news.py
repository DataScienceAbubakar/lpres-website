import os
import re
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/news", tags=["news"])

UPLOAD_DIR = "uploads"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = text.strip("-")
    return text[:200]


async def save_upload(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid image type")
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10 MB)")
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    async with aiofiles.open(path, "wb") as f:
        await f.write(content)
    return f"/api/news/uploads/{filename}"


# ── Public endpoints ──────────────────────────────────────────

@router.get("/", response_model=List[schemas.NewsArticleOut])
def list_published(skip: int = 0, limit: int = 12, db: Session = Depends(get_db)):
    return (
        db.query(models.NewsArticle)
        .filter(models.NewsArticle.is_published == True)
        .order_by(models.NewsArticle.created_at.desc())
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


@router.get("/{slug}", response_model=schemas.NewsArticleOut)
def get_article(slug: str, db: Session = Depends(get_db)):
    article = db.query(models.NewsArticle).filter(
        models.NewsArticle.slug == slug,
        models.NewsArticle.is_published == True,
    ).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.get("/uploads/{filename}")
def serve_upload(filename: str):
    path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path)


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
async def create_article(
    title: str = Form(...),
    body: str = Form(...),
    event_date: Optional[str] = Form(None),
    published_by: str = Form(...),
    template: int = Form(1),
    is_published: bool = Form(False),
    excerpt: Optional[str] = Form(None),
    category: str = Form("News"),
    featured_image: Optional[UploadFile] = File(None),
    images: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    _: models.Admin = Depends(auth.get_current_admin),
):
    base_slug = slugify(title)
    slug = base_slug
    counter = 1
    while db.query(models.NewsArticle).filter(models.NewsArticle.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    feat_path = None
    if featured_image and featured_image.filename:
        feat_path = await save_upload(featured_image)

    image_paths = []
    if images:
        for img in images:
            if img and img.filename:
                image_paths.append(await save_upload(img))

    article = models.NewsArticle(
        title=title,
        body=body,
        featured_image=feat_path,
        images=image_paths,
        event_date=event_date,
        published_by=published_by,
        template=template,
        is_published=is_published,
        slug=slug,
        excerpt=excerpt or (body[:200].strip() + "…" if len(body) > 200 else body),
        category=category,
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@router.put("/admin/{article_id}", response_model=schemas.NewsArticleOut)
async def update_article(
    article_id: int,
    title: Optional[str] = Form(None),
    body: Optional[str] = Form(None),
    event_date: Optional[str] = Form(None),
    published_by: Optional[str] = Form(None),
    template: Optional[int] = Form(None),
    is_published: Optional[bool] = Form(None),
    excerpt: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    featured_image: Optional[UploadFile] = File(None),
    images: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    _: models.Admin = Depends(auth.get_current_admin),
):
    article = db.query(models.NewsArticle).filter(models.NewsArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    if title is not None:
        article.title = title
    if body is not None:
        article.body = body
    if event_date is not None:
        article.event_date = event_date
    if published_by is not None:
        article.published_by = published_by
    if template is not None:
        article.template = template
    if is_published is not None:
        article.is_published = is_published
    if excerpt is not None:
        article.excerpt = excerpt
    if category is not None:
        article.category = category
    if featured_image and featured_image.filename:
        article.featured_image = await save_upload(featured_image)
    if images:
        new_imgs = []
        for img in images:
            if img and img.filename:
                new_imgs.append(await save_upload(img))
        if new_imgs:
            article.images = (article.images or []) + new_imgs

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
