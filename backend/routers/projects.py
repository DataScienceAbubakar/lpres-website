import os
import uuid
import json
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/projects", tags=["projects"])

UPLOAD_DIR = "uploads"
ALLOWED_IMAGE = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_SIZE = 15 * 1024 * 1024


async def _save_image(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_IMAGE:
        raise HTTPException(400, f"Unsupported image type: {file.content_type}")
    content = await file.read()
    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(400, "File too large (max 15 MB)")
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    async with aiofiles.open(path, "wb") as f:
        await f.write(content)
    return f"/api/projects/uploads/{filename}"


def _delete_file(url: Optional[str]):
    if not url:
        return
    filename = url.rsplit("/", 1)[-1]
    path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(path):
        os.remove(path)


# ── Public ────────────────────────────────────────────────────

@router.get("/", response_model=List[schemas.ProjectOut])
def list_projects(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return (
        db.query(models.Project)
        .filter(models.Project.is_published == True)
        .order_by(models.Project.sort_order.asc(), models.Project.created_at.desc())
        .offset(skip).limit(limit).all()
    )


@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.is_published == True,
    ).first()
    if not p:
        raise HTTPException(404, "Project not found")
    return p


@router.get("/uploads/{filename}")
def serve_upload(filename: str):
    path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(404, "File not found")
    return FileResponse(path)


# ── Admin ─────────────────────────────────────────────────────

@router.get("/admin/all", response_model=List[schemas.ProjectOut])
def list_all_admin(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: models.Admin = Depends(auth.get_current_admin),
):
    return (
        db.query(models.Project)
        .order_by(models.Project.sort_order.asc(), models.Project.created_at.desc())
        .offset(skip).limit(limit).all()
    )


@router.post("/admin/", response_model=schemas.ProjectOut)
async def create_project(
    name: str = Form(...),
    lga: str = Form(...),
    cluster: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    status: str = Form("Active"),
    highlights: str = Form("[]"),
    is_published: bool = Form(True),
    sort_order: int = Form(0),
    cover_image: Optional[UploadFile] = File(None),
    images: Optional[List[UploadFile]] = File(default=None),
    db: Session = Depends(get_db),
    _: models.Admin = Depends(auth.get_current_admin),
):
    try:
        highlights_list = json.loads(highlights) if highlights else []
    except Exception:
        highlights_list = []

    cover_url = None
    if cover_image and cover_image.filename:
        cover_url = await _save_image(cover_image)

    img_urls = []
    if images:
        for img in images:
            if img and img.filename:
                img_urls.append(await _save_image(img))

    p = models.Project(
        name=name,
        lga=lga,
        cluster=cluster,
        description=description,
        status=status,
        cover_image=cover_url,
        images=img_urls,
        highlights=highlights_list,
        is_published=is_published,
        sort_order=sort_order,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.put("/admin/{project_id}", response_model=schemas.ProjectOut)
async def update_project(
    project_id: int,
    name: Optional[str] = Form(None),
    lga: Optional[str] = Form(None),
    cluster: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    highlights: Optional[str] = Form(None),
    is_published: Optional[bool] = Form(None),
    sort_order: Optional[int] = Form(None),
    cover_image: Optional[UploadFile] = File(None),
    keep_images: Optional[str] = Form(None),  # JSON array of existing URLs to keep
    images: Optional[List[UploadFile]] = File(default=None),  # new images to append
    db: Session = Depends(get_db),
    _: models.Admin = Depends(auth.get_current_admin),
):
    p = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not p:
        raise HTTPException(404, "Project not found")

    if name is not None:         p.name = name
    if lga is not None:          p.lga = lga
    if cluster is not None:      p.cluster = cluster
    if description is not None:  p.description = description
    if status is not None:       p.status = status
    if is_published is not None: p.is_published = is_published
    if sort_order is not None:   p.sort_order = sort_order
    if highlights is not None:
        try:
            p.highlights = json.loads(highlights)
        except Exception:
            pass

    if cover_image and cover_image.filename:
        _delete_file(p.cover_image)
        p.cover_image = await _save_image(cover_image)

    # Reconcile gallery images: delete dropped ones, keep retained ones
    if keep_images is not None:
        try:
            keep_list = json.loads(keep_images)
        except Exception:
            keep_list = list(p.images or [])
        for url in (p.images or []):
            if url not in keep_list:
                _delete_file(url)
        p.images = keep_list

    # Append newly uploaded images
    if images:
        new_urls = []
        for img in images:
            if img and img.filename:
                new_urls.append(await _save_image(img))
        p.images = list(p.images or []) + new_urls

    db.commit()
    db.refresh(p)
    return p


@router.patch("/admin/{project_id}/publish", response_model=schemas.ProjectOut)
def toggle_publish(
    project_id: int,
    db: Session = Depends(get_db),
    _: models.Admin = Depends(auth.get_current_admin),
):
    p = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not p:
        raise HTTPException(404, "Project not found")
    p.is_published = not p.is_published
    db.commit()
    db.refresh(p)
    return p


@router.delete("/admin/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    _: models.Admin = Depends(auth.get_current_admin),
):
    p = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not p:
        raise HTTPException(404, "Project not found")
    _delete_file(p.cover_image)
    for url in (p.images or []):
        _delete_file(url)
    db.delete(p)
    db.commit()
    return {"message": "Project deleted"}
