from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/register", response_model=dict)
def register_admin(admin_data: schemas.AdminCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Admin).filter(
        (models.Admin.username == admin_data.username) |
        (models.Admin.email == admin_data.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")

    hashed = auth.get_password_hash(admin_data.password)
    admin = models.Admin(
        username=admin_data.username,
        email=admin_data.email,
        hashed_password=hashed,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return {"message": "Admin created successfully", "id": admin.id}


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.username == form_data.username).first()
    if not admin or not auth.verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = auth.create_access_token({"sub": admin.username})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def get_me(current_admin: models.Admin = Depends(auth.get_current_admin)):
    return {"id": current_admin.id, "username": current_admin.username, "email": current_admin.email}


import json
from pydantic import BaseModel
from typing import Optional

class VerificationActionRequest(BaseModel):
    action: str  # "approve" | "reject"
    reason: Optional[str] = None


@router.get("/marketplace/verifications")
def list_marketplace_verifications(db: Session = Depends(get_db)):
    users = db.query(models.MarketplaceUser).filter(
        models.MarketplaceUser.verification_status.isnot(None)
    ).order_by(models.MarketplaceUser.created_at.desc()).all()

    items = []
    for u in users:
        details = {}
        if u.verification_details:
            try:
                details = json.loads(u.verification_details)
            except Exception:
                details = {}
        items.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "lga": u.lga,
            "is_verified": bool(u.is_verified),
            "verification_status": u.verification_status or "unverified",
            "verification_details": details,
            "created_at": u.created_at.isoformat() if u.created_at else ""
        })
    return {"success": True, "data": items}


@router.post("/marketplace/verifications/{user_id}/action")
def action_marketplace_verification(user_id: int, req: VerificationActionRequest, db: Session = Depends(get_db)):
    user = db.query(models.MarketplaceUser).filter(models.MarketplaceUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Marketplace user not found")

    if req.action == "approve":
        user.is_verified = True
        user.verification_status = "verified"
    elif req.action == "reject":
        user.is_verified = False
        user.verification_status = "rejected"
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'approve' or 'reject'.")

    db.commit()
    db.refresh(user)
    return {
        "success": True,
        "message": f"User verification {user.verification_status}",
        "user": {
            "id": user.id,
            "email": user.email,
            "is_verified": bool(user.is_verified),
            "verification_status": user.verification_status
        }
    }
