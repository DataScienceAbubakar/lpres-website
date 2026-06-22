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
