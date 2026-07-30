import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from utils.s3_service import upload_file_to_s3

router = APIRouter(prefix="/api/upload", tags=["upload"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("")
@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    contents = await file.read()
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"

    # Try uploading to S3 if AWS credentials or bucket name are set
    if os.getenv("AWS_ACCESS_KEY_ID") or os.getenv("S3_BUCKET_NAME"):
        object_key = f"marketplace-uploads/{filename}"
        success, url_or_err = upload_file_to_s3(contents, object_key, content_type=file.content_type)
        if success:
            return {"success": True, "url": url_or_err, "storage": "s3"}

    # Local storage fallback
    local_path = os.path.join(UPLOAD_DIR, filename)
    with open(local_path, "wb") as f:
        f.write(contents)

    local_url = f"/api/uploads/{filename}"
    return {"success": True, "url": local_url, "storage": "local"}
