import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy import func as sqlfunc
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/gallery", tags=["gallery"])

UPLOAD_DIR = "uploads"
ALLOWED_IMAGE = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO = {"video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"}
MAX_IMAGE_SIZE = 15 * 1024 * 1024   # 15 MB
MAX_VIDEO_SIZE = 300 * 1024 * 1024  # 300 MB


async def _save(file: UploadFile, is_video: bool = False) -> str:
    allowed = ALLOWED_VIDEO if is_video else ALLOWED_IMAGE
    max_size = MAX_VIDEO_SIZE if is_video else MAX_IMAGE_SIZE
    if file.content_type not in allowed:
        raise HTTPException(400, f"Unsupported {'video' if is_video else 'image'} type: {file.content_type}")
    content = await file.read()
    if len(content) > max_size:
        raise HTTPException(400, f"File too large (max {'300' if is_video else '15'} MB)")
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ("mp4" if is_video else "jpg")
    filename = f"{uuid.uuid4().hex}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    async with aiofiles.open(path, "wb") as f:
        await f.write(content)
    return f"/api/gallery/uploads/{filename}"


def _delete_file(url: Optional[str]):
    if not url:
        return
    filename = url.rsplit("/", 1)[-1]
    path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(path):
        os.remove(path)


# ── Public ────────────────────────────────────────────────────

@router.get("/", response_model=List[schemas.GalleryItemOut])
def list_gallery(
    category: Optional[str] = None,
    media_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 60,
    db: Session = Depends(get_db),
):
    q = db.query(models.GalleryItem).filter(models.GalleryItem.is_published == True)
    if category and category != "All":
        q = q.filter(models.GalleryItem.category == category)
    if media_type and media_type != "all":
        q = q.filter(models.GalleryItem.media_type == media_type)
    return (
        q.order_by(models.GalleryItem.sort_order.asc(), models.GalleryItem.created_at.desc())
        .offset(skip).limit(limit).all()
    )


@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    rows = (
        db.query(models.GalleryItem.category, sqlfunc.count(models.GalleryItem.id).label("count"))
        .filter(models.GalleryItem.is_published == True)
        .group_by(models.GalleryItem.category)
        .all()
    )
    return [{"category": r.category, "count": r.count} for r in rows]


@router.get("/uploads/{filename}")
def serve_upload(filename: str):
    path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(404, "File not found")
    return FileResponse(path)


# ── Admin ─────────────────────────────────────────────────────

@router.get("/admin/all", response_model=List[schemas.GalleryItemOut])
def list_all_admin(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: models.Admin = Depends(auth.get_current_admin),
):
    return (
        db.query(models.GalleryItem)
        .order_by(models.GalleryItem.created_at.desc())
        .offset(skip).limit(limit).all()
    )


@router.post("/admin/upload", response_model=schemas.GalleryItemOut)
async def upload_item(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category: str = Form("General"),
    media_type: str = Form("photo"),
    is_published: bool = Form(True),
    sort_order: int = Form(0),
    file: UploadFile = File(...),
    thumbnail: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _: models.Admin = Depends(auth.get_current_admin),
):
    is_video = media_type == "video"
    file_url = await _save(file, is_video)
    thumb_url = None
    if thumbnail and thumbnail.filename:
        thumb_url = await _save(thumbnail, False)

    item = models.GalleryItem(
        title=title,
        description=description,
        file_url=file_url,
        thumbnail_url=thumb_url,
        media_type=media_type,
        category=category,
        is_published=is_published,
        sort_order=sort_order,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/admin/{item_id}", response_model=schemas.GalleryItemOut)
async def update_item(
    item_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    is_published: Optional[bool] = Form(None),
    sort_order: Optional[int] = Form(None),
    file: Optional[UploadFile] = File(None),
    thumbnail: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _: models.Admin = Depends(auth.get_current_admin),
):
    item = db.query(models.GalleryItem).filter(models.GalleryItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Gallery item not found")

    if title is not None:       item.title = title
    if description is not None: item.description = description
    if category is not None:    item.category = category
    if is_published is not None: item.is_published = is_published
    if sort_order is not None:  item.sort_order = sort_order
    if file and file.filename:
        _delete_file(item.file_url)
        item.file_url = await _save(file, item.media_type == "video")
    if thumbnail and thumbnail.filename:
        _delete_file(item.thumbnail_url)
        item.thumbnail_url = await _save(thumbnail, False)

    db.commit()
    db.refresh(item)
    return item


@router.patch("/admin/{item_id}/publish", response_model=schemas.GalleryItemOut)
def toggle_publish(
    item_id: int,
    db: Session = Depends(get_db),
    _: models.Admin = Depends(auth.get_current_admin),
):
    item = db.query(models.GalleryItem).filter(models.GalleryItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Gallery item not found")
    item.is_published = not item.is_published
    db.commit()
    db.refresh(item)
    return item


@router.delete("/admin/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    _: models.Admin = Depends(auth.get_current_admin),
):
    item = db.query(models.GalleryItem).filter(models.GalleryItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Gallery item not found")
    _delete_file(item.file_url)
    _delete_file(item.thumbnail_url)
    db.delete(item)
    db.commit()
    return {"message": "Gallery item deleted"}
